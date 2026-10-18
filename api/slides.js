// POST /api/slides  { topic_slug, grade, title, content:{explain[],formulas[],terms[[sym,name,unit]],task} }
// -> { title, slides:[...] }  Gemini writes a classroom lesson grounded on the textbook content.
// Auth: Supabase bearer token (teachers only). Rate-limited. Env: GEMINI_API_KEY, GEMINI_MODEL, SUPABASE_*.
'use strict';
const { createClient } = require('@supabase/supabase-js');
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const ALLOWED = { title:1, objectives:1, concept:1, formula:1, example:1, summary:1 };
const str = (v, n) => (typeof v === 'string' ? v : '').slice(0, n || 200);

function buildPrompt(title, grade, c) {
  const explain = Array.isArray(c.explain) ? c.explain.join('\n') : '';
  const formulas = Array.isArray(c.formulas) ? c.formulas.join(' ; ') : '';
  const terms = Array.isArray(c.terms) ? c.terms.map((t) => (Array.isArray(t) ? t.join(' — ') : '')).join('; ') : '';
  const task = str(c.task, 300);
  return [
    'Siz tajribali O‘zbek maktab fizika o‘qituvchisisiz. Sinf uchun professional dars taqdimotini tayyorlaysiz.',
    'Til: O‘zbek tili (lotin yozuvi, to‘g‘ri ‘ apostroflar bilan). Sinf: ' + (grade || '') + '-sinf. Mavzu: "' + title + '".',
    'Faqat quyidagi darslik materialiga tayaning (hech narsa o‘ylab topmang):',
    'Tushuntirish: ' + explain,
    'Formulalar: ' + formulas,
    'Atamalar: ' + terms,
    'Tajriba savoli: ' + task,
    '',
    'Natijani QATIY JSON ko‘rinishida bering: {"slides":[ ... 5 dan 7 gacha slayd ... ]}',
    'Ruxsat etilgan slaydlar:',
    '- {"type":"title","eyebrow":"Fizika · ' + (grade || '') + '-sinf","heading":"<mavzu>","lead":"<bitta qiziqarli jumla>"}',
    '- {"type":"objectives","heading":"Dars maqsadi","bullets":["...", "..."]} (2-4 ta)',
    '- {"type":"concept","heading":"<qisqa sarlavha>","items":[{"sym":"U","name":"Kuchlanish","desc":"<qisqa>"}]} (2-3 ta)',
    '- {"type":"formula","formula":"I = U / R","lead":"<ma’nosi>"}',
    '- {"type":"example","heading":"Masala","bullets":["Berilgan: ...","Yechim: ...","Javob: ..."]}',
    '- {"type":"summary","heading":"Nimani o‘rgandik","bullets":["...", "..."]} (2-4 ta)',
    'Qoidalar: title bilan boshlang, summary bilan tugating. Formulalar bo‘lsa, kamida bitta formula slaydi bo‘lsin.',
    'Har bir bullet qisqa (taxminan 12 so‘zdan oshmasin). Materialga sodiq qoling. Faqat JSON chiqaring.'
  ].join('\n');
}

async function callGemini(prompt) {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, responseMimeType: 'application/json' }
    }),
    signal: AbortSignal.timeout(25000)
  });
  if (!r.ok) throw new Error('gemini_http_' + r.status + ': ' + (await r.text()).slice(0, 200));
  const data = await r.json();
  const text = (((data.candidates || [])[0] || {}).content || {}).parts || [];
  return text.map((p) => p.text || '').join('');
}

function sanitize(raw) {
  let parsed;
  try { parsed = JSON.parse(String(raw).replace(/^```(json)?|```$/g, '').trim()); }
  catch (_) { throw new Error('bad_model_json'); }
  const arr = Array.isArray(parsed) ? parsed : (parsed.slides || []);
  const out = [];
  for (const s of arr) {
    if (!s || !ALLOWED[s.type]) continue;
    const o = { type: s.type };
    if (s.eyebrow) o.eyebrow = str(s.eyebrow, 60);
    if (s.heading) o.heading = str(s.heading, 120);
    if (s.lead) o.lead = str(s.lead, 220);
    if (s.formula) o.formula = str(s.formula, 120);
    if (Array.isArray(s.bullets)) o.bullets = s.bullets.map((b) => str(b, 160)).filter(Boolean).slice(0, 6);
    if (Array.isArray(s.items)) o.items = s.items.slice(0, 3).map((it) => ({ sym: str(it.sym, 12), name: str(it.name, 40), desc: str(it.desc, 90) }));
    out.push(o);
    if (out.length >= 8) break;
  }
  if (!out.length) throw new Error('empty');
  return out;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'not_configured' });
  const m = /^Bearer (\S+)$/.exec(req.headers.authorization || '');
  const token = m && m[1];
  if (!token) return res.status(401).json({ error: 'sign_in_required' });
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); }
  catch (_) { return res.status(400).json({ error: 'invalid_json' }); }
  const slug = str(body.topic_slug, 120);
  const grade = [6, 7, 8, 9, 10, 11].includes(Number(body.grade)) ? Number(body.grade) : null;
  const title = str(body.title, 160);
  const content = body.content && typeof body.content === 'object' ? body.content : {};
  if (!slug || !title) return res.status(400).json({ error: 'missing_fields' });

  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const u = await sb.auth.getUser(token);
    if (u.error || !u.data || !u.data.user) return res.status(401).json({ error: 'sign_in_required' });
    const prof = await sb.from('profiles').select('role').eq('id', u.data.user.id).maybeSingle();
    if (prof.data && prof.data.role === 'student') return res.status(403).json({ error: 'teachers_only' });
    const lim = await sb.rpc('empira_take_rate_limit', { bucket: 'slides:' + u.data.user.id, maximum: 20, window_seconds: 3600 });
    if (lim.error) throw lim.error;
    if (lim.data !== true) { res.setHeader('Retry-After', '120'); return res.status(429).json({ error: 'too_many' }); }
  } catch (_) { return res.status(503).json({ error: 'service_unavailable' }); }

  const started = Date.now();
  try {
    const slides = sanitize(await callGemini(buildPrompt(title, grade, content)));
    console.log(JSON.stringify({ slides: slides.length, grade: grade, ms: Date.now() - started, model: MODEL }));
    return res.status(200).json({ title: title, slides: slides });
  } catch (err) {
    console.error('slides_failed', String(err).slice(0, 300));
    return res.status(502).json({ error: 'generation_failed' });
  }
};
