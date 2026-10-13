(function () {
// Empira — Build Mode ("Zanjirni o‘zingiz yig‘ing"). ?lab=<lab id>, e.g. ?lab=om-qonuni
// The student starts from an empty board: picks the needed tools from a library of 10 (wrong ones are explained),
// wires terminals by tapping one, then another (in 3D or with the terminal buttons), gets an amber ✓ for a correct wire
// and a coral ! with the reason for a wrong one (the wrong wire is not kept). When the circuit is complete,
// measuring starts on the student's own circuit with the same numbers as the ready lab (labs-8.js).
// Nothing here changes the ready labs: it only reads EMPIRA_LABS[lab] (numbers) and the shared kit (3D tools).

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const q = new URLSearchParams(location.search);
const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',');

const labId = q.get('lab') || '';
const cfg = (window.EMPIRA_BUILD || {})[labId];
const L = (window.EMPIRA_LABS || {})[labId];
const avail = window.EMPIRA_AVAIL;

// The lab's own text and topic (same source as the Topic page and the ready lab)
let info = null, topic = null;
Object.entries(window.EMPIRA_TOPICS || {}).forEach(([topicSlug, c]) => c.labs.forEach((l) => {
  if (l.slug === labId) { info = l; topic = avail.findTopic(topicSlug); }
}));

if (!cfg || !L || !info || !topic) {
  // Unknown lab or no Build Mode for it: say so, never open another experiment
  $('[data-main]').hidden = true;
  $('[data-missing]').hidden = false;
  $('[data-title]').textContent = 'Yig‘ish rejimi';
  if (topic) $('[data-back]').href = $('[data-missing-link]').href = `../../topic/index.html?mavzu=${topic.slug}`;
  if (topic) $('[data-missing-link]').textContent = 'Mavzuga qaytish';
  return;
}

document.title = `${info.title} — Zanjirni o‘zingiz yig‘ing — Empira`;
$('[data-title]').textContent = info.title;
$('[data-meta]').textContent = `${topic.n}-§ · ${cfg.label}`;
$('[data-back]').href = `../../topic/index.html?mavzu=${topic.slug}`;
$('[data-task]').textContent = cfg.task;

/* =====================================================================
   Tools, terminals, circuit checker
   ===================================================================== */
const tools = Object.fromEntries(cfg.tools.map((t) => [t.id, t]));
const needed = cfg.tools.filter((t) => t.need);
const names = Object.fromEntries(needed.map((t) => [t.id, t.name]));
const circuit = window.EMPIRA_CIRCUIT.create(cfg.circuit, names, cfg.messages);

const KEY_LABEL = { '+': '«+»', '-': '«−»', a: '(1)', b: '(2)' };
const CHIP_LABEL = { '+': '+', '-': '−', a: '1', b: '2' };
const termTool = (tid) => tid.split('.')[0];
const termKey = (tid) => tid.split('.')[1];
const termName = (tid) => `${tools[termTool(tid)].name} ${KEY_LABEL[termKey(tid)]}`;

const state = {
  phase: 'build',            // build → ready (circuit complete) → measure
  placed: {},                // tool id → kit object
  wires: [],                 // accepted wires [[tid, tid]]
  pending: null,             // first terminal of a wire being made
  hover: null,
  guide: null,               // terminal that pulses "start here" after the step-2 card
  mistakes: 0, startedAt: 0, finaleShown: false,
  // measurement (same shape as the ready lab engine)
  values: Object.fromEntries(L.controls.map((c) => [c.key, c.value])),
  runs: [], touched: new Set(), mphase: 'ready', t: 0, dur: 1
};
const allTerminals = () => Object.keys(state.placed).flatMap((id) => Object.keys(tools[id].terminals).map((k) => `${id}.${k}`));
const wiresAt = (tid) => state.wires.filter((w) => w.includes(tid)).length;
const progress = () => circuit.progress(state.wires);

/* =====================================================================
   Feedback: one region, one message, short animation on a committed action only
   ===================================================================== */
const ICON = {
  ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  done: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  error: '<svg viewBox="0 0 24 24"><path d="M12 6v7.5"/><path d="M12 17.5v.5"/></svg>',
  info: '<svg viewBox="0 0 24 24"><path d="M12 11v6"/><path d="M12 7v.5"/></svg>'
};
const fb = $('[data-feedback]');
function feedback(kind, title, text) {
  fb.className = `feedback feedback--${kind}`;
  $('[data-fb-icon]').innerHTML = ICON[kind];
  $('[data-fb-title]').textContent = title;
  $('[data-fb-text]').textContent = text || '';
  if (kind !== 'info') { void fb.offsetWidth; fb.classList.add('is-anim'); }
}
feedback('info', 'Kerakli asboblarni tanlang', 'To‘g‘ri asbob stolga qo‘yiladi. Keraksiz asbob tanlansa, ogohlantirish chiqadi.');

function flashEl(el, cls) {
  if (!el) return;
  el.classList.remove('is-ok', 'is-wrong'); void el.offsetWidth; el.classList.add(cls);
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove(cls), 900);
}

/* =====================================================================
   Sound: short, soft tones made in the browser (no files). Toggle in the top bar, remembered on this device.
   ===================================================================== */
