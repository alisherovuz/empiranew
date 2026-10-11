// Loads the same curriculum + content files the website uses, and matches a Gemini page reading to a topic.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..', 'design-prototype');
let cache = null;

function load() {
  if (cache) return cache;
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'class-plan', 'data.js'), 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'topic', 'content.js'), 'utf8'), sandbox);
  const plan = sandbox.EMPIRA_PLAN, content = sandbox.EMPIRA_TOPICS;
  const topics = plan.chapters.flatMap((c) => c.topics.map((t) => ({ ...t, chapter: c.n, chapterTitle: c.title, slug: slug(t.t) })));
  topics.forEach((t, i) => { t.pEnd = (topics[i + 1] ? topics[i + 1].p : 171) - 1; });
  cache = { plan, content, topics };
  return cache;
}

function slug(s) { return s.toLowerCase().replace(/[‘’'ʻʼ`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
// Uzbek-aware normalisation: unify o‘/g‘ apostrophes, strip punctuation, collapse spaces
function norm(s) { return String(s || '').toLowerCase().replace(/[‘’'ʻʼ`]/g, '').replace(/[^a-z0-9а-яё\s]/gi, ' ').replace(/\s+/g, ' ').trim(); }
const STOP = new Set(['va', 'ishi', 'laboratoriya', 'amaliy', 'mashgulot', 'uchun', 'bir', 'qismi', 'masalalar', 'yechish']);
function words(s) { return norm(s).split(' ').filter((w) => w.length > 2 && !STOP.has(w)); }

// Same word, or long words sharing their first 8 letters (Uzbek suffixes: elektromagnit / elektromagnitni)
const same = (a, b) => a === b || (a.length >= 8 && b.length >= 8 && a.slice(0, 8) === b.slice(0, 8));
// F1-style overlap: a short title matching one word of a long heading scores low
function scoreHeading(heading, title) {
  const h = [...new Set(words(heading))], t = [...new Set(words(title))];
  if (!t.length || !h.length) return 0;
  const hit = t.filter((w) => h.some((x) => same(w, x))).length;
  return (2 * hit) / (t.length + h.length);
}

// reading = { is_textbook_page, page_number, paragraph, heading, confidence }
function match(reading) {
  const { topics } = load();
  if (!reading || reading.is_textbook_page === false) return { status: 'notfound', reason: 'not_a_textbook_page' };
  const page = Number.isInteger(reading.page_number) && reading.page_number >= 3 && reading.page_number <= 170 ? reading.page_number : null;
  const para = Number.isInteger(reading.paragraph) ? topics.find((t) => t.n === reading.paragraph) : null;

  // 1. Explicit section number (e.g. "19-§"), if consistent with the page number when both are present
  if (para && (!page || (page >= para.p - 1 && page <= para.pEnd + 1))) return found(para, 'paragraph', 0.95);
  // 2. Printed page number → the section whose page range contains it
  if (page) {
    const byPage = topics.find((t) => page >= t.p && page <= t.pEnd);
    if (byPage) return found(byPage, 'page', 0.9);
  }
  // 3. Heading text → best fuzzy title match
  if (reading.heading) {
    const best = topics.map((t) => ({ t, s: scoreHeading(reading.heading, t.t) })).sort((a, b) => b.s - a.s)[0];
    if (best && best.s >= 0.6) return found(best.t, 'heading', Math.min(0.85, best.s));
  }
  return { status: 'notfound', reason: 'no_match' };
}

function found(t, method, confidence) {
  const { plan, content } = load();
  const labs = (content[t.slug] ? content[t.slug].labs : []).map((l) => ({ slug: l.slug, title: l.title }));
  return {
    status: 'found', method, confidence,
    grade: plan.grade, subject: plan.subjects[0].name,
    topic: { slug: t.slug, title: t.t, n: t.n, chapter: t.chapterTitle, week: t.w },
    labs
  };
}

function sectionList() {
  return load().topics.map((t) => `${t.n}-§ (pages ${t.p}–${t.pEnd}): ${t.t}`).join('\n');
}

module.exports = { load, match, sectionList, norm };
