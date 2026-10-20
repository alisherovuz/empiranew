'use strict';
// POST /api/rpc { fn, args } — whitelisted stored-procedure calls.
// The caller's user id is injected server-side; never taken from the client.
// Returns Supabase-style { data, error }.
const { query, one } = require('./_lib/db');
const { getUserByAccessToken, bearer } = require('./_lib/auth');
const { noStore } = require('./_lib/security');

function ok(res, data) { return res.status(200).json({ data, error: null }); }
function err(res, code, message) { return res.status(code).json({ data: null, error: { message } }); }

module.exports = async (req, res) => {
  noStore(res);
  if (req.method !== 'POST') return err(res, 405, 'POST only');
  const body = typeof req.body === 'string' ? safe(req.body) : (req.body || {});
  const fn = body.fn;
  const a = body.args && typeof body.args === 'object' ? body.args : {};

  let user;
  try { user = await getUserByAccessToken(bearer(req)); }
  catch (e) { return err(res, 503, 'auth_unavailable'); }
  if (!user) return err(res, 401, 'sign_in_required');
  const uid = user.id;

  try {
    switch (fn) {
      case 'empira_teacher_classes': {
        const r = await query(`SELECT * FROM empira_teacher_classes($1)`, [uid]);
        return ok(res, r.rows);
      }
      case 'empira_my_classes': {
        const r = await query(`SELECT * FROM empira_my_classes($1)`, [uid]);
        return ok(res, r.rows);
      }
      case 'empira_create_class': {
        const row = await one(`SELECT * FROM empira_create_class($1, $2, $3)`,
          [uid, str(a.p_title), intOrNull(a.p_grade)]);
        return ok(res, row);
      }
      case 'empira_join_class': {
        const row = await one(`SELECT * FROM empira_join_class($1, $2)`, [uid, str(a.p_code)]);
        return ok(res, row);
      }
      case 'empira_class_roster': {
        const r = await query(`SELECT * FROM empira_class_roster($1, $2)`, [uid, a.p_class]);
        return ok(res, r.rows);
      }
      case 'empira_class_report': {
        const r = await query(`SELECT * FROM empira_class_report($1, $2)`, [uid, a.p_class]);
        return ok(res, r.rows);
      }
      case 'empira_class_students': {
        const r = await query(`SELECT * FROM empira_class_students($1, $2)`, [uid, a.p_class]);
        return ok(res, r.rows);
      }
      case 'empira_save_presentation': {
        await query(`SELECT empira_save_presentation($1, $2, $3, $4, $5::jsonb)`,
          [uid, str(a.p_slug), intOrNull(a.p_grade), str(a.p_title),
           JSON.stringify(a.p_slides ?? [])]);
        return ok(res, null);
      }
      // -------- admin only --------
      case 'admin_users':
      case 'admin_stats': {
        const prof = await one(`SELECT role FROM profiles WHERE id = $1`, [uid]);
        if (!prof || prof.role !== 'admin') return err(res, 403, 'admin_only');
        if (fn === 'admin_users') {
          const q = str(a.q);
          const role = ['teacher', 'student', 'admin'].includes(a.role_filter) ? a.role_filter : null;
          const lim = Math.min(Math.max(parseInt(a.lim, 10) || 100, 1), 500);
          const r = await query(
            `SELECT full_name, role, school, region FROM profiles
             WHERE ($1 = '' OR full_name ILIKE '%'||$1||'%' OR school ILIKE '%'||$1||'%')
               AND ($2::text IS NULL OR role = $2)
             ORDER BY full_name NULLS LAST LIMIT $3`,
            [q, role, lim]);
          return ok(res, r.rows);
        }
        // admin_stats
        const stats = await one(`
          SELECT
            (SELECT count(*) FROM profiles WHERE role = 'teacher') AS teachers,
            (SELECT count(*) FROM profiles WHERE role = 'student') AS students,
            (SELECT count(DISTINCT school) FROM profiles WHERE school IS NOT NULL AND school <> '') AS schools,
            (SELECT count(*) FROM telegram_users) AS telegram_users,
            (SELECT count(*) FROM lab_progress) AS lab_opens`);
        const regions = await query(
          `SELECT region, count(*)::int AS n FROM profiles
           WHERE region IS NOT NULL AND region <> '' GROUP BY region ORDER BY n DESC LIMIT 20`);
        return ok(res, {
          teachers: Number(stats.teachers), students: Number(stats.students),
          schools: Number(stats.schools), telegram_users: Number(stats.telegram_users),
          lab_opens: Number(stats.lab_opens), by_region: regions.rows
        });
      }
      default:
        return err(res, 400, 'unknown_fn');
    }
  } catch (e) {
    const msg = String(e && e.message || e);
    console.error('rpc_failed', fn, msg.slice(0, 200));
    // Surface the function's own RAISE messages (e.g. 'teachers only', 'class not found').
    return err(res, 400, msg.replace(/^.*?:\s*/, '').slice(0, 120) || 'rpc_error');
  }
};

function safe(s) { try { return JSON.parse(s); } catch (_) { return {}; } }
function str(v) { return typeof v === 'string' ? v : (v == null ? '' : String(v)); }
function intOrNull(v) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; }