const Sound = (() => {
  let ctx = null, on = true;
  try { on = localStorage.getItem('empira-sound') !== 'off'; } catch (e) { /* storage blocked: keep default */ }
  function tone(freq, t0, dur, type = 'sine', vol = 0.12) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ctx.destination); o.start(t0); o.stop(t0 + dur + 0.03);
  }
  function play(kind) {
    if (!on) return;
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { return; }
    const t = ctx.currentTime;
    if (kind === 'ok') { tone(660, t, 0.12); tone(990, t + 0.07, 0.18); }
    else if (kind === 'error') { tone(233, t, 0.16, 'triangle', 0.1); tone(196, t + 0.12, 0.24, 'triangle', 0.1); }
    else if (kind === 'step') { [523, 659, 784].forEach((f, i) => tone(f, t + i * 0.09, 0.2)); }
    else if (kind === 'win') { [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.11, 0.3, 'sine', 0.14)); tone(1319, t + 0.46, 0.6, 'sine', 0.09); tone(1568, t + 0.52, 0.6, 'sine', 0.06); }
  }
  return { play, get on() { return on; }, toggle() { on = !on; try { localStorage.setItem('empira-sound', on ? 'on' : 'off'); } catch (e) { /* ignore */ } return on; } };
})();
const soundBtn = $('[data-sound]');
soundBtn.setAttribute('aria-pressed', String(Sound.on));
soundBtn.addEventListener('click', () => { soundBtn.setAttribute('aria-pressed', String(Sound.toggle())); });

/* ---------- Confetti in brand colours (skipped under reduced motion) ---------- */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function confetti(amount = 150) {
  if (reduceMotion) return;
  const c = $('[data-confetti]'), g = c.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = c.width = innerWidth * dpr, H = c.height = innerHeight * dpr;
  c.hidden = false;
  const cols = ['#3B4CFF', '#FFB21E', '#8B96FF', '#FFB21E', '#0B1026', '#FFFFFF'];
  const ps = Array.from({ length: amount }, (_, i) => ({
    x: W * (0.5 + (Math.random() - 0.5) * 0.3), y: H * 0.45,
    vx: (Math.random() - 0.5) * W * 0.022, vy: -H * (0.012 + Math.random() * 0.016),
    s: (6 + Math.random() * 8) * dpr, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.35, c: cols[i % cols.length], round: i % 4 === 0
  }));
  const t0 = performance.now();
  (function frame(now) {
    const t = (now - t0) / 1000;
    g.clearRect(0, 0, W, H);
    ps.forEach((p) => {
      p.vy += H * 0.00055; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.globalAlpha = Math.max(0, Math.min(1, 2.6 - t));
      g.fillStyle = p.c; g.strokeStyle = 'rgba(11,16,38,.15)';
      if (p.round) { g.beginPath(); g.arc(0, 0, p.s / 3, 0, Math.PI * 2); g.fill(); } else { g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
      g.restore();
    });
    if (t < 2.6) requestAnimationFrame(frame); else { g.clearRect(0, 0, W, H); c.hidden = true; }
  })(t0);
}

/* ---------- Coach cards: the big, clear moments (start, step 2, win, experiment done) ---------- */
const ART = {
  intro: `<svg viewBox="0 0 112 112"><g class="art-pop"><circle class="art-ring" cx="56" cy="56" r="56"/>
    <rect class="art-ink" x="30" y="34" width="22" height="18" rx="4"/><rect class="art-ink" x="60" y="34" width="22" height="18" rx="4"/>
    <rect class="art-ink" x="30" y="60" width="22" height="18" rx="4"/><rect class="art-ink" x="60" y="60" width="22" height="18" rx="4"/></g>
    <path class="art-arrow" d="M56 88v14M49 96l7 7 7-7"/></svg>`,
  connect: `<svg viewBox="0 0 112 112"><circle class="art-ring" cx="56" cy="56" r="56"/>
    <rect class="art-ink" x="18" y="44" width="24" height="24" rx="5"/><rect class="art-ink" x="70" y="44" width="24" height="24" rx="5"/>
    <path class="art-wire" d="M34 50 C 44 26, 68 26, 78 50"/>
    <circle class="art-dot" cx="34" cy="50" r="5"/><circle class="art-plus" cx="34" cy="50" r="2.5"/><circle class="art-dot" cx="78" cy="50" r="5"/>
    <g transform="translate(56 82)"><circle class="art-finger" r="9"/></g></svg>`,
  win: `<svg viewBox="0 0 112 112"><g class="art-rays">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) =>
    `<line x1="56" y1="4" x2="56" y2="-8" transform="rotate(${a} 56 56)"/>`).join('')}</g>
    <g class="art-pop"><circle class="art-ring" cx="56" cy="56" r="50"/><path class="art-ink art-check" d="M34 58l15 15 30-32"/></g></svg>`,
  done: `<svg viewBox="0 0 112 112"><g class="art-rays">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) =>
    `<line x1="56" y1="4" x2="56" y2="-8" transform="rotate(${a} 56 56)"/>`).join('')}</g>
    <g class="art-pop"><circle class="art-ring" cx="56" cy="56" r="50"/>
    <path class="art-ink" d="M44 32h24M48 32v18L34 76a6 6 0 0 0 5 8h34a6 6 0 0 0 5-8L64 50V32"/><path class="art-ink art-check" d="M44 66l8 8 16-16"/></g></svg>`
};
const STAR = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>';
const coachEl = $('[data-coach]');
let coachGo = null, coachCloseFn = null;
function coach({ kind, step = '', title, text = '', plan = null, stars = 0, meta = '', go, onGo, close = '', onClose = null }) {
  coachEl.dataset.kind = kind;
  $('[data-coach-art]').innerHTML = ART[kind];
  $('[data-coach-step]').textContent = step;
  $('[data-coach-title]').textContent = title;
  $('[data-coach-text]').textContent = text;
  const planEl = $('[data-coach-plan]');
  planEl.hidden = !plan; planEl.innerHTML = plan ? plan.map((x, i) => `<li><span>${i + 1}</span>${x}</li>`).join('') : '';
  const st = $('[data-coach-stars]');
  st.hidden = !stars; st.innerHTML = stars ? [1, 2, 3].map((i) => STAR.replace('class="star"', `class="star${i <= stars ? ' is-on' : ''}"`)).join('') : '';
  st.setAttribute('aria-label', stars ? `${stars} ta yulduz (3 tadan)` : '');
  $('[data-coach-meta]').innerHTML = meta;
  $('[data-coach-go]').textContent = go;
  const cl = $('[data-coach-close]'); cl.hidden = !close; cl.textContent = close;
  coachGo = onGo || null; coachCloseFn = onClose;
  coachEl.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => coachEl.classList.add('is-open')));
  setTimeout(() => $('[data-coach-go]').focus({ preventScroll: true }), 60);
}
function closeCoach(run) {
  if (coachEl.hidden) return;
  coachEl.classList.remove('is-open'); coachEl.hidden = true;
  const fn = run ? coachGo : coachCloseFn; coachGo = coachCloseFn = null;
  if (fn) fn();
}
$('[data-coach-go]').addEventListener('click', () => closeCoach(true));
$('[data-coach-close]').addEventListener('click', () => closeCoach(false));
coachEl.addEventListener('click', (e) => { if (e.target === coachEl) closeCoach(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !coachEl.hidden) closeCoach(false); });

