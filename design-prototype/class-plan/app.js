// Empira — Class Plan prototype. Renders the annual plan of the page's grade (data.js / data-7.js, picked by
// ../shared/availability.js from ?sinf=). Prototype only.
(function () {
  const plan = window.EMPIRA_PLAN;
  const q = new URLSearchParams(location.search);
  const showAllSubjects = q.get('fanlar') === '3'; // preview: how more subjects will appear
  const openAllOnLoad = q.get('ochiq') === 'hammasi'; // documentation: all chapters open
  const grade = Number(q.get('sinf')) || plan.grade;   // prototype route: ?sinf=6…11 from Home
  const requestedWeek=Number(q.get('hafta'));
  const thisWeek=Number.isInteger(requestedWeek)&&requestedWeek>=1&&requestedWeek<=40?requestedWeek:null;

  const chevronRight = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
  const chevronDown = '<svg class="icon chapter__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  const avail = window.EMPIRA_AVAIL;   // ../shared/availability.js: only topics that have a 3D lab are listed
  const slug = avail.slug;

  /* ---------- Subjects ---------- */
  const subjects = plan.subjects.filter((s) => s.available || showAllSubjects);
  document.querySelector('[data-subjects]').innerHTML = subjects.map((s, i) => `
    <li><a class="subject" href="#${s.id}" ${i === 0 ? 'aria-current="true"' : ''}>${s.name}</a></li>
  `).join('');

  /* ---------- Grade ---------- */
  document.querySelector('[data-grade-title]').textContent = `${grade}-sinf`;
  document.title = `${grade}-sinf · ${subjects[0].name} — Empira`;
  const ready = avail.grades();
  if (!ready.includes(grade)) {
    // No labs for this grade yet: say so plainly and point to every grade that is ready
    document.querySelector('[data-plan]').hidden = true;
    document.querySelector('[data-empty]').hidden = false;
    const names = ready.map((g) => `${g}-sinf`);
    document.querySelector('[data-empty-hint]').textContent =
      `Hozircha ${names.length > 1 ? `${names.slice(0, -1).join(', ')} va ${names[names.length - 1]}` : names[0]} ${subjects[0].name} laboratoriyalarini sinab ko‘ring.`;
    // The grade opened last gets the one primary button
    document.querySelector('[data-empty-home]').insertAdjacentHTML('beforebegin', ready.map((g) => `
      <a class="btn ${g === plan.grade ? 'btn--primary' : 'btn--secondary'}" href="../class-plan/index.html?sinf=${g}">${g}-sinf laboratoriyalari</a>`).join(''));
    return;
  }

  // Only topics with a 3D lab are listed, so every row carries the same tag
  const tag = () => '<span class="tag">3D laboratoriya mavjud</span>';

  /* ---------- This week (always a topic that has a lab) ---------- */
  const week = thisWeek ? avail.weekTopic(thisWeek) : null;
  if(!week)document.querySelector('[data-now]').hidden=true;
  if (week) {
    const t = week.topic;
    const label = week.exact ? `Tanlangan hafta · ${t.w}-hafta` : `Eng yaqin laboratoriya · ${t.w}-hafta`;
    const nowEl = document.querySelector('[data-now]');
    nowEl.href = `../topic/index.html?mavzu=${t.slug}`;
    nowEl.innerHTML = `
      <span class="now-row__text">
        <span class="now-row__label"><span class="dot" aria-hidden="true"></span>${label} · ${t.chapter.title}</span>
        <span class="now-row__title">${t.t}</span>
      </span>
      ${tag(t)}
      <span class="now-row__go">${chevronRight}</span>`;
    nowEl.hidden = false;
  }
  const nowSlug = week && week.exact ? week.topic.slug : null;

  /* ---------- Chapters (lab topics only; chapters without a lab are left out) ---------- */
  const listEl = document.querySelector('[data-chapters]');

  listEl.innerHTML = avail.labChapters().map((c) => {
    const first = c.allTopics[0].w;
    const last = c.allTopics[c.allTopics.length - 1].w;
    const chLabs = c.topics.reduce((n, t) => n + avail.labsFor(slug(t.t)).length, 0);   // §24 has two labs
    const isCurrent = c.topics.some((t) => slug(t.t) === nowSlug);
    const open = openAllOnLoad || isCurrent;
    const id = `bob-${c.n}`;

    const rows = c.topics.map((t) => {
      const current = slug(t.t) === nowSlug;
      const week = `
        <span class="topic__week">
          <span>${t.w}-hafta</span>
          ${current ? '<span class="now">Tanlangan hafta</span>' : ''}
        </span>`;

      return `
        <li>
          <a class="topic topic--lab${current ? ' topic--now' : ''}" href="../topic/index.html?mavzu=${slug(t.t)}">
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
