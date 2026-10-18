// POST /api/deck-image  { topic_slug, grade, idx, title, lines:[], visual }
// -> { url } (uploaded to Supabase Storage bucket 'decks', public) OR { dataUrl } if upload unavailable.
// One slide image per call (keeps within function time limits). Auth: Supabase bearer (teachers). Rate-limited.
'use strict';
const { createClient } = require('@supabase/supabase-js');
const IMG_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const BUCKET = process.env.DECK_BUCKET || 'decks';
const str = (v, n) => (typeof v === 'string' ? v : '').slice(0, n || 200);

function imgPrompt(visual) {
  return [
    'Create a clean, modern, friendly flat-vector ILLUSTRATION for a school physics lesson slide.',
    'Subject: ' + (visual || 'a simple, relevant physics diagram') + '.',
    'Style: minimal flat vector, smooth shapes, subtle depth; color palette deep blue #3B4CFF with amber #FFB21E accents; plain white or transparent background; centered composition with margin.',
    'CRITICAL: the image must contain NO text of any kind \u2014 no words, no letters, no numbers, no labels, no captions, no watermark, no logo. Illustration only.',
    'High quality, crisp, 4:3.'
  ].join('\n');
}

async function genImage(p) {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + IMG_MODEL + ':generateContent', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: p }] }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } }),
    signal: AbortSignal.timeout(55000)
  });
  if (!r.ok) throw new Error('img_http_' + r.status + ': ' + (await r.text()).slice(0, 160));
  const d = await r.json();
  const parts = ((((d.candidates || [])[0] || {}).content || {}).parts) || [];
  const img = parts.find((x) => x.inlineData && x.inlineData.data);
  if (!img) throw new Error('no_image');
  return { b64: img.inlineData.data, mime: img.inlineData.mimeType || 'image/png' };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'not_configured' });
  const m = /^Bearer (\S+)$/.exec(req.headers.authorization || '');
  if (!m) return res.status(401).json({ error: 'sign_in_required' });
  let body; try { body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); } catch (_) { return res.status(400).json({ error: 'invalid_json' }); }
  const slug = str(body.topic_slug, 120), title = str(body.title, 160), visual = str(body.visual, 200);
  const grade = [6, 7, 8, 9, 10, 11].includes(Number(body.grade)) ? Number(body.grade) : null;
  const idx = Number.isInteger(Number(body.idx)) ? Math.max(0, Math.min(20, Number(body.idx))) : 0;
  const lines = Array.isArray(body.lines) ? body.lines.map((l) => str(l, 120)).filter(Boolean).slice(0, 3) : [];
  if (!slug || !title) return res.status(400).json({ error: 'missing_fields' });

  let sb;
  try {
    sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const u = await sb.auth.getUser(m[1]);
    if (u.error || !u.data || !u.data.user) return res.status(401).json({ error: 'sign_in_required' });
    const prof = await sb.from('profiles').select('role').eq('id', u.data.user.id).maybeSingle();
    if (prof.data && prof.data.role === 'student') return res.status(403).json({ error: 'teachers_only' });
    const lim = await sb.rpc('empira_take_rate_limit', { bucket: 'deck:' + u.data.user.id, maximum: 120, window_seconds: 3600 });
    if (lim.error) throw lim.error;
    if (lim.data !== true) return res.status(429).json({ error: 'too_many' });
  } catch (_) { return res.status(503).json({ error: 'service_unavailable' }); }

  let img;
  try { img = await genImage(imgPrompt(visual)); }
  catch (e) { console.error('deck_image_failed', String(e).slice(0, 200)); return res.status(502).json({ error: 'image_failed' }); }

  // Try to store it (reusable). If the bucket/upload is unavailable, fall back to returning the image inline.
  try {
    const buf = Buffer.from(img.b64, 'base64');
    const ext = img.mime.indexOf('jpeg') >= 0 ? 'jpg' : 'png';
    const path = slug + '-' + (grade || 'x') + '/' + idx + '.' + ext;
    const up = await sb.storage.from(BUCKET).upload(path, buf, { contentType: img.mime, upsert: true });
    if (up.error) throw up.error;
    const pub = sb.storage.from(BUCKET).getPublicUrl(path);
    const url = pub && pub.data && pub.data.publicUrl;
    if (!url) throw new Error('no_public_url');
    return res.status(200).json({ url: url });
  } catch (e) {
    console.error('deck_store_fallback', String(e).slice(0, 160));
    return res.status(200).json({ dataUrl: 'data:' + img.mime + ';base64,' + img.b64, stored: false });
  }
};