const PRAISE = ['To‘g‘ri!', 'Zo‘r!', 'Ajoyib!', 'Barakalla!', 'Juda yaxshi!', 'Davom eting!'];
let praiseI = 0;
const praise = () => PRAISE[praiseI++ % PRAISE.length];
const mark = () => { if (!state.startedAt) state.startedAt = performance.now(); };
const bestKey = `empira-build-best:${labId}`;
function bestStars() { try { return Number(localStorage.getItem(bestKey)) || 0; } catch (e) { return 0; } }
function saveBest(n) { try { if (n > bestStars()) localStorage.setItem(bestKey, String(n)); } catch (e) { /* ignore */ } }

function showIntro() {
  coach({
    kind: 'intro', step: '1-qadam · 3 tadan', title: 'Laboratoriyani o‘zingiz yig‘ing',
    text: 'Ro‘yxatda 10 ta asbob bor. Ulardan faqat 5 tasi bu tajriba uchun kerak: ularni toping!',
    plan: ['Kerakli asboblarni tanlang', 'Ularni sim bilan ulang', 'O‘lchang va natijani ko‘ring'],
    go: 'Boshladik!',
    onGo: () => { $('.block--tools').classList.add('is-guide'); $('.block--tools').scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }); }
  });
}
function showConnect() {
  Sound.play('step');
  coach({
    kind: 'connect', step: '2-qadam · 3 tadan', title: 'Barakalla! Asboblar stolda',
    text: 'Endi ularni sim bilan ulang: bitta qisqichni bosing, keyin ikkinchisini. Ular orasida sim paydo bo‘ladi. Qizil qisqich — «+».',
    go: 'Ulashni boshlash',
    onGo: () => { state.guide = `${cfg.circuit.source.id}.+`; render(); },
    onClose: () => { state.guide = `${cfg.circuit.source.id}.+`; render(); }
  });
}
function showWin() {
  const stars = state.mistakes === 0 ? 3 : state.mistakes <= 2 ? 2 : 1;
  const prev = bestStars(); saveBest(stars);
  const secs = Math.max(1, Math.round((performance.now() - (state.startedAt || performance.now())) / 1000));
  const time = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  const text = stars === 3 ? 'Zanjirni birinchi urinishda, xatosiz yig‘dingiz. Haqiqiy fizikdek!'
    : stars === 2 ? 'Zanjir to‘g‘ri yig‘ildi! Xatolarni o‘zingiz topib tuzatdingiz.'
    : 'Zanjir to‘g‘ri yig‘ildi! Keyingi safar 3 yulduzga harakat qiling.';
  const record = prev && stars > prev ? '<span class="coach__badge">Yangi rekord!</span><br>' : '';
  Sound.play('win'); confetti();
  coach({
    kind: 'win', step: 'Zanjir tayyor', title: 'Tabriklaymiz!', text, stars,
    meta: `${record}Vaqt: ${time} · Xatolar: ${state.mistakes}`,
    go: 'O‘lchashni boshlash', onGo: startMeasure, close: 'Zanjirga qarash'
  });
}
function showDone() {
  const next = avail.neighbours(topic.slug).next;
  Sound.play('win'); confetti(110);
  coach({
    kind: 'done', step: '3-qadam bajarildi', title: 'Tajriba bajarildi!',
    text: cfg.finale ? cfg.finale(state.runs, calc()) : 'O‘zingiz yig‘gan zanjirda barcha o‘lchovlar olindi.',
    go: next ? 'Keyingi mavzu' : 'Yillik rejaga qaytish',
    onGo: () => { location.href = next ? `../../topic/index.html?mavzu=${next.slug}` : '../../class-plan/index.html?sinf=8'; },
    close: 'Shu yerda qolish'
  });
}

/* =====================================================================
   Panel rendering
   ===================================================================== */
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const BANG = '<svg viewBox="0 0 24 24"><path d="M12 6v7.5"/><path d="M12 17.5v.5"/></svg>';
// Library order is alphabetical, so the needed tools are not simply the first five
const library = cfg.tools.slice().sort((a, b) => a.name.localeCompare(b.name, 'uz'));
$('[data-tools]').innerHTML = library.map((t) => `
  <button class="tool" type="button" data-tool="${t.id}" aria-pressed="false">
    <svg class="tool__icon" viewBox="0 0 24 24" aria-hidden="true">${t.icon}</svg>
    <span class="tool__text"><span class="tool__name">${t.name}</span>${t.note ? `<span class="tool__note">${t.note}</span>` : ''}</span>
    <span class="tool__state" aria-hidden="true">${t.need ? CHECK : BANG}</span>
  </button>`).join('');

