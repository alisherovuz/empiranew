(async function () {
if(!await window.EMPIRA_READY)return;
const P=window.EMPIRA_PROGRESS;
// Empira — Build Mode ("…o‘zingiz yig‘ing"). ?lab=<lab id>, e.g. ?lab=om-qonuni or ?lab=reostat
// The student starts from an empty board, picks the needed tools from a library (wrong ones are explained),
// wires terminals by tapping one, then another (in 3D or with the terminal buttons), gets an amber ✓ for a correct
// action and a coral ! with the reason for a wrong one (a wrong wire is not kept). When it is complete, the experiment
// runs on the student's own setup with the same numbers as the ready lab.
// Two sources for a lab's Build Mode, one engine:
//   - hand-made (experiments.js, Om qonuni): its own tools and a checker that accepts any series order (circuit.js)
//   - automatic (every other lab): read from the ready lab itself (auto.js) and checked against its wiring (netcheck.js)
// Nothing here changes the ready labs.

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const q = new URLSearchParams(location.search);
const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',');

const labId = q.get('lab') || '';
const custom = (window.EMPIRA_BUILD || {})[labId];
const autoInfo = (window.EMPIRA_BUILD_AUTO_LABS || {})[labId];
const L = (window.EMPIRA_LABS || {})[labId];
const avail = window.EMPIRA_AVAIL;

// The lab's own text and topic (same source as the Topic page and the ready lab)
let info = null, topic = null;
Object.entries(window.EMPIRA_TOPICS || {}).forEach(([topicSlug, c]) => c.labs.forEach((l) => {
  if (l.slug === labId) { info = l; topic = avail.findTopic(topicSlug); }
}));

if (!(custom || autoInfo) || !L || !info || !topic) {
  // Unknown lab or no Build Mode for it: say so, never open another experiment
  $('[data-main]').hidden = true;
  $('[data-missing]').hidden = false;
  $('[data-title]').textContent = 'Yig‘ish rejimi';
  if (topic) $('[data-back]').href = $('[data-missing-link]').href = `../../topic/index.html?mavzu=${topic.slug}`;
  if (topic) $('[data-missing-link]').textContent = 'Mavzuga qaytish';
  return;
}

const modeLabel = custom ? custom.label : autoInfo.label;
document.title = `${info.title} — ${modeLabel} — Empira`;
$('[data-title]').textContent = info.title;
$('[data-meta]').textContent = `${topic.n}-§ · ${modeLabel}`;
$('[data-back]').href = `../../topic/index.html?mavzu=${topic.slug}`;

let M = null;   // the lab's model (tools, terminals, checker, instruments): customModel() or autoModel(), made in build3D()

const state = {
  phase: 'build',            // build → ready (complete) → measure
  placed: new Set(),         // library entry ids on the table
  wires: [],                 // accepted wires [[tid, tid]]
  pending: null,             // first terminal of a wire being made
  hover: null,
  guide: null, guide2: null, // terminals that pulse ("start here", or a hint)
  mistakes: 0, hints: 0, startedAt: 0, finaleShown: false,
  // measurement (same shape as the ready lab engine)
  values: Object.fromEntries(L.controls.map((c) => [c.key, c.value])),
  runs: [], touched: new Set(), mphase: 'ready', t: 0, dur: 1
};
let restoring = true;
const draft = P.get(labId,'build');
let earnedStars = Math.max(0,Math.min(3,Number(draft?.bestStars)||0));
function saveDraft(){
  if(restoring || !M)return;
  P.save(labId,'build',{placed:[...state.placed],wires:state.wires,phase:state.phase,
    values:state.values,runs:state.runs.slice(-50),touched:[...state.touched],mphase:state.mphase==='running'?'ready':state.mphase,
    mistakes:state.mistakes,hints:state.hints,bestStars:earnedStars,introSeen:true,finaleShown:state.finaleShown});
}
function restoreDraft(){
  if(!draft)return false;
  const ids=Array.isArray(draft.placed)?draft.placed:[];
  M.entries.filter((e)=>e.need&&ids.includes(e.id)).forEach((e)=>{
    state.placed.add(e.id);M.place(e.id);
    if(M.wiring)e.insts.forEach((i)=>M.keys(i).forEach((k)=>addMarker(i+'.'+k)));
  });
  let complete=false;
  if(M.wiring&&allPlaced()){
    M.junctions.forEach(addMarker);
    const terminals=new Set(allTerminals());
    for(const w of (Array.isArray(draft.wires)?draft.wires:[]).slice(0,200)){
      if(!Array.isArray(w)||w.length!==2||!w.every((t)=>terminals.has(t)))continue;
      const checked=M.checker.check(state.wires,w);
      if(checked.status==='ok'){state.wires.push(w);complete=!!checked.complete;}
    }
  }
  state.mistakes=Math.max(0,Math.min(10000,Number(draft.mistakes)||0));
  state.hints=Math.max(0,Math.min(10000,Number(draft.hints)||0));
  state.values=P.values(L.controls,draft.values);
  if(allPlaced()&&(!M.wiring||complete))state.phase='ready';
  redrawWires();
  if(draft.phase==='measure'&&state.phase==='ready'){
    state.runs=(Array.isArray(draft.runs)?draft.runs:[]).slice(-50).map((r)=>{const v=P.values(L.controls,r);return {...v,...(L.compute?L.compute(v):{})};});
    state.touched=new Set((Array.isArray(draft.touched)?draft.touched:[]).filter((k)=>L.controls.some((c)=>c.key===k)));
    state.mphase=draft.mphase==='done'&&state.runs.length?'done':'ready';
    state.finaleShown=!!draft.finaleShown;
    startMeasure();
    if(state.mphase==='done')M.progress(1,state.values,calc());
  }
  return state.placed.size>0;
}
const needed = () => M.entries.filter((e) => e.need);
const allPlaced = () => needed().every((e) => state.placed.has(e.id));
const placedInstances = () => M.entries.filter((e) => state.placed.has(e.id)).flatMap((e) => e.insts);
const allTerminals = () => {
  if (!M.wiring) return [];
  const t = placedInstances().flatMap((id) => M.keys(id).map((k) => `${id}.${k}`));
  return allPlaced() ? t.concat(M.junctions) : t;
};
const wiresAt = (tid) => state.wires.filter((w) => w.includes(tid)).length;
const progress = () => (M.wiring ? M.checker.progress(state.wires) : 0);
const stepsTotal = () => (M.wiring ? 3 : 2);

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

const { Sound } = window.EMPIRA_FX;   // ../fx.js (shared with the ready labs)
const soundBtn = $('[data-sound]');
soundBtn.setAttribute('aria-pressed', String(Sound.on));
soundBtn.addEventListener('click', () => { soundBtn.setAttribute('aria-pressed', String(Sound.toggle())); });

const { confetti, reduceMotion } = window.EMPIRA_FX;

const { coach, closeCoach } = window.EMPIRA_FX;

const PRAISE = ['To‘g‘ri!', 'Zo‘r!', 'Ajoyib!', 'Barakalla!', 'Juda yaxshi!', 'Davom eting!'];
let praiseI = 0;
const praise = () => PRAISE[praiseI++ % PRAISE.length];
const mark = () => { if (!state.startedAt) state.startedAt = performance.now(); };
function bestStars(){return earnedStars;}
function saveBest(n){earnedStars=Math.max(earnedStars,n);saveDraft();}

function showIntro() {
  coach({
    kind: 'intro', step: `1-qadam · ${stepsTotal()} tadan`, title: 'Laboratoriyani o‘zingiz yig‘ing',
    text: `Ro‘yxatda ${M.entries.length} ta asbob bor. Ulardan faqat ${needed().length} tasi bu tajriba uchun kerak: ularni toping!`,
    plan: M.wiring ? ['Kerakli asboblarni tanlang', 'Ularni sim bilan ulang', 'O‘lchang va natijani ko‘ring']
      : ['Kerakli asboblarni tanlang', 'Tajribani o‘tkazing va natijani ko‘ring'],
    go: 'Boshladik!',
    onGo: () => { $('.block--tools').classList.add('is-guide'); $('.block--tools').scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }); }
  });
}
function showConnect() {
  if(!M || state.phase!=='build' || !allPlaced())return;
  Sound.play('step');
  const startHere = () => { state.guide = M.guideStart(); state.guide2 = null; render(); };
  coach({
    kind: 'connect', step: '2-qadam · 3 tadan', title: 'Barakalla! Asboblar stolda',
    text: 'Endi ularni sim bilan ulang: bitta qisqichni bosing, keyin ikkinchisini. Ular orasida sim paydo bo‘ladi. Qizil qisqich — «+».',
    go: 'Ulashni boshlash', onGo: startHere, onClose: startHere
  });
}
function showWin() {
  if(state.phase!=='ready')return;
  const slips = state.mistakes;
  const stars = slips === 0 ? 3 : slips <= 2 ? 2 : 1;
  const prev = bestStars(); saveBest(stars);
  const secs = Math.max(1, Math.round((performance.now() - (state.startedAt || performance.now())) / 1000));
  const time = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  const what = M.wiring ? 'Zanjirni' : 'Asboblarni';
  const text = stars === 3 ? `${what} birinchi urinishda, xatosiz yig‘dingiz. Haqiqiy fizikdek!`
    : stars === 2 ? `${M.wiring ? 'Zanjir' : 'Laboratoriya'} to‘g‘ri yig‘ildi! Xatolarni o‘zingiz topib tuzatdingiz.`
    : `${M.wiring ? 'Zanjir' : 'Laboratoriya'} to‘g‘ri yig‘ildi! Keyingi safar 3 yulduzga harakat qiling.`;
  const record = prev && stars > prev ? '<span class="coach__badge">Yangi rekord!</span><br>' : '';
  Sound.play('win'); confetti();
  coach({
    kind: 'win', step: M.wiring ? 'Zanjir tayyor' : 'Laboratoriya tayyor', title: 'Tabriklaymiz!', text, stars,
    meta: `${record}Vaqt: ${time} · Xatolar: ${state.mistakes}${state.hints ? ` · Maslahat: ${state.hints}` : ''}`,
    go: M.wiring ? 'O‘lchashni boshlash' : 'Tajribani boshlash', onGo: startMeasure,
    close: M.wiring ? 'Zanjirga qarash' : 'Laboratoriyaga qarash'
  });
}
function showDone() {
  const next = avail.neighbours(topic.slug).next;
  Sound.play('win'); confetti(110);
  coach({
    kind: 'done', step: `${stepsTotal()}-qadam bajarildi`, title: 'Tajriba bajarildi!',
    text: M.finale ? M.finale(state.runs, calc())
      : `Tajribani o‘zingiz yig‘gan laboratoriyada bajardingiz. Tajriba savoli: «${info.task}» Javobni o‘lchovlardan toping.`,
    go: next ? 'Keyingi mavzu' : 'Yillik rejaga qaytish',
    onGo: () => { location.href = next ? `../../topic/index.html?mavzu=${next.slug}` : `../../class-plan/index.html?sinf=${window.EMPIRA_PLAN.grade}`; },
    close: 'Shu yerda qolish'
  });
}

