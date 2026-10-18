'use strict';
const { createClient } = require('@supabase/supabase-js');
const { randomInt } = require('node:crypto');
const { sameSecret, limit, noStore } = require('../_lib/security');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
module.exports = async (req, res) => {
  noStore(res);
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ ok: false });
  if (!sameSecret(req.headers['x-telegram-bot-api-secret-token'], secret)) return res.status(401).json({ ok: false });
  let upd;
  try { upd = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch (_) { return res.status(400).json({ ok: false }); }
  const msg = upd?.message, u = msg?.from;
  if (!msg?.text || !/^\/start(?:@empirabot)?(?:\s|$)/i.test(msg.text)) return res.status(200).json({ ok: true });
  if (!Number.isSafeInteger(u?.id) || u.id <= 0 || u.is_bot || msg.chat?.type !== 'private' || msg.chat.id !== u.id) return res.status(200).json({ ok: true });
  try {
    if (!await limit(sb, 'tg-issue:' + u.id, 3, 300)) return res.status(200).json({ ok: true });
    let code;
    for (let attempt = 0; attempt < 5; attempt++) {
      code = String(randomInt(100000, 1000000));
      const r = await sb.rpc('empira_issue_telegram_code', {
        p_code: code, p_telegram_id: u.id, p_username: u.username || null,
        p_first_name: [u.first_name, u.last_name].filter(Boolean).join(' ') || null
      });
      if (r.error) throw new Error('code_store_failed');
      if (r.data === true) break;
      code = null;
    }
    if (!code) throw new Error('code_generation_failed');
    const delivery = await fetch('https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: u.id, text: "Empira'ga ulanish kodingiz:\n\n" + code + "\n\nShu kodni saytga kiriting. Kod 5 daqiqa amal qiladi." }),
      signal: AbortSignal.timeout(10000)
    });
    const sent = await delivery.json();
    if (!delivery.ok || !sent.ok) throw new Error('delivery_failed');
    return res.status(200).json({ ok: true });
  } catch (_) {
    return res.status(503).json({ ok: false });
  }
};
