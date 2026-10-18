(function () {
  const norm = (s) => String(s).toLowerCase().replace(/[‘’'ʻʼ`]/g,'').trim();
  function mount(box) {
    if (!box || !window.EMPIRA_AVAIL) return;
    box.className = 'empira-catalog';
    box.innerHTML = '<h2>Bugun nimani kashf qilamiz?</h2><p>Mavzuni tanlang. Tayyor tajribani sinang yoki laboratoriyani o‘zingiz yig‘ing.</p><a class="empira-continue" hidden data-resume><strong>Davom ettirish</strong><span></span></a><label>Mavzu yoki tajriba nomi<input class="empira-search" type="search" placeholder="Masalan: kuch, tezlik, Om qonuni" autocomplete="off"></label><div class="empira-filters" role="group" aria-label="Sinf bo‘yicha tanlash"><button type="button" data-grade="all" aria-pressed="true">Barchasi</button><button type="button" data-grade="7" aria-pressed="false">7-sinf</button><button type="button" data-grade="8" aria-pressed="false">8-sinf</button><a class="empira-scan" href="/design-prototype/scan/index.html">Kitobni skanerlash</a></div><p data-result-count role="status" aria-live="polite"></p><ul class="empira-results"></ul>';
    const all = Object.values(window.EMPIRA_PLANS || {}).flatMap((p) => p.chapters.flatMap((chapter) => chapter.topics.map((t) => ({
      ...t, grade: p.grade, slug: window.EMPIRA_AVAIL.slug(t.t), chapter: chapter.title || chapter.t || ''
    })))).filter((t) => window.EMPIRA_AVAIL.hasLab(t));
    let grade = 'all';
    try { const g = localStorage.getItem('empira.grade'); if (['7','8'].includes(g)) grade = g; } catch (_) {}
    const input = box.querySelector('input'), list = box.querySelector('ul'), resume = box.querySelector('[data-resume]');
    const recent = window.EMPIRA_PROGRESS?.recent().find((r) => window.EMPIRA_AVAIL.gradeOfLab(r.lab_id));
    if (recent) {
      const g = window.EMPIRA_AVAIL.gradeOfLab(recent.lab_id);
      let title = recent.lab_id;
      Object.values(window.EMPIRA_TOPICS || {}).forEach((t) => (t.labs || []).forEach((l) => { if (l.slug === recent.lab_id) title = l.title; }));
      resume.href = '/design-prototype/lab/' + (recent.mode === 'build' ? 'build/' : '') + 'index.html?lab=' + encodeURIComponent(recent.lab_id);
      resume.querySelector('span').textContent = g + '-sinf · ' + title + (recent.mode === 'build' ? ' · O‘zingiz yig‘ing' : ' · Tayyor tajriba');
      resume.hidden = false;
    }
    function render() {
      const query = norm(input.value);
      const found = all.filter((t) => (grade === 'all' || String(t.grade) === grade) && norm(t.t + ' ' + window.EMPIRA_AVAIL.labsFor(t.slug).map((l) => l.title).join(' ')).includes(query));
      list.replaceChildren();
      found.forEach((t) => {
        const li = document.createElement('li'), a = document.createElement('a'), title = document.createElement('strong'), meta = document.createElement('small');
        a.href = '/design-prototype/topic/index.html?mavzu=' + encodeURIComponent(t.slug) + '&sinf=' + t.grade;
        title.textContent = t.t; meta.textContent = t.grade + '-sinf · ' + window.EMPIRA_AVAIL.labsFor(t.slug).length + ' ta tajriba';
        a.append(title,meta); li.append(a); list.append(li);
      });
      box.querySelector('[data-result-count]').textContent = found.length ? found.length + ' ta mavzu' : 'Mavzu topilmadi. Boshqa so‘z yoki sinfni tanlang.';
      box.querySelectorAll('[data-grade]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.grade === grade)));
    }
    input.addEventListener('input', render);
    box.querySelectorAll('[data-grade]').forEach((b) => b.addEventListener('click', () => {
      grade = b.dataset.grade;
      if (grade !== 'all') window.EMPIRA_AVAIL.use(Number(grade));
      render();
    }));
    render();
  }
  window.EMPIRA_CATALOG = { mount };
})();
