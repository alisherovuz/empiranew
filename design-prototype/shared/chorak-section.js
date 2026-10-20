/* Empira — "Joriy chorak" section: a compact, self-contained panel showing the
   current school-quarter topics, with a 7/8 grade switcher. Current chorak is
   auto-detected by date (server-side). Works for both teachers and students.
   Usage: <div data-chorak data-chorak-mode="teacher|student"></div> */
(function () {
  'use strict';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function styles() {
    if (document.getElementById('empira-chorak-css')) return;
    var st = document.createElement('style'); st.id = 'empira-chorak-css';
    st.textContent =
      '.ch-panel{margin:10px 0 20px;border:1.5px solid #E6E8F2;border-radius:18px;background:#fff;padding:16px 18px;font-family:Inter,system-ui,sans-serif}' +
      '.ch-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:space-between}' +
      '.ch-l{display:flex;align-items:center;gap:10px;flex-wrap:wrap}' +
      '.ch-l h2{font-size:17px;font-weight:800;color:#1A1D33;margin:0}' +
      '.ch-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(59,76,255,.1);color:#3B4CFF;font-weight:700;font-size:12.5px;padding:4px 10px;border-radius:999px}' +
      '.ch-seg{display:inline-flex;background:#F3F4FA;border-radius:10px;padding:3px;gap:2px}' +
      '.ch-seg button{appearance:none;border:0;background:transparent;color:#6B7191;font:700 13px Inter,system-ui,sans-serif;padding:6px 14px;border-radius:8px;cursor:pointer}' +
      '.ch-seg button.on{background:#fff;color:#3B4CFF;box-shadow:0 1px 3px rgba(11,16,38,.12)}' +
      '.ch-scroll{display:flex;gap:10px;overflow-x:auto;padding:14px 2px 4px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}' +
      '.ch-scroll::-webkit-scrollbar{height:6px}.ch-scroll::-webkit-scrollbar-thumb{background:#D9DCE8;border-radius:6px}' +
      '.ch-item{scroll-snap-align:start;flex:0 0 210px;display:flex;flex-direction:column;gap:8px;border:1.5px solid #ECEEF6;border-radius:13px;padding:12px 13px;background:#FBFBFE;transition:border-color .12s}' +
      '.ch-item:hover{border-color:#8B96FF}' +
      '.ch-top{display:flex;align-items:center;justify-content:space-between;gap:6px}' +
      '.ch-chap{font-size:11px;font-weight:700;color:#8A91AD;background:#F0F1F8;padding:2px 7px;border-radius:6px}' +
      '.ch-dot{width:8px;height:8px;border-radius:50%;flex:0 0 auto}' +
      '.ch-dot.on{background:#1E9E6A}.ch-dot.off{background:#E2C65A}' +
      '.ch-title{font-size:13.5px;font-weight:700;color:#1A1D33;line-height:1.3;margin:0;min-height:35px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
      '.ch-open{text-align:center;text-decoration:none;background:#3B4CFF;color:#fff;border-radius:9px;padding:8px;font:700 12.5px Inter,system-ui,sans-serif;margin-top:auto}' +
      '.ch-open.alt{background:#fff;color:#3B4CFF;border:1.5px solid #D9DCE8}' +
      '.ch-foot{margin:6px 2px 0;font-size:12px;color:#8A91AD}' +
      '.ch-empty{color:#6B7191;font-size:13.5px;padding:12px 2px}';
    document.head.appendChild(st);
  }

  var topicHref = function (t) { return '/design-prototype/topic/index.html?mavzu=' + encodeURIComponent(t.slug) + '&sinf=' + t.grade; };
  var labHref = function (labSlug) { return '/design-prototype/lab/index.html?lab=' + encodeURIComponent(labSlug); };

  function item(t, mode) {
    var hasLab = t.hasLab && t.labs && t.labs[0];
    var url = hasLab ? labHref(t.labs[0].slug) : topicHref(t);
    var dot = mode === 'teacher'
      ? '<span class="ch-dot ' + (t.hasPresentation ? 'on' : 'off') + '" title="' + (t.hasPresentation ? 'Taqdimot tayyor' : 'Taqdimot hali yo‘q') + '"></span>'
      : (hasLab ? '<span class="ch-dot on" title="Laboratoriya bor"></span>' : '');
    return '<article class="ch-item">' +
      '<div class="ch-top"><span class="ch-chap">' + esc(t.chapter) + '-bob</span>' + dot + '</div>' +
      '<h4 class="ch-title">' + esc(t.title) + '</h4>' +
      '<a class="ch-open' + (hasLab ? '' : ' alt') + '" href="' + url + '">' + (hasLab ? 'Laboratoriya' : 'Mavzu') + '</a>' +
      '</article>';
  }

  function mount(box) {
    if (!box) return;
    var mode = box.getAttribute('data-chorak-mode') || 'student';
    fetch('/api/chorak', { headers: { accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || data.error) return;
        var byGrade = data.byGrade || (data.grade ? (function () { var o = {}; o[data.grade] = data.topics; return o; })() : {});
        var gradesAvail = Object.keys(byGrade).filter(function (g) { return (byGrade[g] || []).length; }).sort();
        if (!gradesAvail.length) return;
        var pick = null;
        try { pick = String(localStorage.getItem('empira.grade') || ''); } catch (_) {}
        if (gradesAvail.indexOf(pick) < 0) pick = gradesAvail[0];

        styles();
        box.className = 'ch-panel';
        box.innerHTML =
          '<div class="ch-bar"><div class="ch-l"><h2>Joriy chorak</h2>' +
          '<span class="ch-pill">' + esc(data.label) + ' · ' + esc(data.dateRange) + '</span></div>' +
          '<div class="ch-seg">' + gradesAvail.map(function (g) {
            return '<button type="button" data-g="' + g + '"' + (g === pick ? ' class="on"' : '') + '>' + g + '-sinf</button>';
          }).join('') + '</div></div>' +
          '<div class="ch-scroll" data-list></div>' +
          '<div class="ch-foot" data-foot></div>';

        var list = box.querySelector('[data-list]'), foot = box.querySelector('[data-foot]');
        function draw(g) {
          var topics = byGrade[g] || [];
          list.innerHTML = topics.length ? topics.map(function (t) { return item(t, mode); }).join('')
            : '<p class="ch-empty">Bu chorak uchun mavzular yo‘q.</p>';
          foot.textContent = topics.length + ' ta mavzu · ' + (mode === 'teacher' ? 'nuqta: taqdimot tayyorligi' : 'shu chorak darslik tartibida');
          list.scrollLeft = 0;
        }
        box.querySelectorAll('.ch-seg button').forEach(function (b) {
          b.addEventListener('click', function () {
            var g = b.getAttribute('data-g');
            box.querySelectorAll('.ch-seg button').forEach(function (x) { x.classList.toggle('on', x === b); });
            try { localStorage.setItem('empira.grade', g); } catch (_) {}
            draw(g);
          });
        });
        draw(pick);
      })
      .catch(function () {});
  }

  function auto() { document.querySelectorAll('[data-chorak]').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto, { once: true });
  else auto();
  window.EMPIRA_CHORAK = { mount: mount };
})();