/* =====================================================================
   Panel rendering
   ===================================================================== */
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const BANG = '<svg viewBox="0 0 24 24"><path d="M12 6v7.5"/><path d="M12 17.5v.5"/></svg>';
function renderLibrary() {
  // Alphabetical, so the needed tools are not simply listed first
  const lib = M.entries.slice().sort((a, b) => a.name.localeCompare(b.name, 'uz'));
  $('[data-tools]').innerHTML = lib.map((t) => `
    <button class="tool" type="button" data-tool="${t.id}" aria-pressed="false">
      <svg class="tool__icon" viewBox="0 0 24 24" aria-hidden="true">${t.icon}</svg>
      <span class="tool__text"><span class="tool__name">${t.name}</span>${t.note ? `<span class="tool__note">${t.note}</span>` : ''}</span>
      <span class="tool__state" aria-hidden="true">${t.need ? CHECK : BANG}</span>
    </button>`).join('');
}

function renderTerms() {
  if (!M) return;
  const rows = placedInstances().filter((id) => M.keys(id).length).map((id) => ({ name: M.instName(id), tids: M.keys(id).map((k) => `${id}.${k}`) }));
  if (allPlaced() && M.junctions.length) rows.push({ name: 'Tugunlar', tids: M.junctions });
  $('[data-terms-block]').hidden = !M.wiring || rows.length === 0 || state.phase === 'measure';
  $('[data-terms]').innerHTML = rows.map((r) => `
    <li class="term-row">
      <span class="term-row__name">${r.name}</span>
      <span class="term-row__chips">${r.tids.map((tid) => {
        const n = wiresAt(tid), guide = (state.guide === tid || state.guide2 === tid) && !state.pending;
        return `<button class="chip${M.isPlus(tid) ? ' chip--plus' : ''}${guide ? ' is-guide' : ''}" type="button" data-term="${tid}" aria-pressed="${state.pending === tid}"
          aria-label="${M.termName(tid)}${n ? `, ${n} ta sim` : ''}">${M.chip(tid)}${n ? `<span class="chip__wires" aria-hidden="true">·${n}</span>` : ''}</button>`;
      }).join('')}</span>
    </li>`).join('');
}

