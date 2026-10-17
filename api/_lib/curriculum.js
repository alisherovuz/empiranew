// Loads the same curriculum + content files the website uses, and matches a Gemini page reading to a topic.
// Two books: 7-sinf (data-7.js, content-7.js) and 8-sinf (data.js, content.js). A reading is matched in one grade
// (the book Gemini recognised, else the page's grade hint, else 8); if nothing fits there, the other book is tried
// by heading only.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..', 'design-prototype');
const DEFAULT_GRADE = 8;
let cache = null;

function load() {
  if (cache) return cache;
  const sandbox = {};
  vm.createContext(sandbox);
  for (const f of ['class-plan/data.js', 'class-plan/data-7.js', 'topic/content.js', 'topic/content-7.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
  }
  const content = sandbox.EMPIRA_TOPICS;
  const grades = {};
  for (const plan of Object.values(sandbox.EMPIRA_PLANS)) {
    const topics = plan.chapters.flatMap((c) => c.topics.map((t) => ({ ...t, grade: plan.grade, chapter: c.n, chapterTitle: c.title, slug: slug(t.t) })));
    const lastPage = plan.lastPage || 170;
    topics.forEach((t, i) => { t.pEnd = (topics[i + 1] ? topics[i + 1].p : lastPage + 1) - 1; });
    grades[plan.grade] = { plan, topics, lastPage };
  }
  const def = grades[DEFAULT_GRADE];
  // plan / topics: the 8-sinf book (kept for older callers)
  cache = { grades, content, plan: def.plan, topics: def.topics };
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

const gradeList = () => Object.keys(load().grades).map(Number).sort((a, b) => a - b);
const validGrade = (g) => {
  const n = typeof g === 'string' && /^\d+$/.test(g.trim()) ? Number(g) : g;
  return Number.isInteger(n) && load().grades[n] ? n : null;
};

function byHeading(heading, topics) {
  if (!heading) return null;
  const best = topics.map((t) => ({ t, s: scoreHeading(heading, t.t) })).sort((a, b) => b.s - a.s)[0];
  return best && best.s >= 0.6 ? best : null;
}

// reading = { is_textbook_page, grade, page_number, paragraph, heading, confidence }
// gradeHint = the grade of the page the teacher scanned from (used when Gemini could not tell the book)
function match(reading, gradeHint) {
  if (!reading || reading.is_textbook_page === false) return { status: 'notfound', reason: 'not_a_textbook_page' };
  const grade = validGrade(reading.grade) || validGrade(gradeHint) || DEFAULT_GRADE;
  const { topics, lastPage } = load().grades[grade];
  const page = Number.isInteger(reading.page_number) && reading.page_number >= 3 && reading.page_number <= lastPage ? reading.page_number : null;
  const para = Number.isInteger(reading.paragraph) ? topics.find((t) => t.n === reading.paragraph) : null;

  // 1. Explicit section number (e.g. "19-§"), if consistent with the page number when both are present
  if (para && (!page || (page >= para.p - 1 && page <= para.pEnd + 1))) return found(para, 'paragraph', 0.95);
  // 2. Printed page number → the section whose page range contains it
  if (page) {
    const byPage = topics.find((t) => page >= t.p && page <= t.pEnd);
    if (byPage) return found(byPage, 'page', 0.9);
  }
  // 3. Heading text → best fuzzy title match
  const best = byHeading(reading.heading, topics);
  if (best) return found(best.t, 'heading', Math.min(0.85, best.s));
  // 4. Nothing in that book: maybe it is the other book (heading only: page and § numbers mean nothing across books)
  for (const g of gradeList().filter((x) => x !== grade)) {
    const other = byHeading(reading.heading, load().grades[g].topics);
    if (other) return found(other.t, 'heading', Math.min(0.8, other.s));
  }
  return { status: 'notfound', reason: 'no_match' };
}

function found(t, method, confidence) {
  const { grades, content } = load();
  const plan = grades[t.grade].plan;
  const labs = (content[t.slug] ? content[t.slug].labs : []).map((l) => ({ slug: l.slug, title: l.title }));
  return {
    status: 'found', method, confidence,
    grade: plan.grade, subject: plan.subjects[0].name,
    topic: { slug: t.slug, title: t.t, n: t.n, chapter: t.chapterTitle, week: t.w },
    labs
  };
}

// One book's sections, for the Gemini prompt (default: 8-sinf, as before)
function sectionList(grade) {
  const g = validGrade(grade) || DEFAULT_GRADE;
  return load().grades[g].topics.map((t) => `${t.n}-§ (pages ${t.p}–${t.pEnd}): ${t.t}`).join('\n');
}

module.exports = { load, match, sectionList, norm, grades: gradeList };
