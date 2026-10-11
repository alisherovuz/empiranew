// Empira — Topic page prototype (S3). Prototype only.
// ?mavzu=<slug> selects the topic (default: Nyutonning ikkinchi qonuni).
(function () {
  const plan = window.EMPIRA_PLAN;
  const content = window.EMPIRA_TOPICS;

  const slug = (s) => s.toLowerCase()
    .replace(/[‘’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const icon = {
    left: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    right: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'
  };

  // Every curriculum topic has a page, in annual-plan order. Previous/next follow this order (no skipping).
  const pages = plan.chapters.flatMap((c) =>
    c.topics.map((t) => ({ ...t, slug: slug(t.t), chapter: c })));

  const requested = new URLSearchParams(location.search).get('mavzu') || 'nyutonning-ikkinchi-qonuni';
  const i = Math.max(0, pages.findIndex((p) => p.slug === requested));
  const topic = pages[i];
  const data = topic.lab ? content[topic.slug] : null;
  const prev = pages[i - 1];
  const next = pages[i + 1];

  const subject = plan.subjects[0].name;
  const planHref = `../class-plan/index.html?sinf=${plan.grade}`;
  const chapterHref = `${planHref}#bob-${topic.chapter.n}`;
  const topicHref = (p) => `?mavzu=${p.slug}`;

  document.title = `${topic.t} — ${plan.grade}-sinf ${subject} — Empira`;

  /* ---------- Lab cards (first lab gets the page's one primary button) ---------- */
  const labCards = !data ? '' : data.labs.map((lab, n) => `
    <article class="lab-card">
      <h3 class="lab-card__title">${lab.title}</h3>
      <p class="lab-card__meta">Taxminan ${lab.minutes} daqiqa</p>
      <p class="lab-card__goal">${lab.goal}</p>
      <div class="question">
        <p class="question__label">Tajriba savoli</p>
        <p class="question__text">${lab.task}</p>
      </div>
      <a class="btn ${n === 0 ? 'btn--primary' : 'btn--secondary'} btn--large" href="../lab/index.html?lab=${lab.slug}"${n === 0 ? ' data-main-cta' : ''}>
        ${n === 0 ? '3D laboratoriyani ochish' : 'Ochish'}
      </a>
    </article>`).join('');

  /* ---------- Formula panel ---------- */
  const terms = !data ? '' : data.terms.map(([sym, name, unit]) => `
    <div class="term">
      <dt class="term__sym">${sym}</dt>
      <dd class="term__name">${name}</dd>
      <dd class="term__unit">${unit}</dd>
    </div>`).join('');

  /* ---------- Previous / next ---------- */
  const pagerTile = (p, dir) => {
    if (!p) {
      // Start / end of the year: offer the way back to the plan instead of a dead end
      return `
        <a class="pager__tile pager__tile--${dir}" href="${planHref}">
          <span class="pager__label">${dir === 'prev' ? icon.left : ''}Yillik reja${dir === 'next' ? icon.right : ''}</span>
          <span class="pager__title">${plan.grade}-sinf · ${subject}</span>
          <span class="pager__meta">Barcha boblar va mavzular</span>
        </a>`;
    }
    return `
      <a class="pager__tile pager__tile--${dir}" href="${topicHref(p)}" rel="${dir}">
        <span class="pager__label">${dir === 'prev' ? icon.left + 'Oldingi mavzu' : 'Keyingi mavzu' + icon.right}</span>
        <span class="pager__title">${p.t}</span>
        <span class="pager__meta">${p.w}-hafta · ${p.lab ? '3D laboratoriya mavjud' : 'Tez orada'}</span>
      </a>`;
  };

  document.querySelector('[data-page]').innerHTML = `
    <nav class="crumbs" aria-label="Siz shu yerdasiz">
      <ol role="list">
        <li><a href="${planHref}">${plan.grade}-sinf · ${subject}</a></li>
        <li><span class="crumbs__sep" aria-hidden="true">${icon.right}</span><a href="${chapterHref}">${topic.chapter.n}-bob. ${topic.chapter.title}</a></li>
      </ol>
    </nav>

    <h1 class="title">${topic.t}</h1>
    <p class="title-meta">${topic.w}-hafta</p>

    ${data ? '' : `
    <section class="nolab" aria-live="polite">
      <p class="nolab__text">Bu mavzu uchun 3D laboratoriya hali mavjud emas.</p>
      <a class="btn btn--secondary btn--large" href="${chapterHref}">Yillik rejaga qaytish</a>
    </section>`}

    <div class="layout"${data ? '' : ' hidden'}>
      <section class="labs" aria-labelledby="labs-title">
        <h2 class="section-title" id="labs-title">3D laboratoriya</h2>
        ${labCards}
      </section>

      <div class="study">
        <section aria-labelledby="explain-title">
          <h2 class="section-title" id="explain-title">Qisqacha tushuntirish</h2>
          <div class="explain">${data ? data.explain.map((p) => `<p>${p}</p>`).join('') : ''}</div>
        </section>

        <section class="formula" aria-labelledby="formula-title">
          <h2 class="section-title" id="formula-title">${data && data.formulas.length > 1 ? 'Asosiy formulalar' : 'Asosiy formula'}</h2>
          <div class="formula__panel">
            ${data ? data.formulas.map((f) => `<p class="formula__expr">${f}</p>`).join('') : ''}
            <dl class="terms">${terms}</dl>
          </div>
        </section>
      </div>
    </div>

    <nav class="pager" aria-label="Mavzular orasida o‘tish">
      ${pagerTile(prev, 'prev')}
      ${pagerTile(next, 'next')}
    </nav>`;

  /* ---------- Mobile sticky CTA: appears only after the card's button has scrolled out of view ---------- */
  const mainCta = document.querySelector('[data-main-cta]');
  if (data) document.querySelector('[data-sticky-link]').href = `../lab/index.html?lab=${data.labs[0].slug}`;
  const sticky = document.querySelector('[data-sticky]');
  if (mainCta && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      sticky.hidden = !scrolledPast;
      document.body.classList.toggle('has-sticky', scrolledPast);
    }).observe(mainCta);
  }
})();