function renderReadouts() {
  if (state.phase === 'measure') {
    $('[data-readouts]').innerHTML = L.readouts(state.values, calc(), state.mphase === 'done', state.runs).map(([k, v, key]) =>
      `<span class="pill${key ? ' pill--key' : ''}"><span class="pill__k">${k}</span><span>${v}</span></span>`).join('');
    return;
  }
  // Build phases: the steps, always visible on the workspace
  const n = needed(), placedNeed = n.filter((e) => state.placed.has(e.id)).length;
  const steps = [['Asboblar', `${placedNeed} / ${n.length}`, placedNeed === n.length]];
  if (M.wiring) steps.push(['Ulash', `${progress()} / ${M.checker.required}`, state.phase === 'ready']);
  steps.push([M.wiring ? 'O‘lchash' : 'Tajriba', '', false]);
  const cur = steps.findIndex((x) => !x[2]);
  $('[data-readouts]').innerHTML = `<ol class="stepbar" aria-label="Bosqichlar">${steps.map(([k, v, done], i) => `
    <li class="stepbar__item${done ? ' is-done' : ''}${i === cur ? ' is-current' : ''}"${i === cur ? ' aria-current="step"' : ''}>
      <span class="stepbar__n">${done ? CHECK : i + 1}</span>${k}${v ? ` <span class="stepbar__count">${v}</span>` : ''}</li>`).join('')}</ol>`;
}

function render() {
  if (!M) return;
  saveDraft();
  const n = needed();
  $('[data-tools-count]').textContent = `${n.filter((e) => state.placed.has(e.id)).length} / ${n.length}`;
  $('[data-wires-count]').textContent = M.wiring ? `${progress()} / ${M.checker.required}` : '';
  $$('[data-tool]').forEach((b) => {
    const placed = state.placed.has(b.dataset.tool);
    b.classList.toggle('is-placed', placed);
    b.setAttribute('aria-pressed', String(placed));
    b.disabled = state.phase === 'measure';
  });
  $('[data-undo]').disabled = state.wires.length === 0;
  $('[data-hint-btn]').disabled = state.phase !== 'build' || !allPlaced();
  $('[data-start]').hidden = state.phase !== 'ready';
  $('[data-start]').textContent = M.wiring ? 'O‘lchashni boshlash' : 'Tajribani boshlash';
  $$('[data-build-only]').forEach((el) => { if (el.dataset.termsBlock === undefined) el.hidden = state.phase === 'measure'; });
  $$('[data-measure]').forEach((el) => { el.hidden = state.phase !== 'measure'; });
  if (state.phase === 'measure') { $('[data-runs-block]').hidden = state.runs.length === 0; renderMeasure(); }
  renderTerms();
  renderReadouts();
  const hint = $('[data-hint]');
  hint.textContent = state.phase === 'measure' ? 'Aylantirish uchun suring'
    : state.pending ? `${M.termName(state.pending)} tanlandi — endi ikkinchi qisqichni bosing`
    : state.guide ? `Shu yerdan boshlang: ${M.termName(state.guide)}`
    : state.placed.size && M.wiring ? 'Qisqichni bosing, so‘ng ikkinchisini: sim ulanadi' : 'Asboblarni ro‘yxatdan tanlang';
}

/* =====================================================================
   Models: everything lab-specific behind one small interface
   ===================================================================== */
const { curveBetween, currentRoute } = window.EMPIRA_FX;

