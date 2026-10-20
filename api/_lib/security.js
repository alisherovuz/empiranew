'use strict';
const crypto = require('node:crypto');
const { one } = require('./db');

function sameSecret(actual, expected) {
  if (typeof actual !== 'string' || typeof expected !== 'string' || !expected) return false;
  const a = Buffer.from(actual), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function clientBucket(req, prefix) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  return prefix + ':' + crypto.createHmac('sha256', process.env.APP_SECRET || '').update(ip).digest('hex');
}

async function limit(bucket, maximum, seconds = 60) {
  const r = await one('SELECT empira_take_rate_limit($1, $2, $3) AS ok', [bucket, maximum, seconds]);
  if (!r) throw new Error('rate_limit_unavailable');
  return r.ok === true;
}

function noStore(res) { res.setHeader('Cache-Control', 'no-store'); }
module.exports = { sameSecret, clientBucket, limit, noStore };
