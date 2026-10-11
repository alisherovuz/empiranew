// POST /api/scan  { image: "<base64 JPEG>", mime: "image/jpeg" }
// → { status: 'found', grade, subject, topic: { slug, title, n }, labs: [{ slug, title }] } | { status: 'notfound' } | { status: 'error' }
// Gemini reads the photographed page (page number, § number, heading); the server matches it to the 8-sinf curriculum.
// Env: GEMINI_API_KEY (required), GEMINI_MODEL (optional, default below).
const { match, sectionList } = require('./_lib/curriculum');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_BASE64 = 6 * 1024 * 1024;

function prompt() {
  return [
    'You are reading a photo of a page from the Uzbek school textbook "Fizika. 8-sinf" (2019, Uzbek Latin script).',
    'Read what is printed on the page and answer ONLY with JSON of this shape:',
    '{"is_textbook_page": boolean, "page_number": integer|null, "paragraph": integer|null, "heading": string|null, "confidence": number}',
    '- page_number: the printed page number (usually in a corner of the page), or null if not visible.',
    '- paragraph: the section number if a section label like "19-§" is visible on the page, or if the page clearly continues one section from the list below; otherwise null.',
    '- heading: the main section heading text exactly as printed (Uzbek), or null.',
    '- is_textbook_page: false if the photo is not a page of this textbook.',
    '- confidence: 0..1, how sure you are.',
    'Do not guess numbers you cannot see. The book\'s sections are:',
    sectionList()
  ].join('\n');
}

async function askGemini(base64, mime) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
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

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const base64 = String(body.image || '').replace(/^data:[^;]+;base64,/, '');
  const mime = /^image\/(jpeg|png|webp)$/.test(body.mime) ? body.mime : 'image/jpeg';
  if (!base64) return res.status(400).json({ status: 'error', error: 'no_image' });
  if (base64.length > MAX_BASE64) return res.status(413).json({ status: 'error', error: 'image_too_large' });

  const started = Date.now();
  try {
    const reading = await askGemini(base64, mime);
    const result = match(reading);
    // Log only the outcome, never the photo
    console.log(JSON.stringify({ scan: result.status, method: result.method, topic: result.topic?.n, ms: Date.now() - started, model: MODEL }));
    return res.status(200).json({ ...result, reading: { page_number: reading.page_number ?? null, paragraph: reading.paragraph ?? null } });
  } catch (err) {
    console.error('scan_failed', String(err).slice(0, 400));
    return res.status(502).json({ status: 'error', error: 'recognition_failed' });
  }
};
