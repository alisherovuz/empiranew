'use strict';
// Chorak (school quarter) model. Everything editable lives in the two maps below.
//
// CHORAK_DATES: the 2026/2027 official school calendar (update once per year).
// CHORAK_TOPICS: which topic positions (1-based, in curriculum order) fall in each
//   chorak, per grade. Derived from the textbook chapter order + the calendar's
//   lesson pacing; adjust ranges freely to match a teacher's exact plan.
const C = require('./curriculum');

const CHORAK_DATES = [
  { n: 1, from: [9, 2],  to: [11, 3]  },
  { n: 2, from: [11, 10], to: [12, 27] },
  { n: 3, from: [1, 11], to: [3, 20]  },
  { n: 4, from: [3, 28], to: [5, 25]  }
];

// [firstTopic, lastTopic] inclusive, 1-based over the grade's ordered topic list.
const CHORAK_TOPICS = {
  7: { 1: [1, 14], 2: [15, 25], 3: [26, 38], 4: [39, 46] },
  8: { 1: [1, 18], 2: [19, 32], 3: [33, 51], 4: [52, 60] }
};

const LABELS = { 1: '1-chorak', 2: '2-chorak', 3: '3-chorak', 4: '4-chorak' };
const md = (m, d) => m * 100 + d;

// Which chorak a date is in; during a break/summer, the chorak about to start.
function currentChorak(date = new Date()) {
  const cur = md(date.getMonth() + 1, date.getDate());
  for (const c of CHORAK_DATES) {
    if (cur >= md(c.from[0], c.from[1]) && cur <= md(c.to[0], c.to[1])) return c.n;
  }
  // In a gap: pick the next chorak to begin (wrap around to 1 after summer).
  const starts = CHORAK_DATES.map((c) => ({ n: c.n, s: md(c.from[0], c.from[1]) }));
  const upcoming = starts.filter((c) => c.s > cur).sort((a, b) => a.s - b.s)[0];
  return upcoming ? upcoming.n : 1;
}

function dateRange(n) {
  const c = CHORAK_DATES.find((x) => x.n === n);
  if (!c) return null;
  const f = (p) => String(p[1]).padStart(2, '0') + '.' + String(p[0]).padStart(2, '0');
  return f(c.from) + '–' + f(c.to);
}

// Topics for a given grade + chorak, enriched with lab availability.
function topicsFor(grade, chorak) {
  const { grades, content } = C.load();
  const g = grades[grade];
  if (!g || !CHORAK_TOPICS[grade] || !CHORAK_TOPICS[grade][chorak]) return [];
  const [a, b] = CHORAK_TOPICS[grade][chorak];
  return g.topics.slice(a - 1, b).map((t) => {
    const labs = (content[t.slug] && content[t.slug].labs) || [];
    return {
      slug: t.slug,
      title: t.t,
      grade: t.grade,
      chapter: t.chapter,
      chapterTitle: t.chapterTitle,
      page: t.p,
      hasLab: !!(t.lab && labs.length),
      labs: labs.map((l) => ({ slug: l.slug, title: l.title || l.t || '' }))
    };
  });
}

module.exports = { currentChorak, topicsFor, dateRange, label: (n) => LABELS[n] || '', grades: () => C.grades(), CHORAK_DATES, CHORAK_TOPICS };
