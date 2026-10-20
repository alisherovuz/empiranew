'use strict';
// POST /api/auth/signout { access_token } -> { ok: true }
const { deleteSession } = require('../_lib/auth');
const { noStore } = require('../_lib/security');

module.exports = async (req, res) => {
  noStore(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const body = typeof req.body === 'string' ? safe(req.body) : (req.body || {});
  try { await deleteSession(body.access_token); } catch (_) {}
  return res.status(200).json({ ok: true });
};
function safe(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
