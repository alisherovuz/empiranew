// Empira — Topic page prototype (S3). Prototype only.
// ?mavzu=<slug> selects the topic. An unknown slug shows "Mavzu topilmadi" (never a different topic).
// Previous/next step through topics that have a 3D lab only (../shared/availability.js).
(async function () {
  if(!await window.EMPIRA_READY)return;
  const plan = window.EMPIRA_PLAN;
  const content = window.EMPIRA_TOPICS;
  const avail = window.EMPIRA_AVAIL;

  const icon = {
    left: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    right: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'
  };

  const subject = plan.subjects[0].name;
  // The page's grade is the topic's grade (availability.js picks it from ?mavzu=), so every link goes to that plan
  const planHref = `../class-plan/index.html?sinf=${plan.grade}`;
  document.querySelector('[data-back]').href = planHref;

  // Any curriculum topic can still be opened directly (scanner, old links), so resolve against the full plan
  const requested = new URLSearchParams(location.search).get('mavzu') || '';
  const topic = avail.findTopic(requested);

  if (!topic) {
    document.title = `Mavzu topilmadi — Empira`;
    document.querySelector('[data-page]').innerHTML = `
      <h1 class="title">Mavzu topilmadi</h1>
      <section class="nolab" aria-live="polite">
        <p class="nolab__text">Bu havola bo‘yicha mavzu topilmadi.</p>
        <a class="btn btn--secondary btn--large" href="${planHref}">Yillik rejaga qaytish</a>
      </section>`;
    return;
  }

  const hasLab = avail.hasLab(topic);
  const data = hasLab ? content[topic.slug] : null;
  // A topic without a lab may still have a short explanation (e.g. 7-sinf §2 Fazo va vaqt): show it under the note
  const study = data || content[topic.slug] || null;
  const { prev, next } = avail.neighbours(topic.slug);
  const chapterHref = `${planHref}#bob-${topic.chapter.n}`;
  const topicHref = (p) => `?mavzu=${p.slug}`;

  document.title = `${topic.t} — ${plan.grade}-sinf ${subject} — Empira`;

  /* ---------- Lab cards (first lab gets the page's one primary button) ----------
     Labs with a Build Mode (../lab/build/experiments.js) get two choices: the ready lab, or build it yourself. */
  const buildFor = window.EMPIRA_BUILD_FOR || (() => null);
  // Best result in Build Mode on this device (1–3 stars), so students see what they earned and can try for 3
  const starsFor = (labSlug) => {
    let n = 0;
    n = Math.max(0,Math.min(3,Number(window.EMPIRA_PROGRESS.get(labSlug,'build')?.bestStars)||0));
    return n ? `<span class="lab-card__stars" aria-label="Eng yaxshi natija: ${n} ta yulduz">${'★'.repeat(n)}${'☆'.repeat(3 - n)}</span>` : '';
  };
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
        ${buildFor(lab.slug) ? 'Tayyor laboratoriya' : n === 0 ? '3D laboratoriyani ochish' : 'Ochish'}
      </a>
      ${buildFor(lab.slug) ? `<a class="btn btn--secondary btn--large lab-card__build" href="../lab/build/index.html?lab=${lab.slug}">${buildFor(lab.slug).label}${starsFor(lab.slug)}</a>` : ''}
    </article>`).join('');

  /* ---------- Formula panel ---------- */
  const terms = !study ? '' : (study.terms || []).map(([sym, name, unit]) => `
    <div class="term">
      <dt class="term__sym">${sym}</dt>
      <dd class="term__name">${name}</dd>
      <dd class="term__unit">${unit}</dd>
    </div>`).join('');

  const nf = study ? (study.formulas || []).length : 0;
  const formulaTitle = nf > 1 ? 'Asosiy formulalar' : nf === 1 ? 'Asosiy formula' : 'Asosiy kattaliklar';

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
        <span class="pager__meta">${p.w}-hafta · 3D laboratoriya mavjud</span>
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
      <p class="nolab__text">Bu mavzu uchun laboratoriya yo‘q.</p>
      <a class="btn btn--secondary btn--large" href="${chapterHref}">Yillik rejaga qaytish</a>
    </section>`}

    <div class="layout"${study ? '' : ' hidden'}>
      ${data ? `<section class="labs" aria-labelledby="labs-title">
        <h2 class="section-title" id="labs-title">3D laboratoriya</h2>
        ${labCards}
      </section>` : ''}

      <div class="study">
        <section aria-labelledby="explain-title">
          <h2 class="section-title" id="explain-title">Qisqacha tushuntirish</h2>
          <div class="explain">${study ? (study.explain || []).map((p) => `<p>${p}</p>`).join('') : ''}</div>
        </section>

        ${study && ((study.formulas || []).length || terms) ? `<section class="formula" aria-labelledby="formula-title">
          <h2 class="section-title" id="formula-title">${formulaTitle}</h2>
          <div class="formula__panel">
            ${(study.formulas || []).map((f) => `<p class="formula__expr">${f}</p>`).join('')}
            <dl class="terms">${terms}</dl>
          </div>
        </section>` : ''}
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
