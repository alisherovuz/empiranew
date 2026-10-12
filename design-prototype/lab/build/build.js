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
        return `<button class="chip${k === '+' ? ' chip--plus' : ''}" type="button" data-term="${tid}" aria-pressed="${state.pending === tid}"
          aria-label="${termName(tid)}${n ? `, ${n} ta sim` : ''}">${CHIP_LABEL[k]}${n ? `<span class="chip__wires" aria-hidden="true">·${n}</span>` : ''}</button>`;
      }).join('')}</span>
    </li>`).join('');
}

function renderReadouts() {
  let pills;
  if (state.phase === 'measure') {
    pills = L.readouts(state.values, calc(), state.mphase === 'done', state.runs);
  } else {
    const placedNeed = needed.filter((t) => state.placed[t.id]).length;
    pills = [['Asboblar', `${placedNeed} / ${needed.length}`, placedNeed === needed.length ? 'done' : ''],
      ['Ulanishlar', `${progress()} / ${circuit.required}`, state.phase === 'ready' ? 'done' : '']];
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

/* =====================================================================
   Actions
   ===================================================================== */
function chooseTool(id) {
  if (!S || state.phase === 'measure') return;
  const t = tools[id]; const btn = $(`[data-tool="${id}"]`);
  if (!t.need) {
    flashEl(btn, 'is-wrong');
    feedback('error', 'Bu asbob kerak emas', t.why);
    return;
  }
  if (state.placed[id]) { feedback('info', `${t.name} allaqachon stolda`, ''); return; }
  placeTool(t);
  flashEl(btn, 'is-ok');
  const left = needed.filter((x) => !state.placed[x.id]).length;
  if (left) feedback('ok', 'To‘g‘ri!', `${t.name} stolga qo‘yildi.`);
  else feedback('ok', 'Barcha asboblar stolda', 'Endi ularni sim bilan ulang: bir qisqichni, so‘ng ikkinchisini bosing.');
  render();
}

function chooseTerminal(tid) {
  if (state.phase === 'measure' || !tid) return;
  if (!state.pending) { state.pending = tid; render(); return; }
  if (state.pending === tid) { state.pending = null; render(); return; }
  const w = [state.pending, tid];
  state.pending = null;
  const r = circuit.check(state.wires, w);
  if (r.status === 'duplicate') feedback('info', 'Bu sim allaqachon bor', r.message);
  else if (r.status === 'error') {
    flashWire(w, 'error'); flashTerms(w, 'error');
    feedback('error', 'Noto‘g‘ri ulanish', r.message);
    render(); w.forEach((x) => flashEl($(`[data-term="${x}"]`), 'is-wrong'));
    return;
  } else if (r.status === 'ok') {
    state.wires.push(w); redrawWires();
    flashWire(w, 'ok'); flashTerms(w, 'ok');
    if (r.complete) {
      state.phase = 'ready';
      state.wires.forEach((x) => flashWire(x, 'ok'));
      flashTerms(allTerminals(), 'ok');
      feedback('done', 'Zanjir tayyor!', 'Barcha ulanishlar to‘g‘ri. Endi o‘lchashni boshlang.');
    } else {
      feedback('ok', 'To‘g‘ri ulandi', `${termName(w[0])} → ${termName(w[1])}`);
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
  Object.assign(state, { phase: 'build', placed: {}, wires: [], pending: null, hover: null, runs: [], touched: new Set(), mphase: 'ready', t: 0 });
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
  feedback('done', 'Zanjir tayyor!', 'Kuchlanishni tanlab, kalitni ulang va o‘lchang.');
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
    render();
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

  S = { THREE, kit, scene, camera, controls, canvas, markers: {}, drops: [], temps: [], tempGroup, hoverLabel };

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
    const show = state.phase !== 'measure' && (state.pending || state.hover);
    hoverLabel.userData.hidden = !show;
    if (show) { hoverLabel.setText(termName(show)); hoverLabel.position.copy(termPos(show)).add(new THREE.Vector3(0, 0.055, 0)); }
    controls.update();
    kit.sizeLabels(camera, viewH);
    renderer.render(scene, camera);
    if (first) { first = false; $('[data-loading]').hidden = true; }
  });
}

render();
try { build3D(); render(); }
catch (err) { console.error(err); $('[data-loading]').hidden = true; $('[data-fallback]').hidden = false; }
})();
