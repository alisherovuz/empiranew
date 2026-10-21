/* Empira — lab home (used by /design-prototype/home and the student dashboard).
   Layout: Continue → grade tiles | "yoki" | scan card → search → recent experiments. */
(function () {
  const norm = (s) => String(s).toLowerCase().replace(/[‘’'ʻʼ`]/g, '').trim();
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICON = {
    scan: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    build: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4Z"/></svg>',
    ready: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M10 3v6l-5.5 9.3A1.6 1.6 0 0 0 5.9 21h12.2a1.6 1.6 0 0 0 1.4-2.7L14 9V3"/></svg>'
  };
  const SHOWN = [7, 8];

  function ago(iso) {
    const d = (Date.now() - Date.parse(iso)) / 86400000;
    if (!Number.isFinite(d)) return '';
    if (d < 1 && new Date(iso).getDate() === new Date().getDate()) return 'bugun';
    if (d < 2) return 'kecha';
    if (d < 7) return Math.floor(d) + ' kun oldin';
    return new Date(iso).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  }

  function mount(box) {
    const A = window.EMPIRA_AVAIL;
    if (!box || !A) return;
    const plans = window.EMPIRA_PLANS || {};
    const topicsMap = window.EMPIRA_TOPICS || {};
    const ready = A.grades();

    // every lab topic across ready grades
    const all = Object.values(plans).flatMap((p) => p.chapters.flatMap((ch) => ch.topics.map((t) => ({
      ...t, grade: p.grade, slug: A.slug(t.t)
    })))).filter((t) => A.hasLab(t));
    const labCount = (g) => all.filter((t) => t.grade === g).reduce((n, t) => n + A.labsFor(t.slug).length, 0);
    const labTitle = {};
    Object.values(topicsMap).forEach((t) => (t.labs || []).forEach((l) => { labTitle[l.slug] = l.title; }));
    const labHref = (id, mode) => '/design-prototype/lab/' + (mode === 'build' ? 'build/' : '') + 'index.html?lab=' + encodeURIComponent(id);

    let last = null;
    try { last = Number(localStorage.getItem('empira.grade')) || null; } catch (_) {}

    const recent = (window.EMPIRA_PROGRESS ? window.EMPIRA_PROGRESS.recent() : [])
      .filter((r) => A.gradeOfLab(r.lab_id) && labTitle[r.lab_id]);
    const first = recent[0];

    const tiles = SHOWN.map((g) => {
      const on = ready.includes(g);
      const n = on ? labCount(g) : 0;
      return '<li><a class="ec-grade' + (on ? '' : ' is-soon') + (on && g === last ? ' is-current' : '') + '" href="/design-prototype/class-plan/index.html?sinf=' + g + '" data-g="' + g + '"' +
        (on ? '' : ' aria-label="' + g + '-sinf, tayyorlanmoqda"') + '>' +
        '<span class="ec-grade__n">' + g + '<small>-sinf</small></span>' +
        '<span class="ec-grade__meta">' + (on ? n + ' ta tajriba' : 'Tayyorlanmoqda') + '</span></a></li>';
    }).join('');

    const chips = ['Om qonuni', 'Mayatnik', 'Guk qonuni', 'Arximed', 'Tezlik', 'Linza']
      .filter((q) => all.some((t) => norm(t.t + ' ' + A.labsFor(t.slug).map((l) => l.title).join(' ')).includes(norm(q))))
      .slice(0, 5);

    box.className = 'ec';
    box.innerHTML =
      (first ? '<a class="ec-continue" href="' + labHref(first.lab_id, first.mode) + '">' +
        '<span class="ec-continue__icon">' + (first.mode === 'build' ? ICON.build : ICON.ready) + '</span>' +
        '<span class="ec-continue__text"><span class="ec-continue__label">Davom ettirish · ' + esc(ago(first.updated_at)) + '</span>' +
        '<strong>' + esc(labTitle[first.lab_id]) + '</strong>' +
        '<span class="ec-continue__meta">' + A.gradeOfLab(first.lab_id) + '-sinf · ' + (first.mode === 'build' ? 'O‘zingiz yig‘ing' : 'Tayyor tajriba') + '</span></span>' +
        '<span class="ec-continue__go">' + ICON.arrow + '</span></a>' : '') +

      '<div class="ec-choices">' +
        '<section class="ec-choice" aria-labelledby="ec-t1"><h2 id="ec-t1">Sinfingizni tanlang</h2><p>Yillik reja ochiladi — mavzu va tajribalar darslik tartibida.</p>' +
          '<ul class="ec-grades" role="list">' + tiles + '</ul></section>' +
        '<div class="ec-or" aria-hidden="true"><span>yoki</span></div>' +
        '<section class="ec-choice" aria-labelledby="ec-t2"><h2 id="ec-t2">Kitobni skanerlang</h2><p>Darslik sahifasini suratga oling — kerakli tajriba o‘zi ochiladi.</p>' +
          '<a class="ec-scan" href="/design-prototype/scan/index.html"><span class="ec-scan__icon">' + ICON.scan + '</span>' +
          '<span class="ec-scan__label">Skanerlash</span><span class="ec-scan__note">Kamera yoki rasm yuklash orqali</span></a></section>' +
      '</div>' +

      '<section class="ec-find" aria-labelledby="ec-t3"><h2 id="ec-t3">Yoki mavzuni nomi bilan toping</h2>' +
        '<label class="ec-search">' + ICON.search + '<span class="ec-sr">Mavzu yoki tajriba nomi</span>' +
        '<input type="search" placeholder="Masalan: Om qonuni, tezlik, linza" autocomplete="off"></label>' +
        (chips.length ? '<div class="ec-chips" aria-label="Tez qidiruv">' + chips.map((c) => '<button type="button">' + esc(c) + '</button>').join('') + '</div>' : '') +
        '<p class="ec-count" role="status" aria-live="polite"></p><ul class="ec-results" role="list"></ul></section>' +

      (recent.length > 1 ? '<section class="ec-recent" aria-labelledby="ec-t4"><h2 id="ec-t4">So‘nggi tajribalaringiz</h2><ul role="list">' +
        recent.slice(0, 4).map((r) => '<li><a href="' + labHref(r.lab_id, r.mode) + '">' +
          '<span class="ec-tag ' + (r.mode === 'build' ? 'is-build' : '') + '">' + (r.mode === 'build' ? 'O‘zingiz yig‘ing' : 'Tayyor tajriba') + '</span>' +
          '<strong>' + esc(labTitle[r.lab_id]) + '</strong><small>' + A.gradeOfLab(r.lab_id) + '-sinf · ' + esc(ago(r.updated_at)) + '</small></a></li>').join('') +
        '</ul></section>' : '');

    // grade tiles remember the choice
    box.querySelectorAll('.ec-grade').forEach((a) => a.addEventListener('click', () => {
      const g = Number(a.dataset.g); if (ready.includes(g)) A.use(g);
    }));

    // search: results appear only while typing
    const input = box.querySelector('.ec-search input'), list = box.querySelector('.ec-results'), count = box.querySelector('.ec-count');
    function render() {
      const q = norm(input.value);
      list.replaceChildren();
      if (!q) { count.textContent = ''; return; }
      const found = all.filter((t) => norm(t.t + ' ' + A.labsFor(t.slug).map((l) => l.title).join(' ')).includes(q));
      count.textContent = found.length ? found.length + ' ta mavzu topildi' : 'Hech narsa topilmadi. Boshqa so‘z bilan urinib ko‘ring yoki sinfni tanlang.';
      found.slice(0, 12).forEach((t) => {
        const li = document.createElement('li'), a = document.createElement('a');
        a.href = '/design-prototype/topic/index.html?mavzu=' + encodeURIComponent(t.slug) + '&sinf=' + t.grade;
        a.innerHTML = '<span class="ec-tag">' + t.grade + '-sinf</span><strong></strong><small></small>';
        a.querySelector('strong').textContent = t.t;
        a.querySelector('small').textContent = A.labsFor(t.slug).length + ' ta tajriba';
        li.append(a); list.append(li);
      });
    }
    input.addEventListener('input', render);
    box.querySelectorAll('.ec-chips button').forEach((b) => b.addEventListener('click', () => { input.value = b.textContent; render(); input.focus(); }));
  }
  window.EMPIRA_CATALOG = { mount };
})();
