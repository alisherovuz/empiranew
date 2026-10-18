(async function () {
if (!await window.EMPIRA_READY) return;
const P = window.EMPIRA_PROGRESS;
// Empira — 3D Laboratory engine. One screen design, many labs.
//   ?lab=<lab slug>   e.g. ?lab=om-qonuni   (definitions in labs-8.js, 3D equipment in kit.js)
//   &holat=tugadi     documentation state: the lab's demo measurements already taken
// Titles, questions and topics come from ../topic/content.js and ../class-plan/data.js,
// so the Topic page, Scanner and Lab always agree.

const $ = (s) => document.querySelector(s);
const q = new URLSearchParams(location.search);
const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',');
const slug = (s) => s.toLowerCase().replace(/[‘’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const plan = window.EMPIRA_PLAN;
const content = window.EMPIRA_TOPICS;
const LABS = window.EMPIRA_LABS;

/* =====================================================================
   Which lab? Find its definition, its text (content.js) and its topic (data.js)
   ===================================================================== */
const allTopics = plan.chapters.flatMap((c) => c.topics.map((t) => ({ ...t, slug: slug(t.t), chapter: c })));
const labIndex = {};
Object.entries(content).forEach(([topicSlug, c]) => c.labs.forEach((lab) => { labIndex[lab.slug] = { lab, topicSlug }; }));

const labId = q.get('lab') || '';
const L = LABS[labId];
const info = labIndex[labId]?.lab;
const topic = allTopics.find((t) => t.slug === labIndex[labId]?.topicSlug);
if (!L || !info || !topic) {
  document.querySelector('main').innerHTML = '<section class="empira-recovery"><h1>Tajriba topilmadi</h1><p>Bu havola eskirgan yoki noto‘g‘ri. Mavzular ro‘yxatidan tajribani tanlang.</p><a href="/dashboard">Mavzularni ochish</a></section>';
  $('[data-title]').textContent='Tajriba topilmadi';
  return;
}

document.title = `${info.title} — 3D laboratoriya — Empira`;
$('[data-title]').textContent = info.title;
$('[data-meta]').textContent = `${topic.n}-§ · ${plan.grade}-sinf ${plan.subjects[0].name}`;
$('[data-back]').href = `../topic/index.html?mavzu=${topic.slug}`;
$('[data-question]').textContent = info.task;
$('[data-stage]').setAttribute('aria-label', `3D laboratoriya: ${info.title}`);

/* Next topic that has a 3D lab (same rule and labels as the Topic page pager) */
{
  const next = window.EMPIRA_AVAIL ? window.EMPIRA_AVAIL.neighbours(topic.slug).next
    : allTopics[allTopics.findIndex((t) => t.slug === topic.slug) + 1];
  if (next) {
    $('[data-next]').innerHTML = `
      <a class="next-link" href="../topic/index.html?mavzu=${next.slug}">
        <span class="next-link__label">Keyingi mavzu<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></span>
        <span class="next-link__title">${next.t}</span>
        <span class="next-link__meta">${next.w}-hafta · 3D laboratoriya mavjud</span>
      </a>`;
    $('[data-next]').hidden = false;
  }
}

/* =====================================================================
   Panel: controls (range | choice), steps, measurements — same markup for every lab
   ===================================================================== */
const values = Object.fromEntries(L.controls.map((c) => [c.key, c.value]));
const state = { phase: 'ready', t: 0, dur: 1, runs: [], touched: new Set() };
const calc = () => (L.compute ? L.compute(values) : {});
const saved = P.get(labId,'ready');
if (saved) {
  Object.assign(values,P.values(L.controls,saved.values));
  state.runs=(Array.isArray(saved.runs)?saved.runs:[]).slice(-50).map((r)=>{const v=P.values(L.controls,r);return {...v,...(L.compute?L.compute(v):{})};});
  state.touched=new Set((Array.isArray(saved.touched)?saved.touched:[]).filter((k)=>L.controls.some((c)=>c.key===k)));
  state.phase=saved.phase==='done'&&state.runs.length?'done':'ready';
}
function saveDraft() {
  P.save(labId,'ready',{values:{...values},runs:state.runs.slice(-50),touched:[...state.touched],phase:state.phase==='running'?'ready':state.phase});
}

$('[data-fields]').innerHTML = L.controls.map((c) => c.type === 'choice' ? `
  <div class="field">
    <div class="field__row"><span class="field__label" id="c-${c.key}-l">${c.label}</span></div>
    <div class="choice" role="radiogroup" aria-labelledby="c-${c.key}-l">
      ${c.options.map((o) => `<button class="choice__opt" type="button" role="radio" data-choice="${c.key}" data-v="${o.v}">${o.label}</button>`).join('')}
    </div>
  </div>` : `
  <div class="field">
    <div class="field__row"><label for="c-${c.key}">${c.label}</label><output for="c-${c.key}" data-val="${c.key}"></output></div>
    <input class="range" id="c-${c.key}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}" data-ctl="${c.key}">
  </div>`).join('');
$('[data-steps]').innerHTML = L.steps.map((s, i) => `
  <li class="step" data-step="${i + 1}"><span class="step__n">${i + 1}</span><span class="step__text">${s.text}</span></li>`).join('');
$('[data-runs-head]').innerHTML = L.cols.map((c) => `<th scope="col">${c}</th>`).join('');

const ui = {
  run: $('[data-run]'),
  inputs: [...document.querySelectorAll('[data-ctl]')],
  choices: [...document.querySelectorAll('[data-choice]')],
  steps: [...document.querySelectorAll('[data-step]')],
  readouts: $('[data-readouts]'),
  runs: $('[data-runs]'), runsBody: $('[data-runs-body]'), runsEmpty: $('[data-runs-empty]'),
  hint: $('[data-hint]')
};

let scene3d = null; // filled in when three.js loads

/* =====================================================================
   Live feedback: every action shows what happened (same look, sounds and cards as Build Mode, from fx.js)
   ===================================================================== */
const FX = window.EMPIRA_FX;
const FB_ICON = {
  ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  done: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  info: '<svg viewBox="0 0 24 24"><path d="M12 11v6"/><path d="M12 7v.5"/></svg>'
};
function feedback(kind, title, text) {
  const el = $('[data-feedback]'); if (!el) return;
  el.className = `feedback feedback--${kind}`;
  $('[data-fb-icon]').innerHTML = FB_ICON[kind];
  $('[data-fb-title]').textContent = title;
  $('[data-fb-text]').textContent = text || '';
  if (kind !== 'info') { void el.offsetWidth; el.classList.add('is-anim'); }
}
const PRAISE = ['O‘lchandi!', 'Zo‘r!', 'Ajoyib!', 'Barakalla!', 'Kuzating!'];
let praiseI = 0;
const praise = () => PRAISE[praiseI++ % PRAISE.length];
const num = (t) => { const m = String(t).replace('−', '-').replace(',', '.').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; };
const pillsOf = (v, c, runs) => L.readouts(v, c, true, runs).map(([k, val, key]) => ({ k, v: String(val), key: !!key }));
// "I: 20 mA → 30 mA ↑" for every reading that changed since the previous measurement
function changes(prevRun, nowRun, runs) {
  const before = pillsOf(prevRun, prevRun, runs.slice(0, -1)), after = pillsOf(nowRun, nowRun, runs);
  return after.map((p) => {
    const b = before.find((x) => x.k === p.k);
    if (!b || b.v === p.v || p.v === '—' || b.v === '—') return null;
    const x = num(b.v), y = num(p.v);
    const arrow = x !== null && y !== null && x !== y ? (y > x ? ' ↑' : ' ↓') : '';
    return { text: `${p.k}: ${b.v} → ${p.v}${arrow}`, key: p.key };
  }).filter(Boolean).sort((a, b) => b.key - a.key);
}
const stepsDone = () => L.steps.map((st) => !!st.done(state));
let lastPills = {};
let changeTimer = null;
function announceControl(ctl) {
  // a slider sends many events: speak once it settles
  clearTimeout(changeTimer);
  changeTimer = setTimeout(() => {
    const v = values[ctl.key];
    const text = ctl.type === 'choice' ? (ctl.options.find((o) => String(o.v) === String(v)) || {}).label : ctl.text ? ctl.text(v) : `${fmt(v, ctl.d)} ${ctl.unit}`;
    feedback('info', `${ctl.label}: ${text}`, `«${L.run[0]}» tugmasini bosing va natija qanday o‘zgarishini kuzating.`);
  }, 250);
}
let finaleShown = !!saved && L.steps.every((step)=>step.done(state));
function finale() {
  const build = window.EMPIRA_BUILD_FOR && window.EMPIRA_BUILD_FOR(labId);
  const next = window.EMPIRA_AVAIL ? window.EMPIRA_AVAIL.neighbours(topic.slug).next : null;
  FX.Sound.play('win'); FX.confetti(110);
  FX.coach({
    kind: 'done', step: 'Barcha bosqichlar bajarildi', title: 'Tajriba bajarildi!',
    text: `Tajriba savoli: «${info.task}» O‘lchovlaringizga qarab javob bering.`,
    go: build ? build.label : next ? 'Keyingi mavzu' : 'Yillik rejaga qaytish',
    onGo: () => { location.href = build ? `build/index.html?lab=${labId}` : next ? `../topic/index.html?mavzu=${next.slug}` : `../class-plan/index.html?sinf=${plan.grade}`; },
    close: 'Shu yerda qolish'
  });
}

function paintRange(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty('--fill', `${pct}%`);
}

function render() {
  saveDraft();
  const c = calc();
  const done = state.phase === 'done';
  ui.inputs.forEach((input) => {
    paintRange(input);
    const ctl = L.controls.find((x) => x.key === input.dataset.ctl);
    $(`[data-val="${ctl.key}"]`).textContent = ctl.text ? ctl.text(values[ctl.key]) : `${fmt(values[ctl.key], ctl.d)} ${ctl.unit}`;
  });
  ui.choices.forEach((b) => b.setAttribute('aria-checked', String(String(values[b.dataset.choice]) === b.dataset.v)));
  const pills = L.readouts(values, c, done, state.runs);
  ui.readouts.innerHTML = pills.map(([k, v, key]) => {
    const changed = k in lastPills && lastPills[k] !== String(v) && String(v) !== '—';
    return `<span class="pill${key ? ' pill--key' : ''}${changed ? ' is-changed' : ''}"><span class="pill__k">${k}</span><span>${v}</span></span>`;
  }).join('');
  lastPills = Object.fromEntries(pills.map(([k, v]) => [k, String(v)]));

  const doneSteps = L.steps.map((s) => !!s.done(state));
  const current = doneSteps.indexOf(false);
  ui.steps.forEach((li, i) => {
    li.classList.toggle('is-done', doneSteps[i]);
    li.classList.toggle('is-current', i === current);
    li.querySelector('.step__n').textContent = doneSteps[i] ? '' : String(i + 1);
    li.setAttribute('aria-current', i === current ? 'step' : 'false');
  });

  const ran = state.runs.length > 0;
  ui.runsEmpty.hidden = ran;
  ui.runs.hidden = !ran;
  $('[data-runs-block]').hidden = !ran;          // measurements appear with the first measurement
  const shown = state.runs.slice(-5);
  ui.runsBody.innerHTML = shown.map((r, i) =>
    `<tr${i === shown.length - 1 && state.justMeasured ? ' class="is-new"' : ''}>${L.row(r, r).map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('');
  state.justMeasured = false;

  const running = state.phase === 'running';
  ui.run.disabled = running || !scene3d;
  ui.inputs.forEach((i) => { i.disabled = running; });
  ui.choices.forEach((b) => { b.disabled = running; });
  ui.run.textContent = L.run[running ? 1 : done ? 2 : 0];
}

function reset() {
  state.phase = 'ready'; state.t = 0;
  scene3d?.update(values, calc());
  render();
}

ui.inputs.forEach((input) => input.addEventListener('input', () => {
  values[input.dataset.ctl] = +input.value;
  state.touched.add(input.dataset.ctl);
  reset();
  announceControl(L.controls.find((x) => x.key === input.dataset.ctl));
}));
ui.choices.forEach((b) => b.addEventListener('click', () => {
  const ctl = L.controls.find((x) => x.key === b.dataset.choice);
  values[ctl.key] = typeof ctl.value === 'number' ? +b.dataset.v : b.dataset.v;
  state.touched.add(ctl.key);
  reset();
  announceControl(ctl);
}));

ui.run.addEventListener('click', () => {
  if(!scene3d || state.phase==='running')return;
  if (state.phase === 'done') scene3d?.update(values, calc());
  state.t = 0;
  state.dur = L.duration ? L.duration(values, calc()) : 1;
  state.phase = 'running';
  flowRefresh();
  render();
});

function finish() {
  const before = stepsDone();
  state.phase = 'done';
  state.runs.push({ ...values, ...calc() });
  state.justMeasured = true;
  scene3d?.progress(1, values, calc());
  const after = stepsDone();
  const fresh = after.map((d, i) => d && !before[i] ? i : -1).filter((i) => i >= 0);
  const runs = state.runs, now = runs[runs.length - 1];
  const diff = runs.length > 1 ? changes(runs[runs.length - 2], now, runs) : [];
  const keys = pillsOf(now, now, runs).filter((p) => p.key && p.v !== '—').map((p) => `${p.k} = ${p.v}`);
  const what = diff.length ? diff.slice(0, 3).map((d) => d.text).join(' · ') : keys.join(' · ');
  render();
  if (after.every(Boolean) && !finaleShown) {
    finaleShown = true;
    feedback('done', 'Tajriba bajarildi!', what);
    setTimeout(finale, FX.reduceMotion ? 0 : 700);
  } else if (fresh.length) {
    FX.Sound.play('step');
    feedback('ok', `${fresh[fresh.length - 1] + 1}-bosqich bajarildi!`, what);
    fresh.forEach((i) => { const li = ui.steps[i]; li.classList.remove('is-just-done'); void li.offsetWidth; li.classList.add('is-just-done'); });
  } else if (runs.length > 1 && !diff.length) {
    feedback('info', 'Natija o‘zgarmadi', 'Boshqaruvni o‘zgartirib, yana o‘lchab ko‘ring.');
  } else {
    FX.Sound.play('ok');
    feedback('ok', praise(), what);
  }
}

function tick(dt) {
  if (state.phase !== 'running') return;
  state.t += dt;
  const p = Math.min(1, state.t / state.dur);
  scene3d?.progress(p, values, calc());
  if (p >= 1) finish();
}

$('[data-fullscreen]').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
});

/* =====================================================================
   3D: shared stage (table, light, camera, labels) + the lab's own scene from kit.js
   ===================================================================== */
/* ---------- Current flow: amber dots run along the wires while current flows (faster with more current) ---------- */
let rec = null, flow = null, Iref = 0;
function flowRefresh() { if (flow && rec) flow.set(FX.labRoutes(rec, window.EMPIRA_BUILD_AUTO.TYPES)); }
function flowTick(dt) {
  if (!flow || !flow.size) return;
  const c = calc();
  const I = typeof c.I === 'number' ? c.I : null;
  const flowing = (state.phase === 'done' || (state.phase === 'running' && state.t / state.dur > 0.45)) && I !== 0;
  if (I > 0 && !Iref) Iref = I;
  const speed = I && Iref ? 0.35 + 0.45 * Math.min(2, I / Iref) : 0.55;
  flow.update(dt, flowing, speed);
}

async function build3D() {
  if (!window.EMPIRA_THREE) throw new Error('three.js bundle missing');
  const { THREE, OrbitControls } = window.EMPIRA_THREE;   // local bundle: no internet needed

  const canvas = $('[data-canvas]');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.matchMedia('(max-width: 700px)').matches ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xF6F7FB);
  scene.fog = new THREE.Fog(0xF6F7FB, 2.2, 4.2);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 50);
  const target = new THREE.Vector3(...L.camera.target);
  const viewDir = new THREE.Vector3(...L.camera.dir).normalize();

  scene.add(new THREE.HemisphereLight(0xffffff, 0xDDE1EA, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(0.8, 2.2, 1.4);
  sun.castShadow = true;
  const shadowSize=window.matchMedia('(max-width: 700px)').matches?1024:2048;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  Object.assign(sun.shadow.camera, { left: -1, right: 1.6, top: 1, bottom: -1 });
  sun.shadow.radius = 4;
  scene.add(sun);

  const kit = window.EMPIRA_KIT(THREE, scene);
  kit.table();
  // Recording the lab (build/auto.js) changes nothing in it; it only tells where its wires run, for the current-flow dots
  const A = window.EMPIRA_BUILD_AUTO;
  rec = A ? A.analyze(L, kit, THREE, scene, values, calc()) : null;
  const api = rec ? rec.api : L.build(kit, THREE);
  flow = FX.makeFlow(THREE, scene);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 0.25;
  controls.maxDistance = 4.5;
  controls.maxPolarAngle = Math.PI / 2 - 0.08;
  controls.target.copy(target);
  controls.addEventListener('start', () => { ui.hint.hidden = true; });

  let baseDist = 1.5;
  function frame() {
    camera.position.copy(target).addScaledVector(viewDir, baseDist);
    controls.target.copy(target);
    controls.update();
  }
  $('[data-reset-view]').addEventListener('click', frame);

  let viewH = 1;
  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement;
    viewH = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const vTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const hTan = vTan * camera.aspect;
    baseDist = Math.max(L.camera.min, L.camera.fitW / (2 * hTan), L.camera.fitH / (2 * vTan));
    camera.updateProjectionMatrix();
    frame();
  }
  new ResizeObserver(resize).observe(canvas.parentElement);
  resize();

  const clock = new THREE.Clock();
  let firstFrame = true;
  renderer.setAnimationLoop(() => {
    if(document.hidden){clock.getDelta();return;}
    const dt = Math.min(clock.getDelta(), 0.05);
    tick(dt);
    api.animate?.(dt, state.phase);
    flowTick(dt);
    controls.update();
    kit.sizeLabels(camera, viewH);
    renderer.render(scene, camera);
    if (firstFrame) { firstFrame = false; $('[data-loading]').hidden = true; }
  });

  return api;
}

/* =====================================================================
   Boot
   ===================================================================== */
render();
feedback('info', 'Tajribani boshlang', `Boshqaruvni tanlab, «${L.run[0]}» tugmasini bosing. Har bir o‘lchovdan keyin nima o‘zgarganini shu yerda ko‘rasiz.`);
{
  const btn = $('[data-sound]');
  if (btn) { btn.setAttribute('aria-pressed', String(FX.Sound.on)); btn.addEventListener('click', () => btn.setAttribute('aria-pressed', String(FX.Sound.toggle()))); }
}

build3D().then((api) => {
  scene3d = api;
  ui.inputs.forEach((i)=>{i.value=values[i.dataset.ctl];});
  api.update(values, calc());

  if (q.get('holat') === 'tugadi' && L.demo) {
    // Documentation state: the lab's demo measurements already taken
    L.demo.forEach((d) => { Object.assign(values, d); state.runs.push({ ...values, ...calc() }); Object.keys(d).forEach((k) => state.touched.add(k)); });
    ui.inputs.forEach((i) => { i.value = values[i.dataset.ctl]; });
    api.update(values, calc());
    state.phase = 'done';
    api.progress(1, values, calc());
  }
  render();
}).catch((err) => {
  console.error(err);
  $('[data-loading]').hidden = true;
  $('[data-fallback]').hidden = false;
  ui.run.disabled=true;
  $('[data-fallback]').innerHTML='3D ko‘rinish yuklanmadi. <button type="button" data-retry-scene>Qayta urinish</button> <a href="/dashboard">Boshqa tajriba</a>';
  $('[data-retry-scene]').onclick=()=>location.reload();
});
})();
