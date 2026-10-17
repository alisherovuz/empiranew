// Empira — which grades and topics are shown.
// Rule: a topic is listed only if it really has a 3D lab (data.js `lab: true` AND content.js lists at least one lab).
// The curriculum data itself is never changed: all 60 topics stay in data.js because the scanner
// uses them for page ranges. Pages only *show* the lab topics.
// Needs ../class-plan/data.js (+ data-7.js) and ../topic/content.js (+ content-7.js) loaded first.
// Several grades: every page works on ONE grade at a time (window.EMPIRA_PLAN). It is chosen from the URL
// (?sinf=7, or the grade of ?mavzu=<topic> / ?lab=<lab>), else the grade the teacher opened last, else 8.
(function (root) {
  // One slug function for every page (same character set as api/_lib/curriculum.js)
  const slug = (s) => String(s).toLowerCase()
    .replace(/[‘’'ʻʼ`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const plan = () => root.EMPIRA_PLAN;
  const content = () => root.EMPIRA_TOPICS || {};
  const plans = () => root.EMPIRA_PLANS || (root.EMPIRA_PLAN ? { [root.EMPIRA_PLAN.grade]: root.EMPIRA_PLAN } : {});
  const topicsOf = (p) => p.chapters.flatMap((c) => c.topics);

  // Which grade a topic or a lab belongs to (null if unknown)
  function gradeOfTopic(topicSlug) {
    const hit = Object.values(plans()).find((p) => topicsOf(p).some((t) => slug(t.t) === topicSlug));
    return hit ? hit.grade : null;
  }
  function gradeOfLab(labId) {
    const t = Object.entries(content()).find(([, c]) => (c.labs || []).some((l) => l.slug === labId));
    return t ? gradeOfTopic(t[0]) : null;
  }
  // Switch the page to a grade (returns the plan, or null if that grade has no plan)
  function use(grade) {
    const p = plans()[grade];
    if (!p) return null;
    root.EMPIRA_PLAN = p;
    try { root.localStorage && root.localStorage.setItem('empira.grade', String(grade)); } catch (e) { /* private mode */ }
    return p;
  }

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

  // Grades that have at least one lab, in order (a grade is "ready" when it has labs)
  function grades() {
    return Object.values(plans()).filter((p) => topicsOf(p).some((t) => hasLab({ ...t, slug: slug(t.t) })))
      .map((p) => p.grade).sort((a, b) => a - b);
  }

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

  // In the browser: pick this page's grade once, before the page scripts read window.EMPIRA_PLAN
  if (root.location && root.document) {
    const q = new URLSearchParams(root.location.search);
    let last = null;
    try { last = Number(root.localStorage.getItem('empira.grade')) || null; } catch (e) { /* private mode */ }
    const pick = [Number(q.get('sinf')) || null, q.get('mavzu') && gradeOfTopic(q.get('mavzu')), q.get('lab') && gradeOfLab(q.get('lab')), last]
      .find((g) => g && plans()[g]);
    if (pick) {
      root.EMPIRA_PLAN = plans()[pick];
      // remember a grade only when the page was opened for it (a link with ?sinf / ?mavzu / ?lab)
      if (pick !== last && (q.get('sinf') || q.get('mavzu') || q.get('lab'))) use(pick);
    }
  }

  root.EMPIRA_AVAIL = { slug, labsFor, allTopics, hasLab, labTopics, labChapters, grades, weekTopic, neighbours, findTopic, use, gradeOfTopic, gradeOfLab };
})(typeof window !== 'undefined' ? window : globalThis);