// Hand-made Build Mode (experiments.js): Om qonuni
function customModel(cfg, kit, THREE, scene) {
  kit.board(...cfg.board);
  const tools = Object.fromEntries(cfg.tools.map((t) => [t.id, t]));
  const objs = {};
  const KEY = { '+': '«+»', '-': '«−»', a: '(1)', b: '(2)' }, CHIP = { '+': '+', '-': '−', a: '1', b: '2' };
  const split = (tid) => [tid.slice(0, tid.indexOf('.')), tid.slice(tid.indexOf('.') + 1)];
  const names = Object.fromEntries(cfg.tools.filter((t) => t.need).map((t) => [t.id, t.name]));
  const isAcross = (tid) => cfg.circuit.across.some((a) => split(tid)[0] === a.id);
  const termPos = (tid) => { const [id, k] = split(tid); return objs[id][tools[id].terminals[k]]; };
  return {
    wiring: true, task: cfg.task, camera: cfg.camera, finale: cfg.finale,
    entries: cfg.tools.map((t) => ({ id: t.id, name: t.name, note: t.note, icon: t.icon, need: !!t.need, why: t.why, insts: [t.id] })),
    place(id) { const o = tools[id].make(kit); objs[id] = o; return [o.group]; },
    unplaceAll() { Object.keys(objs).forEach((id) => { scene.remove(objs[id].group); delete objs[id]; }); },
    keys: (id) => Object.keys(tools[id].terminals),
    instName: (id) => tools[id].name,
    termPos,
    termName: (tid) => { const [id, k] = split(tid); return `${tools[id].name} ${KEY[k]}`; },
    chip: (tid) => CHIP[split(tid)[1]],
    isPlus: (tid) => split(tid)[1] === '+',
    junctions: [],
    checker: window.EMPIRA_CIRCUIT.create(cfg.circuit, names, cfg.messages),
    guideStart: () => `${cfg.circuit.source.id}.+`,
    liftFor: (w) => (w.some(isAcross) ? 0.05 : 0.035),
    showLabWires: false, enterMeasure() {}, reset() {},
    update: (v, c) => cfg.instruments.update(objs, v, c),
    progress: (p, v, c) => cfg.instruments.progress(objs, p, v, c),
    animate: () => {},
    flowRoutes() {
      const edges = state.wires.map((w) => ({ a: w[0], b: w[1], pa: termPos(w[0]), pb: termPos(w[1]), lift: w.some(isAcross) ? 0.05 : 0.035 }));
      const through = cfg.circuit.series.map((e) => (e.polar ? [`${e.id}.+`, `${e.id}.-`] : [`${e.id}.a`, `${e.id}.b`]));
      return currentRoute(edges, through, `${cfg.circuit.source.id}.+`, `${cfg.circuit.source.id}.-`);
    }
  };
}

