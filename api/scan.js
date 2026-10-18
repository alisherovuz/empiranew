// POST /api/scan  { image: "<base64 JPEG>", mime: "image/jpeg", grade?: 7|8 }
// → { status: 'found', grade, subject, topic: { slug, title, n }, labs: [{ slug, title }], reading } | { status: 'notfound' } | { status: 'error' }
// Gemini reads the photographed page (which book, page number, § number, heading); the server matches it to the
// 7-sinf or 8-sinf curriculum. `grade` is the grade of the page the teacher scanned from: a hint used only when
// Gemini cannot tell which book the page is from.
// Env: GEMINI_API_KEY (required), GEMINI_MODEL (optional, default below).
const { createClient } = require('@supabase/supabase-js');
const { limit } = require('./_lib/security');
const { match, sectionList } = require('./_lib/curriculum');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_BASE64 = 3 * 1024 * 1024;

function prompt() {
  return [
    'You are reading a photo of a page from one of two Uzbek school physics textbooks (Uzbek Latin script):',
    '- "Fizika. 7-sinf" (2017): mechanics: harakat (motion), kuch (force), ishqalanish (friction), impuls (momentum), energiya (energy).',
    '- "Fizika. 8-sinf" (2019): electricity and magnetism: elektr zaryad, elektr toki, Om qonuni, elektroliz, magnit maydon.',
    'Read what is printed on the page and answer ONLY with JSON of this shape:',
    '{"is_textbook_page": boolean, "grade": 7|8|null, "page_number": integer|null, "paragraph": integer|null, "heading": string|null, "confidence": number}',
    '- grade: which of the two books the page is from (7 or 8), judged from its content and headings; null if you cannot tell.',
    '- page_number: the printed page number (usually in a corner of the page), or null if not visible.',
    '- paragraph: the section number if a section label like "19-§" is visible on the page, or if the page clearly continues one section from that book\'s list below; otherwise null.',
    '- heading: the main section heading text exactly as printed (Uzbek), or null.',
    '- is_textbook_page: false if the photo is not a page of either textbook.',
    '- confidence: 0..1, how sure you are.',
    'Do not guess numbers you cannot see. The sections of each book are:',
    '',
    '7-sinf book ("Fizika. 7-sinf", 2017):',
    sectionList(7),
    '',
    '8-sinf book ("Fizika. 8-sinf", 2019):',
    sectionList(8)
  ].join('\n');
}

async function askGemini(base64, mime) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    signal: AbortSignal.timeout(20000),
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt() }, { inline_data: { mime_type: mime, data: base64 } }] }],
      generationConfig: { temperature: 0, responseMimeType: 'application/json' }
    })
  });
  if (!res.ok) throw new Error(`gemini_http_${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  return JSON.parse(text.replace(/^```(json)?|```$/g, '').trim());
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ status: 'error', error: 'method_not_allowed' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ status: 'error', error: 'not_configured' });

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); }
  catch (_) { return res.status(400).json({ status:'error', error:'invalid_json' }); }
  if (!body || typeof body !== 'object') return res.status(400).json({ status:'error', error:'invalid_body' });
  const base64 = String(body.image || '').replace(/^data:[^;]+;base64,/, '');
  const mime = /^image\/(jpeg|png|webp)$/.test(body.mime) ? body.mime : 'image/jpeg';
  if (!base64) return res.status(400).json({ status: 'error', error: 'no_image' });
  if (base64.length > MAX_BASE64) return res.status(413).json({ status: 'error', error: 'image_too_large' });

  const token = /^Bearer (\S+)$/.exec(req.headers.authorization || '')?.[1];
  if (!token) return res.status(401).json({ status:'error', error:'sign_in_required' });
  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession:false, autoRefreshToken:false } });
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ status:'error', error:'sign_in_required' });
    if (!await limit(sb, 'scan-user:' + data.user.id, 10, 60) || !await limit(sb, 'scan-global', 120, 60)) {
      res.setHeader('Retry-After','60');
      return res.status(429).json({ status:'error', error:'too_many_scans' });
    }
  } catch (_) { return res.status(503).json({ status:'error', error:'service_unavailable' }); }
  const started = Date.now();
  try {
    const hint = [7, 8].includes(Number(body.grade)) ? Number(body.grade) : null;
    const reading = await askGemini(base64, mime);
    const result = match(reading, hint);
    // Log only the outcome, never the photo
    console.log(JSON.stringify({ scan: result.status, method: result.method, grade: result.grade, read_grade: reading.grade ?? null, hint, topic: result.topic?.n, ms: Date.now() - started, model: MODEL }));
    return res.status(200).json({ ...result, reading: { grade: reading.grade ?? null, page_number: reading.page_number ?? null, paragraph: reading.paragraph ?? null } });
  } catch (err) {
    console.error('scan_failed', String(err).slice(0, 400));
    return res.status(502).json({ status: 'error', error: 'recognition_failed' });
  }
};
