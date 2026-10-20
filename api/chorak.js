'use strict';
// GET /api/chorak[?grade=7|8][?chorak=1..4]
// Public. Returns the current (or requested) chorak and its topics, flagged with
// whether a ready-made presentation exists. Used by the "Joriy chorak" dashboard section.
const chorak = require('./_lib/chorak');
const { query } = require('./_lib/db');

async function withPresented(grade, topics) {
  if (!topics.length) return topics;
  try {
    const slugs = topics.map((t) => t.slug);
    const r = await query(
      `SELECT topic_slug FROM empira_presentations WHERE grade = $1 AND topic_slug = ANY($2)`,
      [grade, slugs]);
    const have = new Set(r.rows.map((x) => x.topic_slug));
    return topics.map((t) => ({ ...t, hasPresentation: have.has(t.slug) }));
  } catch (_) {
    return topics.map((t) => ({ ...t, hasPresentation: false }));
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  const current = chorak.currentChorak();
  const asked = parseInt(req.query.chorak, 10);
  const show = [1, 2, 3, 4].includes(asked) ? asked : current;
  const base = { current, chorak: show, label: chorak.label(show), dateRange: chorak.dateRange(show) };

  const gParam = parseInt(req.query.grade, 10);
  try {
    if ([7, 8].includes(gParam)) {
      const topics = await withPresented(gParam, chorak.topicsFor(gParam, show));
      return res.status(200).json({ ...base, grade: gParam, topics });
    }
    const byGrade = {};
    for (const g of chorak.grades()) {
      byGrade[g] = await withPresented(g, chorak.topicsFor(g, show));
    }
    return res.status(200).json({ ...base, byGrade });
  } catch (e) {
    console.error('chorak_failed', String(e).slice(0, 160));
    return res.status(500).json({ error: 'chorak_error' });
  }
};
