'use strict';
// GET /api/auth/google/callback?code=...&state=...
// Verifies state, exchanges the code, upserts the user, creates a session,
// then redirects to the app with tokens in the URL fragment (implicit-style),
// which the frontend shim reads via detectSessionInUrl.
const crypto = require('node:crypto');
const { googleConfigured, googleExchange, upsertGoogleUser, createSession } = require('../../_lib/auth');

const STATE_TTL_MS = 10 * 60 * 1000;

function verifyState(state) {
  if (typeof state !== 'string' || !state.includes('.')) return null;
  const [body, sig] = state.split('.');
  const expect = crypto.createHmac('sha256', process.env.APP_SECRET || 'x').update(body).digest('base64url');
  const a = Buffer.from(sig || ''), b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let p; try { p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch (_) { return null; }
  if (!p || typeof p.t !== 'number' || Date.now() - p.t > STATE_TTL_MS) return null;
  return p;
}

function fail(res, reason) {
  return res.redirect(302, '/dashboard?auth_error=' + encodeURIComponent(reason));
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!googleConfigured()) return fail(res, 'google_not_configured');
  if (req.query.error) return fail(res, 'google_denied');
  const code = typeof req.query.code === 'string' ? req.query.code : null;
  const st = verifyState(req.query.state);
  if (!code || !st) return fail(res, 'bad_state');
  let next = typeof st.next === 'string' && /^\/[^/]/.test(st.next) ? st.next : '/dashboard';
  try {
    const profile = await googleExchange(code);
    const userId = await upsertGoogleUser(profile);
    const s = await createSession(userId);
    const frag = new URLSearchParams({
      access_token: s.access_token,
      refresh_token: s.refresh_token,
      expires_at: String(s.expires_at),
      token_type: 'bearer'
    }).toString();
    return res.redirect(302, next + '#' + frag);
  } catch (e) {
    console.error('google_callback_failed', String(e).slice(0, 200));
    return fail(res, 'google_failed');
  }
};