function renderTerms() {
  const ids = needed.map((t) => t.id).filter((id) => state.placed[id]);
  $('[data-terms-block]').hidden = ids.length === 0 || state.phase === 'measure';
  $('[data-terms]').innerHTML = ids.map((id) => `
    <li class="term-row">
      <span class="term-row__name">${tools[id].name}</span>
      <span class="term-row__chips">${Object.keys(tools[id].terminals).map((k) => {
        const tid = `${id}.${k}`, n = wiresAt(tid);
        return `<button class="chip${k === '+' ? ' chip--plus' : ''}${state.guide === tid && !state.pending ? ' is-guide' : ''}" type="button" data-term="${tid}" aria-pressed="${state.pending === tid}"
          aria-label="${termName(tid)}${n ? `, ${n} ta sim` : ''}">${CHIP_LABEL[k]}${n ? `<span class="chip__wires" aria-hidden="true">·${n}</span>` : ''}</button>`;
      }).join('')}</span>
    </li>`).join('');
}

function renderReadouts() {
  let pills;
  if (state.phase === 'measure') {
    pills = L.readouts(state.values, calc(), state.mphase === 'done', state.runs);
  } else {
    // Build phases: the three steps, always visible on the workspace
    const placedNeed = needed.filter((t) => state.placed[t.id]).length;
    const steps = [
      ['Asboblar', `${placedNeed} / ${needed.length}`, placedNeed === needed.length],
      ['Ulash', `${progress()} / ${circuit.required}`, state.phase === 'ready'],
      ['O‘lchash', '', false]
    ];
    const cur = steps.findIndex((x) => !x[2]);
    $('[data-readouts]').innerHTML = `<ol class="stepbar" aria-label="Bosqichlar">${steps.map(([k, v, done], i) => `
      <li class="stepbar__item${done ? ' is-done' : ''}${i === cur ? ' is-current' : ''}"${i === cur ? ' aria-current="step"' : ''}>
        <span class="stepbar__n">${done ? CHECK : i + 1}</span>${k}${v ? ` <span class="stepbar__count">${v}</span>` : ''}</li>`).join('')}</ol>`;
    return;
  }
  $('[data-readouts]').innerHTML = pills.map(([k, v, key]) =>
    `<span class="pill${key === 'done' ? ' pill--done' : key ? ' pill--key' : ''}"><span class="pill__k">${k}</span><span>${v}</span></span>`).join('');
}

function render() {
  const placedNeed = needed.filter((t) => state.placed[t.id]).length;
  $('[data-tools-count]').textContent = `${placedNeed} / ${needed.length}`;
  $('[data-wires-count]').textContent = `${progress()} / ${circuit.required}`;
  $$('[data-tool]').forEach((b) => {
    const placed = !!state.placed[b.dataset.tool];
    b.classList.toggle('is-placed', placed);
    b.setAttribute('aria-pressed', String(placed));
    b.disabled = state.phase === 'measure';
  });
  $('[data-undo]').disabled = state.wires.length === 0;
  $('[data-start]').hidden = state.phase !== 'ready';
  $$('[data-build-only]').forEach((el) => { if (el.dataset.termsBlock === undefined) el.hidden = state.phase === 'measure'; });
  $$('[data-measure]').forEach((el) => { el.hidden = state.phase !== 'measure'; });
  if (state.phase === 'measure') { $('[data-runs-block]').hidden = state.runs.length === 0; renderMeasure(); }
  renderTerms();
  renderReadouts();
  const hint = $('[data-hint]');
  hint.textContent = state.phase === 'measure' ? 'Aylantirish uchun suring'
    : state.pending ? `${termName(state.pending)} tanlandi — endi ikkinchi qisqichni bosing`
    : state.guide ? `Shu yerdan boshlang: ${termName(state.guide)}`
    : Object.keys(state.placed).length ? 'Qisqichni bosing, so‘ng ikkinchisini: sim ulanadi' : 'Asboblarni ro‘yxatdan tanlang';
}

/* =====================================================================
   3D stage (same look as the ready lab) — filled in build3D()
   ===================================================================== */
let S = null;   // { THREE, kit, scene, camera, controls, canvas, markers, tempGroup, hoverLabel, ... }

function placeTool(t) {
  const obj = t.make(S.kit);
  state.placed[t.id] = obj;
  const to = obj.group.position.y;
  obj.group.position.y = to + 0.12;
  S.drops.push({ group: obj.group, to, t: 0 });
  Object.keys(t.terminals).forEach((k) => addMarker(`${t.id}.${k}`));
}

function termPos(tid) {
  const t = tools[termTool(tid)];
  return state.placed[t.id][t.terminals[termKey(tid)]];
}

