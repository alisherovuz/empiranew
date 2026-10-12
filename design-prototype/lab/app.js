(function () {
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

const firstLab = Object.keys(LABS)[0];
const labId = LABS[q.get('lab')] && labIndex[q.get('lab')] ? q.get('lab') : firstLab;
const L = LABS[labId];
const info = labIndex[labId].lab;
const topic = allTopics.find((t) => t.slug === labIndex[labId].topicSlug);

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

function paintRange(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty('--fill', `${pct}%`);
}

function render() {
  const c = calc();
  const done = state.phase === 'done';
  ui.inputs.forEach((input) => {
    paintRange(input);
    const ctl = L.controls.find((x) => x.key === input.dataset.ctl);
    $(`[data-val="${ctl.key}"]`).textContent = ctl.text ? ctl.text(values[ctl.key]) : `${fmt(values[ctl.key], ctl.d)} ${ctl.unit}`;
  });
  ui.choices.forEach((b) => b.setAttribute('aria-checked', String(String(values[b.dataset.choice]) === b.dataset.v)));
  ui.readouts.innerHTML = L.readouts(values, c, done, state.runs).map(([k, v, key]) =>
    `<span class="pill${key ? ' pill--key' : ''}"><span class="pill__k">${k}</span><span>${v}</span></span>`).join('');

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
  ui.runsBody.innerHTML = state.runs.slice(-5).map((r) =>
    `<tr>${L.row(r, r).map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('');

  const running = state.phase === 'running';
  ui.run.disabled = running;
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
}));
ui.choices.forEach((b) => b.addEventListener('click', () => {
  const ctl = L.controls.find((x) => x.key === b.dataset.choice);
  values[ctl.key] = typeof ctl.value === 'number' ? +b.dataset.v : b.dataset.v;
  state.touched.add(ctl.key);
  reset();
}));

ui.run.addEventListener('click', () => {
  if (state.phase === 'done') scene3d?.update(values, calc());
  state.t = 0;
  state.dur = L.duration ? L.duration(values, calc()) : 1;
  state.phase = 'running';
  render();
});

function finish() {
  state.phase = 'done';
  state.runs.push({ ...values, ...calc() });
  scene3d?.progress(1, values, calc());
  render();
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
async function build3D() {
  if (!window.EMPIRA_THREE) throw new Error('three.js bundle missing');
  const { THREE, OrbitControls } = window.EMPIRA_THREE;   // local bundle: no internet needed

  const canvas = $('[data-canvas]');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -1, right: 1.6, top: 1, bottom: -1 });
  sun.shadow.radius = 4;
  scene.add(sun);

  const kit = window.EMPIRA_KIT(THREE, scene);
  kit.table();
  const api = L.build(kit, THREE);

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
    const dt = Math.min(clock.getDelta(), 0.05);
    tick(dt);
    api.animate?.(dt, state.phase);
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

build3D().then((api) => {
  scene3d = api;
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
});
})();
