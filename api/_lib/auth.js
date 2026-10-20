'use strict';
// Local auth: opaque session tokens in the `sessions` table (no JWT, revocable).
// Login providers: Google (OIDC) and Telegram. No passwords anywhere.
const crypto = require('node:crypto');
const { query, one } = require('./db');

const ACCESS_TTL_DAYS = 7;
const REFRESH_TTL_DAYS = 30;

const token = () => crypto.randomBytes(32).toString('hex');
const unix = (d) => Math.floor(new Date(d).getTime() / 1000);

// Shape a users-table row the way the frontend expects a Supabase user.
function toUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    user_metadata: row.user_metadata || {},
    app_metadata: { provider: row.provider },
    created_at: row.created_at
  };
}

// Create a session for a user id; returns a Supabase-style session object.
async function createSession(userId) {
  const access = token(), refresh = token();
  const row = await one(
    `INSERT INTO sessions (user_id, access_token, refresh_token, expires_at)
     VALUES ($1, $2, $3, now() + ($4 || ' days')::interval)
     RETURNING access_token, refresh_token, expires_at`,
    [userId, access, refresh, String(ACCESS_TTL_DAYS)]
  );
  const user = toUser(await one(`SELECT * FROM users WHERE id = $1`, [userId]));
  return {
    access_token: row.access_token,
    refresh_token: row.refresh_token,
    expires_at: unix(row.expires_at),
    token_type: 'bearer',
    user
  };
}

// Resolve an access token to a user (or null) — used by every protected endpoint.
async function getUserByAccessToken(accessToken) {
  if (!accessToken || typeof accessToken !== 'string') return null;
  const row = await one(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.access_token = $1 AND s.expires_at > now()`,
    [accessToken]
  );
  return toUser(row);
}

// Exchange a refresh token for a fresh session (rotates both tokens).
async function refreshSession(refreshToken) {
  if (!refreshToken || typeof refreshToken !== 'string') return null;
  const sess = await one(
    `SELECT id, user_id FROM sessions WHERE refresh_token = $1
     AND created_at > now() - ($2 || ' days')::interval`,
    [refreshToken, String(REFRESH_TTL_DAYS)]
  );
  if (!sess) return null;
  const access = token(), refresh = token();
  const row = await one(
    `UPDATE sessions SET access_token = $2, refresh_token = $3,
       expires_at = now() + ($4 || ' days')::interval
     WHERE id = $1 RETURNING access_token, refresh_token, expires_at, user_id`,
    [sess.id, access, refresh, String(ACCESS_TTL_DAYS)]
  );
  const user = toUser(await one(`SELECT * FROM users WHERE id = $1`, [row.user_id]));
  return {
    access_token: row.access_token,
    refresh_token: row.refresh_token,
    expires_at: unix(row.expires_at),
    token_type: 'bearer',
    user
  };
}

async function deleteSession(accessToken) {
  if (!accessToken) return;
  await query(`DELETE FROM sessions WHERE access_token = $1`, [accessToken]);
}

// Find-or-create a Google user by verified email; store google_sub + profile.
async function upsertGoogleUser({ sub, email, name, picture }) {
  if (!email) throw new Error('google_no_email');
  const meta = { provider: 'google', full_name: name || null, avatar_url: picture || null, google_sub: sub || null };
  let user = await one(`SELECT * FROM users WHERE email = $1 OR (google_sub IS NOT NULL AND google_sub = $2)`, [email, sub || null]);
  if (!user) {
    user = await one(
      `INSERT INTO users (email, provider, google_sub, email_confirmed, user_metadata)
       VALUES ($1, 'google', $2, true, $3) RETURNING *`,
      [email, sub || null, meta]
    );
    await query(
      `INSERT INTO profiles (id, role, full_name) VALUES ($1, 'teacher', $2)
       ON CONFLICT (id) DO NOTHING`,
      [user.id, name || null]
    );
  } else if (!user.google_sub && sub) {
    await query(`UPDATE users SET google_sub = $2, updated_at = now() WHERE id = $1`, [user.id, sub]);
  }
  return user.id;
}

// Find-or-create a Telegram user (stable synthetic email), ensure a profile exists.
async function upsertTelegramUser({ telegram_id, username, first_name }) {
  const email = 'tg' + telegram_id + '@tg.empira.app';
  const full_name = first_name || ('Telegram ' + telegram_id);
  const meta = { provider: 'telegram', telegram_id, username: username || null, full_name };
  let user = await one(`SELECT * FROM users WHERE email = $1`, [email]);
  if (!user) {
    user = await one(
      `INSERT INTO users (email, provider, email_confirmed, user_metadata)
       VALUES ($1, 'telegram', true, $2) RETURNING *`,
      [email, meta]
    );
    await query(
      `INSERT INTO profiles (id, role, full_name) VALUES ($1, 'teacher', $2)
       ON CONFLICT (id) DO NOTHING`,
      [user.id, full_name]
    );
  }
  return user.id;
}

// ---- Google OIDC helpers (authorization-code flow, server-side) ----
const GOOGLE_AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO = 'https://openidconnect.googleapis.com/v1/userinfo';

function googleConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI);
}

function googleAuthUrl(state) {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account'
  });
  return GOOGLE_AUTH + '?' + p.toString();
}

async function googleExchange(code) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code'
  });
  const tr = await fetch(GOOGLE_TOKEN, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body, signal: AbortSignal.timeout(10000)
  });
  if (!tr.ok) throw new Error('google_token_' + tr.status);
  const tok = await tr.json();
  const ur = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: 'Bearer ' + tok.access_token }, signal: AbortSignal.timeout(10000)
  });
  if (!ur.ok) throw new Error('google_userinfo_' + ur.status);
  const info = await ur.json();
  if (!info.email || info.email_verified === false) throw new Error('google_email_unverified');
  return { sub: info.sub, email: info.email, name: info.name, picture: info.picture };
}

// Read a bearer access token from the Authorization header.
function bearer(req) {
  return (/^Bearer (\S+)$/.exec(req.headers.authorization || '') || [])[1] || null;
}

module.exports = {
  createSession, getUserByAccessToken, refreshSession, deleteSession,
  upsertGoogleUser, upsertTelegramUser,
  googleConfigured, googleAuthUrl, googleExchange, bearer, toUser
};