/* ---------- Terminal markers: a small ring around each terminal post ---------- */
const COLOR = { idle: 0x8B96FF, active: 0x3B4CFF, ok: 0xFFB21E, error: 0xFF6A4D };
function addMarker(tid) {
  const { THREE } = S;
  const m = new THREE.Mesh(new THREE.TorusGeometry(0.0105, 0.0024, 8, 28),
    new THREE.MeshBasicMaterial({ color: COLOR.idle, transparent: true, opacity: 0.95 }));
  m.rotation.x = Math.PI / 2; m.renderOrder = 5;
  S.scene.add(m); S.markers[tid] = { mesh: m, flash: null };
}
function flashTerms(tids, kind) { tids.forEach((tid) => { if (S.markers[tid]) S.markers[tid].flash = { kind, until: performance.now() + 900 }; }); }
function updateMarkers(now) {
  Object.entries(S.markers).forEach(([tid, mk]) => {
    const p = termPos(tid); mk.mesh.position.set(p.x, p.y + 0.002, p.z);
    let color = COLOR.idle, scale = 1;
    if (state.phase === 'measure') { mk.mesh.visible = false; return; }
    mk.mesh.visible = true;
    if (wiresAt(tid)) { color = COLOR.active; scale = 0.85; }
    if (state.hover === tid) { color = COLOR.active; scale = 1.35; }
    if (state.pending === tid) { color = COLOR.active; scale = 1.5 + Math.sin(now / 160) * 0.12; }
    else if (state.guide === tid) { color = COLOR.active; scale = 1.45 + 0.4 * (0.5 + 0.5 * Math.sin(now / 220)); }
    if (mk.flash && mk.flash.until > now) {
      const k = (mk.flash.until - now) / 900;
      color = COLOR[mk.flash.kind]; scale = 1.2 + 0.6 * k;
    } else mk.flash = null;
    mk.mesh.material.color.setHex(color); mk.mesh.scale.setScalar(scale);
  });
}

/* ---------- Wires ---------- */
const liftFor = (w) => (w.some((tid) => cfg.circuit.across.some((a) => termTool(tid) === a.id)) ? 0.05 : 0.035);
function redrawWires() {
  S.kit.clearWires();
  state.wires.forEach((w) => S.kit.wire(termPos(w[0]), termPos(w[1]), liftFor(w)));
}
// A short-lived coloured copy of a wire: amber glow for a correct wire, coral for a wrong one (which is not kept)
function flashWire(w, kind) {
  const { THREE } = S;
  const a = termPos(w[0]), b = termPos(w[1]), lift = liftFor(w);
  const mid = a.clone().lerp(b, 0.5); mid.y = Math.max(a.y, b.y) + lift;
  const curve = new THREE.CatmullRomCurve3([a, a.clone().setY(a.y + lift * 0.55), mid, b.clone().setY(b.y + lift * 0.55), b]);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, kind === 'error' ? 0.0034 : 0.0044, 8, false),
    new THREE.MeshBasicMaterial({ color: COLOR[kind], transparent: true, opacity: 0.9, depthWrite: false }));
  mesh.renderOrder = 4; S.tempGroup.add(mesh);
  S.temps.push({ mesh, t: 0, dur: kind === 'error' ? 1.1 : 0.9, kind });
}

/* ---------- Current flow: glowing dots run along the student's wires, from «+» through the loop to «−» ---------- */
function wireCurve(w) {
  const { THREE } = S;
  const a = termPos(w[0]), b = termPos(w[1]), lift = liftFor(w);
  const mid = a.clone().lerp(b, 0.5); mid.y = Math.max(a.y, b.y) + lift;
  return new THREE.CatmullRomCurve3([a, a.clone().setY(a.y + lift * 0.55), mid, b.clone().setY(b.y + lift * 0.55), b]);
}
function currentPath() {
  // terminals joined by wires, plus the inside of each series element (not the voltmeter)
  const adj = {}; const link = (a, b, w) => { (adj[a] = adj[a] || []).push([b, w]); };
  state.wires.forEach((w) => { link(w[0], w[1], w); link(w[1], w[0], w); });
  cfg.circuit.series.forEach((e) => { const [a, b] = e.polar ? [`${e.id}.+`, `${e.id}.-`] : [`${e.id}.a`, `${e.id}.b`]; link(a, b, null); link(b, a, null); });
  const start = `${cfg.circuit.source.id}.+`, end = `${cfg.circuit.source.id}.-`;
  const prev = { [start]: null }; const queue = [start];
  while (queue.length) {
    const n = queue.shift(); if (n === end) break;
    (adj[n] || []).forEach(([m, w]) => { if (!(m in prev)) { prev[m] = [n, w]; queue.push(m); } });
  }
  if (!(end in prev)) return [];
  const out = []; let n = end;
  while (prev[n]) { const [from, w] = prev[n]; if (w) out.unshift({ w, forward: w[0] === from }); n = from; }
  return out;
}
function buildFlow() {
  const { THREE } = S;
  S.flow.forEach((f) => f.dots.forEach((d) => S.flowGroup.remove(d)));
  const geo = new THREE.SphereGeometry(0.0042, 10, 8);
  const mat = new THREE.MeshBasicMaterial({ color: 0xFFB21E });
  S.flow = currentPath().map(({ w, forward }) => {
    const curve = wireCurve(w);
    const n = Math.max(3, Math.round(curve.getLength() / 0.06));
    const dots = Array.from({ length: n }, () => { const d = new THREE.Mesh(geo, mat); d.visible = false; S.flowGroup.add(d); return d; });
    return { curve, forward, dots };
  });
  S.flowT = 0;
}
function updateFlow(dt) {
  if (!S.flow.length) return;
  const running = state.mphase === 'running' && state.t / state.dur > 0.45;
  const on = state.phase === 'measure' && (state.mphase === 'done' || running);
  const speed = 0.25 + 0.6 * Math.min(1, (calc().I || 0) / 0.05);    // more current, faster flow
  S.flowT = (S.flowT + dt * speed * (reduceMotion ? 0 : 1)) % 1;
  S.flow.forEach(({ curve, forward, dots }) => dots.forEach((d, i) => {
    d.visible = on;
    if (!on) return;
    const u = (i / dots.length + S.flowT) % 1;
    d.position.copy(curve.getPointAt(forward ? u : 1 - u));
  }));
}

