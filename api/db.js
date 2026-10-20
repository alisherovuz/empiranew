'use strict';
// POST /api/db  — constrained data access for the browser (replaces direct
// Supabase table access + RLS). Every policy is enforced server-side from the
// session user id; client-supplied id/user_id filters are never trusted.
//
// Body: { table, action, columns?, values?, filters?, single? }
//   action: 'select' | 'insert' | 'update' | 'upsert'
// Returns Supabase-style { data, error }.
const { query, one } = require('./_lib/db');
const { getUserByAccessToken, bearer } = require('./_lib/auth');
const { noStore } = require('./_lib/security');

// Columns a user may set on their own profile (role limited to teacher|student).
const PROFILE_WRITABLE = ['full_name', 'username', 'school', 'region', 'district',
  'institution_type', 'subjects', 'grades', 'student_counts', 'onboarded', 'role'];

function ok(res, data) { return res.status(200).json({ data, error: null }); }
function err(res, code, message) { return res.status(code).json({ data: null, error: { message } }); }

module.exports = async (req, res) => {
  noStore(res);
  if (req.method !== 'POST') return err(res, 405, 'POST only');
  const body = typeof req.body === 'string' ? safe(req.body) : (req.body || {});
  const { table, action } = body;

  let user;
  try { user = await getUserByAccessToken(bearer(req)); }
  catch (e) { return err(res, 503, 'auth_unavailable'); }
  if (!user) return err(res, 401, 'sign_in_required');
  const uid = user.id;

  try {
    // -------- profiles: read/update own row only --------
    if (table === 'profiles') {
      if (action === 'select') {
        const r = await query(`SELECT * FROM profiles WHERE id = $1`, [uid]);
        return ok(res, body.single ? (r.rows[0] || null) : r.rows);
      }
      if (action === 'update') {
        const patch = body.values && typeof body.values === 'object' ? body.values : {};
        // Role is write-once: it may be set during onboarding, then it is permanently locked.
        const current = await one(`SELECT onboarded FROM profiles WHERE id = $1`, [uid]);
        const roleLocked = !!(current && current.onboarded);
        const cols = [], vals = [];
        for (const k of PROFILE_WRITABLE) {
          if (!(k in patch)) continue;
          let v = patch[k];
          if (k === 'role') {
            if (roleLocked) continue;                              // one account = one role, strict
            if (!['teacher', 'student'].includes(v)) continue;     // never let a user self-assign admin
          }
          cols.push(k); vals.push(v);
        }
        if (!cols.length) {
          // Nothing to change, but callers may still ask for the row back (.select()).
          const row = await one(`SELECT * FROM profiles WHERE id = $1`, [uid]);
          return ok(res, body.single ? row : (row ? [row] : []));
        }
        const set = cols.map((c, i) => `${c} = $${i + 2}`).join(', ');
        const r = await query(`UPDATE profiles SET ${set} WHERE id = $1 RETURNING *`, [uid, ...vals]);
        return ok(res, body.single ? (r.rows[0] || null) : r.rows);
      }
      return err(res, 400, 'unsupported_action');
    }

    // -------- lab_progress: read/sync own rows only --------
    if (table === 'lab_progress') {
      if (action === 'select') {
        const r = await query(
          `SELECT lab_id, mode, snapshot, updated_at FROM lab_progress WHERE user_id = $1`, [uid]);
        return ok(res, r.rows);
      }
      if (action === 'upsert') {
        const rows = Array.isArray(body.values) ? body.values : [body.values];
        for (const row of rows) {
          if (!row) continue;
          await query(
            `INSERT INTO lab_progress (user_id, lab_id, mode, snapshot, updated_at)
             VALUES ($1, $2, $3, $4, COALESCE($5::timestamptz, now()))
             ON CONFLICT (user_id, lab_id, mode)
             DO UPDATE SET snapshot = excluded.snapshot, updated_at = excluded.updated_at`,
            [uid, row.lab_id, row.mode, row.snapshot, row.updated_at || null]
          );
        }
        return ok(res, null);
      }
      return err(res, 400, 'unsupported_action');
    }

    // -------- empira_quiz_answers: insert own answers only --------
    if (table === 'empira_quiz_answers') {
      if (action === 'insert') {
        const rows = Array.isArray(body.values) ? body.values : [body.values];
        for (const row of rows) {
          if (!row) continue;
          // class_id: only honor it if the student is actually enrolled; else null.
          let classId = null;
          if (row.class_id) {
            const e = await query(
              `SELECT 1 FROM empira_enrollments WHERE class_id = $1 AND student_id = $2`,
              [row.class_id, uid]);
            if (e.rowCount) classId = row.class_id;
          }
          await query(
            `INSERT INTO empira_quiz_answers
               (student_id, class_id, lab_id, topic_slug, grade, question_idx, correct, chosen)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [uid, classId, row.lab_id, row.topic_slug || null, row.grade || null,
             row.question_idx, row.correct, row.chosen]
          );
        }
        return ok(res, null);
      }
      return err(res, 400, 'unsupported_action');
    }

    // -------- empira_presentations: read only (any signed-in user) --------
    if (table === 'empira_presentations') {
      if (action === 'select') {
        const f = body.filters || {};
        const r = await query(
          `SELECT title, slides FROM empira_presentations WHERE topic_slug = $1 AND grade = $2`,
          [f.topic_slug, f.grade ?? null]);
        return ok(res, body.single ? (r.rows[0] || null) : r.rows);
      }
      return err(res, 400, 'unsupported_action');
    }

    return err(res, 400, 'unknown_table');
  } catch (e) {
    console.error('db_endpoint_failed', table, action, String(e).slice(0, 200));
    return err(res, 500, 'db_error');
  }
};

function safe(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
