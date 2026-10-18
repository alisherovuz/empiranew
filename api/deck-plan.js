// POST /api/deck-plan  { topic_slug, grade, title, content:{explain[],formulas[],terms[],task} }
// -> { title, slides:[ {type,title,lead?,points[]?,formula?,visual} ] }  (accurate Uzbek text; rendered as HTML)
// "visual" is an ENGLISH description of a text-free illustration for /api/deck-image.
'use strict';
const { createClient } = require('@supabase/supabase-js');
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const TYPES = { cover: 1, content: 1, formula: 1, summary: 1 };
const str = (v, n) => (typeof v === 'string' ? v : '').slice(0, n || 200);

function prompt(title, grade, c) {
  const explain = Array.isArray(c.explain) ? c.explain.join('\n') : '';
  const formulas = Array.isArray(c.formulas) ? c.formulas.join(' ; ') : '';
  const terms = Array.isArray(c.terms) ? c.terms.map((t) => (Array.isArray(t) ? t.join(' — ') : '')).join('; ') : '';
  const task = str(c.task, 300);
  return [
    'Siz O‘zbek maktab fizika o‘qituvchisisiz. "' + title + '" (' + (grade || '') + '-sinf) mavzusi uchun dars taqdimoti matnini tayyorlaysiz.',
    'Faqat quyidagi darslik materialiga tayaning (hech narsa o‘ylab topmang):',
    'Tushuntirish: ' + explain, 'Formulalar: ' + formulas, 'Atamalar: ' + terms, 'Tajriba savoli: ' + task,
    '',
    '5 dan 7 gacha slayd. QATIY JSON qaytaring:',
    '{"slides":[{"type":"cover|content|formula|summary","title":"...","lead":"...","points":["..."],"formula":"I = U / R","visual":"ENGLISH description"}]}',
    'Tuzilma: 1-slayd type="cover" (title + bitta qisqa lead jumla). Formulalar bo‘lsa, kamida bitta type="formula" (title, formula matni, qisqa lead). Oxirgi slayd type="summary". Qolganlari type="content".',
    'content va summary slaydlarida 2-3 ta juda qisqa "points" (har biri 9 so‘zdan kam). Butun matn O‘zbek (lotin), to‘g‘ri yozilgan, qisqa.',
    '"visual" har doim INGLIZ tilida va MATNSIZ rasmni tasvirlaydi (masalan: "simple circuit with battery, resistor and ammeter, flat vector, no text"). Rasmda hech qanday yozuv bo‘lmasligi kerak.',
    'Faqat JSON chiqaring.'
  ].join('\n');
}

async function gemini(p) {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: p }] }], generationConfig: { temperature: 0.5, responseMimeType: 'application/json' } }),
    signal: AbortSignal.timeout(20000)
  });
  if (!r.ok) throw new Error('gemini_' + r.status);
  const d = await r.json();
  return ((((d.candidates || [])[0] || {}).content || {}).parts || []).map((x) => x.text || '').join('');
}

function parse(raw) {
  let j; try { j = JSON.parse(String(raw).replace(/^```(json)?|```$/g, '').trim()); } catch (_) { throw new Error('bad_json'); }
  const arr = Array.isArray(j) ? j : (j.slides || []);
  const out = [];
  for (const s of arr) {
    if (!s || !s.title) continue;
    const type = TYPES[s.type] ? s.type : 'content';
    const o = { type: type, title: str(s.title, 90), visual: str(s.visual, 200) };
    if (s.lead) o.lead = str(s.lead, 180);
    if (type === 'formula' && s.formula) o.formula = str(s.formula, 100);
    if (Array.isArray(s.points)) o.points = s.points.map((p) => str(p, 120)).filter(Boolean).slice(0, 4);
    out.push(o);
    if (out.length >= 8) break;
  }
  if (out.length < 3) throw new Error('too_few');
  if (out[0]) out[0].type = 'cover';
  return out;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'not_configured' });
  const m = /^Bearer (\S+)$/.exec(req.headers.authorization || '');
  if (!m) return res.status(401).json({ error: 'sign_in_required' });
  let body; try { body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); } catch (_) { return res.status(400).json({ error: 'invalid_json' }); }
  const title = str(body.title, 160), slug = str(body.topic_slug, 120);
  const grade = [6, 7, 8, 9, 10, 11].includes(Number(body.grade)) ? Number(body.grade) : null;
  const content = body.content && typeof body.content === 'object' ? body.content : {};
  if (!title || !slug) return res.status(400).json({ error: 'missing_fields' });
  try {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const u = await sb.auth.getUser(m[1]);
    if (u.error || !u.data || !u.data.user) return res.status(401).json({ error: 'sign_in_required' });
    const prof = await sb.from('profiles').select('role').eq('id', u.data.user.id).maybeSingle();
    if (prof.data && prof.data.role === 'student') return res.status(403).json({ error: 'teachers_only' });
    const lim = await sb.rpc('empira_take_rate_limit', { bucket: 'deck:' + u.data.user.id, maximum: 120, window_seconds: 3600 });
    if (lim.error) throw lim.error;
    if (lim.data !== true) return res.status(429).json({ error: 'too_many' });
  } catch (_) { return res.status(503).json({ error: 'service_unavailable' }); }
  try {
    const slides = parse(await gemini(prompt(title, grade, content)));
    return res.status(200).json({ title: title, slides: slides });
  } catch (e) {
    console.error('deck_plan_failed', String(e).slice(0, 200));
    return res.status(502).json({ error: 'plan_failed' });
  }
};