/* =====================================================================
   Actions
   ===================================================================== */
function chooseTool(id) {
  if (!S || state.phase === 'measure') return;
  const t = tools[id]; const btn = $(`[data-tool="${id}"]`);
  mark();
  $('.block--tools').classList.remove('is-guide');
  if (!t.need) {
    flashEl(btn, 'is-wrong'); Sound.play('error'); state.mistakes++;
    feedback('error', 'Bu asbob kerak emas', t.why);
    return;
  }
  if (state.placed[id]) { feedback('info', `${t.name} allaqachon stolda`, ''); return; }
  placeTool(t);
  flashEl(btn, 'is-ok');
  const left = needed.filter((x) => !state.placed[x.id]).length;
  if (left) { Sound.play('ok'); feedback('ok', praise(), `${t.name} stolga qo‘yildi. Yana ${left} ta asbob qoldi.`); }
  else {
    feedback('ok', 'Barcha asboblar stolda', 'Endi ularni sim bilan ulang: bir qisqichni, so‘ng ikkinchisini bosing.');
    setTimeout(showConnect, reduceMotion ? 0 : 500);   // let the last tool land first
  }
  render();
}

function chooseTerminal(tid) {
  if (state.phase === 'measure' || !tid) return;
  mark();
  if (!state.pending) { state.pending = tid; render(); return; }
  if (state.pending === tid) { state.pending = null; render(); return; }
  const w = [state.pending, tid];
  state.pending = null;
  const r = circuit.check(state.wires, w);
  if (r.status === 'duplicate') feedback('info', 'Bu sim allaqachon bor', r.message);
  else if (r.status === 'error') {
    flashWire(w, 'error'); flashTerms(w, 'error'); Sound.play('error'); state.mistakes++;
    feedback('error', 'Noto‘g‘ri ulanish', r.message);
    render(); w.forEach((x) => flashEl($(`[data-term="${x}"]`), 'is-wrong'));
    return;
  } else if (r.status === 'ok') {
    state.wires.push(w); redrawWires(); state.guide = null;
    flashWire(w, 'ok'); flashTerms(w, 'ok');
    if (r.complete) {
      state.phase = 'ready';
      state.wires.forEach((x) => flashWire(x, 'ok'));
      flashTerms(allTerminals(), 'ok');
      feedback('done', 'Zanjir tayyor!', 'Barcha ulanishlar to‘g‘ri. Endi o‘lchashni boshlang.');
      setTimeout(showWin, reduceMotion ? 0 : 450);
    } else {
      Sound.play('ok');
      const left = r.required - r.progress;
      feedback('ok', praise(), `${termName(w[0])} → ${termName(w[1])}. Yana ${left} ta ulanish qoldi.`);
    }
    render(); w.forEach((x) => flashEl($(`[data-term="${x}"]`), 'is-ok'));
    return;
  }
  render();
}

function undo() {
  if (!state.wires.length || state.phase === 'measure') return;
  state.wires.pop(); redrawWires();
  if (state.phase === 'ready') state.phase = 'build';
  state.pending = null;
  feedback('info', 'Oxirgi sim olib tashlandi', '');
  render();
}

function restart() {
  if (!S) return;
  Object.values(state.placed).forEach((o) => S.scene.remove(o.group));
  Object.values(S.markers).forEach((m) => { S.scene.remove(m.mesh); m.mesh.geometry.dispose(); });
  S.markers = {}; S.drops = [];
  Object.assign(state, { phase: 'build', placed: {}, wires: [], pending: null, hover: null, guide: null, mistakes: 0, startedAt: 0, finaleShown: false, runs: [], touched: new Set(), mphase: 'ready', t: 0 });
  S.flow.forEach((f) => f.dots.forEach((d) => { S.flowGroup.remove(d); }));
  S.flow = [];
  state.values = Object.fromEntries(L.controls.map((c) => [c.key, c.value]));
  S.kit.clearWires();
  feedback('info', 'Kerakli asboblarni tanlang', 'To‘g‘ri asbob stolga qo‘yiladi. Keraksiz asbob tanlansa, ogohlantirish chiqadi.');
  render();
}

/* =====================================================================
   Measuring on the student's circuit (same rules as the ready lab engine)
   ===================================================================== */
