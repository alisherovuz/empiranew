'use strict';
const { Pool } = require('pg');

let pool;
function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.PG_POOL_MAX) || 16,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
    pool.on('error', (e) => console.error('pg_pool_error', String(e).slice(0, 200)));
  }
  return pool;
}

async function query(text, params) {
  return getPool().query(text, params);
}

async function one(text, params) {
  const r = await getPool().query(text, params);
  return r.rows[0] || null;
}

module.exports = { getPool, query, one };
