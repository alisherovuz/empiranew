'use strict';
// GET /api/auth/google/start?next=/dashboard  -> 302 redirect to Google consent.
const crypto = require('node:crypto');
const { googleConfigured, googleAuthUrl } = require('../../_lib/auth');

function signState(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', process.env.APP_SECRET || 'x').update(body).digest('base64url');
  return body + '.' + sig;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!googleConfigured()) return res.redirect(302, '/dashboard?auth_error=google_not_configured');
  // Only allow local relative paths as the post-login destination.
  let next = typeof req.query.next === 'string' ? req.query.next : '/dashboard';
  if (!/^\/[^/]/.test(next)) next = '/dashboard';
  const state = signState({ n: crypto.randomBytes(12).toString('hex'), next, t: Date.now() });
  return res.redirect(302, googleAuthUrl(state));
};
