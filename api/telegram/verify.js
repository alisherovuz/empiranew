// Sayt kodni shu yerga yuboradi. To'g'ri bo'lsa — hisob yaratiladi/ulanadi.
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

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

    const { data: row } = await sb.from('telegram_codes').select('*').eq('code', code).single();
    if (!row) return res.status(404).json({ error: 'Kod topilmadi' });

    if (new Date(row.expires_at) < new Date()) {
      await sb.from('telegram_codes').delete().eq('code', row.code);
      return res.status(410).json({ error: 'Kod muddati tugagan' });
    }
    await sb.from('telegram_users').upsert({
      telegram_id: row.telegram_id, username: row.username,
      first_name: row.first_name, photo_url: row.photo_url,
      last_seen: new Date().toISOString()
    }, { onConflict: 'telegram_id' });
    await sb.from('telegram_codes').delete().eq('code', row.code);

    return res.status(200).json({ ok: true, telegram_id: row.telegram_id, first_name: row.first_name });
  } catch (e) { return res.status(500).json({ error: 'Server xatosi' }); }
};