const calc = () => (L.compute ? L.compute(state.values) : {});
function startMeasure() {
  if (state.phase !== 'ready') return;
  state.phase = 'measure'; state.pending = null; state.hover = null;
  $('[data-fields]').innerHTML = L.controls.map((c) => c.type === 'choice' ? `
    <div class="field"><div class="field__row"><span class="field__label" id="c-${c.key}-l">${c.label}</span></div>
      <div class="choice" role="radiogroup" aria-labelledby="c-${c.key}-l">
        ${c.options.map((o) => `<button class="choice__opt" type="button" role="radio" data-choice="${c.key}" data-v="${o.v}">${o.label}</button>`).join('')}
      </div></div>` : `
    <div class="field"><div class="field__row"><label for="c-${c.key}">${c.label}</label><output for="c-${c.key}" data-val="${c.key}"></output></div>
      <input class="range" id="c-${c.key}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${state.values[c.key]}" data-ctl="${c.key}"></div>`).join('');
  $('[data-steps]').innerHTML = L.steps.map((s, i) => `<li class="step" data-step="${i + 1}"><span class="step__n">${i + 1}</span><span class="step__text">${s.text}</span></li>`).join('');
  $('[data-runs-head]').innerHTML = L.cols.map((c) => `<th scope="col">${c}</th>`).join('');
  $$('[data-ctl]').forEach((input) => input.addEventListener('input', () => {
    state.values[input.dataset.ctl] = +input.value; state.touched.add(input.dataset.ctl); resetRun();
  }));
  $$('[data-choice]').forEach((b) => b.addEventListener('click', () => {
    const c = L.controls.find((x) => x.key === b.dataset.choice);
    state.values[c.key] = typeof c.value === 'number' ? +b.dataset.v : b.dataset.v; state.touched.add(c.key); resetRun();
  }));
  cfg.instruments.update(state.placed, state.values, calc());
  buildFlow();
  feedback('done', '3-qadam: o‘lchang', 'Kuchlanishni tanlab, kalitni ulang. Simlarda tok qanday oqishini kuzating!');
  fb.classList.remove('is-anim');
  render();
}
function resetRun() { state.mphase = 'ready'; state.t = 0; cfg.instruments.update(state.placed, state.values, calc()); render(); }
function renderMeasure() {
  const running = state.mphase === 'running';
  $$('[data-ctl]').forEach((input) => {
    const c = L.controls.find((x) => x.key === input.dataset.ctl);
    input.style.setProperty('--fill', `${((input.value - input.min) / (input.max - input.min)) * 100}%`);
    $(`[data-val="${c.key}"]`).textContent = c.text ? c.text(state.values[c.key]) : `${fmt(state.values[c.key], c.d)} ${c.unit}`;
    input.disabled = running;
  });
  $$('[data-choice]').forEach((b) => { b.setAttribute('aria-checked', String(String(state.values[b.dataset.choice]) === b.dataset.v)); b.disabled = running; });
  const run = $('[data-run]');
  run.textContent = L.run[running ? 1 : state.mphase === 'done' ? 2 : 0]; run.disabled = running;
  const s = { runs: state.runs, touched: state.touched, phase: state.mphase };
  const done = L.steps.map((st) => !!st.done(s)); const cur = done.indexOf(false);
  $$('[data-step]').forEach((li, i) => {
    li.classList.toggle('is-done', done[i]); li.classList.toggle('is-current', i === cur);
    li.querySelector('.step__n').textContent = done[i] ? '' : String(i + 1);
  });
  $('[data-runs-body]').innerHTML = state.runs.slice(-5).map((r) => `<tr>${L.row(r, r).map((x) => `<td>${x}</td>`).join('')}</tr>`).join('');
}
function tickMeasure(dt) {
  if (state.mphase !== 'running') return;
  state.t += dt;
  const p = Math.min(1, state.t / state.dur);
  cfg.instruments.progress(state.placed, p, state.values, calc());
  if (p >= 1) {
    state.mphase = 'done'; state.runs.push({ ...state.values, ...calc() });
    const allDone = L.steps.every((st) => st.done({ runs: state.runs, touched: state.touched, phase: 'done' }));
    if (allDone) feedback('done', 'Tajriba bajarildi!', 'O‘zingiz yig‘gan zanjirda barcha o‘lchovlar olindi.');
    else Sound.play('ok');
    render();
    if (allDone && !state.finaleShown) { state.finaleShown = true; setTimeout(showDone, reduceMotion ? 0 : 600); }
  }
}

/* =====================================================================
   Events
   ===================================================================== */
$('[data-tools]').addEventListener('click', (e) => { const b = e.target.closest('[data-tool]'); if (b) chooseTool(b.dataset.tool); });
$('[data-terms]').addEventListener('click', (e) => { const b = e.target.closest('[data-term]'); if (b) chooseTerminal(b.dataset.term); });
$('[data-undo]').addEventListener('click', undo);
$$('[data-restart]').forEach((b) => b.addEventListener('click', restart));
$('[data-start]').addEventListener('click', startMeasure);
$('[data-run]').addEventListener('click', () => {
  if (state.mphase === 'done') cfg.instruments.update(state.placed, state.values, calc());
  state.t = 0; state.dur = L.duration ? L.duration(state.values, calc()) : 1; state.mphase = 'running'; render();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.pending) { state.pending = null; render(); } });
$('[data-fullscreen]').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.();
});

/* =====================================================================
   3D boot
   ===================================================================== */
