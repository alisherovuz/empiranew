// Telegram webhook — /start kelganda kod yaratib, foydalanuvchiga yuboradi.
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function tg(method, body){
  await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
  });
}
const code6 = () => String(Math.floor(100000 + Math.random() * 900000));

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(200).send('ok');
  try {
    const upd = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const msg = upd.message;
    if (msg && msg.text && msg.text.startsWith('/start')) {
      const u = msg.from;
      const code = code6();
      await sb.from('telegram_codes').upsert({
        code,
        telegram_id: u.id,
        username: u.username || null,
        first_name: [u.first_name, u.last_name].filter(Boolean).join(' ') || null,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      });
      await tg('sendMessage', {
        chat_id: msg.chat.id,
        text: `Empira'ga ulanish kodingiz:\n\n*${code}*\n\nShu kodni saytga kiriting. Kod 5 daqiqa amal qiladi.`,
        parse_mode: 'Markdown'
      });
    }
    return res.status(200).json({ ok: true });
  } catch (e) { return res.status(200).json({ ok: false }); }
};
