'use strict';
// POST /api/auth/user { access_token }  -> { user } | 401
// Backs the shim's getSession()/getUser().
const { getUserByAccessToken } = require('../_lib/auth');
const { noStore } = require('../_lib/security');

module.exports = async (req, res) => {
  noStore(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const body = typeof req.body === 'string' ? safe(req.body) : (req.body || {});
  const t = body.access_token;
  try {
    const user = await getUserByAccessToken(t);
    if (!user) return res.status(401).json({ user: null });
    return res.status(200).json({ user });
  } catch (e) {
    console.error('auth_user_failed', String(e).slice(0, 160));
    return res.status(503).json({ error: 'auth_unavailable' });
  }
};
function safe(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