// Automatic Build Mode: read from the ready lab (auto.js), checked against its wiring (netcheck.js)
function autoModel(kit, THREE, scene) {
  const A = window.EMPIRA_BUILD_AUTO;
  const values = Object.fromEntries(L.controls.map((c) => [c.key, c.value]));
  const r = A.analyze(L, kit, THREE, scene, values, L.compute ? L.compute(values) : {});
  const meta = (type) => A.TYPES[type] || { name: type.startsWith('meter:') ? `${type.slice(6)}-metr` : type, icon: A.TYPES.stopwatch.icon, domain: 'x', polar: type.startsWith('meter:') ? ['a', 'b'] : null };
  const inst = Object.fromEntries(r.instances.map((i) => [i.id, i]));
  const count = {}; r.instances.forEach((i) => { count[i.type] = (count[i.type] || 0) + 1; });
  const instName = (id) => (id in inst ? `${meta(inst[id].type).name}${count[inst[id].type] > 1 ? ` ${inst[id].n}` : ''}` : '');

  // Junction points: wire ends that are not a terminal of a piece (e.g. the A and B nodes of a parallel circuit)
  const J = [];
  const jAt = (p) => { let j = J.find((x) => x.p.distanceTo(p) < 1e-3); if (!j) { j = { id: `tugun${J.length + 1}`, p: p.clone(), name: `${'ABCDEFGH'[J.length] || J.length + 1} nuqta` }; J.push(j); } return `${j.id}.p`; };
  const resolve = (w) => ({ ...w, a: w.a || jAt(w.pa), b: w.b || jAt(w.pb) });
  const target = r.wires.map(resolve).filter((w) => w.a !== w.b);
  const liftOf = {}; target.forEach((w) => { liftOf[[w.a, w.b].sort().join('|')] = w.lift; });
  const inTarget = new Set(target.flatMap((w) => [w.a, w.b]));
  const STD = /^(a|b|c|plus|minus|an|k|\d+(plus|minus))$/;
  const keys = (id) => {
    if (!(id in inst)) return [];
    const ks = Object.keys(inst[id].terms);
    if (!ks.some((k) => inTarget.has(`${id}.${k}`))) return [];
    return ks.filter((k) => inTarget.has(`${id}.${k}`) || STD.test(k));
  };
  const isMeter = (id) => inst[id] && inst[id].type.startsWith('meter:');
  const keyName = (id, k) => {
    if (k === 'plus' || (isMeter(id) && k === 'a')) return '«+»';
    if (k === 'minus' || (isMeter(id) && k === 'b')) return '«−»';
    const m = k.match(/^(\d+)(plus|minus)$/); if (m) return `(${m[1]}-element ${m[2] === 'plus' ? '«+»' : '«−»'})`;
    return { a: '(1)', b: '(2)', c: '(3)', end: '(uchi)', an: '(anod)', k: '(katod)', ball: '(shar)' }[k] || `(${k})`;
  };
  const chipOf = (id, k) => {
    if (k === 'plus' || (isMeter(id) && k === 'a')) return '+';
    if (k === 'minus' || (isMeter(id) && k === 'b')) return '−';
    const m = k.match(/^(\d+)(plus|minus)$/); if (m) return `${m[1]}${m[2] === 'plus' ? '+' : '−'}`;
    return { a: '1', b: '2', c: '3', end: '•', an: 'A', k: 'K', ball: '●' }[k] || k;
  };
  const split = (tid) => [tid.slice(0, tid.indexOf('.')), tid.slice(tid.indexOf('.') + 1)];
  const junction = (tid) => J.find((j) => `${j.id}.p` === tid);
  const termPos = (tid) => { const j = junction(tid); if (j) return j.p; const [id, k] = split(tid); return inst[id].terms[k](); };
  const termName = (tid) => { const j = junction(tid); if (j) return j.name; const [id, k] = split(tid); return `${instName(id)} ${keyName(id, k)}`; };

  // Checker: the textbook wiring, with harmless swaps allowed
  const polarOf = (i) => { const p = meta(i.type).polar; return p && p.every((k) => k in i.terms) ? p : null; };
  const checker = window.EMPIRA_NETCHECK.create({
    wires: target.map((w) => [w.a, w.b]),
    instances: r.instances.map((i) => ({ id: i.id, type: i.type, keys: Object.keys(i.terms), polar: polarOf(i), source: !!meta(i.type).source }))
      .concat(J.map((j) => ({ id: j.id, type: 'tugun', keys: ['p'], polar: null }))),
    name: termName, instName: (id) => instName(id) || (J.find((j) => j.id === id) || {}).name
  });

  // Library: one entry per kind of piece (two lamps = one entry "×2"), plus look-alike pieces that do not belong
  const types = [...new Set(r.instances.map((i) => i.type))];
  const entries = types.map((type) => {
    const m = meta(type), n = count[type];
    return { id: type.replace(/[^a-z0-9]/gi, '-'), name: m.name, note: n > 1 ? `${n} ta` : '', icon: m.icon, need: true,
      insts: r.instances.filter((i) => i.type === type).map((i) => i.id) };
  });
  const usedNames = new Set(entries.map((e) => e.name));
  const domains = types.map((t) => meta(t).domain); const main = domains.sort((a, b) => domains.filter((x) => x === b).length - domains.filter((x) => x === a).length)[0];
  let seed = [...labId].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const same = new Set(types.flatMap((t) => A.SAME[t] || []));
  const pool = Object.entries(A.TYPES).filter(([t, m]) => !types.includes(t) && !same.has(t) && !usedNames.has(m.name))
    .map(([t, m]) => ({ t, m, k: (m.domain === main ? 0 : 1) + rnd() })).sort((a, b) => a.k - b.k);
  const wantWrong = Math.max(3, Math.min(10 - entries.length, 6));
  const seen = new Set();
  pool.forEach(({ t, m }) => {
    if (entries.filter((e) => !e.need).length >= wantWrong || seen.has(m.name)) return;
    seen.add(m.name);
    entries.push({ id: `x-${t.replace(/[^a-z0-9]/gi, '-')}`, name: m.name, icon: m.icon, need: false,
      why: `${m.name} bu tajribada kerak emas. Vazifani va tajriba savolini yana bir bor o‘qing.`, insts: [] });
  });

  // Hide the ready lab's pieces and wires: the student puts them on the table. (Hidden, not removed: the lab
  // keeps its own wires and may remove or redraw them while measuring.)
  const hideLabWires = () => r.current().forEach((w) => { w.mesh.visible = false; });
  r.instances.forEach((i) => i.groups.forEach((g) => { g.visible = false; }));
  hideLabWires();
  const sources = r.instances.filter((i) => meta(i.type).source && polarOf(i));
  const wired = target.length > 0;
  return {
    wiring: wired,
    task: wired ? 'Kerakli asboblarni tanlang va ularni darslikdagi sxema bo‘yicha sim bilan ulang.' : 'Tajriba uchun kerakli asboblarni tanlang va stolga qo‘ying.',
    camera: L.camera, finale: null, entries,
    place(id) { const e = entries.find((x) => x.id === id); const gs = e.insts.flatMap((i) => inst[i].groups); gs.forEach((g) => { g.visible = true; }); return gs; },
    unplaceAll() { r.instances.forEach((i) => i.groups.forEach((g) => { g.visible = false; })); },
    keys, instName, termPos, termName,
    chip: (tid) => (junction(tid) ? '●' : chipOf(...split(tid))),
    isPlus: (tid) => { if (junction(tid)) return false; const [id, k] = split(tid); return k === 'plus' || /plus$/.test(k) || (isMeter(id) && k === 'a'); },
    junctions: J.map((j) => `${j.id}.p`),
    checker,
    guideStart: () => {
      const s = sources.map((i) => `${i.id}.${polarOf(i)[0]}`).find((t) => inTarget.has(t));
      return s || target[0].a;
    },
    liftFor: (w) => { const l = liftOf[[w[0], w[1]].sort().join('|')]; return l === undefined ? 0.035 : l; },
    update: (v, c) => r.api.update?.(v, c),
    progress: (p, v, c) => r.api.progress?.(p, v, c),
    animate: (dt, phase) => r.api.animate?.(dt, phase),
    // Measuring runs the ready lab on the same table: its wires (same connections as the student's) take over,
    // so a lab that moves a meter or opens a lamp while measuring redraws them correctly.
    showLabWires: true,
    enterMeasure() { r.current().forEach((w) => { w.mesh.visible = true; }); },
    reset(values) { r.api.update?.(values, L.compute ? L.compute(values) : {}); hideLabWires(); },
    flowRoutes() {
      // the ready lab's wires as they are now (it may redraw them while measuring)
      const edges = r.current().map(resolve).filter((w) => w.a !== w.b);
      const through = r.instances.filter((i) => !meta(i.type).source && i.type !== 'meter:V').flatMap((i) => {
        const ks = Object.keys(i.terms); const out = [];
        for (let x = 0; x < ks.length; x++) for (let y = x + 1; y < ks.length; y++) out.push([`${i.id}.${ks[x]}`, `${i.id}.${ks[y]}`]);
        return out;
      });
      for (const s of sources) {
        const [p, m] = polarOf(s);
        const route = currentRoute(edges, through, `${s.id}.${p}`, `${s.id}.${m}`);
        if (route.length) return route;
      }
      return [];
    }
  };
}

