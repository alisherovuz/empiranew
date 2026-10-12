// Empira — which grades and topics are shown.
// Rule: a topic is listed only if it really has a 3D lab (data.js `lab: true` AND content.js lists at least one lab).
// The curriculum data itself is never changed: all 60 topics stay in data.js because the scanner
// uses them for page ranges. Pages only *show* the lab topics.
// Needs ../class-plan/data.js and ../topic/content.js loaded first.
(function (root) {
  // One slug function for every page (same character set as api/_lib/curriculum.js)
  const slug = (s) => String(s).toLowerCase()
    .replace(/[‘’'ʻʼ`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const plan = () => root.EMPIRA_PLAN;
  const content = () => root.EMPIRA_TOPICS || {};

  const labsFor = (topicSlug) => {
    const c = content()[topicSlug];
    return c && Array.isArray(c.labs) ? c.labs : [];
  };

  // Every curriculum topic in plan order, with its slug and chapter
  function allTopics() {
    return plan().chapters.flatMap((c) => c.topics.map((t) => ({ ...t, slug: slug(t.t), chapter: c })));
  }

  const hasLab = (t) => !!t.lab && labsFor(t.slug || slug(t.t)).length > 0;

  function labTopics() { return allTopics().filter(hasLab); }

  // Chapters with only their lab topics; chapters without any lab are dropped
  function labChapters() {
    return plan().chapters
      .map((c) => ({ ...c, allTopics: c.topics, topics: c.topics.filter((t) => hasLab({ ...t, slug: slug(t.t) })) }))
      .filter((c) => c.topics.length > 0);
  }

  // Grades that have at least one lab (today only the one grade in data.js)
  function grades() { return labTopics().length ? [plan().grade] : []; }

  // The lab topic for a given week. If that week has no lab, the nearest lab topic (later one wins a tie).
  function weekTopic(week) {
    const list = labTopics();
    if (!list.length) return null;
    const exact = list.find((t) => t.w === week);
    if (exact) return { topic: exact, exact: true };
    const best = list.reduce((a, t) => {
      const d = Math.abs(t.w - week), da = Math.abs(a.w - week);
      return d < da || (d === da && t.w > a.w) ? t : a;
    });
    return { topic: best, exact: false };
  }

  // Previous / next lab topic around any topic (also works for a no-lab topic opened by scan or old link)
  function neighbours(topicSlug) {
    const all = allTopics();
    const i = all.findIndex((t) => t.slug === topicSlug);
    if (i < 0) return { prev: null, next: null };
    const prev = all.slice(0, i).reverse().find(hasLab) || null;
    const next = all.slice(i + 1).find(hasLab) || null;
    return { prev, next };
  }

  const findTopic = (topicSlug) => allTopics().find((t) => t.slug === topicSlug) || null;

  root.EMPIRA_AVAIL = { slug, labsFor, allTopics, hasLab, labTopics, labChapters, grades, weekTopic, neighbours, findTopic };
})(typeof window !== 'undefined' ? window : globalThis);
