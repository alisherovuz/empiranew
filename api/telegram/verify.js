// Sayt kodni shu yerga yuboradi. To'g'ri bo'lsa — Telegram foydalanuvchisi
// Supabase Auth user'iga aylanadi va unga sessiya (access/refresh token) beriladi.
// Shunday qilib Google ham, Telegram ham BITTA sessiya + RLS ustida ishlaydi.
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const { clientBucket, limit, noStore } = require('../_lib/security');

const URL     = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_KEY;     // secret (admin) key
const ANON    = process.env.SUPABASE_ANON_KEY;        // publishable (public) key
const SECRET  = process.env.APP_SECRET || SERVICE;    // parol hosil qilish uchun (barqaror bo'lsin!)

// Create clients inside the handler so missing Preview variables return JSON.

const tgEmail = (id) => 'tg' + id + '@tg.empira.app';
const tgPass  = (id) => crypto.createHmac('sha256', SECRET).update('tg:' + String(id)).digest('hex');

module.exports = async (req, res) => {
  noStore(res);
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  if (!URL || !SERVICE || !ANON) {
    console.error('telegram_verify_not_configured');
    return res.status(503).json({ ok:false, code:'AUTH_NOT_CONFIGURED', error:'Telegram orqali kirish bu saytda hali sozlanmagan. Hozir Google orqali kiring yoki yordam xizmatiga murojaat qiling.' });
  }
  try {
    const admin = createClient(URL, SERVICE, { auth: { autoRefreshToken:false, persistSession:false } });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const code = body && body.code && String(body.code).trim();
    if (!code || !/^\d{6}$/.test(code)) return res.status(400).json({ error: 'Kod kiritilmadi' });

    if (!await limit(admin, clientBucket(req, 'tg-verify'), 10, 300) || !await limit(admin, 'tg-verify-global', 300, 60)) {
      res.setHeader('Retry-After', '300');
      return res.status(429).json({ error: 'Juda ko‘p urinish. Biroz kutib, qayta urinib ko‘ring.' });
    }
    // DELETE ... RETURNING consumes an OTP exactly once, before session creation.
    const consumed = await admin.rpc('empira_consume_telegram_code', { p_code: code });
    if (consumed.error) throw new Error('code_store_unavailable');
    const row = consumed.data;
    if (!row) return res.status(400).json({ error: 'Kod noto‘g‘ri yoki muddati tugagan. Botdan yangi kod oling.' });

    const email     = tgEmail(row.telegram_id);
    const password  = tgPass(row.telegram_id);
    const full_name = row.first_name || ('Telegram ' + row.telegram_id);

    // 2) Sessiya: avval to'g'ridan-to'g'ri kirishga urinamiz (qaytgan foydalanuvchi uchun TEZ yo'l — createUser'siz).
    const pub = createClient(URL, ANON, { auth: { autoRefreshToken: false, persistSession: false } });
    let si = await pub.auth.signInWithPassword({ email, password });
    if (si.error || !si.data || !si.data.session) {
      // Birinchi marta: auth user yaratamiz, keyin kiramiz.
      await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { provider: 'telegram', telegram_id: row.telegram_id, username: row.username || null, full_name }
      });
      si = await pub.auth.signInWithPassword({ email, password });
    }
    if (si.error || !si.data || !si.data.session) {
      return res.status(503).json({ok:false,code:'AUTH_SESSION_FAILED',error:'Telegram hisobi bilan kirib bo‘lmadi. Hozir Google orqali kiring yoki yordam xizmatiga murojaat qiling.'});
    }
    const s = si.data.session;

    // 3) Sanash uchun telegram_users, so'ng kodni o'chiramiz
    await admin.from('telegram_users').upsert(
      { telegram_id: row.telegram_id, username: row.username, first_name: row.first_name, last_seen: new Date().toISOString() },
      { onConflict: 'telegram_id' }
    );
    return res.status(200).json({
      ok: true,
      access_token: s.access_token,
      refresh_token: s.refresh_token,
      telegram_id: row.telegram_id,
      first_name: full_name
    });
  } catch (e) {
    const storage = ['rate_limit_unavailable','code_store_unavailable'].includes(e.message);
    console.error(storage ? 'telegram_verify_storage_unavailable' : 'telegram_verify_failed');
    return res.status(503).json({ok:false,code:storage?'AUTH_STORAGE_UNAVAILABLE':'AUTH_UNAVAILABLE',
      error:storage?'Telegram kirish xizmati vaqtincha tayyor emas. Hozir Google orqali kiring yoki yordam xizmatiga murojaat qiling.':'Telegram orqali kirish hozir ishlamayapti. Birozdan so‘ng botdan yangi kod olib urinib ko‘ring.'});
  }
};
