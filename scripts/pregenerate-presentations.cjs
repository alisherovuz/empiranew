#!/usr/bin/env node
/* Pre-generate lesson presentations (slides + images) for a chorak's topics, so
 * teachers open them instantly and NO per-user AI generation ever happens.
 *
 * Generates slides (deck-plan prompt) AND images (deck-image prompt), writes the
 * images to DECK_DIR so Nginx serves them from /storage/, embeds the image URLs in
 * the slides, and saves the deck into empira_presentations (one shared row per
 * topic+grade). Idempotent: skips topics that already have a saved deck unless FORCE=1.
 *
 * Run from /srv/empira/empiranew:
 *   sudo bash -c 'set -a; . /etc/empira/app.env; set +a; cd /srv/empira/empiranew && node scripts/pregenerate-presentations.cjs'
 * Options via env: GRADE=7|8 (default both), CHORAK=1..4 (default current), FORCE=1,
 *                  IMAGES=0 (slides only, skip images)
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const chorak = require('../api/_lib/chorak');
const C = require('../api/_lib/curriculum');

const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const IMG_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const STORAGE_DIR = process.env.DECK_DIR || '/var/lib/empira/storage/decks';
const PUBLIC_BASE = process.env.PUBLIC_BASE || 'https://app.empira.uz';
const WITH_IMAGES = process.env.IMAGES !== '0';
const DB = process.env.DATABASE_URL;
const KEY = process.env.GEMINI_API_KEY;
if (!DB || !KEY) { console.error('Missing DATABASE_URL / GEMINI_API_KEY'); process.exit(1); }
const pool = new Pool({ connectionString: DB });
const str = (v, n) => (typeof v === 'string' ? v : '').slice(0, n || 200);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- slides (same prompt/parse as api/deck-plan.js) ----------
function prompt(title, grade, c) {
  const explain = Array.isArray(c.explain) ? c.explain.join('\n') : '';
  const formulas = Array.isArray(c.formulas) ? c.formulas.join(' ; ') : '';
  const terms = Array.isArray(c.terms) ? c.terms.map((t) => (Array.isArray(t) ? t.join(' — ') : '')).join('; ') : '';
  const task = str(c.task, 300);
  return [
    'Siz O‘zbek maktab fizika o‘qituvchisisiz. "' + title + '" (' + (grade || '') + '-sinf) mavzusi uchun dars taqdimoti matnini tayyorlaysiz.',
    'Faqat quyidagi darslik materialiga tayaning (hech narsa o‘ylab topmang):',
    'Tushuntirish: ' + explain, 'Formulalar: ' + formulas, 'Atamalar: ' + terms, 'Tajriba savoli: ' + task,
    '', '5 dan 7 gacha slayd. QATIY JSON qaytaring:',
    '{"slides":[{"type":"cover|content|formula|summary","title":"...","lead":"...","points":["..."],"formula":"I = U / R","visual":"ENGLISH description"}]}',
    'Tuzilma: 1-slayd type="cover" (title + bitta qisqa lead jumla). Formulalar bo‘lsa, kamida bitta type="formula". Oxirgi slayd type="summary". Qolganlari type="content".',
    'content va summary slaydlarida 2-3 ta juda qisqa "points" (har biri 9 so‘zdan kam). Butun matn O‘zbek (lotin), qisqa.',
    '"visual" har doim INGLIZ tilida va MATNSIZ rasmni tasvirlaydi. Faqat JSON chiqaring.'
  ].join('\n');
}
const TYPES = { cover: 1, content: 1, formula: 1, summary: 1 };
function parse(raw) {
  let j; try { j = JSON.parse(String(raw).replace(/^```(json)?|```$/g, '').trim()); } catch (_) { throw new Error('bad_json'); }
  const arr = Array.isArray(j) ? j : (j.slides || []);
  const out = [];
  for (const s of arr) {
    if (!s || !s.title) continue;
    const type = TYPES[s.type] ? s.type : 'content';
    const o = { type, title: str(s.title, 90), visual: str(s.visual, 200) };
    if (s.lead) o.lead = str(s.lead, 180);
    if (type === 'formula' && s.formula) o.formula = str(s.formula, 100);
    if (Array.isArray(s.points)) o.points = s.points.map((p) => str(p, 120)).filter(Boolean).slice(0, 4);
    out.push(o); if (out.length >= 8) break;
  }
  if (out.length < 3) throw new Error('too_few');
  if (out[0]) out[0].type = 'cover';
  return out;
}
async function geminiText(p) {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: p }] }], generationConfig: { temperature: 0.5, responseMimeType: 'application/json' } }),
    signal: AbortSignal.timeout(25000)
  });
  if (!r.ok) throw new Error('gemini_' + r.status);
  const d = await r.json();
  return ((((d.candidates || [])[0] || {}).content || {}).parts || []).map((x) => x.text || '').join('');
}

// ---------- images (same prompt as api/deck-image.js) ----------
function imgPrompt(visual) {
  return [
    'Create a clean, modern, friendly flat-vector ILLUSTRATION for a school physics lesson slide.',
    'Subject: ' + (visual || 'a simple, relevant physics diagram') + '.',
    'Style: minimal flat vector, smooth shapes, subtle depth; color palette deep blue #3B4CFF with amber #FFB21E accents; plain white or transparent background; centered composition with margin.',
    'CRITICAL: the image must contain NO text of any kind — no words, no letters, no numbers, no labels. Illustration only.',
    'High quality, crisp, 4:3.'
  ].join('\n');
}
async function genImage(p) {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + IMG_MODEL + ':generateContent', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: p }] }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } }),
    signal: AbortSignal.timeout(55000)
  });
  if (!r.ok) throw new Error('img_http_' + r.status);
  const d = await r.json();
  const parts = ((((d.candidates || [])[0] || {}).content || {}).parts) || [];
  const img = parts.find((x) => x.inlineData && x.inlineData.data);
  if (!img) throw new Error('no_image');
  return { b64: img.inlineData.data, mime: img.inlineData.mimeType || 'image/png' };
}
function saveImage(slug, grade, idx, img) {
  const ext = img.mime.indexOf('jpeg') >= 0 ? 'jpg' : 'png';
  const folder = slug + '-' + (grade || 'x');
  const rel = folder + '/' + idx + '.' + ext;
  fs.mkdirSync(path.join(STORAGE_DIR, folder), { recursive: true });
  fs.writeFileSync(path.join(STORAGE_DIR, rel), Buffer.from(img.b64, 'base64'));
  return PUBLIC_BASE + '/storage/decks/' + rel;
}

async function run() {
  const only = parseInt(process.env.GRADE, 10);
  const grades = [7, 8].includes(only) ? [only] : chorak.grades();
  const ch = [1, 2, 3, 4].includes(parseInt(process.env.CHORAK, 10)) ? parseInt(process.env.CHORAK, 10) : chorak.currentChorak();
  const force = process.env.FORCE === '1';
  const content = C.load().content;
  const c = await pool.connect();
  const stat = { made: 0, skipped: 0, nocontent: 0, failed: 0, images: 0, imgfail: 0 };
  try {
    for (const grade of grades) {
      const topics = chorak.topicsFor(grade, ch);
      console.log(`\n### Grade ${grade}, chorak ${ch}: ${topics.length} topics (images: ${WITH_IMAGES}) ###`);
      for (const t of topics) {
        const existing = await c.query(`SELECT 1 FROM empira_presentations WHERE topic_slug=$1 AND grade=$2`, [t.slug, grade]);
        if (existing.rowCount && !force) { stat.skipped++; console.log('  = skip (exists):', t.title); continue; }
        const data = content[t.slug];
        if (!data || !(data.explain || []).length) { stat.nocontent++; console.log('  ? no content:', t.title); continue; }
        const input = { explain: data.explain, formulas: data.formulas, terms: data.terms, task: (data.labs && data.labs[0] && data.labs[0].task) || '' };
        try {
          const slides = parse(await geminiText(prompt(t.title, grade, input)));
          // Generate + cache an image per slide (so viewers never trigger generation).
          if (WITH_IMAGES) {
            for (let i = 0; i < slides.length; i++) {
              try {
                const img = await genImage(imgPrompt(slides[i].visual));
                slides[i].img = saveImage(t.slug, grade, i, img);
                stat.images++;
              } catch (e) { stat.imgfail++; console.log('    ! image', i, 'failed:', String(e.message).slice(0, 40)); }
              await sleep(800);
            }
          }
          await c.query(
            `INSERT INTO empira_presentations (topic_slug, grade, title, slides, updated_by, updated_at)
             VALUES ($1,$2,$3,$4::jsonb,NULL,now())
             ON CONFLICT (topic_slug, grade) DO UPDATE SET title=excluded.title, slides=excluded.slides, updated_at=now()`,
            [t.slug, grade, t.title, JSON.stringify(slides)]);
          stat.made++; console.log('  + made (' + slides.length + ' slides' + (WITH_IMAGES ? ', imgs' : '') + '):', t.title);
        } catch (e) { stat.failed++; console.log('  ! failed:', t.title, String(e.message).slice(0, 60)); }
        await sleep(1000);
      }
    }
    console.log('\n=== summary ===', JSON.stringify(stat));
  } finally { c.release(); await pool.end(); }
}
run().catch((e) => { console.error('PREGEN FAILED:', e); process.exit(1); });
