'use strict';
const crypto = require('node:crypto');
function sameSecret(actual, expected) {
  if (typeof actual !== 'string' || typeof expected !== 'string' || !expected) return false;
  const a = Buffer.from(actual), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function clientBucket(req, prefix) {
  // Vercel supplies the forwarding header. Only deploy behind a trusted proxy.
  const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  return prefix + ':' + crypto.createHmac('sha256', process.env.APP_SECRET || process.env.SUPABASE_SERVICE_KEY).update(ip).digest('hex');
}
async function limit(sb, bucket, maximum, seconds = 60) {
  const { data, error } = await sb.rpc('empira_take_rate_limit', { bucket, maximum, window_seconds: seconds });
  if (error) throw new Error('rate_limit_unavailable');
  return data === true;
}
function noStore(res) { res.setHeader('Cache-Control', 'no-store'); }
module.exports = { sameSecret, clientBucket, limit, noStore };
