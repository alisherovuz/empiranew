// Empira — shared lab effects for the ready labs and Build Mode: sound, confetti, the big "moment" cards,
// and the wire shape + current route used for the glowing current-flow dots. One copy, both pages.
// Pages that use the cards/confetti include the markup [data-coach…] and [data-confetti] (see build/index.html).
(function (root) {
const $ = (s) => document.querySelector(s);

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
      g.fillStyle = p.c;
      if (p.round) { g.beginPath(); g.arc(0, 0, p.s / 3, 0, Math.PI * 2); g.fill(); } else { g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
      g.restore();
    });
    if (t < 2.6) requestAnimationFrame(frame); else { g.clearRect(0, 0, W, H); c.hidden = true; }
  })(t0);
}


/* ---------- Coach cards: the big, clear moments (start, step 2, win, experiment done) ---------- */
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="56" y1="4" x2="56" y2="-8" transform="rotate(${a} 56 56)"/>`).join('');
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
  win: `<svg viewBox="0 0 112 112"><g class="art-rays">${RAYS}</g>
    <g class="art-pop"><circle class="art-ring" cx="56" cy="56" r="50"/><path class="art-ink art-check" d="M34 58l15 15 30-32"/></g></svg>`,
  done: `<svg viewBox="0 0 112 112"><g class="art-rays">${RAYS}</g>
    <g class="art-pop"><circle class="art-ring" cx="56" cy="56" r="50"/>
    <path class="art-ink" d="M44 32h24M48 32v18L34 76a6 6 0 0 0 5 8h34a6 6 0 0 0 5-8L64 50V32"/><path class="art-ink art-check" d="M44 66l8 8 16-16"/></g></svg>`
};
const STAR = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>';
const coachEl = $('[data-coach]');
let coachGo = null, coachCloseFn = null, coachPreviousFocus=null;
function coach({ kind, step = '', title, text = '', plan = null, stars = 0, meta = '', go, onGo, close = '', onClose = null }) {
  if(coachEl.hidden)coachPreviousFocus=document.activeElement;
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
  if(coachPreviousFocus?.isConnected)coachPreviousFocus.focus({preventScroll:true});
  if (fn) fn();
}
if (coachEl) {
  $('[data-coach-go]').addEventListener('click', () => closeCoach(true));
  $('[data-coach-close]').addEventListener('click', () => closeCoach(false));
  coachEl.addEventListener('click', (e) => { if (e.target === coachEl) closeCoach(false); });
  document.addEventListener('keydown',(e)=>{
    if(coachEl.hidden)return;
    if(e.key==='Escape'){e.preventDefault();closeCoach(false);}
    if(e.key==='Tab'){
      const buttons=[...coachEl.querySelectorAll('button:not([hidden]):not(:disabled),a[href]')].filter((el)=>el.getClientRects().length);
      if(!buttons.length)return;
      const first=buttons[0],last=buttons[buttons.length-1];
      if(e.shiftKey&&(document.activeElement===first||!coachEl.contains(document.activeElement))){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&(document.activeElement===last||!coachEl.contains(document.activeElement))){e.preventDefault();first.focus();}
    }
  });
}


// Wire shape shared by the student's wires, the amber/coral flashes and the current-flow dots (same as kit.wire)
function curveBetween(THREE, a, b, lift) {
  const mid = a.clone().lerp(b, 0.5); mid.y = Math.max(a.y, b.y) + lift;
  return new THREE.CatmullRomCurve3([a.clone(), a.clone().setY(a.y + lift * 0.55), mid, b.clone().setY(b.y + lift * 0.55), b.clone()]);
}
// Shortest way from a source's «+» to its «−» through wires and pieces: which wires carry current, and which way
function currentRoute(edges, through, start, end) {
  const adj = {}; const link = (a, b, w, fw) => { (adj[a] = adj[a] || []).push([b, w, fw]); };
  edges.forEach((w) => { link(w.a, w.b, w, true); link(w.b, w.a, w, false); });
  through.forEach(([a, b]) => { link(a, b, null); link(b, a, null); });
  const prev = { [start]: null }; const queue = [start];
  while (queue.length) {
    const n = queue.shift(); if (n === end) break;
    (adj[n] || []).forEach(([m, w, fw]) => { if (!(m in prev)) { prev[m] = [n, w, fw]; queue.push(m); } });
  }
  if (!(end in prev)) return [];
  const out = []; let n = end;
  while (prev[n]) { const [from, w, fw] = prev[n]; if (w) out.unshift({ w, forward: fw }); n = from; }
  return out;
}


// The way current goes through a ready lab's own wires (recorded by build/auto.js): from a source's «+» to its «−»,
// through every piece except voltmeters. Wire ends that are not a terminal are junction points (parallel circuits).
function labRoutes(r, TYPES) {
  const J = [];
  const jAt = (p) => { let j = J.find((x) => x.p.distanceTo(p) < 1e-3); if (!j) { j = { id: `j${J.length}`, p: p.clone() }; J.push(j); } return `${j.id}.p`; };
  const edges = r.current().map((w) => ({ ...w, a: w.a || jAt(w.pa), b: w.b || jAt(w.pb) })).filter((w) => w.a !== w.b);
  const meta = (t) => TYPES[t] || {};
  const polarOf = (i) => { const p = meta(i.type).polar; return p && p.every((k) => k in i.terms) ? p : null; };
  const through = r.instances.filter((i) => !meta(i.type).source && i.type !== 'meter:V').flatMap((i) => {
    const ks = Object.keys(i.terms); const out = [];
    for (let x = 0; x < ks.length; x++) for (let y = x + 1; y < ks.length; y++) out.push([`${i.id}.${ks[x]}`, `${i.id}.${ks[y]}`]);
    return out;
  });
  for (const s of r.instances.filter((i) => meta(i.type).source && polarOf(i))) {
    const [p, m] = polarOf(s);
    const route = currentRoute(edges, through, `${s.id}.${p}`, `${s.id}.${m}`);
    if (route.length) return route;
  }
  return [];
}
// Glowing amber dots running along wires (one lane per wire on the route)
function makeFlow(THREE, scene) {
  const group = new THREE.Group(); scene.add(group);
  const geo = new THREE.SphereGeometry(0.0042, 10, 8), mat = new THREE.MeshBasicMaterial({ color: 0xFFB21E });
  let lanes = [], t = 0;
  return {
    set(routes) {
      group.clear();
      lanes = routes.map(({ w, forward }) => {
        const curve = curveBetween(THREE, w.pa, w.pb, w.lift);
        const dots = Array.from({ length: Math.max(3, Math.round(curve.getLength() / 0.06)) }, () => { const d = new THREE.Mesh(geo, mat); d.visible = false; group.add(d); return d; });
        return { curve, forward, dots };
      });
    },
    update(dt, on, speed) {
      t = (t + dt * speed * (reduceMotion ? 0 : 1)) % 1;
      lanes.forEach(({ curve, forward, dots }) => dots.forEach((d, i) => {
        d.visible = on; if (!on) return;
        const u = (i / dots.length + t) % 1; d.position.copy(curve.getPointAt(forward ? u : 1 - u));
      }));
    },
    get size() { return lanes.length; }
  };
}

root.EMPIRA_FX = { Sound, confetti, coach, closeCoach, reduceMotion, curveBetween, currentRoute, labRoutes, makeFlow,
  isCoachOpen: () => !!coachEl && !coachEl.hidden };
})(window);