/* =====================================================================
   3D stage (same look as the ready lab) — filled in build3D()
   ===================================================================== */
let S = null;

/* ---------- Terminal markers: a small ring around each terminal post ---------- */
const COLOR = { idle: 0x8B96FF, active: 0x3B4CFF, ok: 0xFFB21E, error: 0xFF6A4D };
function addMarker(tid) {
  if (S.markers[tid]) return;
  const { THREE } = S;
  const m = new THREE.Mesh(new THREE.TorusGeometry(0.0105, 0.0024, 8, 28),
    new THREE.MeshBasicMaterial({ color: COLOR.idle, transparent: true, opacity: 0.95 }));
  m.rotation.x = Math.PI / 2; m.renderOrder = 5;
  S.scene.add(m); S.markers[tid] = { mesh: m, flash: null };
}
function flashTerms(tids, kind) { tids.forEach((tid) => { if (S.markers[tid]) S.markers[tid].flash = { kind, until: performance.now() + 900 }; }); }
function updateMarkers(now) {
  Object.entries(S.markers).forEach(([tid, mk]) => {
    if (state.phase === 'measure') { mk.mesh.visible = false; return; }
    const p = M.termPos(tid); mk.mesh.position.set(p.x, p.y + 0.002, p.z);
    let color = COLOR.idle, scale = 1;
    mk.mesh.visible = true;
    if (wiresAt(tid)) { color = COLOR.active; scale = 0.85; }
    if (state.hover === tid) { color = COLOR.active; scale = 1.35; }
    if (state.pending === tid) { color = COLOR.active; scale = 1.5 + Math.sin(now / 160) * 0.12; }
    else if (state.guide === tid || state.guide2 === tid) { color = COLOR.active; scale = 1.45 + 0.4 * (0.5 + 0.5 * Math.sin(now / 220)); }
    if (mk.flash && mk.flash.until > now) {
      const k = (mk.flash.until - now) / 900;
      color = COLOR[mk.flash.kind]; scale = 1.2 + 0.6 * k;
    } else mk.flash = null;
    mk.mesh.material.color.setHex(color); mk.mesh.scale.setScalar(scale);
  });
}
function clearMarkers() { Object.values(S.markers).forEach((m) => { S.scene.remove(m.mesh); m.mesh.geometry.dispose(); }); S.markers = {}; }

/* ---------- Wires ---------- */
// The student's wires live in their own group (same look as kit.wire), so the ready lab's own wires are never touched
function redrawWires() {
  const { THREE } = S;
  S.wireGroup.children.slice().forEach((m) => { m.geometry.dispose(); S.wireGroup.remove(m); });
  state.wires.forEach((w) => {
    const m = new THREE.Mesh(new THREE.TubeGeometry(curveBetween(THREE, M.termPos(w[0]), M.termPos(w[1]), M.liftFor(w)), 40, 0.0028, 8, false), S.wireMat);
    m.castShadow = true; S.wireGroup.add(m);
  });
}
// A short-lived coloured copy of a wire: amber glow for a correct wire, coral for a wrong one (which is not kept)
function flashWire(w, kind) {
  const { THREE } = S;
  const curve = curveBetween(THREE, M.termPos(w[0]), M.termPos(w[1]), M.liftFor(w));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, kind === 'error' ? 0.0034 : 0.0044, 8, false),
    new THREE.MeshBasicMaterial({ color: COLOR[kind], transparent: true, opacity: 0.9, depthWrite: false }));
  mesh.renderOrder = 4; S.tempGroup.add(mesh);
  S.temps.push({ mesh, t: 0, dur: kind === 'error' ? 1.1 : 0.9, kind });
}

