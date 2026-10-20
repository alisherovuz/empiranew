#!/usr/bin/env node
/* One-time data migration: Supabase -> local PostgreSQL.
 * Reads SUPABASE_URL, SUPABASE_SERVICE_KEY, DATABASE_URL from the environment.
 * Pulls auth users + app tables from Supabase (service role, bypasses RLS) and
 * inserts them into the local schema, preserving ids. Idempotent: ON CONFLICT DO NOTHING.
 *
 * Run from /srv/empira/empiranew so require('pg') resolves:
 *   sudo bash -c 'set -a; . /etc/empira/app.env; set +a; cd /srv/empira/empiranew && node scripts/migrate-from-supabase.cjs'
 */
'use strict';
const { Pool } = require('pg');

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;
const DB = process.env.DATABASE_URL;
if (!URL || !KEY || !DB) { console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_KEY / DATABASE_URL'); process.exit(1); }

const pool = new Pool({ connectionString: DB });
const H = { apikey: KEY, Authorization: 'Bearer ' + KEY };

async function getJSON(u, opts) {
  const r = await fetch(u, Object.assign({ headers: H }, opts));
  if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + u + ' :: ' + (await r.text()).slice(0, 160));
  return r.json();
}

// ---- Supabase Auth admin API (paginated) ----
async function fetchAuthUsers() {
  const out = [];
  for (let page = 1; page < 1000; page++) {
    const d = await getJSON(`${URL}/auth/v1/admin/users?page=${page}&per_page=200`);
    const users = Array.isArray(d) ? d : (d.users || []);
    if (!users.length) break;
    out.push(...users);
    if (users.length < 200) break;
  }
  return out;
}

