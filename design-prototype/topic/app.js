// Empira — Topic page v2 (rebuild Phase 1). No gamification, no stars.
// ?mavzu=<slug> selects the topic. Previous/next step through topics that have a 3D lab only.
(async function () {
  if (!await window.EMPIRA_READY) return;
  const plan = window.EMPIRA_PLAN;
  const content = window.EMPIRA_TOPICS;
  const avail = window.EMPIRA_AVAIL;

  const subject = plan.subjects[0].name;
  const planHref = `../class-plan/index.html?sinf=${plan.grade}`;
  document.querySelector('[data-back]').href = planHref;

  // Resolve the requested topic
  const requested = new URLSearchParams(location.search).get('mavzu') || '';
  const topic = avail.findTopic(requested);

  if (!topic) {
    document.title = 'Mavzu topilmadi — Empira';
    document.querySelector('[data-page]').innerHTML = `
      <h1 class="topic-title">Mavzu topilmadi</h1>
      <section class="nolab">
        <p class="nolab__text">Bu havola bo'yicha mavzu topilmadi.</p>
        <a class="btn btn--secondary btn--large" href="${planHref}">Yillik rejaga qaytish</a>
      </section>`;
    return;
  }

  const hasLab = avail.hasLab(topic);
  const data = hasLab ? content[topic.slug] : null;
  const study = data || content[topic.slug] || null;
  const { prev, next } = avail.neighbours(topic.slug);
  const buildFor = window.EMPIRA_BUILD_FOR || (() => null);

  document.title = `${topic.t} — ${plan.grade}-sinf ${subject} — Empira`;

  // Update header class info
  const classLabel = `${plan.grade}-A sinf`;
  const el = (s) => document.querySelector(s);
  if (el('[data-class-name]')) el('[data-class-name]').textContent = classLabel;
  if (el('[data-class-subject]')) el('[data-class-subject]').textContent = subject;
  if (el('[data-class-right]')) el('[data-class-right]').textContent = `${classLabel} · ${subject}`;

  // Get user initial for avatar
  try {
    const session = window.EMPIRA_SESSION;
    if (session && session.user) {
      const meta = session.user.user_metadata || {};
      const initial = (meta.full_name || meta.name || session.user.email || 'U')[0].toUpperCase();
      if (el('[data-avatar]')) el('[data-avatar]').textContent = initial;
    }
  } catch (e) { /* keep default */ }

  // SVG icons
  const icons = {
    lab: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2.5l8 4.2v8.6L12 19.5 4 15.3V6.7z" stroke="#fff" stroke-width="1.9" stroke-linejoin="round"/><path d="M4 6.7l8 4.3 8-4.3M12 11v8.5" stroke="#fff" stroke-width="1.9" stroke-linejoin="round"/></svg>',
    build: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M14.5 6.5a3.5 3.5 0 0 1-4.6 4.6l-5 5a1.7 1.7 0 0 0 2.4 2.4l5-5a3.5 3.5 0 0 1 4.6-4.6l-2.3 2.3-1.8-1.8z" stroke="#E8991A" stroke-width="1.9" stroke-linejoin="round"/></svg>',
    presentation: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none"><rect x="3" y="4.5" width="18" height="12" rx="2" stroke="#1FA85C" stroke-width="1.9"/><path d="M12 16.5v3M8.5 19.5h7" stroke="#1FA85C" stroke-width="1.9" stroke-linecap="round"/></svg>',
    tests: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none"><rect x="4" y="3.5" width="16" height="17" rx="2.5" stroke="#AEB4C6" stroke-width="1.9"/><path d="M8 9l1.5 1.5L12 8M8 15l1.5 1.5L12 14" stroke="#AEB4C6" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 9.5h3M14 15.5h3" stroke="#AEB4C6" stroke-width="1.9" stroke-linecap="round"/></svg>',
    chevronRight: (color) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    chevronLeft: (color) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    backArrow: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="#6B7191" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  // Build info card content from explain data
  const infoCardContent = !study ? '' : (() => {
    const paragraphs = (study.explain || []).map(p => `<p class="info-card__text">${p}</p>`).join('');
    // Show formulas if available
    const formulaHtml = (study.formulas || []).length ? `
      <div class="info-card__formula">
        ${study.formulas.map(f => `<p class="info-card__formula-expr">${f}</p>`).join('')}
      </div>` : '';
    return paragraphs + formulaHtml;
  })();

  // Build action cards
  const labSlug = data && data.labs[0] ? data.labs[0].slug : null;
  const labHref = labSlug ? `../lab/index.html?lab=${labSlug}` : '#';
  const hasBuild = labSlug && buildFor(labSlug);
  const buildHref = labSlug ? `../lab/build/index.html?lab=${labSlug}` : '#';

  const actionCards = !data ? '' : `
    <a class="action-card action-card--primary" href="${labHref}">
      <div class="action-card__icon">${icons.lab}</div>
      <div class="action-card__body">
        <div class="action-card__title">Haqiqiy laboratoriya</div>
        <div class="action-card__subtitle">3D jarayonni${window.innerWidth >= 1024 ? ' jonli' : ''} ko'r${window.innerWidth >= 1024 ? 'sating' : 'ish'}</div>
      </div>
      <div class="action-card__arrow">${icons.chevronRight('rgba(255,255,255,0.9)')}</div>
    </a>

    ${hasBuild ? `
    <a class="action-card action-card--secondary" href="${buildHref}">
      <div class="action-card__icon" style="background:#FFF3DC">${icons.build}</div>
      <div class="action-card__body">
        <div class="action-card__title">Qurish rejimi</div>
        <div class="action-card__subtitle">Laboratoriyani o'zingiz yig'ing</div>
      </div>
      <div class="action-card__arrow">${icons.chevronRight('#C3C7D6')}</div>
    </a>` : `
    <button class="action-card action-card--secondary" type="button" onclick="location.href='${buildHref}'">
      <div class="action-card__icon" style="background:#FFF3DC">${icons.build}</div>
      <div class="action-card__body">
        <div class="action-card__title">Qurish rejimi</div>
        <div class="action-card__subtitle">Laboratoriyani o'zingiz yig'ing</div>
      </div>
      <div class="action-card__arrow">${icons.chevronRight('#C3C7D6')}</div>
    </button>`}

    <button class="action-card action-card--secondary" type="button" disabled>
      <div class="action-card__icon" style="background:#E7F7EE">${icons.presentation}</div>
      <div class="action-card__body">
        <div class="action-card__title">Taqdimot</div>
        <div class="action-card__subtitle">O'quvchilarga slaydlar bilan tushuntiring</div>
      </div>
      <div class="action-card__arrow">${icons.chevronRight('#C3C7D6')}</div>
    </button>

    <button class="action-card action-card--disabled" type="button" disabled>
      <div class="action-card__icon" style="background:#ECEEF4">${icons.tests}</div>
      <div class="action-card__body">
        <div class="action-card__title">Testlar</div>
        <div class="action-card__subtitle">Bilimni tekshirish</div>
      </div>
      <span class="action-card__badge">Tez orada</span>
    </button>`;

  // Phone prev/next pager
  const topicHref = (p) => `?mavzu=${p.slug}`;
  const phonePager = `
    <div class="pager-phone">
      ${prev ? `
      <a class="pager-phone__tile" href="${topicHref(prev)}">
        ${icons.chevronLeft('#6B7191')}
        <span><span class="pager-phone__label">Oldingi</span><span class="pager-phone__title">${prev.t}</span></span>
      </a>` : ''}
      ${next ? `
      <a class="pager-phone__tile pager-phone__tile--next" href="${topicHref(next)}">
        <span><span class="pager-phone__label">Keyingi</span><span class="pager-phone__title">${next.t}</span></span>
        ${icons.chevronRight('#3B4CFF')}
      </a>` : ''}
    </div>`;

  // Render the page
  document.querySelector('[data-page]').innerHTML = `
    <a class="back-link" href="${planHref}">
      ${icons.backArrow}
      Mavzular
    </a>

    <div class="chapter-badge">
      <span class="chapter-badge__text">${topic.chapter.n}-bob · ${topic.chapter.title}</span>
    </div>

    <h1 class="topic-title">${topic.t}</h1>

    ${!data && !study ? `
    <section class="nolab">
      <p class="nolab__text">Bu mavzu uchun laboratoriya yo'q.</p>
      <a class="btn btn--secondary btn--large" href="${planHref}">Yillik rejaga qaytish</a>
    </section>` : ''}

    <div class="topic-layout">
      ${study ? `
      <div class="topic-layout__info">
        <div class="info-card">
          <div class="info-card__label">Asosiy ma'lumot</div>
          ${infoCardContent}
        </div>
      </div>` : ''}

      ${data ? `
      <div class="topic-layout__actions">
        <div class="actions-label">Darsni boshlang</div>
        <div class="actions">
          ${actionCards}
        </div>
      </div>` : ''}
    </div>

    ${phonePager}`;

  // Desktop bottom nav
  const bottomNav = el('[data-bottom-nav]');
  if (bottomNav) {
    // Count position among available topics
    const allLabs = avail.labTopics ? avail.labTopics() : [];
    const idx = allLabs.findIndex(t => t.slug === topic.slug);
    const total = allLabs.length || '?';
    const pos = idx >= 0 ? idx + 1 : '?';

    if (el('[data-nav-counter]')) el('[data-nav-counter]').textContent = `Mavzu ${pos} / ${total}`;
    if (el('[data-nav-center]')) el('[data-nav-center]').href = planHref;

    if (prev) {
      el('[data-nav-prev]').href = topicHref(prev);
      if (el('[data-nav-prev-title]')) el('[data-nav-prev-title]').textContent = prev.t;
    } else {
      el('[data-nav-prev]').hidden = true;
    }
    if (next) {
      el('[data-nav-next]').href = topicHref(next);
      if (el('[data-nav-next-title]')) el('[data-nav-next-title]').textContent = next.t;
    } else {
      el('[data-nav-next]').hidden = true;
    }
    bottomNav.hidden = false;
  }
})();
