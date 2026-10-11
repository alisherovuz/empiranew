// Empira — Class Plan prototype. Renders the annual plan from data.js. Prototype only.
(function () {
  const plan = window.EMPIRA_PLAN;
  const q = new URLSearchParams(location.search);
  const showAllSubjects = q.get('fanlar') === '3'; // preview: how more subjects will appear
  const openAllOnLoad = q.get('ochiq') === 'hammasi'; // documentation: all chapters open
  const grade = Number(q.get('sinf')) || plan.grade;   // prototype route: ?sinf=6…11 from Home
  const thisWeek = Number(q.get('hafta')) || plan.demoThisWeek; // prototype setting (see data.js), not a calendar

  const chevronRight = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
  const chevronDown = '<svg class="icon chapter__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  const slug = (s) => s.toLowerCase()
    .replace(/[‘’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  /* ---------- Subjects ---------- */
  const subjects = plan.subjects.filter((s) => s.available || showAllSubjects);
  document.querySelector('[data-subjects]').innerHTML = subjects.map((s, i) => `
    <li><a class="subject" href="#${s.id}" ${i === 0 ? 'aria-current="true"' : ''}>${s.name}</a></li>
  `).join('');

  /* ---------- Grade ---------- */
  document.querySelector('[data-grade-title]').textContent = `${grade}-sinf`;
  document.title = `${grade}-sinf · ${subjects[0].name} — Empira`;
  if (grade !== plan.grade) {
    // Mock data exists only for 8-sinf: say so plainly instead of showing a fake plan
    document.querySelector('[data-plan]').hidden = true;
    document.querySelector('[data-empty]').hidden = false;
    return;
  }

  // Every topic shows honestly whether its lab exists
  const tag = (t) => t.lab
    ? '<span class="tag">3D laboratoriya mavjud</span>'
    : '<span class="tag tag--soon">Tez orada</span>';

  /* ---------- This week ---------- */
  const nowChapter = plan.chapters.find((c) => c.topics.some((t) => t.w === thisWeek));
  if (nowChapter) {
    const t = nowChapter.topics.find((x) => x.w === thisWeek);
    const nowEl = document.querySelector('[data-now]');
    nowEl.href = `../topic/index.html?mavzu=${slug(t.t)}`;
    nowEl.innerHTML = `
      <span class="now-row__text">
        <span class="now-row__label"><span class="dot" aria-hidden="true"></span>Shu hafta · ${t.w}-hafta · ${nowChapter.title}</span>
        <span class="now-row__title">${t.t}</span>
      </span>
      ${tag(t)}
      <span class="now-row__go">${chevronRight}</span>`;
    nowEl.hidden = false;
  }

  /* ---------- Chapters ---------- */
  const listEl = document.querySelector('[data-chapters]');

  listEl.innerHTML = plan.chapters.map((c) => {
    const first = c.topics[0].w;
    const last = c.topics[c.topics.length - 1].w;
    const chLabs = c.topics.filter((t) => t.lab).length;
    const isCurrent = c.topics.some((t) => t.w === thisWeek);
    const open = openAllOnLoad || isCurrent;
    const id = `bob-${c.n}`;

    const rows = c.topics.map((t) => {
      const current = t.w === thisWeek;
      const week = `
        <span class="topic__week">
          <span>${t.w}-hafta</span>
          ${current ? '<span class="now">Shu hafta</span>' : ''}
        </span>`;

      return `
        <li>
          <a class="topic${t.lab ? ' topic--lab' : ''}${current ? ' topic--now' : ''}" href="../topic/index.html?mavzu=${slug(t.t)}">
            ${week}
            <span class="topic__title">${t.t}</span>
            ${tag(t)}
            <span class="topic__go">${chevronRight}</span>
          </a>
        </li>`;
    }).join('');

    return `
      <li class="chapter" id="${id}">
        <h3 class="chapter__h">
          <button class="chapter__head" type="button" aria-expanded="${open}" aria-controls="${id}-mavzular">
            <span class="chapter__text">
              <span class="chapter__meta">${c.n}-bob · ${first}–${last}-hafta</span>
              <span class="chapter__title">${c.title}</span>
            </span>
            ${chLabs ? `<span class="chapter__count">${chLabs} ta laboratoriya</span>` : ''}
            ${chevronDown}
          </button>
        </h3>
        <ol class="topics" role="list" id="${id}-mavzular" ${open ? '' : 'hidden'}>${rows}</ol>
      </li>`;
  }).join('');

  /* ---------- Expand / collapse ---------- */
  const toggleAll = document.querySelector('[data-toggle-all]');
  const heads = () => [...listEl.querySelectorAll('.chapter__head')];

  function setOpen(btn, open) {
    btn.setAttribute('aria-expanded', String(open));
    document.getElementById(btn.getAttribute('aria-controls')).hidden = !open;
  }
  function syncToggleAll() {
    const allOpen = heads().every((b) => b.getAttribute('aria-expanded') === 'true');
    toggleAll.textContent = allOpen ? 'Barcha boblarni yopish' : 'Barcha boblarni ochish';
    toggleAll.setAttribute('aria-pressed', String(allOpen));
  }

  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.chapter__head');
    if (!btn) return;
    const willOpen = btn.getAttribute('aria-expanded') !== 'true';
    setOpen(btn, willOpen);
    // If the sticky header was clicked while scrolled deep into the chapter, bring the chapter top into view
    if (!willOpen) {
      const top = btn.closest('.chapter').getBoundingClientRect().top;
      if (top < 0) btn.closest('.chapter').scrollIntoView({ block: 'start' });
    }
    syncToggleAll();
  });

  toggleAll.addEventListener('click', () => {
    const allOpen = toggleAll.getAttribute('aria-pressed') === 'true';
    heads().forEach((b) => setOpen(b, !allOpen));
    syncToggleAll();
  });

  // Deep link: #bob-3 opens and scrolls to chapter 3
  function openFromHash() {
    const m = location.hash.match(/^#bob-(\d+)$/);
    if (!m) return;
    const btn = document.querySelector(`#bob-${m[1]} .chapter__head`);
    if (btn) { setOpen(btn, true); syncToggleAll(); btn.scrollIntoView({ block: 'start' }); }
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
  syncToggleAll();
})();
