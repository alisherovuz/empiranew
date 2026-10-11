(function () {
// Empira — 3D Laboratory prototype. One screen design, three demo labs (mock experiences, not physics engines):
//   ?lab=nyutonning-ikkinchi-qonuni   Aravachaning tezlanishi   a = F / m
//   ?lab=om-qonuni                    Om qonuni                 I = U / R
//   ?lab=elastiklik-kuchi-guk-qonuni  Prujinaning cho‘zilishi   F = k · x
// Titles and questions come from ../topic/content.js so Topic page, Scanner and Lab always agree.
// Prototype URL option: &holat=tugadi shows the state after two measurements.

const $ = (s) => document.querySelector(s);
const fmt = (v, d = 1) => v.toFixed(d).replace('.', ',');
const q = new URLSearchParams(location.search);

/* =====================================================================
   Lab definitions
   ===================================================================== */
const G = 9.8;
const LABS = {
  'nyutonning-ikkinchi-qonuni': {
    controls: [
      { key: 'F', label: 'Kuch, F', unit: 'N', min: 0.5, max: 4, step: 0.5, value: 1, d: 1 },
      { key: 'm', label: 'Aravacha massasi, m', unit: 'kg', min: 0.5, max: 2, step: 0.5, value: 1, d: 1 }
    ],
    primary: 'F',
    run: ['Boshlash', 'Harakatlanmoqda…', 'Qayta boshlash'],
    steps: ['Kuchni tanlang', '«Boshlash» tugmasini bosing', 'Kuchni 2 marta oshirib, qayta o‘lchang'],
    duration: (v) => Math.sqrt(2 / (v.F / v.m)),          // real time to cover 1 m
    readouts: (v, done) => {
      const a = v.F / v.m;
      const out = [['F', `${fmt(v.F)} N`], ['m', `${fmt(v.m)} kg`], ['a', `${fmt(a, a < 1 ? 2 : 1)} m/s²`, true]];
      if (done) out.push(['t (1 m)', `${fmt(Math.sqrt(2 / a), 2)} s`]);
      return out;
    },
    cols: ['F', 'm', 'a'],
    row: (v) => { const a = v.F / v.m; return [`${fmt(v.F)} N`, `${fmt(v.m)} kg`, `${fmt(a, a < 1 ? 2 : 1)} m/s²`]; },
    doubled: (runs) => runs.some((r) => runs.some((s) => s.m === r.m && Math.abs(s.F - 2 * r.F) < 1e-9)),
    demo: [{ F: 1, m: 1 }, { F: 2, m: 1 }],
    camera: { target: [0.36, 0.02, 0.02], dir: [-0.55, 0.75, 1], fitW: 1.42, fitH: 0, min: 1.5 },
    build: buildCart
  },

  'om-qonuni': {
    controls: [
      { key: 'U', label: 'Kuchlanish, U', unit: 'V', min: 1.5, max: 6, step: 1.5, value: 3, d: 1 },
      { key: 'R', label: 'Qarshilik, R', unit: 'Ω', min: 5, max: 20, step: 5, value: 10, d: 0 }
    ],
    primary: 'R',
    run: ['Zanjirni ulash', 'Ulanmoqda…', 'Qayta ulash'],
    steps: ['Qarshilikni tanlang', '«Zanjirni ulash» tugmasini bosing', 'Qarshilikni 2 marta oshirib, qayta o‘lchang'],
    duration: () => 0.9,
    readouts: (v, done) => [['U', `${fmt(v.U)} V`], ['R', `${fmt(v.R, 0)} Ω`], ['I', done ? `${fmt(v.U / v.R, 2)} A` : '—', true]],
    cols: ['U', 'R', 'I'],
    row: (v) => [`${fmt(v.U)} V`, `${fmt(v.R, 0)} Ω`, `${fmt(v.U / v.R, 2)} A`],
    doubled: (runs) => runs.some((r) => runs.some((s) => s.U === r.U && Math.abs(s.R - 2 * r.R) < 1e-9)),
    demo: [{ U: 3, R: 10 }, { U: 3, R: 20 }],
    camera: { target: [0, 0.03, 0], dir: [0.05, 1.15, 1], fitW: 0.78, fitH: 0.5, min: 0.75 },
    build: buildCircuit
  },

  'elastiklik-kuchi-guk-qonuni': {
    controls: [
      { key: 'm', label: 'Yuk massasi, m', unit: 'g', min: 50, max: 300, step: 50, value: 100, d: 0 }
    ],
    primary: 'm',
    run: ['Yukni osish', 'Osilmoqda…', 'Qayta osish'],
    steps: ['Yuk massasini tanlang', '«Yukni osish» tugmasini bosing', 'Yukni 2 marta oshirib, qayta o‘lchang'],
    duration: () => 1.4,
    readouts: (v, done) => {
      const F = (v.m / 1000) * G;
      return [['F', `${fmt(F, 2)} N`], ['k', '20 N/m'], ['x', done ? `${fmt((F / 20) * 100)} sm` : '—', true]];
    },
    cols: ['m', 'F', 'x'],
    row: (v) => { const F = (v.m / 1000) * G; return [`${fmt(v.m, 0)} g`, `${fmt(F, 2)} N`, `${fmt((F / 20) * 100)} sm`]; },
    doubled: (runs) => runs.some((r) => runs.some((s) => Math.abs(s.m - 2 * r.m) < 1e-9)),
    demo: [{ m: 100 }, { m: 200 }],
    camera: { target: [0.03, 0.27, 0], dir: [0.3, 0.3, 1], fitW: 0.46, fitH: 0.78, min: 0.8 },
    build: buildSpring
  }
};

/* =====================================================================
   Which lab? (title + question shared with the Topic page)
   ===================================================================== */
const plan = window.EMPIRA_PLAN;
const content = window.EMPIRA_TOPICS;
const labId = LABS[q.get('lab')] ? q.get('lab') : 'nyutonning-ikkinchi-qonuni';
const L = LABS[labId];
const info = content[labId].labs[0];
const slug = (s) => s.toLowerCase().replace(/[‘’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const topicTitle = plan.chapters.flatMap((c) => c.topics).find((t) => slug(t.t) === labId)?.t || '';

document.title = `${info.title} — 3D laboratoriya — Empira`;
$('[data-title]').textContent = info.title;
$('[data-meta]').textContent = info.title === topicTitle
  ? `${plan.grade}-sinf · ${plan.subjects[0].name}`
  : `${topicTitle} · ${plan.grade}-sinf`;
$('[data-back]').href = `../topic/index.html?mavzu=${labId}`;
$('[data-question]').textContent = info.task;
$('[data-stage]').setAttribute('aria-label', `3D laboratoriya: ${info.title}`);

/* Next curriculum topic (same order and labels as the Topic page pager) */
{
  const all = plan.chapters.flatMap((c) => c.topics);
  const next = all[all.findIndex((t) => slug(t.t) === labId) + 1];
  if (next) {
    const el = $('[data-next]');
    el.innerHTML = `
      <a class="next-link" href="../topic/index.html?mavzu=${slug(next.t)}">
        <span class="next-link__label">Keyingi mavzu<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></span>
        <span class="next-link__title">${next.t}</span>
        <span class="next-link__meta">${next.w}-hafta · ${next.lab ? '3D laboratoriya mavjud' : 'Tez orada'}</span>
      </a>`;
    el.hidden = false;
  }
}

/* =====================================================================
   Panel (same markup and classes for every lab)
   ===================================================================== */
const values = Object.fromEntries(L.controls.map((c) => [c.key, c.value]));
const state = { phase: 'ready', t: 0, dur: 1, runs: [], touched: false };

$('[data-fields]').innerHTML = L.controls.map((c) => `
  <div class="field">
    <div class="field__row"><label for="c-${c.key}">${c.label}</label><output for="c-${c.key}" data-val="${c.key}"></output></div>
    <input class="range" id="c-${c.key}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}" data-ctl="${c.key}">
  </div>`).join('');
$('[data-steps]').innerHTML = L.steps.map((text, i) => `
  <li class="step" data-step="${i + 1}"><span class="step__n">${i + 1}</span><span class="step__text">${text}</span></li>`).join('');
$('[data-runs-head]').innerHTML = L.cols.map((c) => `<th scope="col">${c}</th>`).join('');

const ui = {
  run: $('[data-run]'),
  inputs: [...document.querySelectorAll('[data-ctl]')],
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
  ui.inputs.forEach((input) => {
    paintRange(input);
    const c = L.controls.find((x) => x.key === input.dataset.ctl);
    $(`[data-val="${c.key}"]`).textContent = `${fmt(values[c.key], c.d)} ${c.unit}`;
  });
  ui.readouts.innerHTML = L.readouts(values, state.phase === 'done').map(([k, v, key]) =>
    `<span class="pill${key ? ' pill--key' : ''}"><span class="pill__k">${k}</span><span>${v}</span></span>`).join('');

  const ran = state.runs.length > 0;
  const done = [state.touched || ran, ran, L.doubled(state.runs)];
  const current = done.indexOf(false);
  ui.steps.forEach((li, i) => {
    li.classList.toggle('is-done', done[i]);
    li.classList.toggle('is-current', i === current);
    li.querySelector('.step__n').textContent = done[i] ? '' : String(i + 1);
    li.setAttribute('aria-current', i === current ? 'step' : 'false');
  });

  ui.runsEmpty.hidden = ran;
  ui.runs.hidden = !ran;
  $('[data-runs-block]').hidden = !ran;          // measurements appear with the first measurement
  ui.runsBody.innerHTML = state.runs.slice(-4).map((r) =>
    `<tr>${L.row(r).map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');

  const running = state.phase === 'running';
  ui.run.disabled = running;
  ui.inputs.forEach((i) => { i.disabled = running; });
  ui.run.textContent = L.run[running ? 1 : state.phase === 'done' ? 2 : 0];
}

function reset() {
  state.phase = 'ready'; state.t = 0;
  scene3d?.update(values);
  render();
}

ui.inputs.forEach((input) => input.addEventListener('input', () => {
  values[input.dataset.ctl] = +input.value;
  if (input.dataset.ctl === L.primary) state.touched = true;
  reset();
}));

ui.run.addEventListener('click', () => {
  if (state.phase === 'done') scene3d?.update(values);
  state.t = 0;
  state.dur = L.duration(values);
  state.phase = 'running';
  render();
});

function finish() {
  state.phase = 'done';
  state.runs.push({ ...values });
  scene3d?.progress(1, values);
  render();
}

function tick(dt) {
  if (state.phase !== 'running') return;
  state.t += dt;
  const p = Math.min(1, state.t / state.dur);
  scene3d?.progress(p, values);
  if (p >= 1) finish();
}

$('[data-fullscreen]').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
});

/* =====================================================================
   3D: shared stage (table, light, camera, labels) + one builder per lab
   ===================================================================== */
const C = {
  paper: 0xF6F7FB, table: 0xFFFFFF, gridMain: 0xD9DCE8, gridSub: 0xE9EBF2,
  track: 0xE4E7EF, ink: 0x0B1026, navy: 0x1C2347, ink700: 0x3A4166, steel: 0x5A6285,
  blue: 0x3B4CFF, amber: 0xFFB21E, white: 0xFFFFFF
};

async function build3D() {
  if (!window.EMPIRA_THREE) throw new Error('three.js bundle missing');
  const { THREE, OrbitControls } = window.EMPIRA_THREE;   // local bundle: no internet needed

  const canvas = $('[data-canvas]');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.paper);
  scene.fog = new THREE.Fog(C.paper, 2.2, 4.2); // table edge fades into the page background

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

  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.05, ...extra });
  const box = (w, h, d, material) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); m.castShadow = m.receiveShadow = true; return m; };
  const cyl = (r, h, material, seg = 32) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), material); m.castShadow = m.receiveShadow = true; return m; };

  // Table + faint grid (shared by every lab)
  const table = box(6, 0.06, 4, mat(C.table));
  table.position.set(0.5, -0.03, 0);
  scene.add(table);
  const grid = new THREE.GridHelper(6, 60, C.gridMain, C.gridSub);
  grid.position.set(0.5, 0.0005, 0);
  scene.add(grid);

  // Labels: white pills with bold Lab Ink text; constant on-screen size (readable on phone, laptop, projector)
  const labels = [];
  const label = (text, pos, { color = '#0B1026', border = '#D9DCE8', parent = scene, minor = false } = {}) => {
    const H = 128, font = '700 72px Sora, system-ui, sans-serif';
    const c = document.createElement('canvas');
    const g = c.getContext('2d');
    g.font = font;
    const W = Math.ceil(g.measureText(text).width + 64);
    c.width = W; c.height = H;
    g.font = font;
    g.fillStyle = '#FFFFFF'; g.strokeStyle = border; g.lineWidth = 6;
    g.beginPath(); g.roundRect(3, 3, W - 6, H - 6, 28); g.fill(); g.stroke();
    g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, W / 2, H / 2 + 4);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false }));
    sp.renderOrder = 10;
    sp.userData.ratio = W / H;
    sp.userData.minor = minor;   // minor labels hide on small stages (phones) to avoid crowding
    sp.position.set(...pos);
    parent.add(sp); labels.push(sp); return sp;
  };

  const api = L.build({ THREE, scene, mat, box, cyl, label });

  // Camera framing: fit the experiment on any aspect ratio
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 0.3;
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
  const tmp = new THREE.Vector3();
  function sizeLabels() {
    const px = Math.min(36, Math.max(24, viewH * 0.045)); // pill height in CSS px
    const k = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / viewH;
    labels.forEach((sp) => {
      sp.visible = !(sp.userData.minor && viewH < 420);
      const h = px * camera.position.distanceTo(sp.getWorldPosition(tmp)) * k;
      sp.scale.set(h * sp.userData.ratio, h, 1);
    });
  }

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
    tick(Math.min(clock.getDelta(), 0.05));
    controls.update();
    sizeLabels();
    renderer.render(scene, camera);
    if (firstFrame) { firstFrame = false; $('[data-loading]').hidden = true; }
  });

  return api;
}

/* ---------- Lab 1: cart on a 1 m track (Nyutonning ikkinchi qonuni) ---------- */
function buildCart({ THREE, scene, mat, box, cyl, label }) {
  const TRACK = 1;
  const track = box(1.36, 0.012, 0.16, mat(C.track));
  track.position.set(0.56, 0.006, 0);
  scene.add(track);
  [-0.045, 0.045].forEach((z) => {
    const rail = box(1.36, 0.006, 0.006, mat(C.steel));
    rail.position.set(0.56, 0.016, z);
    scene.add(rail);
  });
  for (let i = 0; i <= 10; i++) {
    const big = i % 5 === 0;
    const tick = box(big ? 0.006 : 0.004, 0.002, big ? 0.03 : 0.018, mat(C.ink700));
    tick.position.set(i / 10, 0.013, 0.08 + (big ? 0.015 : 0.009));
    scene.add(tick);
  }
  label('0', [0, 0.03, 0.2]); label('0,5 m', [0.5, 0.03, 0.2]); label('1 m', [1, 0.03, 0.2]);

  const start = box(0.006, 0.004, 0.17, mat(C.ink));
  start.position.set(0, 0.014, 0);
  scene.add(start);
  const finishMat = mat(C.amber, { emissive: C.amber, emissiveIntensity: 0.05 });
  const finish = box(0.01, 0.006, 0.2, finishMat);
  finish.position.set(TRACK, 0.015, 0);
  scene.add(finish);

  const cart = new THREE.Group();
  const body = box(0.16, 0.04, 0.11, mat(C.navy, { roughness: 0.5 }));
  body.position.set(-0.08, 0.052, 0);
  cart.add(body);
  [[-0.035, 0.06], [-0.125, 0.06], [-0.035, -0.06], [-0.125, -0.06]].forEach(([x, z]) => {
    const w = cyl(0.018, 0.012, mat(C.ink, { roughness: 0.4 }), 24);
    w.rotation.x = Math.PI / 2; w.position.set(x, 0.03, z); cart.add(w);
  });
  const weights = new THREE.Group();
  cart.add(weights);
  scene.add(cart);

  const arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0.005, 0.052, 0), 0.1, C.blue, 0.035, 0.024);
  cart.add(arrow);
  const fLabel = label('F', [0, 0.115, 0], { color: '#3B4CFF', border: '#3B4CFF', parent: cart });

  return {
    update(v) {
      const len = 0.06 + v.F * 0.045;
      arrow.setLength(len, 0.035, 0.024);
      fLabel.position.set(0.005 + len / 2, 0.115, 0);
      weights.clear();
      for (let i = 0; i < Math.round(v.m / 0.5) - 1; i++) {
        const b = box(0.07, 0.022, 0.07, mat(C.steel, { roughness: 0.45, metalness: 0.3 }));
        b.position.set(-0.08, 0.083 + i * 0.024, 0);
        weights.add(b);
      }
      cart.position.x = 0;
      finishMat.emissiveIntensity = 0.05;
    },
    progress(p) {
      cart.position.x = TRACK * p * p;              // x = ½·a·t², with t = p·T
      finishMat.emissiveIntensity = p >= 1 ? 0.9 : 0.05;
    }
  };
}

/* ---------- Lab 2: simple circuit (Om qonuni) ---------- */
function buildCircuit({ THREE, scene, mat, box, cyl, label }) {
  const board = box(0.66, 0.012, 0.46, mat(0xEEF0F5));
  board.position.set(0, 0.006, 0);
  scene.add(board);

  const Y = 0.012;
  const P = {
    batt: new THREE.Vector3(-0.2, Y, 0.02),
    sw: new THREE.Vector3(-0.06, Y, 0.16),
    amm: new THREE.Vector3(0.17, Y, 0.12),
    bulb: new THREE.Vector3(0.2, Y, -0.12),
    res: new THREE.Vector3(-0.03, Y, -0.15)
  };

  // Battery pack: one navy cell per 1,5 V
  const cells = new THREE.Group();
  cells.position.copy(P.batt);
  scene.add(cells);

  // Switch: base + lever (open ↔ closed)
  const swBase = box(0.07, 0.012, 0.035, mat(C.ink700));
  swBase.position.copy(P.sw).add(new THREE.Vector3(0, 0.006, 0));
  scene.add(swBase);
  const lever = new THREE.Group();
  lever.position.copy(P.sw).add(new THREE.Vector3(-0.03, 0.016, 0));
  const leverBar = box(0.062, 0.006, 0.012, mat(C.steel, { metalness: 0.5, roughness: 0.3 }));
  leverBar.position.set(0.031, 0, 0);
  lever.add(leverBar);
  scene.add(lever);

  // Ammeter: navy body, white dial, ink needle
  const amm = cyl(0.05, 0.035, mat(C.navy, { roughness: 0.5 }));
  amm.position.copy(P.amm).add(new THREE.Vector3(0, 0.0175, 0));
  scene.add(amm);
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.042, 48), mat(C.white, { roughness: 0.9 }));
  dial.rotation.x = -Math.PI / 2;
  dial.position.copy(P.amm).add(new THREE.Vector3(0, 0.0355, 0));
  scene.add(dial);
  for (let i = 0; i <= 6; i++) {
    const a = THREE.MathUtils.degToRad(-60 + i * 20);
    const t = box(0.002, 0.001, 0.008, mat(C.ink700));
    t.position.copy(P.amm).add(new THREE.Vector3(Math.sin(a) * 0.033, 0.036, -Math.cos(a) * 0.033));
    t.rotation.y = -a;
    scene.add(t);
  }
  const needle = new THREE.Group();
  needle.position.copy(P.amm).add(new THREE.Vector3(0, 0.037, 0));
  const needleBar = box(0.002, 0.002, 0.034, mat(C.ink));
  needleBar.position.set(0, 0, -0.017);
  needle.add(needleBar);
  scene.add(needle);

  // Bulb: base + glass + filament (amber glow ∝ current)
  const bulbBase = cyl(0.022, 0.03, mat(C.ink700, { metalness: 0.4, roughness: 0.4 }));
  bulbBase.position.copy(P.bulb).add(new THREE.Vector3(0, 0.015, 0));
  scene.add(bulbBase);
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.034, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.1 }));
  glass.position.copy(P.bulb).add(new THREE.Vector3(0, 0.06, 0));
  scene.add(glass);
  const filMat = mat(C.amber, { emissive: C.amber, emissiveIntensity: 0 });
  const filament = new THREE.Mesh(new THREE.SphereGeometry(0.009, 16, 12), filMat);
  filament.position.copy(glass.position);
  scene.add(filament);
  const glow = new THREE.PointLight(C.amber, 0, 0.6, 2);
  glow.position.copy(glass.position);
  scene.add(glow);

  // Resistor: body length grows with R, ink colour bands
  const resistor = new THREE.Group();
  resistor.position.copy(P.res).add(new THREE.Vector3(0, 0.02, 0));
  scene.add(resistor);

  // Wires (Empira Blue) between the terminals
  const wireMat = mat(C.blue, { roughness: 0.45 });
  const wire = (a, b, lift = 0.03) => {
    const mid = a.clone().lerp(b, 0.5); mid.y += lift;
    const curve = new THREE.CatmullRomCurve3([a, a.clone().setY(a.y + lift * 0.6), mid, b.clone().setY(b.y + lift * 0.6), b]);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.0035, 8, false), wireMat);
    m.castShadow = true; scene.add(m);
  };
  const v = (x, z, y = 0.02) => new THREE.Vector3(x, y, z);
  wire(v(-0.2, 0.075), v(-0.095, 0.16));            // battery + → switch
  wire(v(-0.025, 0.16), v(0.12, 0.12));             // switch → ammeter
  wire(v(0.17, 0.07), v(0.2, -0.1));                // ammeter → bulb
  wire(v(0.175, -0.12), v(0.035, -0.15));           // bulb → resistor
  wire(v(-0.09, -0.15), v(-0.2, -0.035));           // resistor → battery −

  label('Manba', [-0.2, 0.11, 0.02]);
  label('Ampermetr', [0.17, 0.1, 0.12]);
  label('Chiroq', [0.2, 0.15, -0.12]);
  label('Rezistor', [-0.03, 0.09, -0.15]);

  const I_MAX = 1.2;
  return {
    update(val) {
      cells.clear();
      const n = Math.round(val.U / 1.5);
      for (let i = 0; i < n; i++) {
        const c = cyl(0.016, 0.06, mat(C.navy, { roughness: 0.5 }), 24);
        c.rotation.x = Math.PI / 2;
        c.position.set((i - (n - 1) / 2) * 0.034, 0.017, 0);
        cells.add(c);
        const cap = cyl(0.006, 0.006, mat(C.amber), 12);
        cap.rotation.x = Math.PI / 2;
        cap.position.set(c.position.x, 0.017, 0.033);
        cells.add(cap);
      }
      resistor.clear();
      const len = 0.05 + val.R * 0.0035;
      const body = cyl(0.012, len, mat(0xE9DCC4, { roughness: 0.6 }), 24);
      body.rotation.z = Math.PI / 2;
      resistor.add(body);
      [-0.3, -0.1, 0.1, 0.3].forEach((f, i) => {
        const band = cyl(0.0125, 0.005, mat(i === 3 ? C.amber : C.ink), 24);
        band.rotation.z = Math.PI / 2; band.position.x = f * len; resistor.add(band);
      });
      lever.rotation.z = THREE.MathUtils.degToRad(35);          // circuit open
      needle.rotation.y = THREE.MathUtils.degToRad(60);
      filMat.emissiveIntensity = 0; glow.intensity = 0;
    },
    progress(p, val) {
      const close = Math.min(1, p / 0.4);                        // lever closes in the first 40 %
      lever.rotation.z = THREE.MathUtils.degToRad(35 * (1 - close));
      const on = p <= 0.4 ? 0 : (p - 0.4) / 0.6;                  // then the current rises
      const I = (val.U / val.R) * on;
      needle.rotation.y = THREE.MathUtils.degToRad(60 - 120 * Math.min(1, I / I_MAX));
      filMat.emissiveIntensity = on === 0 ? 0 : 0.3 + 3 * (I / I_MAX);
      glow.intensity = 0.25 * (I / I_MAX);
    }
  };
}

/* ---------- Lab 3: spring on a stand (Guk qonuni) ---------- */
function buildSpring({ THREE, scene, mat, box, cyl, label }) {
  const K = 20, L0 = 0.12, TOP = 0.52, X = 0.04;
  const ZERO = TOP - L0;                                         // ruler zero = spring end at rest

  const base = box(0.26, 0.02, 0.16, mat(C.navy, { roughness: 0.5 }));
  base.position.set(0, 0.01, 0);
  scene.add(base);
  const rod = cyl(0.008, 0.56, mat(C.steel, { metalness: 0.5, roughness: 0.35 }));
  rod.position.set(-0.09, 0.3, 0);
  scene.add(rod);
  const arm = box(0.16, 0.014, 0.014, mat(C.steel, { metalness: 0.5, roughness: 0.35 }));
  arm.position.set(-0.01, TOP + 0.007, 0);
  scene.add(arm);

  // Ruler: white board, ink tick every 1 sm
  const ruler = box(0.05, 0.22, 0.006, mat(C.white, { roughness: 0.9 }));
  ruler.position.set(0.12, ZERO - 0.09, -0.02);
  scene.add(ruler);
  for (let i = 0; i <= 18; i++) {
    const big = i % 5 === 0;
    const t = box(big ? 0.022 : 0.012, 0.0015, 0.002, mat(C.ink700));
    t.position.set(0.12 - 0.025 + (big ? 0.011 : 0.006), ZERO - i * 0.01, -0.016);
    scene.add(t);
  }
  label('0', [0.175, ZERO, -0.02]);
  label('5 sm', [0.185, ZERO - 0.05, -0.02], { minor: true });
  label('10 sm', [0.19, ZERO - 0.1, -0.02]);
  label('15 sm', [0.19, ZERO - 0.15, -0.02], { minor: true });

  // Spring (Empira Blue helix), hook + discs, blue pointer to the ruler
  const springMat = mat(C.blue, { metalness: 0.3, roughness: 0.35 });
  let spring = null;
  const makeSpring = (len) => {
    if (spring) { scene.remove(spring); spring.geometry.dispose(); }
    const turns = 14, pts = [];
    for (let i = 0; i <= turns * 24; i++) {
      const t = i / (turns * 24);
      const a = t * turns * Math.PI * 2;
      pts.push(new THREE.Vector3(X + Math.cos(a) * 0.014, TOP - t * len, Math.sin(a) * 0.014));
    }
    spring = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 0.0022, 6, false), springMat);
    spring.castShadow = true;
    scene.add(spring);
  };

  const load = new THREE.Group();
  scene.add(load);
  const pointer = box(0.075, 0.002, 0.004, mat(C.blue));
  scene.add(pointer);
  const restDiscs = new THREE.Group();                           // weights wait on the base until hung
  scene.add(restDiscs);

  const discs = (group, n, hanging) => {
    group.clear();
    if (hanging) {
      const hook = cyl(0.002, 0.03, mat(C.ink700));
      hook.position.set(0, -0.015, 0);
      group.add(hook);
    }
    for (let i = 0; i < n; i++) {
      const d = cyl(0.026, 0.014, mat(C.steel, { metalness: 0.45, roughness: 0.35 }));
      d.position.set(0, hanging ? -0.037 - i * 0.015 : 0.027 + i * 0.015, 0);
      group.add(d);
    }
  };

  const place = (x) => {
    const end = ZERO - x;
    makeSpring(L0 + x);
    load.position.set(X, end, 0);
    pointer.position.set(X + 0.045, end, -0.012);
  };

  let xEq = 0;
  return {
    update(v) {
      xEq = ((v.m / 1000) * G) / K;
      discs(load, 0, true);                                      // empty hook
      discs(restDiscs, Math.round(v.m / 50), false);
      restDiscs.position.set(-0.035, 0, 0.045);
      place(0);
    },
    progress(p, v) {
      if (restDiscs.children.length) {                           // move the weights onto the hook
        discs(load, Math.round(v.m / 50), true);
        restDiscs.clear();
      }
      const x = p >= 1 ? xEq : xEq * (1 - Math.exp(-5 * p) * Math.cos(12 * p)); // damped settle
      place(Math.max(0, x));
    }
  };
}

/* =====================================================================
   Boot
   ===================================================================== */
render();

build3D().then((api) => {
  scene3d = api;
  api.update(values);

  if (q.get('holat') === 'tugadi') {
    // Documentation state: two measurements, the second one doubling the studied quantity
    L.demo.forEach((d) => { Object.assign(values, d); state.runs.push({ ...values }); });
    state.touched = true;
    ui.inputs.forEach((i) => { i.value = values[i.dataset.ctl]; });
    api.update(values);
    state.phase = 'done';
    api.progress(1, values);
  }
  render();
}).catch((err) => {
  console.error(err);
  $('[data-loading]').hidden = true;
  $('[data-fallback]').hidden = false;
});
})();
