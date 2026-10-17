// Sayt kodni shu yerga yuboradi. To'g'ri bo'lsa — Telegram foydalanuvchisi
// Supabase Auth user'iga aylanadi va unga sessiya (access/refresh token) beriladi.
// Shunday qilib Google ham, Telegram ham BITTA sessiya + RLS ustida ishlaydi.
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const URL     = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_KEY;     // secret (admin) key
const ANON    = process.env.SUPABASE_ANON_KEY;        // publishable (public) key
const SECRET  = process.env.APP_SECRET || SERVICE;    // parol hosil qilish uchun (barqaror bo'lsin!)

const admin = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });

const tgEmail = (id) => 'tg' + id + '@tg.empira.app';
const tgPass  = (id) => crypto.createHmac('sha256', SECRET).update('tg:' + String(id)).digest('hex');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const code = body.code && String(body.code).trim();
    if (!code) return res.status(400).json({ error: 'Kod kiritilmadi' });

    // 1) Kodni tekshiramiz
    const { data: row } = await admin.from('telegram_codes').select('*').eq('code', code).single();
    if (!row) return res.status(404).json({ error: 'Kod topilmadi' });
    if (new Date(row.expires_at) < new Date()) {
      await admin.from('telegram_codes').delete().eq('code', row.code);
      return res.status(410).json({ error: 'Kod muddati tugagan' });
    }

    const email     = tgEmail(row.telegram_id);
    const password  = tgPass(row.telegram_id);
    const full_name = row.first_name || ('Telegram ' + row.telegram_id);

    // 2) Auth user yaratamiz (agar bo'lmasa). Bor bo'lsa — xatoni e'tiborsiz qoldiramiz.
    const cr = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { provider: 'telegram', telegram_id: row.telegram_id, username: row.username || null, full_name }
    });
    // cr.error (masalan "already registered") bo'lsa ham davom etamiz — parol deterministik.

    // 3) Sanash uchun telegram_users, so'ng kodni o'chiramiz
    await admin.from('telegram_users').upsert(
      { telegram_id: row.telegram_id, username: row.username, first_name: row.first_name, last_seen: new Date().toISOString() },
      { onConflict: 'telegram_id' }
    );
    await admin.from('telegram_codes').delete().eq('code', row.code);

    // 4) Sessiya olamiz (anon klient bilan parol orqali kiramiz)
    const pub = createClient(URL, ANON, { auth: { autoRefreshToken: false, persistSession: false } });
    const si = await pub.auth.signInWithPassword({ email, password });
    if (si.error || !si.data || !si.data.session) {
      return res.status(500).json({ error: 'Sessiya yaratilmadi. Email provider yoqilganini tekshiring.' });
    }
    const s = si.data.session;
    return res.status(200).json({
      ok: true,
      access_token: s.access_token,
      refresh_token: s.refresh_token,
      telegram_id: row.telegram_id,
      first_name: full_name
    });
  } catch (e) {
    return res.status(500).json({ error: 'Server xatosi: ' + (e.message || e) });
  }
};