/* ---------- Current flow: glowing dots run along the wires, from «+» through the circuit to «−» ---------- */
function buildFlow() {
  const { THREE } = S;
  S.flow.forEach((f) => f.dots.forEach((d) => S.flowGroup.remove(d)));
  if (!M.wiring) { S.flow = []; return; }
  const geo = new THREE.SphereGeometry(0.0042, 10, 8);
  const mat = new THREE.MeshBasicMaterial({ color: 0xFFB21E });
  S.flow = M.flowRoutes().map(({ w, forward }) => {
    const curve = curveBetween(THREE, w.pa, w.pb, w.lift);
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
  const I = calc().I;
  const speed = typeof I === 'number' ? 0.25 + 0.6 * Math.min(1, I / 0.05) : 0.5;   // more current, faster flow
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
  if (!S || !M || state.phase === 'measure') return;
  const t = M.entries.find((e) => e.id === id); const btn = $(`[data-tool="${id}"]`);
  mark();
  $('.block--tools').classList.remove('is-guide');
  if (!t.need) {
    flashEl(btn, 'is-wrong'); Sound.play('error'); state.mistakes++;
    feedback('error', 'Bu asbob kerak emas', t.why);
    saveDraft();return;
  }
  if (state.placed.has(id)) { feedback('info', `${t.name} allaqachon stolda`, ''); return; }
  state.placed.add(id);
  M.place(id).forEach((g) => { const to = g.position.y; g.position.y = to + 0.12; S.drops.push({ group: g, to, t: 0 }); });
  if (M.wiring) t.insts.forEach((i) => M.keys(i).forEach((k) => addMarker(`${i}.${k}`)));
  flashEl(btn, 'is-ok');
  const left = needed().filter((x) => !state.placed.has(x.id)).length;
  if (left) { Sound.play('ok'); feedback('ok', praise(), `${t.name} stolga qo‘yildi. Yana ${left} ta asbob qoldi.`); }
  else if (M.wiring) {
    M.junctions.forEach(addMarker);
    feedback('ok', 'Barcha asboblar stolda', 'Endi ularni sim bilan ulang: bir qisqichni, so‘ng ikkinchisini bosing.');
    setTimeout(showConnect, reduceMotion ? 0 : 500);   // let the last tool land first
  } else {
    state.phase = 'ready';
    feedback('done', 'Laboratoriya tayyor!', 'Barcha kerakli asboblar stolda. Endi tajribani boshlang.');
    setTimeout(showWin, reduceMotion ? 0 : 500);
  }
  render();
}

function chooseTerminal(tid) {
  if (!M || !M.wiring || state.phase === 'measure' || !tid) return;
  mark();
  if (!state.pending) { state.pending = tid; render(); return; }
  if (state.pending === tid) { state.pending = null; render(); return; }
  const w = [state.pending, tid];
  state.pending = null;
  const r = M.checker.check(state.wires, w);
  if (r.status === 'duplicate') feedback('info', 'Bu sim allaqachon bor', r.message);
  else if (r.status === 'error') {
    flashWire(w, 'error'); flashTerms(w, 'error'); Sound.play('error'); state.mistakes++;
    feedback('error', 'Noto‘g‘ri ulanish', r.message);
    render(); w.forEach((x) => flashEl($(`[data-term="${x}"]`), 'is-wrong'));
    return;
  } else if (r.status === 'ok') {
    state.wires.push(w); redrawWires(); state.guide = state.guide2 = null;
    flashWire(w, 'ok'); flashTerms(w, 'ok');
    if (r.complete) {
      state.phase = 'ready';
      state.wires.forEach((x) => flashWire(x, 'ok'));
      flashTerms(allTerminals(), 'ok');
      feedback('done', 'Zanjir tayyor!', 'Barcha ulanishlar to‘g‘ri. Endi o‘lchashni boshlang.');
      setTimeout(showWin, reduceMotion ? 0 : 450);
    } else {
      Sound.play('ok');
      feedback('ok', praise(), `${M.termName(w[0])} → ${M.termName(w[1])}. Yana ${r.required - r.progress} ta ulanish qoldi.`);
    }
    render(); w.forEach((x) => flashEl($(`[data-term="${x}"]`), 'is-ok'));
    return;
  }
  render();
}

function giveHint() {
  if (!M || !M.wiring || state.phase !== 'build' || !allPlaced()) return;
  const h = M.checker.hint(state.wires);
  if (!h) return;
  state.hints++; state.pending = null;
  state.guide = h[0]; state.guide2 = h[1];
  feedback('info', 'Maslahat', `${M.termName(h[0])} ni ${M.termName(h[1])} bilan ulang.`);
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
  if (!S || !M) return;
  if((state.placed.size||state.runs.length)&&!window.confirm('Bu tajribani boshidan boshlaysizmi? Joriy yig‘ish va o‘lchovlar tozalanadi. Eng yaxshi yulduzlaringiz saqlanadi.'))return;
  closeCoach(false);
  M.unplaceAll(); clearMarkers(); S.drops = [];
  Object.assign(state, { phase: 'build', placed: new Set(), wires: [], pending: null, hover: null, guide: null, guide2: null, mistakes: 0, hints: 0, startedAt: 0, finaleShown: false, runs: [], touched: new Set(), mphase: 'ready', t: 0 });
  S.flow.forEach((f) => f.dots.forEach((d) => { S.flowGroup.remove(d); }));
  S.flow = [];
  state.values = Object.fromEntries(L.controls.map((c) => [c.key, c.value]));
  M.reset(state.values);
  S.wireGroup.visible = true; redrawWires();
  feedback('info', 'Kerakli asboblarni tanlang', 'To‘g‘ri asbob stolga qo‘yiladi. Keraksiz asbob tanlansa, ogohlantirish chiqadi.');
  render();
}

/* =====================================================================
   Measuring on the student's own setup (same rules as the ready lab engine)
   ===================================================================== */
const calc = () => (L.compute ? L.compute(state.values) : {});
function startMeasure() {
  if (state.phase !== 'ready') return;
  state.phase = 'measure'; state.pending = null; state.hover = null; state.guide = state.guide2 = null;
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
  M.update(state.values, calc());
  if (M.showLabWires) { M.enterMeasure(); S.wireGroup.visible = false; }
  buildFlow();
  feedback('done', `${stepsTotal()}-qadam: ${M.wiring ? 'o‘lchang' : 'tajriba'}`,
    `Boshqaruvni o‘zgartirib, «${L.run[0]}» tugmasini bosing.${M.wiring ? ' Simlarda tok qanday oqishini kuzating!' : ''}`);
  fb.classList.remove('is-anim');
  render();
}
function resetRun() { state.mphase = 'ready'; state.t = 0; M.update(state.values, calc()); buildFlow(); render(); }
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
  if (state.phase === 'measure') M.animate(dt, state.mphase);
  if (state.mphase !== 'running') return;
  state.t += dt;
  const p = Math.min(1, state.t / state.dur);
  M.progress(p, state.values, calc());
  if (p >= 1) {
    state.mphase = 'done'; state.runs.push({ ...state.values, ...calc() });
    const allDone = L.steps.every((st) => st.done({ runs: state.runs, touched: state.touched, phase: 'done' }));
    if (allDone) feedback('done', 'Tajriba bajarildi!', 'O‘zingiz yig‘gan laboratoriyada barcha o‘lchovlar olindi.');
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
$('[data-hint-btn]').addEventListener('click', giveHint);
$$('[data-restart]').forEach((b) => b.addEventListener('click', restart));
$('[data-start]').addEventListener('click', startMeasure);
$('[data-run]').addEventListener('click', () => {
  if (state.mphase === 'done') M.update(state.values, calc());
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.matchMedia('(max-width: 700px)').matches ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xF6F7FB);
  scene.fog = new THREE.Fog(0xF6F7FB, 2.2, 4.2);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 50);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xDDE1EA, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(0.8, 2.2, 1.4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -1, right: 1.6, top: 1, bottom: -1 }); sun.shadow.radius = 4;
  scene.add(sun);

  const kit = window.EMPIRA_KIT(THREE, scene);
  kit.table();
  M = custom ? customModel(custom, kit, THREE, scene) : autoModel(kit, THREE, scene);
  $('[data-task]').textContent = M.task;
  renderLibrary();

  const target = new THREE.Vector3(...M.camera.target);
  const viewDir = new THREE.Vector3(...M.camera.dir).normalize();
  const tempGroup = new THREE.Group(); scene.add(tempGroup);
  const flowGroup = new THREE.Group(); scene.add(flowGroup);
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
    baseDist = Math.max(M.camera.min, M.camera.fitW / (2 * hTan), M.camera.fitH / (2 * vTan));
    camera.updateProjectionMatrix(); frame();
  }
  new ResizeObserver(resize).observe(canvas.parentElement);
  resize();

  const wireGroup = new THREE.Group(); scene.add(wireGroup);
  const wireMat = kit.mat(kit.C.blue, { roughness: 0.45 });
  S = { THREE, kit, scene, camera, controls, canvas, markers: {}, drops: [], temps: [], tempGroup, hoverLabel, flowGroup, flow: [], flowT: 0, wireGroup, wireMat };

  /* ---------- Picking: the terminal nearest to the tap on screen (generous radius for fingers) ---------- */
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const v = new THREE.Vector3();
  const screenOf = (tid) => { const r = canvas.getBoundingClientRect(); v.copy(M.termPos(tid)).project(camera); return { x: (v.x + 1) / 2 * r.width + r.left, y: (1 - v.y) / 2 * r.height + r.top }; };
  function nearest(cx, cy) {
    let best = null, bd = coarse ? 40 : 28;
    allTerminals().forEach((tid) => { const p = screenOf(tid); const d = Math.hypot(p.x - cx, p.y - cy); if (d < bd) { bd = d; best = tid; } });
    return best;
  }
  // For automated tests only: where a terminal is on screen, the needed tools, and the next correct wire
  window.EMPIRA_BUILD_VIEW = {
    terminalScreen: screenOf,
    pending: () => state.pending,
    needed: () => needed().map((e) => e.id),
    wrongTools: () => M.entries.filter((e) => !e.need).map((e) => e.id),
    wiring: () => M.wiring,
    hint: () => (M.wiring ? M.checker.hint(state.wires) : null)
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
    if(document.hidden){clock.getDelta();return;}
    const dt = Math.min(clock.getDelta(), 0.05), now = performance.now();
    // tools dropping onto the board
    S.drops = S.drops.filter((d) => {
      d.t = Math.min(1, d.t + dt / 0.35); const k = 1 - Math.pow(1 - d.t, 3);
      d.group.position.y = d.to + 0.12 * (1 - k);
      if (d.t >= 1) { if (state.phase !== 'measure') redrawWires(); return false; }
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
      hoverLabel.setText(show === state.guide && !state.pending && !state.hover ? (state.guide2 ? M.termName(show) : 'Shu yerdan boshlang') : M.termName(show));
      hoverLabel.position.copy(M.termPos(show)).add(new THREE.Vector3(0, 0.055, 0));
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

try {
  build3D(); const resumed=restoreDraft(); restoring=false; render();
  // Step 1 card: shown on a student's first visit to this lab (remembered on this device)
  if(resumed)feedback('info','Davom etamiz!','Saqlangan tajribangiz tiklandi. Maslahat olish yulduzlarni kamaytirmaydi.');
  else if(!draft?.introSeen)setTimeout(showIntro,350);
  else feedback('info','Kerakli asboblarni tanlang','Maslahat olish yulduzlarni kamaytirmaydi.');
 } catch (err) {
  console.error(err); $('[data-loading]').hidden=true; $('[data-fallback]').hidden=false;
  $('[data-fallback]').innerHTML='3D ko‘rinish yuklanmadi. <button type="button" data-retry-scene>Qayta urinish</button> <a href="/dashboard">Boshqa tajriba</a>';
  $('[data-retry-scene]').onclick=()=>location.reload();
  $('[data-start],[data-run],[data-tool],[data-hint-btn]').forEach((b)=>{b.disabled=true;});
}
})();