function build3D() {
  if (!window.EMPIRA_THREE) throw new Error('three.js bundle missing');
  const { THREE, OrbitControls } = window.EMPIRA_THREE;
  const canvas = $('[data-canvas]');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xF6F7FB);
  scene.fog = new THREE.Fog(0xF6F7FB, 2.2, 4.2);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 50);
  const target = new THREE.Vector3(...cfg.camera.target);
  const viewDir = new THREE.Vector3(...cfg.camera.dir).normalize();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xDDE1EA, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(0.8, 2.2, 1.4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -1, right: 1.6, top: 1, bottom: -1 }); sun.shadow.radius = 4;
  scene.add(sun);

  const kit = window.EMPIRA_KIT(THREE, scene);
  kit.table();
  kit.board(...cfg.board);
  const tempGroup = new THREE.Group(); scene.add(tempGroup);
  const hoverLabel = kit.label(' ', new THREE.Vector3(), { color: '#3B4CFF', border: '#3B4CFF' });
  hoverLabel.userData.hidden = true;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.enablePan = false;
  controls.minDistance = 0.25; controls.maxDistance = 4.5;
  controls.maxPolarAngle = Math.PI / 2 - 0.08;
  controls.target.copy(target);

  let baseDist = 1.5, viewH = 1;
  function frame() { camera.position.copy(target).addScaledVector(viewDir, baseDist); controls.target.copy(target); controls.update(); }
  $('[data-reset-view]').addEventListener('click', frame);
  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement;
    viewH = h; renderer.setSize(w, h, false); camera.aspect = w / h;
    const vTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), hTan = vTan * camera.aspect;
    baseDist = Math.max(cfg.camera.min, cfg.camera.fitW / (2 * hTan), cfg.camera.fitH / (2 * vTan));
    camera.updateProjectionMatrix(); frame();
  }
  new ResizeObserver(resize).observe(canvas.parentElement);
  resize();

  const flowGroup = new THREE.Group(); scene.add(flowGroup);
  S = { THREE, kit, scene, camera, controls, canvas, markers: {}, drops: [], temps: [], tempGroup, hoverLabel, flowGroup, flow: [], flowT: 0 };

  /* ---------- Picking: the terminal nearest to the tap on screen (generous radius for fingers) ---------- */
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const v = new THREE.Vector3();
  function nearest(cx, cy) {
    const r = canvas.getBoundingClientRect(); let best = null, bd = coarse ? 40 : 28;
    allTerminals().forEach((tid) => {
      v.copy(termPos(tid)).project(camera);
      const d = Math.hypot((v.x + 1) / 2 * r.width + r.left - cx, (1 - v.y) / 2 * r.height + r.top - cy);
      if (d < bd) { bd = d; best = tid; }
    });
    return best;
  }
  // For automated tests only: where a terminal is on screen (lets a test tap it like a finger would)
  window.EMPIRA_BUILD_VIEW = {
    terminalScreen(tid) { const r = canvas.getBoundingClientRect(); v.copy(termPos(tid)).project(camera); return { x: (v.x + 1) / 2 * r.width + r.left, y: (1 - v.y) / 2 * r.height + r.top }; },
    pending: () => state.pending
  };
  const down = new Map(); let multi = false;
  canvas.addEventListener('pointerdown', (e) => { down.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now() }); if (down.size > 1) multi = true; });
  canvas.addEventListener('pointerup', (e) => {
    const d = down.get(e.pointerId); down.delete(e.pointerId);
    if (!d) return;
    const wasMulti = multi; if (down.size === 0) multi = false;
    if (wasMulti || state.phase === 'measure') return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8 && performance.now() - d.t < 700) {
      const tid = nearest(e.clientX, e.clientY);
      if (tid) chooseTerminal(tid);
      else if (state.pending) { state.pending = null; render(); }
    }
  });
  canvas.addEventListener('pointercancel', (e) => { down.delete(e.pointerId); if (!down.size) multi = false; });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || e.buttons || state.phase === 'measure') return;
    const tid = nearest(e.clientX, e.clientY);
    if (tid !== state.hover) { state.hover = tid; canvas.style.cursor = tid ? 'pointer' : ''; }
  });
  canvas.addEventListener('pointerleave', () => { state.hover = null; canvas.style.cursor = ''; });
  controls.addEventListener('start', () => { if (state.phase === 'measure') $('[data-hint]').hidden = true; });

  const clock = new THREE.Clock(); let first = true;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05), now = performance.now();
    // tools dropping onto the board
    S.drops = S.drops.filter((d) => {
      d.t = Math.min(1, d.t + dt / 0.35); const k = 1 - Math.pow(1 - d.t, 3);
      d.group.position.y = d.to + 0.12 * (1 - k);
      if (d.t >= 1) { redrawWires(); return false; }
      return true;
    });
    // short-lived amber / coral wire copies
    S.temps = S.temps.filter((x) => {
      x.t += dt; const k = x.t / x.dur;
      x.mesh.material.opacity = 0.9 * (1 - k) * (x.kind === 'error' ? 0.75 + 0.25 * Math.sin(x.t * 30) : 1);
      if (k >= 1) { tempGroup.remove(x.mesh); x.mesh.geometry.dispose(); x.mesh.material.dispose(); return false; }
      return true;
    });
    tickMeasure(dt);
    updateMarkers(now);
    const show = state.phase !== 'measure' && (state.pending || state.hover || state.guide);
    hoverLabel.userData.hidden = !show;
    if (show) {
      hoverLabel.setText(show === state.guide && !state.pending && !state.hover ? 'Shu yerdan boshlang' : termName(show));
      hoverLabel.position.copy(termPos(show)).add(new THREE.Vector3(0, 0.055, 0));
      // keep the whole label inside the workspace (terminals near the edge, small phone screens)
      const r = canvas.getBoundingClientRect();
      const ndc = hoverLabel.position.clone().project(camera);
      const hPx = Math.min(36, Math.max(24, viewH * 0.045)), half = (hPx * (hoverLabel.userData.ratio || 1)) / 2;
      const cx = (ndc.x + 1) / 2 * r.width;
      const dx = cx - half < 8 ? 8 - (cx - half) : cx + half > r.width - 8 ? (r.width - 8) - (cx + half) : 0;
      if (dx) {
        const perPx = 2 * camera.position.distanceTo(hoverLabel.position) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / viewH;
        hoverLabel.position.addScaledVector(new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), dx * perPx);
      }
    }
    updateFlow(dt);
    controls.update();
    kit.sizeLabels(camera, viewH);
    renderer.render(scene, camera);
    if (first) { first = false; $('[data-loading]').hidden = true; }
  });
}

render();
try {
  build3D(); render();
  // Step 1 card: shown on a student's first visit to this lab (remembered on this device)
  let seen = false;
  try { seen = localStorage.getItem(`empira-build-intro:${labId}`) === '1'; localStorage.setItem(`empira-build-intro:${labId}`, '1'); } catch (e) { /* ignore */ }
  if (!seen) setTimeout(showIntro, 350);
  else feedback('info', '1-qadam: kerakli asboblarni tanlang', 'Ro‘yxatdagi 10 ta asbobdan faqat 5 tasi kerak.');
} catch (err) { console.error(err); $('[data-loading]').hidden = true; $('[data-fallback]').hidden = false; }
})();
