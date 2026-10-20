'use strict';
// POST /api/auth/refresh { refresh_token } -> { session } | 401  (rotates tokens)
const { refreshSession } = require('../_lib/auth');
const { noStore } = require('../_lib/security');

module.exports = async (req, res) => {
  noStore(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const body = typeof req.body === 'string' ? safe(req.body) : (req.body || {});
  try {
    const session = await refreshSession(body.refresh_token);
    if (!session) return res.status(401).json({ session: null });
    return res.status(200).json({ session });
  } catch (e) {
    console.error('auth_refresh_failed', String(e).slice(0, 160));
    return res.status(503).json({ error: 'auth_unavailable' });
  }
};
function safe(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