// ---- PostgREST table reads (paginated by limit/offset) ----
async function fetchTable(table) {
  const out = [];
  for (let off = 0; off < 1e6; off += 1000) {
    const rows = await getJSON(`${URL}/rest/v1/${table}?select=*&limit=1000&offset=${off}`);
    if (!Array.isArray(rows) || !rows.length) break;
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

function providerOf(u) {
  if (u.email && String(u.email).endsWith('@tg.empira.app')) return 'telegram';
  const p = (u.app_metadata && (u.app_metadata.provider || (u.app_metadata.providers || [])[0])) || '';
  if (String(p).includes('google')) return 'google';
  return 'password';
}
function googleSubOf(u) {
  const g = (u.identities || []).find((i) => i.provider === 'google');
  return g ? ((g.identity_data && g.identity_data.sub) || g.id || null) : null;
}

async function run() {
  const c = await pool.connect();
  const stat = {};
  const insert = async (label, sql, values) => {
    try { const r = await c.query(sql, values); stat[label] = (stat[label] || 0) + (r.rowCount || 0); return true; }
    catch (e) { stat[label + '_err'] = (stat[label + '_err'] || 0) + 1;
      if ((stat[label + '_err'] || 0) <= 3) console.error('  !', label, String(e.message).slice(0, 140)); return false; }
  };
  try {
    // 1) users (from auth)
    const authUsers = await fetchAuthUsers();
    console.log('auth users:', authUsers.length);
    for (const u of authUsers) {
      const ok = await insert('users',
        `INSERT INTO users (id, email, provider, google_sub, email_confirmed, user_metadata, created_at)
         VALUES ($1,$2,$3,$4,true,$5,COALESCE($6::timestamptz, now())) ON CONFLICT (id) DO NOTHING`,
        [u.id, u.email, providerOf(u), googleSubOf(u), u.user_metadata || {}, u.created_at || null]);
      if (!ok) { // retry without google_sub (unique collision)
        await insert('users',
          `INSERT INTO users (id, email, provider, google_sub, email_confirmed, user_metadata, created_at)
           VALUES ($1,$2,$3,NULL,true,$4,COALESCE($5::timestamptz, now())) ON CONFLICT (id) DO NOTHING`,
          [u.id, u.email, providerOf(u), u.user_metadata || {}, u.created_at || null]);
      }
    }

    // 2) profiles
    for (const p of await fetchTable('profiles')) {
      await insert('profiles',
        `INSERT INTO profiles (id, role, full_name, email, username, school, region, district,
            institution_type, subjects, grades, student_counts, onboarded, created_at)
         VALUES ($1,COALESCE($2,'teacher'),$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,COALESCE($13,false),COALESCE($14::timestamptz,now()))
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.role, p.full_name, p.email, p.username, p.school, p.region, p.district,
         p.institution_type, p.subjects || null, p.grades || null,
         p.student_counts != null ? JSON.stringify(p.student_counts) : null, p.onboarded, p.created_at]);
    }

    // 3) telegram_users
    for (const t of await fetchTable('telegram_users')) {
      await insert('telegram_users',
        `INSERT INTO telegram_users (telegram_id, username, first_name, photo_url, first_seen, last_seen)
         VALUES ($1,$2,$3,$4,COALESCE($5::timestamptz,now()),COALESCE($6::timestamptz,now()))
         ON CONFLICT (telegram_id) DO NOTHING`,
        [t.telegram_id, t.username, t.first_name, t.photo_url, t.first_seen, t.last_seen]);
    }

    // 4) empira_classes
    for (const k of await fetchTable('empira_classes')) {
      await insert('empira_classes',
        `INSERT INTO empira_classes (id, teacher_id, title, grade, code, created_at)
         VALUES ($1,$2,$3,$4,$5,COALESCE($6::timestamptz,now())) ON CONFLICT (id) DO NOTHING`,
        [k.id, k.teacher_id, k.title, k.grade, k.code, k.created_at]);
    }

    // 5) empira_enrollments
    for (const e of await fetchTable('empira_enrollments')) {
      await insert('empira_enrollments',
        `INSERT INTO empira_enrollments (class_id, student_id, joined_at)
         VALUES ($1,$2,COALESCE($3::timestamptz,now())) ON CONFLICT DO NOTHING`,
        [e.class_id, e.student_id, e.joined_at]);
    }

    // 6) empira_quiz_answers
    for (const q of await fetchTable('empira_quiz_answers')) {
      await insert('empira_quiz_answers',
        `INSERT INTO empira_quiz_answers (student_id, class_id, lab_id, topic_slug, grade, question_idx, correct, chosen, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9::timestamptz,now()))`,
        [q.student_id, q.class_id, q.lab_id, q.topic_slug, q.grade, q.question_idx, q.correct, q.chosen, q.created_at]);
    }

    // 7) lab_progress
    for (const l of await fetchTable('lab_progress')) {
      await insert('lab_progress',
        `INSERT INTO lab_progress (user_id, lab_id, mode, snapshot, updated_at)
         VALUES ($1,$2,$3,$4,COALESCE($5::timestamptz,now()))
         ON CONFLICT (user_id,lab_id,mode) DO NOTHING`,
        [l.user_id, l.lab_id, l.mode, l.snapshot != null ? JSON.stringify(l.snapshot) : '{}', l.updated_at]);
    }

    // 8) empira_presentations
    for (const pr of await fetchTable('empira_presentations')) {
      await insert('empira_presentations',
        `INSERT INTO empira_presentations (id, topic_slug, grade, title, slides, updated_by, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7::timestamptz,now())) ON CONFLICT (topic_slug, grade) DO NOTHING`,
        [pr.id, pr.topic_slug, pr.grade, pr.title,
         pr.slides != null ? JSON.stringify(pr.slides) : '[]', pr.updated_by, pr.updated_at]);
    }

    console.log('\n=== migration summary (rows inserted) ===');
    console.log(JSON.stringify(stat, null, 2));
  } finally {
    c.release(); await pool.end();
  }
}
run().catch((e) => { console.error('MIGRATION FAILED:', e); process.exit(1); });
