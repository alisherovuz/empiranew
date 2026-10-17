// Empira — 7-sinf Fizika labs, VI bob «Impuls» va VII bob «Ish va energiya» (§36–§46). Same definition shape as labs-8.js.
// Each lab follows the textbook (Fizika 7-sinf, 2017): its own experiment where the book has one (117–123, 129, 130, 137-rasm,
// 4- va 5-laboratoriya ishlari), otherwise a classroom experiment that agrees with the book's numbers (g = 10 m/s², as in the book).
// 3D equipment comes from kit.js + kit-7.js + kit-7e.js.
(function () {
  const fmt = (v, d = 1) => { let x = Number(v); if (Math.abs(x) < 0.5 * 10 ** -d) x = 0; return x.toFixed(d).replace('.', ',').replace('-', '−'); };
  const num = (v) => String(v).replace('.', ',').replace('-', '−');                    // a setting as typed: 0,5 · −1
  const uniq = (runs, key) => new Set(runs.map((r) => String(r[key]))).size;
  const has = (runs, key, val) => runs.some((r) => String(r[key]) === String(val));
  const where = (runs, obj) => runs.filter((r) => Object.entries(obj).every(([k, v]) => String(r[k]) === String(v)));
  const ease = (p) => p * p * (3 - 2 * p);
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const G = 10;                                                                             // the book uses g = 10 m/s² in this chapter
  const opt = (vals, unit) => vals.map((v) => ({ v, label: `${num(v)} ${unit}`.trim() }));

  // kit.js dynamometer laid along dir (unit vector from the hook towards the ring), hook tip at `hook`, showing Fvis
  function aimDyn(dyn, hook, dir, Fvis) {
    dyn.set(Fvis);
    const d = Math.min(0.1, Fvis * 0.06);
    dyn.group.rotation.set(0, 0, Math.atan2(dir.y, dir.x) - Math.PI / 2);
    dyn.group.position.copy(hook).addScaledVector(dir, 0.185 + d);
  }
  // amber "measured value" pill that appears at the end of a run
  const tag = (k) => { const l = k.label('·', k.V(0, 0, 0), { border: '#FFB21E' }); l.userData.hidden = true; return l; };
  const show = (l, text, pos) => { l.setText(text); l.position.copy(pos); l.userData.hidden = false; };
  const hide = (...ls) => ls.forEach((l) => { l.userData.hidden = true; });
  // force/velocity arrow with its own label (kit-7 arrow().hide() leaves its label on screen: sizeLabels() resets .visible each frame)
  const arrowL = (k, color) => {
    const a = k.arrow(color), l = k.label('·', k.V(0, 0, 0), { color: '#' + new k.THREE.Color(color).getHexString() }); l.userData.hidden = true;
    return {
      set(from, vec, text, off) { a.set(from, vec); const L = vec.length(); if (L < 1e-4 || !text) { l.userData.hidden = true; return; } l.setText(text); l.position.copy(from).addScaledVector(vec.clone().normalize(), L + 0.03); if (off) l.position.add(off); l.userData.hidden = false; },
      hide() { a.hide(); l.userData.hidden = true; }
    };
  };
  const newDyn = (k, name) => { const d = k.dynamometer(k.V(0, 0, 0)); d.nameLabel = k.label(name, k.V(-0.035, -0.08, 0), { parent: d.group, minor: true }); return d; };

  /* §36: the pull is shown in a compressed zone of the rail (the real distance F·t²/2m can be metres); timers show real time */
  const L36 = { S0: 0.08, G1: 0.5, G2: 1.0, END: 1.08, HALF: 0.062 };
  const vis36 = (v, c) => {
    const uv = clamp(0.6 * c.u, 0.3, 1.2); let TA = 0.5 + 0.5 * v.t, D = uv * TA / 2;
    if (D > 0.32) { D = 0.32; TA = 2 * D / uv; }
    const TB = (L36.END - L36.S0 - D) / uv;
    return { uv, TA, D, TB, T: TA + TB + 0.15 };
  };

  /* §37: carts on the rail. Reach = centre → buffer tip (spring 0,087 m; plasticine 0,072 m; plain plate 0,054 m), as in kit-7e bufferCart */
  const plan37 = (v) => {
    const el = v.buf === 'prujina', Dc = el ? 0.174 : 0.126, s1 = 0.2, s2 = v.u2 < 0 ? 1.1 : 0.75;
    const tc = (s2 - s1 - Dc) / (1 - v.u2), TAU = el ? 0.05 : 0.016;
    return { el, Dc, s1, s2, tc, TAU, T: tc + TAU + 0.28 };
  };
  const SLOW37 = 4;

  /* §40: the official 4-laboratoriya ishi */
  const MODE40 = { k: 'ko‘tarish', s: 'sudrash' };

  window.EMPIRA_LABS = window.EMPIRA_LABS || {};
  Object.assign(window.EMPIRA_LABS, {

    /* ================= §36 Impuls: kuch impulsi aravachaga beradigan tezlik ================= */
    'kuch-impulsi': {
      controls: [
        { key: 'F', label: 'Tortish kuchi, F', type: 'choice', value: 1, options: opt([0.5, 1, 2], 'N') },
        { key: 't', label: 'Kuchning ta’sir vaqti, t', type: 'choice', value: 1, options: opt([0.5, 1, 2], 's') },
        { key: 'm', label: 'Aravacha massasi, m', type: 'choice', value: 1, options: opt([0.5, 1], 'kg') }
      ],
      compute: (v) => { const I = v.F * v.t, u = I / v.m; return { I, u, t0: 0.5 / u, p: v.m * u }; },
      readouts: (v, c, done) => [['F', `${num(v.F)} N`], ['t', `${num(v.t)} s`], ['m', `${num(v.m)} kg`], ['I = F · t', `${fmt(c.I, 2)} N·s`],
        ['t₀ (0,5 m)', done ? `${fmt(c.t0, 3)} s` : '—'], ['υ = l / t₀', done ? `${fmt(c.u, 2)} m/s` : '—', true], ['p = m · υ', done ? `${fmt(c.p, 2)} kg·m/s` : '—', true]],
      run: ['Aravachani tortish', 'Aravacha harakatlanmoqda…', 'Qayta tortish'],
      duration: (v, c) => vis36(v, c).T,
      steps: [
        { text: 'm = 1 kg, F = 1 N, t = 1 s: aravachani tortib, 0,5 m ni o‘tish vaqti t₀ ni o‘lchang', done: (s) => where(s.runs, { m: 1, F: 1, t: 1 }).length > 0 },
        { text: 'Kuchni 2 N ga oshirib, vaqtni 0,5 s ga qisqartiring («siltab tortish»)', done: (s) => where(s.runs, { m: 1, F: 2, t: 0.5 }).length > 0 },
        { text: 'F = 0,5 N, t = 2 s bilan torting, so‘ng m = 0,5 kg li aravachani sinang', done: (s) => where(s.runs, { m: 1, F: 0.5, t: 2 }).length > 0 && has(s.runs, 'm', 0.5) }
      ],
      cols: ['F, N', 't, s', 'm, kg', 't₀, s', 'υ, m/s', 'p, kg·m/s'],
      row: (r) => [num(r.F), num(r.t), num(r.m), fmt(r.t0, 3), fmt(r.u, 2), fmt(r.p, 2)],
      demo: [{ F: 1, t: 1, m: 1 }, { F: 2, t: 0.5 }, { F: 0.5, t: 2 }, { m: 0.5, F: 1, t: 1 }],
      camera: { target: [0.13, 0.06, -0.06], dir: [0.06, 0.5, 1], fitW: 1.52, fitH: 0.55, min: 1.25 },
      build(k) {
        const { V } = k;
        const { S0, G1, G2, END, HALF } = L36;
        const tr = k.track(-0.6, 0, 1.2);
        const c = k.cart({ name: 'Aravacha' });
        const pl = k.forcePuller(0.69, 0, { threadY: tr.at(0).y + 0.03 });
        const th = k.thread(0x3A4166, { owner: pl });
        const g1 = k.photogate({ name: '1-datchik' }), g2 = k.photogate({ name: '2-datchik' });
        [g1, g2].forEach((g) => g.label.position.set(0, 0.0, 0.1));
        const tmA = k.timer(-0.36, -0.24, { name: 't (tortish)', digits: 2 }), tmB = k.timer(0.24, -0.24, { name: 't₀ (0,5 m)', digits: 3 });
        k.label('l = 0,5 m', tr.local((G1 + G2) / 2, 0.0).add(V(0, 0, 0.1)), { parent: tr.inner, minor: true });
        const rel = k.add(tr.inner, k.box(0.004, 0.006, 0.07, k.C.amber), 0, tr.top, 0);
        const fa = arrowL(k, k.C.blue), tg = tag(k);
        return {
          update(v, cc) {
            c.setLoad(v.m === 1 ? 1 : 0); c.put(tr, S0);
            g1.put(tr, G1); g2.put(tr, G2); g1.cut(false); g2.cut(false);
            tmA.set(0); tmB.set(0); pl.set(0, 2).on(false).spin(0); th.set(c.front(), pl.point); fa.hide(); hide(tg);
            rel.position.x = S0 + vis36(v, cc).D + HALF;
          },
          progress(p, v, cc) {
            const q = vis36(v, cc), T = p * q.T;
            let s;
            if (T < q.TA) {                                                     // pulled with F for the time t (time scaled; the timer shows real t)
              const f = T / q.TA; s = S0 + q.D * f * f;
              c.put(tr, s); th.set(c.front(), pl.point); pl.set(v.F, 2).on(true).spin(-(s - S0) / 0.014);
              fa.set(c.front().add(V(0, 0.04, 0)), V(0.04 + 0.05 * v.F, 0, 0), 'F'); tmA.set(v.t * f);
            } else {                                                            // thread released: the cart rolls on uniformly
              s = Math.min(END, S0 + q.D + q.uv * (T - q.TA));
              c.put(tr, s); th.hide(); pl.set(0, 2).on(false); fa.hide(); tmA.set(v.t);
            }
            const front = s + HALF, back = s - HALF;
            g1.cut(front >= G1 && back <= G1); g2.cut(front >= G2 && back <= G2);
            tmB.set(clamp((front - G1) / 0.5) * cc.t0);
            if (p >= 1) show(tg, `υ = ${fmt(cc.u, 2)} m/s`, c.top().add(V(0, 0.15, 0))); else hide(tg);
          }
        };
      }
    },

    /* ================= §37 Impulsning saqlanish qonuni: aravachalar to‘qnashuvi (119–121-rasm) ================= */
    'aravachalar-toqnashuvi': {
      controls: [
        { key: 'm2', label: '2-aravacha massasi, m₂', type: 'choice', value: 1, options: opt([1, 2], 'kg') },
        { key: 'u2', label: '2-aravacha tezligi, υ₂', type: 'choice', value: -1, options: opt([0, -1], 'm/s') },
        { key: 'buf', label: 'Bufer', type: 'choice', value: 'plastilin', options: [{ v: 'plastilin', label: 'Plastilin (yopishadi)' }, { v: 'prujina', label: 'Prujina' }] }
      ],
      compute: (v) => {
        const m1 = 1, u1 = 1, m2 = v.m2, u2 = v.u2;
        let a, b;
        if (v.buf === 'prujina') { a = ((m1 - m2) * u1 + 2 * m2 * u2) / (m1 + m2); b = ((m2 - m1) * u2 + 2 * m1 * u1) / (m1 + m2); }
        else { a = b = (m1 * u1 + m2 * u2) / (m1 + m2); }
        return { u1p: a, u2p: b, pb: m1 * u1 + m2 * u2, pa: m1 * a + m2 * b };
      },
      readouts: (v, c, done) => [['m₂', `${num(v.m2)} kg`], ['υ₂', `${num(v.u2)} m/s`], ['Bufer', v.buf],
        ['υ₁′', done ? `${fmt(c.u1p, 2)} m/s` : '—'], ['υ₂′', done ? `${fmt(c.u2p, 2)} m/s` : '—'],
        ['p (oldin)', `${fmt(c.pb, 2)} kg·m/s`, true], ['p (keyin)', done ? `${fmt(c.pa, 2)} kg·m/s` : '—', true]],
      run: ['Aravachalarni to‘qnashtirish', 'To‘qnashuv (sekinlashtirilgan)…', 'Qayta to‘qnashtirish'],
      duration: (v) => plan37(v).T * SLOW37 + 0.2,
      steps: [
        { text: 'm₂ = 1 kg, υ₂ = −1 m/s, plastilin: aravachalarni to‘qnashtiring', done: (s) => where(s.runs, { m2: 1, u2: -1, buf: 'plastilin' }).length > 0 },
        { text: 'Xuddi shunday, lekin prujinali bufer bilan to‘qnashtiring', done: (s) => where(s.runs, { m2: 1, u2: -1, buf: 'prujina' }).length > 0 },
        { text: 'm₂ = 2 kg, υ₂ = 0: tinch turgan og‘ir aravachaga uring', done: (s) => where(s.runs, { m2: 2, u2: 0 }).length > 0 }
      ],
      cols: ['m₂, kg', 'υ₂, m/s', 'Bufer', 'υ₁′, m/s', 'υ₂′, m/s', 'p oldin', 'p keyin'],
      row: (r) => [num(r.m2), num(r.u2), r.buf, fmt(r.u1p, 2), fmt(r.u2p, 2), fmt(r.pb, 2), fmt(r.pa, 2)],
      demo: [{ m2: 1, u2: -1, buf: 'plastilin' }, { buf: 'prujina' }, { m2: 2, u2: 0 }],
      camera: { target: [0.0, 0.15, -0.1], dir: [0.06, 0.42, 1], fitW: 1.8, fitH: 0.7, min: 1.3 },
      build(k) {
        const { V } = k;
        const tr = k.track(-0.65, 0, 1.3);
        const c1 = k.bufferCart({ name: '1-aravacha', facing: 1, clay: true });
        const c2 = k.bufferCart({ name: '2-aravacha', facing: -1, color: 0x3B4CFF });
        const ms1 = k.motionSensor(), ms2 = k.motionSensor();
        const ch = k.chartBoard(0.0, 0.12, -0.3, { w: 0.62, h: 0.34, xMax: 0.8, yMax: 2, yMin: -2, xStep: 0.2, yStep: 1, xLabel: 't, s', yLabel: 'p, kg·m/s', name: 'Impulslar grafigi p(t)' });
        const a1 = arrowL(k, k.C.navy), a2 = arrowL(k, k.C.blue);
        // velocities and positions at real time t (velocity changes linearly during the short contact τ)
        const velAt = (K, v, cc, t) => { const f = clamp((t - K.tc) / K.TAU); return [1 + (cc.u1p - 1) * f, v.u2 + (cc.u2p - v.u2) * f]; };
        const xAt = (K, x0, u0, u1, t) => {
          if (t < K.tc) return x0 + u0 * t;
          const dt = Math.min(K.TAU, t - K.tc), xc = x0 + u0 * K.tc + u0 * dt + (u1 - u0) * dt * dt / (2 * K.TAU);
          return xc + Math.max(0, t - K.tc - K.TAU) * u1;
        };
        const place = (K, v, cc, t) => {
          const x1 = clamp(xAt(K, K.s1, 1, cc.u1p, t), 0.07, 1.23), x2 = clamp(xAt(K, K.s2, v.u2, cc.u2p, t), 0.07, 1.23);
          c1.put(tr, x1); c2.put(tr, x2);
          const ov = Math.max(0, K.Dc - (x2 - x1));
          if (K.el) { c1.squeeze(ov / 2); c2.squeeze(ov / 2); } else { c1.squeeze(ov); c2.squeeze(0); }
          const [u1, u2] = velAt(K, v, cc, t), after = t > K.tc;
          const arr = (a, c, u, n) => { if (Math.abs(u) < 0.02) { a.hide(); return; } a.set(c.top().add(V(0, 0.0, 0.07)), V(0.09 * u, 0, 0), n); };
          arr(a1, c1, u1, after ? 'υ₁′' : 'υ₁'); arr(a2, c2, u2, after ? 'υ₂′' : 'υ₂');
        };
        const series = (K, v, cc, t) => {
          const P1 = [], P2 = [], S = [];
          for (let i = 0; i <= 60; i++) { const q = t * i / 60, [u1, u2] = velAt(K, v, cc, q); P1.push([q, u1]); P2.push([q, v.m2 * u2]); S.push([q, u1 + v.m2 * u2]); }
          return [{ color: '#1C2347', pts: P1, name: 'p₁' }, { color: '#3B4CFF', pts: P2, name: 'p₂' }, { color: '#FFB21E', pts: S, name: 'p₁ + p₂', dash: true }];
        };
        return {
          update(v, cc) {
            c1.setBuffer(v.buf); c2.setBuffer(v.buf); c2.setLoad(v.m2 === 2 ? 1 : 0);
            ms1.put(tr, -0.035); ms2.put(tr, 1.335); ms2.group.rotation.set(0, Math.PI, 0);
            place(plan37(v), v, cc, 0); a1.hide(); a2.hide(); ch.clear();
          },
          progress(p, v, cc) {
            const K = plan37(v), t = Math.min(K.T, p * (K.T * SLOW37 + 0.2) / SLOW37);
            place(K, v, cc, t); ch.set(series(K, v, cc, t));
          }
        };
      }
    },

    /* ================= §38 Reaktiv harakat: tiqini otilgan probirkali aravacha (123-rasm) ================= */
    'reaktiv-harakat': {
      controls: [
        { key: 'm1', label: 'Tiqin massasi, m₁', type: 'choice', value: 10, options: opt([5, 10, 20], 'g') },
        { key: 'm2', label: 'Aravacha massasi (probirka bilan), m₂', type: 'choice', value: 500, options: opt([250, 500, 1000], 'g') }
      ],
      compute: (v) => { const u2 = -(v.m1 / v.m2) * 10; return { u2, t0: 0.1 / -u2, p1: v.m1 / 1000 * 10, p2: v.m2 / 1000 * u2 }; },
      readouts: (v, c, done) => [['m₁', `${v.m1} g`], ['m₂', `${v.m2} g`], ['t₀ (10 sm)', done ? `${fmt(c.t0, 3)} s` : '—'], ['υ₂′ = −l / t₀', done ? `${fmt(c.u2, 2)} m/s` : '—', true],
        ['m₁υ₁′', `${fmt(c.p1, 2)} kg·m/s`], ['m₂υ₂′', done ? `${fmt(c.p2, 2)} kg·m/s` : '—'], ['Yig‘indi', done ? `${fmt(c.p1 + c.p2, 2)} kg·m/s` : '—', true]],
      run: ['Suvni qizdirish', 'Suv qizimoqda…', 'Qayta qizdirish'],
      duration: (v, c) => 1.2 + c.t0 + 0.4,
      steps: [
        { text: 'm₁ = 10 g, m₂ = 500 g: suvni qizdiring va aravachaning 10 sm ni o‘tish vaqtini o‘lchang', done: (s) => where(s.runs, { m1: 10, m2: 500 }).length > 0 },
        { text: 'Tiqinni 20 g li bilan almashtirib, takrorlang', done: (s) => where(s.runs, { m1: 20, m2: 500 }).length > 0 },
        { text: 'm₁ = 10 g, aravachaga yuk qo‘yib m₂ = 1000 g qiling', done: (s) => where(s.runs, { m1: 10, m2: 1000 }).length > 0 }
      ],
      cols: ['m₁, g', 'm₂, g', 't₀, s', 'υ₂′, m/s', 'm₁υ₁′', 'm₂υ₂′'],
      row: (r) => [r.m1, r.m2, fmt(r.t0, 3), fmt(r.u2, 2), fmt(r.p1, 2), fmt(r.p2, 2)],
      demo: [{ m1: 10, m2: 500 }, { m1: 20 }, { m1: 10, m2: 1000 }],
      camera: { target: [0.02, 0.1, -0.05], dir: [0.1, 0.4, 1], fitW: 1.12, fitH: 0.5, min: 1.0 },
      build(k) {
        const { V } = k;
        const tr = k.track(-0.5, 0, 1.0);
        const c = k.cart({ name: 'Aravacha', len: 0.2 }); c.label.position.set(-0.075, 0.12, 0);
        const tube = k.corkTube(); c.carry(tube, V(0.025, 0.048, 0));
        const lamp = k.spiritLamp(); c.carry(lamp, V(0.005, 0.048, 0.0));
        const loads = [0, 1, 2].map((i) => k.add(c.group, k.box(0.04, 0.014, 0.05, k.C.ink700, { metalness: 0.4, roughness: 0.4 }), -0.075, 0.055 + i * 0.0145, 0));
        const tm = k.timer(0.38, -0.2, { name: 't₀ (10 sm)', digits: 3 });
        const S0 = 0.62, TP = 1.2, SLOWC = 6;
        const m1 = k.add(tr.inner, k.box(0.004, 0.006, 0.07, 0x2E7D5B), S0 - 0.1, tr.top, 0), m2 = k.add(tr.inner, k.box(0.004, 0.006, 0.07, k.C.amber), S0 - 0.2, tr.top, 0);
        k.label('l = 10 sm', tr.local(S0 - 0.15, 0.0).add(V(0, 0, 0.09)), { parent: tr.inner, minor: true });
        const ac = arrowL(k, k.C.blue), tg = tag(k);
        let cork0 = null, dir0 = null;
        const put = (s) => { c.put(tr, s); if (!tube.free) tube.corkAt(null); };
        return {
          update(v) {
            loads.forEach((l, i) => { l.visible = i < { 250: 0, 500: 1, 1000: 3 }[v.m2]; });
            cork0 = null; tube.corkAt(null); put(S0); tube.heat(0); tube.steam(0); lamp.set(false); tm.set(0); ac.hide(); hide(tg);
            m1.position.x = S0 - 0.1; m2.position.x = S0 - 0.2;
          },
          progress(p, v, cc) {
            const T = p * (TP + cc.t0 + 0.4);
            lamp.set(true);
            if (T < TP) { tube.corkAt(null); put(S0); tube.heat(T / TP); tm.set(0); ac.hide(); hide(tg); return; }
            const tt = T - TP;                                                   // after the pop: real time for the cart
            if (!cork0) { cork0 = tube.mouth(); dir0 = tube.dir(); }
            const tr2 = tt / SLOWC;                                              // the cork flies in slow motion (10 m/s)
            const cp = cork0.clone().addScaledVector(dir0, 10 * tr2).add(V(0, -G * tr2 * tr2 / 2, 0));
            tube.corkAt(cp, -tt * 25); tube.cork.visible = cp.x < 0.85 && cp.y > 0.01;
            tube.steam(clamp(tt / 0.8));
            put(S0 + cc.u2 * tt);
            tube.heat(0.4);
            tm.set(Math.min(tt, cc.t0));
            ac.set(c.top().add(V(-0.12, 0.05, 0.06)), V(-(0.05 + Math.abs(cc.u2) * 0.25), 0, 0), 'υ₂′');
            if (p >= 1) { show(tg, `υ₂′ = ${fmt(cc.u2, 2)} m/s`, c.top().add(V(0, 0.24, 0))); cork0 = null; }
          },
          animate(dt) { lamp.animate(dt); }
        };
      }
    },

    /* ================= §39 Mexanik ish: kuch yo‘nalishi va ish (129-rasm) ================= */
    'mexanik-ish': {
      controls: [
        { key: 'h', label: 'Kuch yo‘nalishi (129-rasm)', type: 'choice', value: 'a', options: [{ v: 'a', label: 'a) bo‘ylab' }, { v: 'b', label: 'b) qiya' }, { v: 'd', label: 'd) qiyaroq' }, { v: 'e', label: 'e) tik' }] },
        { key: 'F', label: 'Kuch, F', type: 'choice', value: 5, options: opt([2.5, 5], 'N') },
        { key: 's', label: 'Ko‘chish, s', type: 'choice', value: 20, options: opt([20, 40], 'sm') }
      ],
      compute: (v) => { const pr = { a: 1, b: 0.8, d: 0.6, e: 0 }[v.h], Fpr = v.F * pr, sm = v.h === 'e' ? 0 : v.s / 100; return { Fpr, sm, A: Fpr * sm }; },
      readouts: (v, c, done) => [['Holat', { a: 'a) harakat bo‘ylab', b: 'b) qiya', d: 'd) qiyaroq', e: 'e) tik yuqoriga' }[v.h]], ['F', `${num(v.F)} N`],
        ['Fₚᵣ', done ? `${fmt(c.Fpr, 1)} N` : '—'], ['s', done ? `${fmt(c.sm * 100, 0)} sm` : '—'], ['A = Fₚᵣ · s', done ? `${fmt(c.A, 2)} J` : '—', true]],
      run: ['Aravachani tortish', 'Tortilmoqda…', 'Qayta tortish'],
      duration: () => 2.4,
      steps: [
        { text: 'a) holat, F = 5 N, s = 20 sm: aravachani harakat bo‘ylab torting', done: (s) => where(s.runs, { h: 'a', F: 5, s: 20 }).length > 0 },
        { text: 'b) va d) holatlarda ham 5 N bilan 20 sm ga torting', done: (s) => where(s.runs, { h: 'b', F: 5, s: 20 }).length > 0 && where(s.runs, { h: 'd', F: 5, s: 20 }).length > 0 },
        { text: 'e) holatda aravachani tik yuqoriga 5 N bilan torting', done: (s) => where(s.runs, { h: 'e', F: 5 }).length > 0 }
      ],
      cols: ['Holat', 'F', 'Fₚᵣ', 's', 'A'],
      row: (r) => [`${r.h})`, `${num(r.F)} N`, `${fmt(r.Fpr, 1)} N`, `${fmt(r.sm * 100, 0)} sm`, `${fmt(r.A, 2)} J`],
      demo: [{ h: 'a', F: 5, s: 20 }, { h: 'b' }, { h: 'd' }, { h: 'e' }],
      camera: { target: [0.02, 0.13, -0.02], dir: [0.1, 0.32, 1], fitW: 1.0, fitH: 0.52, min: 1.0 },
      build(k) {
        const { V } = k;
        const tr = k.track(-0.4, 0, 0.9);
        const c = k.cart({ name: 'Aravacha (1 kg)' }); c.setLoad(1);
        const dyn = newDyn(k, 'Dinamometr'); dyn.nameLabel.position.set(-0.05, -0.03, 0);
        const fA = arrowL(k, k.C.blue), pA = arrowL(k, k.C.amber), drop = k.thread(0x8A93B5);
        const S0 = 0.14;
        const mS = k.add(tr.inner, k.box(0.004, 0.006, 0.07, 0x2E7D5B), S0 + 0.062, tr.top, 0), mE = k.add(tr.inner, k.box(0.004, 0.006, 0.07, k.C.amber), S0 + 0.262, tr.top, 0);
        const tg = tag(k);
        const DIR = { a: [1, 0], b: [0.8, 0.6], d: [0.6, 0.8], e: [0, 1] };
        const pose = (v, s, Fcur, show2) => {
          c.put(tr, s);
          const [dx, dy] = DIR[v.h], dir = V(dx, dy, 0);
          const P = v.h === 'e' ? k.world(c.group, V(0, 0.07, 0)) : c.front();
          aimDyn(dyn, P, dir, Fcur * 0.33);
          if (!show2) { fA.hide(); pA.hide(); drop.hide(); return; }
          const Q = P.clone().add(V(0, 0, 0.05)), Q0 = V(Q.x, tr.at(0).y + 0.004, Q.z), sc = 0.025;   // Fₚᵣ drawn on the track, under F
          fA.set(Q, dir.clone().multiplyScalar(Fcur * sc), `F = ${num(v.F)} N`);
          pA.set(Q0, V(Fcur * dx * sc, 0, 0), `Fₚᵣ = ${fmt(v.F * dx, 1)} N`, V(0, -0.02, 0.05));
          if (dx > 0) drop.set(Q.clone().addScaledVector(dir, Fcur * sc), Q0.clone().add(V(Fcur * dx * sc, 0, 0))); else drop.hide();
        };
        return {
          update(v) { pose(v, S0, 0, false); mE.position.x = S0 + 0.062 + (v.h === 'e' ? 0 : v.s / 100); mE.visible = v.h !== 'e'; hide(tg); },
          progress(p, v, cc) {
            const f1 = ease(clamp(p / 0.2)), f2 = ease(clamp((p - 0.25) / 0.6));
            pose(v, S0 + cc.sm * f2, v.F * f1, p > 0.02);
            if (p >= 1) show(tg, `A = ${fmt(cc.A, 2)} J`, tr.at(0.74, 0.0).add(V(0, 0, 0.12))); else hide(tg);
          }
        };
      }
    },

    /* ================= §40 4-laboratoriya ishi: jismni ko‘tarish va gorizontal ko‘chirishdagi ish (130-rasm) ================= */
    'kotarish-va-sudrash': {
      controls: [
        { key: 'mode', label: 'Tajriba', type: 'choice', value: 'k', options: [{ v: 'k', label: 'Ko‘tarish (h)' }, { v: 's', label: 'Sudrash (s)' }] },
        { key: 'n', label: 'Brusokka osilgan 100 g li yuklar', type: 'choice', value: 0, options: [0, 1, 2].map((n) => ({ v: n, label: `${n} ta` })) },
        { key: 'h', label: 'Balandlik va yo‘l, h = s', type: 'choice', value: 0.5, options: opt([0.3, 0.5], 'm') }
      ],
      compute: (v) => { const Fog = 0.81 + v.n, Fish = 0.3 * Fog, F = v.mode === 'k' ? Fog : Fish; return { Fog, Fish, F, A: F * v.h }; },
      readouts: (v, c, done, runs) => {
        const Lr = where(runs, { mode: 'k', n: v.n, h: v.h }).pop(), Sr = where(runs, { mode: 's', n: v.n, h: v.h }).pop();
        const out = [['Yuklar', `${v.n} ta`], ['h = s', `${num(v.h)} m`], ['Fog‘', `${fmt(c.Fog, 2)} N`], ['Fᵢₛₕ', Sr ? `${fmt(Sr.Fish, 2)} N` : '—'],
          ['Aₕ = Fog‘ · h', Lr ? `${fmt(Lr.A, 2)} J` : '—', true], ['Aₜₑₖ = Fᵢₛₕ · s', Sr ? `${fmt(Sr.A, 2)} J` : '—', true]];
        if (Lr && Sr) out.push(['Aₕ / Aₜₑₖ', fmt(Lr.A / Sr.A, 1)]);
        return out;
      },
      run: ['Dinamometr bilan tortish', 'Tekis tortilmoqda…', 'Qayta tortish'],
      duration: () => 2.6,
      steps: [
        { text: 'Brusokni dinamometrga osib, h = 0,5 m balandlikka tekis ko‘taring', done: (s) => where(s.runs, { mode: 'k', n: 0, h: 0.5 }).length > 0 },
        { text: 'Brusokni tribometr bo‘ylab shu 0,5 m ga tekis sudrang', done: (s) => where(s.runs, { mode: 's', n: 0, h: 0.5 }).length > 0 },
        { text: 'Brusokka 1 ta, so‘ng 2 ta yuk osib, ikkala o‘lchashni takrorlang', done: (s) => [1, 2].every((n) => where(s.runs, { mode: 'k', n }).length > 0 && where(s.runs, { mode: 's', n }).length > 0) }
      ],
      cols: ['Tajriba', 'Yuklar', 'F, N', 'h = s', 'A, J'],
      row: (r) => [MODE40[r.mode], `${r.n} ta`, fmt(r.F, 2), `${num(r.h)} m`, fmt(r.A, 2)],
      demo: [{ mode: 'k', n: 0, h: 0.5 }, { mode: 's' }, { n: 1, mode: 'k' }, { mode: 's' }, { n: 2 }, { mode: 'k' }],
      camera: { target: [-0.12, 0.44, 0.0], dir: [0.1, 0.2, 1], fitW: 1.35, fitH: 1.22, min: 1.3 },
      build(k) {
        const { V } = k;
        const tb = k.workTribometer(-0.74, 0.05, 0.72);
        const bl = k.block({ name: 'Brusok' });
        const ws = k.weights(0.5, 0.08, 2, { name: 'Yuklar', mass: '100 g' });
        const dyn = newDyn(k, 'Dinamometr');
        const rl = k.ruler(0.7, { vertical: true, name: 'Tasma', width: 0.03 }); rl.place(0.23, 0, -0.04);
        const XL = 0.32, BW = bl.w, BH = bl.h, S0 = 0.07;
        const tg = tag(k), tgH = tag(k);
        const home = ws.items.map((it) => it.position.clone());
        const loadsAt = (n, fn) => ws.items.forEach((it, i) => {
          if (i >= n) { it.position.copy(home[i]); return; }
          it.position.copy(fn(i).sub(ws.group.position));
        });
        const pose = (v, f, Fcur) => {
          if (v.mode === 'k') {                                              // brusok hangs from the dynamometer (hook up), loads hang under it
            const L0 = 0.042 * v.n, L = L0 + v.h * f;
            bl.group.rotation.set(0, 0, Math.PI / 2); bl.group.position.set(XL + BH / 2, L + BW / 2, 0); bl.label.position.set(0, -0.09, 0);
            loadsAt(v.n, (i) => V(XL, L - 0.04 - i * 0.042, 0));
            aimDyn(dyn, bl.hook(), V(0, 1, 0), Fcur * 0.5);
          } else {                                                           // brusok lies on the tribometer, loads on top of it
            const s = S0 + v.h * f, p0 = tb.at(s);
            bl.group.rotation.set(0, 0, 0); bl.group.position.copy(p0); bl.label.position.set(0, BH + 0.05, 0);
            loadsAt(v.n, (i) => V(p0.x + (i - (v.n - 1) / 2) * 0.03, p0.y + BH, p0.z));
            aimDyn(dyn, bl.hook(), V(1, 0, 0), Fcur * 0.5);
          }
        };
        return {
          update(v) { pose(v, 0, 0); hide(tg, tgH); },
          progress(p, v, cc) {
            const f1 = ease(clamp(p / 0.2)), f2 = ease(clamp((p - 0.25) / 0.6));
            pose(v, f2, cc.F * f1);
            const top = dyn.group.position;
            show(tg, `${fmt(cc.F * f1, 2)} N`, top.clone().add(v.mode === 'k' ? V(0.08, -0.12, 0) : V(-0.1, 0.1, 0)));
            if (p >= 1) show(tgH, v.mode === 'k' ? `h = ${num(v.h)} m` : `s = ${num(v.h)} m`, v.mode === 'k' ? V(XL + 0.13, 0.042 * v.n + v.h / 2, 0) : tb.at(S0 + v.h / 2, 0.0).add(V(0, 0, 0.1)));
            else hide(tgH);
          }
        };
      }
    },

    /* ================= §41 Potensial energiya: ko‘tarilgan yuk mixni qoqadi ================= */
    'potensial-energiya': {
      controls: [
        { key: 'm', label: 'Yuk massasi, m', type: 'choice', value: 0.1, options: opt([0.1, 0.2, 0.4], 'kg') },
        { key: 'h', label: 'Tashlash balandligi, h', type: 'choice', value: 0.4, options: opt([0.2, 0.4, 0.8], 'm') }
      ],
      compute: (v) => { const Ep = v.m * G * v.h; return { Ep, dcm: Ep / 40 * 100, tf: Math.sqrt(2 * v.h / G) }; },  // plastilin qarshiligi ≈ 40 N
      readouts: (v, c, done) => [['m', `${num(v.m)} kg`], ['h', `${num(v.h)} m`], ['Eₚ = m · g · h', `${fmt(c.Ep, 2)} J`, true], ['d (mix kirishi)', done ? `${fmt(c.dcm, 1)} sm` : '—', true]],
      run: ['Yukni qo‘yib yuborish', 'Yuk tushmoqda (sekinlashtirilgan)…', 'Qayta tashlash'],
      duration: (v, c) => 0.35 + 3 * c.tf + 0.6,
      steps: [
        { text: 'm = 0,1 kg li yukni h = 0,4 m dan tashlab, mix qancha kirganini o‘lchang', done: (s) => where(s.runs, { m: 0.1, h: 0.4 }).length > 0 },
        { text: 'Yuk massasini 0,2 kg ga oshirib, o‘sha balandlikdan tashlang', done: (s) => where(s.runs, { m: 0.2, h: 0.4 }).length > 0 },
        { text: '0,2 kg li yukni 0,8 m dan tashlang: chuqurlik qanday o‘zgaradi?', done: (s) => where(s.runs, { m: 0.2, h: 0.8 }).length > 0 }
      ],
      cols: ['m', 'h', 'Eₚ', 'd'],
      row: (r) => [`${num(r.m)} kg`, `${num(r.h)} m`, `${fmt(r.Ep, 2)} J`, `${fmt(r.dcm, 1)} sm`],
      demo: [{ m: 0.1, h: 0.4 }, { m: 0.2 }, { h: 0.8 }],
      camera: { target: [0.1, 0.6, 0], dir: [0.3, 0.16, 1], fitW: 0.8, fitH: 1.42, min: 1.0 },
      build(k) {
        const { V } = k;
        const bx = k.plasticineBox(0, 0, { top: 0.07, protrude: 0.1 });
        const HEAD = bx.headY(0);
        const pd = k.pileDriver(0, 0, { zeroY: HEAD, H: 1.1 });
        const ws = k.weights(0.36, 0.06, 3, { name: 'Yuklar', mass: '0,1–0,4 kg' });
        const HL = { 0.1: 0.022, 0.2: 0.035, 0.4: 0.06 };
        const tg = tag(k);
        const pose = (yb, on) => { pd.loadAt(yb).magnetAt(yb + pd.loadH, on); };
        return {
          update(v) { pd.setLoad(HL[v.m]); bx.setDepth(0); pose(HEAD + v.h, true); hide(tg); },
          progress(p, v, c) {
            const T = p * (0.35 + 3 * c.tf + 0.6), d = c.dcm / 100;
            if (T < 0.35) { bx.setDepth(0); pose(HEAD + v.h, T < 0.22); hide(tg); return; }
            const t = (T - 0.35) / 3;                                         // slow motion ×3
            if (t < c.tf) { bx.setDepth(0); pd.loadAt(HEAD + v.h - G * t * t / 2); hide(tg); return; }
            const q = 1 - (1 - clamp((T - 0.35 - 3 * c.tf) / 0.25)) ** 2;  // the nail is driven in
            bx.setDepth(d * q); pd.loadAt(bx.headY(d * q));
            if (q >= 1) show(tg, `d = ${fmt(c.dcm, 1)} sm`, V(0.15, HEAD - d + 0.04, 0.06)); else hide(tg);
          }
        };
      }
    },

    /* ================= §42 Kinetik energiya: kuch ishi aravachaning kinetik energiyasiga aylanadi (134-rasm) ================= */
    'kinetik-energiya': {
      controls: [
        { key: 'F', label: 'Tortish kuchi, F', type: 'choice', value: 1, options: opt([0.5, 1, 2], 'N') },
        { key: 's', label: 'Tortish yo‘li, s', type: 'choice', value: 0.2, options: opt([0.2, 0.4, 0.8], 'm') },
        { key: 'm', label: 'Aravacha massasi, m', type: 'choice', value: 0.5, options: opt([0.5, 1], 'kg') }
      ],
      compute: (v) => { const A = v.F * v.s, u = Math.sqrt(2 * A / v.m); return { A, u, Ek: v.m * u * u / 2, tp: Math.sqrt(2 * v.s * v.m / v.F), dt: 0.1 / u }; },
      readouts: (v, c, done) => [['m', `${num(v.m)} kg`], ['F', `${num(v.F)} N`], ['s', `${num(v.s)} m`], ['A = F · s', `${fmt(c.A, 2)} J`],
        ['Δt', done ? `${fmt(c.dt, 3)} s` : '—'], ['υ = Δs / Δt', done ? `${fmt(c.u, 2)} m/s` : '—'], ['Eₖ = m·υ² / 2', done ? `${fmt(c.Ek, 2)} J` : '—', true]],
      run: ['Aravachani tortish', 'Aravacha tezlanmoqda…', 'Qayta tortish'],
      duration: (v, c) => c.tp + (1.08 - 0.08 - v.s) / c.u + 0.15,
      steps: [
        { text: 'm = 0,5 kg, F = 1 N, s = 0,2 m: aravachani tortib, tezligini o‘lchang', done: (s) => where(s.runs, { m: 0.5, F: 1, s: 0.2 }).length > 0 },
        { text: 'Yo‘lni 0,8 m ga oshiring: ish 4 marta ortadi. Tezlik-chi?', done: (s) => where(s.runs, { m: 0.5, F: 1, s: 0.8 }).length > 0 },
        { text: 'm = 1 kg li aravacha bilan F = 1 N, s = 0,8 m da takrorlang', done: (s) => where(s.runs, { m: 1, F: 1, s: 0.8 }).length > 0 }
      ],
      cols: ['m, kg', 'F, N', 's, m', 'A, J', 'υ, m/s', 'Eₖ, J'],
      row: (r) => [num(r.m), num(r.F), num(r.s), fmt(r.A, 2), fmt(r.u, 2), fmt(r.Ek, 2)],
      demo: [{ m: 0.5, F: 1, s: 0.2 }, { s: 0.8 }, { m: 1 }],
      camera: { target: [0.13, 0.06, -0.06], dir: [0.06, 0.5, 1], fitW: 1.52, fitH: 0.55, min: 1.25 },
      build(k) {
        const { V } = k;
        const S0 = 0.08, END = 1.08, HALF = 0.062;
        const tr = k.track(-0.6, 0, 1.2);
        const c = k.cart({ name: 'Aravacha' });
        k.add(c.group, k.box(0.1, 0.03, 0.003, k.C.amber, { roughness: 0.5 }), 0, 0.064, 0);          // 10 sm flag for the photogate
        const pl = k.forcePuller(0.69, 0, { threadY: tr.at(0).y + 0.03 });
        const th = k.thread(0x3A4166, { owner: pl });
        const gt = k.photogate({ name: 'Fotodatchik' }); gt.label.position.set(0, 0.0, 0.1);
        const tm = k.timer(0.1, -0.24, { name: 'Δt (datchik)', digits: 3 });
        const mS = k.add(tr.inner, k.box(0.004, 0.006, 0.07, 0x2E7D5B), S0 + HALF, tr.top, 0), mE = k.add(tr.inner, k.box(0.004, 0.006, 0.07, k.C.amber), S0 + HALF, tr.top, 0);
        const sl = k.label('s', tr.local(0, 0.0).add(V(0, 0, 0.1)), { parent: tr.inner, minor: true });
        const fa = arrowL(k, k.C.blue), tg = tag(k);
        const gateS = (v) => S0 + v.s + 0.05 + 0.04;
        return {
          update(v) {
            c.setLoad(v.m === 1 ? 1 : 0); c.put(tr, S0); gt.put(tr, gateS(v)); gt.cut(false); tm.set(0);
            pl.set(0, 2).on(false).spin(0); th.set(c.front(), pl.point); fa.hide(); hide(tg);
            mE.position.x = S0 + HALF + v.s; sl.setText(`s = ${num(v.s)} m`); sl.position.x = S0 + HALF + v.s / 2;
          },
          progress(p, v, cc) {
            const T = p * (cc.tp + (END - S0 - v.s) / cc.u + 0.15), a = v.F / v.m;
            let s;
            if (T < cc.tp) {
              s = S0 + a * T * T / 2; c.put(tr, s); th.set(c.front(), pl.point); pl.set(v.F, 2).on(true).spin(-(s - S0) / 0.014);
              fa.set(c.front().add(V(0, 0.04, 0)), V(0.04 + 0.05 * v.F, 0, 0), 'F');
            } else {
              s = Math.min(END, S0 + v.s + cc.u * (T - cc.tp)); c.put(tr, s); th.hide(); pl.set(0, 2).on(false); fa.hide();
            }
            const g = gateS(v);
            gt.cut(s + 0.05 >= g && s - 0.05 <= g);
            tm.set(clamp((s + 0.05 - g) / 0.1) * cc.dt);
            if (p >= 1) show(tg, `υ = ${fmt(cc.u, 2)} m/s`, c.top().add(V(0, 0.15, 0))); else hide(tg);
          }
        };
      }
    },

    /* ================= §43 Mexanik energiyaning saqlanish qonuni: erkin tushayotgan shar (135-rasm, sinf o‘lchamida) ================= */
    'energiya-saqlanishi': {
      controls: [
        { key: 'h1', label: 'Boshlang‘ich balandlik, h₁', type: 'choice', value: 0.8, options: opt([0.5, 0.8], 'm') },
        { key: 'h2', label: 'Fotodatchik balandligi, h₂', type: 'choice', value: 0.4, options: opt([0.4, 0.2, 0], 'm') },
        { key: 'm', label: 'Shar massasi, m', type: 'choice', value: 0.2, options: opt([0.1, 0.2], 'kg') }
      ],
      compute: (v) => { const u = Math.sqrt(2 * G * (v.h1 - v.h2)), Ep1 = v.m * G * v.h1, Ep2 = v.m * G * v.h2, Ek2 = v.m * u * u / 2; return { u, Ep1, Ep2, Ek2, E: Ep2 + Ek2, tf: Math.sqrt(2 * v.h1 / G) }; },
      readouts: (v, c, done) => [['m', `${num(v.m)} kg`], ['Eₚ₁ = m·g·h₁', `${fmt(c.Ep1, 2)} J`], ['h₂', `${num(v.h2)} m`], ['υ', done ? `${fmt(c.u, 2)} m/s` : '—'],
        ['Eₚ₂', done ? `${fmt(c.Ep2, 2)} J` : '—'], ['Eₖ₂', done ? `${fmt(c.Ek2, 2)} J` : '—'], ['Eₚ₂ + Eₖ₂', done ? `${fmt(c.E, 2)} J` : '—', true]],
      run: ['Sharni qo‘yib yuborish', 'Shar tushmoqda (sekinlashtirilgan)…', 'Qayta qo‘yib yuborish'],
      duration: (v, c) => 0.3 + 4 * c.tf + 0.35,
      steps: [
        { text: 'h₁ = 0,8 m, m = 0,2 kg: datchikni h₂ = 0,4 m ga qo‘yib, sharni qo‘yib yuboring', done: (s) => where(s.runs, { h1: 0.8, h2: 0.4, m: 0.2 }).length > 0 },
        { text: 'Datchikni 0,2 m ga, so‘ng 0 ga (yostiq ustiga) tushirib, takrorlang', done: (s) => where(s.runs, { h1: 0.8, h2: 0.2 }).length > 0 && where(s.runs, { h1: 0.8, h2: 0 }).length > 0 },
        { text: 'Shar massasini yoki h₁ ni o‘zgartirib, Eₚ₂ + Eₖ₂ = Eₚ₁ ekanini tekshiring', done: (s) => has(s.runs, 'm', 0.1) || has(s.runs, 'h1', 0.5) }
      ],
      cols: ['m, kg', 'h₁, m', 'h₂, m', 'υ, m/s', 'Eₚ₂, J', 'Eₖ₂, J', 'Eₚ₂ + Eₖ₂'],
      row: (r) => [num(r.m), num(r.h1), num(r.h2), fmt(r.u, 2), fmt(r.Ep2, 2), fmt(r.Ek2, 2), fmt(r.E, 2)],
      demo: [{ h1: 0.8, h2: 0.4, m: 0.2 }, { h2: 0.2 }, { h2: 0 }, { m: 0.1 }],
      camera: { target: [0.12, 0.53, -0.02], dir: [0.16, 0.16, 1], fitW: 1.05, fitH: 1.3, min: 1.0 },
      build(k) {
        const { V } = k;
        const CU = 0.03;                                                     // top of the soft cushion: h is measured from here
        const ds = k.dropStand(-0.24, 0, { arm: 0.24, zeroY: CU });
        const X = ds.dropX, Z = ds.dropZ;
        const cg = k.group(X, 0, Z); k.add(cg, k.box(0.13, CU, 0.13, 0x8B96FF, { roughness: 0.95 }), 0, CU / 2, 0);
        const b = k.ball(0.019, { name: 'Po‘lat shar' });
        const gt = k.photogate({ name: 'Fotodatchik' });
        const eb = k.energyBars(0.44, -0.12, { y: 0.3, w: 0.44, h: 0.42 });
        let r = 0.019;
        const putBall = (yb) => { b.mesh.position.y = r; b.put(V(X, CU + yb, Z)); };
        const setGate = (h2) => { const y = CU + h2 + r; gt.group.rotation.set(0, 0, -Math.PI / 2); gt.group.position.set(X - 0.055, y, Z); ds.setGateArm(y); };
        const bars = (v, c, yb, note) => eb.set({ Ep: v.m * G * yb, Ek: v.m * G * (v.h1 - yb), max: 2, ref: c.Ep1, note });
        return {
          update(v, c) {
            r = v.m === 0.2 ? 0.019 : 0.015; b.mesh.scale.setScalar(r / 0.019);
            putBall(v.h1); ds.setRelease(CU + v.h1 + 2 * r, true); setGate(v.h2); gt.cut(false);
            bars(v, c, v.h1, `h₁ = ${num(v.h1)} m`);
          },
          progress(p, v, c) {
            const T = p * (0.3 + 4 * c.tf + 0.35);
            ds.setRelease(CU + v.h1 + 2 * r, T < 0.25);
            const t = Math.max(0, (T - 0.3) / 4), yb = Math.max(0, v.h1 - G * t * t / 2);
            putBall(yb);
            gt.cut(Math.abs(yb - v.h2) < r);
            if (yb > v.h2) bars(v, c, yb, `h = ${fmt(yb, 2)} m`);
            else bars(v, c, v.h2, `h₂ = ${num(v.h2)} m da: υ = ${fmt(c.u, 2)} m/s`);
          }
        };
      }
    },

    /* ================= §44 5-laboratoriya ishi: sharcha kinetik energiyasining tezlik va massaga bog‘liqligi (137-rasm) ================= */
    'sharcha-kinetik-energiyasi': {
      controls: [
        { key: 'b', label: 'Sharcha', type: 'choice', value: 'kichik', options: [{ v: 'kichik', label: 'Kichik (17 g)' }, { v: 'katta', label: 'Katta (64 g)' }] },
        { key: 's', label: 'Qo‘yib yuborish joyi (brusokkacha yo‘l), s', type: 'choice', value: 0.5, options: [{ v: 0.5, label: 'O‘rtasidan (0,5 m)' }, { v: 1, label: 'Yuqori uchidan (1 m)' }] }
      ],
      compute: (v) => {
        const m = v.b === 'kichik' ? 0.017 : 0.064, aT = G * 0.1 / 1.4;     // dumalayotgan sharcha, nov qiyaligi 1 : 10
        const t = Math.sqrt(2 * v.s / aT), a = 2 * v.s / (t * t), u = a * t, Ek = m * u * u / 2;
        return { m, t, a, u, Ek, dl: 0.6 * Ek / 0.15 * 100 };                  // brusok: Fᵢₛₕ ≈ 0,15 N; energiyaning bir qismi zarbaga ketadi
      },
      readouts: (v, c, done) => [['Sharcha', `${v.b} (${fmt(c.m * 1000, 0)} g)`], ['s', `${num(v.s)} m`], ['t', done ? `${fmt(c.t, 2)} s` : '—'], ['a = 2s / t²', done ? `${fmt(c.a, 2)} m/s²` : '—'],
        ['υ = a · t', done ? `${fmt(c.u, 2)} m/s` : '—'], ['Eₖ = m·υ² / 2', done ? `${fmt(c.Ek, 4)} J` : '—', true], ['Δl', done ? `${fmt(c.dl, 1)} sm` : '—', true]],
      run: ['Sharchani qo‘yib yuborish', 'Sharcha dumalamoqda…', 'Qayta qo‘yib yuborish'],
      duration: (v, c) => c.t + 0.7,
      steps: [
        { text: 'Kichik sharchani novning o‘rtasidan qo‘yib yuboring: t va Δl ni o‘lchang', done: (s) => where(s.runs, { b: 'kichik', s: 0.5 }).length > 0 },
        { text: 'Kichik sharchani novning yuqori uchidan qo‘yib yuboring', done: (s) => where(s.runs, { b: 'kichik', s: 1 }).length > 0 },
        { text: 'Katta sharchani novning o‘rtasidan qo‘yib yuboring', done: (s) => where(s.runs, { b: 'katta', s: 0.5 }).length > 0 }
      ],
      cols: ['Sharcha', 's, m', 't, s', 'υ, m/s', 'Eₖ, J', 'Δl, sm'],
      row: (r) => [r.b, num(r.s), fmt(r.t, 2), fmt(r.u, 2), fmt(r.Ek, 4), fmt(r.dl, 1)],
      demo: [{ b: 'kichik', s: 0.5 }, { s: 1 }, { b: 'katta', s: 0.5 }],
      camera: { target: [0.17, 0.07, -0.03], dir: [0.14, 0.5, 1], fitW: 1.6, fitH: 0.5, min: 1.2 },
      build(k) {
        const { V } = k;
        const LEN = 1.12;
        const ch = k.chute(-0.58, 0, LEN).setTilt(0.112);
        const st = k.holder(-0.55, -0.1); st.hold(ch.at(0.03));
        const bS = k.ball(0.008, { name: 'Kichik sharcha' }), bL = k.ball(0.0125, { name: 'Katta sharcha' });
        const end = ch.at(LEN, -ch.top);
        const bl = k.block({ name: 'Brusok' });
        const X0 = end.x + 0.004 + bl.w / 2;
        const rl = k.ruler(0.3, { name: '' }); rl.place(end.x + 0.004, 0, 0.075); k.label('Tasma', V(0.27, 0.03, 0.02), { parent: rl.group, minor: true });
        const tm = k.timer(0.05, -0.22, { name: 'Sekundomer', digits: 2 });
        const tg = tag(k);
        const sHit = (r) => LEN + 0.004 - r;
        return {
          update(v) {
            const [b, o] = v.b === 'kichik' ? [bS, bL] : [bL, bS];
            b.onRail(ch, sHit(b.r) - v.s); o.put(V(-0.36, 0, 0.12)); o.group.quaternion.identity(); o.mesh.rotation.set(0, 0, 0);
            bl.group.position.set(X0, 0, 0); tm.set(0); hide(tg);
          },
          progress(p, v, c) {
            const b = v.b === 'kichik' ? bS : bL, T = p * (c.t + 0.7);
            const t = Math.min(T, c.t);
            b.onRail(ch, sHit(b.r) - v.s + c.a * t * t / 2); tm.set(t);
            const q = 1 - (1 - clamp((T - c.t) / 0.35)) ** 2;
            bl.group.position.x = X0 + c.dl / 100 * q;
            if (p >= 1) show(tg, `Δl = ${fmt(c.dl, 1)} sm`, V(X0 + c.dl / 100, 0.15, 0)); else hide(tg);
          }
        };
      }
    },

    /* ================= §45 Quvvat: ko‘targichning quvvati (kran misoli, stol o‘lchamida) ================= */
    'kotargich-quvvati': {
      controls: [
        { key: 'm', label: 'Yuk massasi, m', type: 'choice', value: 0.5, options: opt([0.2, 0.5, 1], 'kg') },
        { key: 'u', label: 'Ko‘tarish tezligi, υ', type: 'choice', value: 0.25, options: opt([0.1, 0.25, 0.5], 'm/s') }
      ],
      compute: (v) => { const F = v.m * G, t = 1 / v.u, A = F * 1; return { F, t, A, N: A / t, Fu: F * v.u }; },
      readouts: (v, c, done) => [['m', `${num(v.m)} kg`], ['υ', `${num(v.u)} m/s`], ['F', `${fmt(c.F, 1)} N`], ['t (1 m)', done ? `${fmt(c.t, 1)} s` : '—'],
        ['A = F · h', done ? `${fmt(c.A, 1)} J` : '—'], ['N = A / t', done ? `${fmt(c.N, 2)} W` : '—', true], ['F · υ', done ? `${fmt(c.Fu, 2)} W` : '—']],
      run: ['Yukni ko‘tarish', 'Yuk ko‘tarilmoqda (tezlashtirilgan)…', 'Qayta ko‘tarish'],
      duration: (v, c) => 0.3 + 0.35 * c.t + 0.3,
      steps: [
        { text: '0,5 kg yukni 0,25 m/s tezlikda 1 m ga ko‘tarib, vaqtni o‘lchang', done: (s) => where(s.runs, { m: 0.5, u: 0.25 }).length > 0 },
        { text: 'Shu yukni 0,5 m/s tezlikda (ikki marta tezroq) ko‘taring', done: (s) => where(s.runs, { m: 0.5, u: 0.5 }).length > 0 },
        { text: '1 kg yukni 0,25 m/s tezlikda ko‘tarib, quvvatlarni solishtiring', done: (s) => where(s.runs, { m: 1, u: 0.25 }).length > 0 }
      ],
      cols: ['m, kg', 'υ, m/s', 'F, N', 't, s', 'A, J', 'N, W'],
      row: (r) => [num(r.m), num(r.u), fmt(r.F, 1), fmt(r.t, 1), fmt(r.A, 1), fmt(r.N, 2)],
      demo: [{ m: 0.5, u: 0.25 }, { u: 0.5 }, { m: 1, u: 0.25 }],
      camera: { target: [0.08, 0.62, 0], dir: [0.28, 0.12, 1], fitW: 0.95, fitH: 1.5, min: 1.2 },
      build(k) {
        const { V } = k;
        const pw = k.powerWinch(-0.2, 0, { H: 1.16, arm: 0.25 });
        const X = pw.ropeX, Z = pw.ropeZ;
        const rope = k.thread(0x3A4166, { owner: pw });
        const rl = k.ruler(1.0, { vertical: true, name: 'Chizg‘ich', width: 0.035 }); rl.place(X + 0.075, 0, -0.03);
        k.add(rl.group, k.box(0.05, 0.004, 0.01, k.C.amber), 0, 1.0, 0.004);
        const tm = k.timer(0.42, -0.06, { name: 'Sekundomer', digits: 1 });
        const ld = k.group(X, 0, Z);
        const body = k.add(ld, k.cyl(0.024, 1, 0xB89A4A, { metalness: 0.7, roughness: 0.3 }), 0, 0.5, 0);
        const ring = k.add(ld, new k.THREE.Mesh(new k.THREE.TorusGeometry(0.006, 0.0014, 6, 16), k.mat(k.C.steel, { metalness: 0.7 })), 0, 0.05, 0);
        const ll = k.label('Yuk', V(-0.1, 0.03, 0), { parent: ld, minor: true });
        const fTag = k.label('F', V(-0.07, 0.2, 0.05), { parent: pw.group, border: '#FFB21E' }); fTag.userData.hidden = true;
        const HM = { 0.2: 0.03, 0.5: 0.05, 1: 0.075 };
        let hm = 0.05;
        const lift = (y) => {
          ld.position.y = y; const top = y + hm + 0.012;
          pw.hookAt(top + 0.012); rope.set(...pw.rope(top + 0.012)); pw.spin(-y / 0.016);
        };
        return {
          update(v) {
            hm = HM[v.m]; body.scale.y = hm; body.position.y = hm / 2; ring.position.y = hm + 0.006; ll.setText(`Yuk (${num(v.m)} kg)`);
            lift(0); tm.set(0); fTag.userData.hidden = true;
          },
          progress(p, v, c) {
            const T = p * (0.3 + 0.35 * c.t + 0.3), f = clamp((T - 0.3) / (0.35 * c.t));
            lift(f * 1.0); tm.set(f * c.t);
            fTag.setText(`F = ${fmt(c.F, 1)} N`); fTag.userData.hidden = false;
          }
        };
      }
    },

    /* ================= §46 Foydali ish koeffitsiyenti: qiya tekislikning FIK ================= */
    'qiya-tekislik-fik': {
      controls: [
        { key: 'h', label: 'Qiyalik balandligi, h (l = 0,5 m)', type: 'choice', value: 0.15, options: [0.1, 0.15, 0.25].map((v) => ({ v, label: `${fmt(v, 2)} m` })) },
        { key: 'sur', label: 'Taxta sirti', type: 'choice', value: 'yogoch', options: [{ v: 'yogoch', label: 'Yog‘och (μ ≈ 0,3)' }, { v: 'plyonka', label: 'Silliq plyonka (μ ≈ 0,1)' }] }
      ],
      compute: (v) => {
        const P = 2, l = 0.5, sn = v.h / l, cs = Math.sqrt(1 - sn * sn), mu = v.sur === 'yogoch' ? 0.3 : 0.1;
        const F = P * sn + mu * P * cs, Af = P * v.h, At = F * l;
        return { F, Af, At, eta: Af / At * 100 };
      },
      readouts: (v, c, done) => [['h', `${fmt(v.h, 2)} m`], ['Sirt', v.sur === 'yogoch' ? 'yog‘och' : 'plyonka'], ['F', done ? `${fmt(c.F, 2)} N` : '—'], ['Af = P · h', `${fmt(c.Af, 2)} J`],
        ['At = F · l', done ? `${fmt(c.At, 2)} J` : '—'], ['η = Af / At', done ? `${fmt(c.eta, 0)} %` : '—', true]],
      run: ['Brusokni tortib chiqarish', 'Tekis tortilmoqda…', 'Qayta tortish'],
      duration: () => 2.6,
      steps: [
        { text: 'h = 0,15 m, yog‘och sirt: brusokni tekis tortib chiqaring va F ni yozing', done: (s) => where(s.runs, { h: 0.15, sur: 'yogoch' }).length > 0 },
        { text: 'Qiyalikni h = 0,25 m ga oshirib, FIK ni toping', done: (s) => where(s.runs, { h: 0.25, sur: 'yogoch' }).length > 0 },
        { text: 'h = 0,15 m da taxtaga silliq plyonka qoplab, takrorlang', done: (s) => where(s.runs, { h: 0.15, sur: 'plyonka' }).length > 0 }
      ],
      cols: ['h, m', 'Sirt', 'F, N', 'Af, J', 'At, J', 'η, %'],
      row: (r) => [fmt(r.h, 2), r.sur === 'yogoch' ? 'yog‘och' : 'plyonka', fmt(r.F, 2), fmt(r.Af, 2), fmt(r.At, 2), fmt(r.eta, 0)],
      demo: [{ h: 0.15, sur: 'yogoch' }, { h: 0.25 }, { h: 0.15, sur: 'plyonka' }],
      camera: { target: [0.04, 0.2, 0.0], dir: [0.12, 0.3, 1], fitW: 1.28, fitH: 0.8, min: 1.1 },
      build(k) {
        const { V } = k;
        const X0 = -0.44;
        const ib = k.fikIncline(X0, 0, { len: 0.62 });
        const hd = k.holder(0, -0.1, { h: 0.4 });
        const bl = k.block({ name: 'Brusok (P = 2 N)' }); bl.setLoad(2);
        const dyn = newDyn(k, 'Dinamometr');
        const rl = k.ruler(0.3, { vertical: true, name: 'Chizg‘ich', width: 0.03 });
        const tg = tag(k), tgH = tag(k);
        const S0 = 0.06;
        const pose = (v, f, Fcur) => {
          bl.group.position.copy(ib.at(S0 + 0.5 * f)); bl.group.quaternion.copy(ib.quat());
          aimDyn(dyn, bl.hook(), ib.dir(), Fcur * 0.6);
        };
        return {
          update(v) {
            ib.setRise(v.h).setFilm(v.sur === 'plyonka');
            const e = ib.at(0.6, -ib.top); hd.group.position.x = e.x; hd.hold(V(e.x, e.y - 0.004, 0));
            const m = ib.at(S0 + 0.5); rl.place(m.x, 0, -0.075);
            pose(v, 0, 0); hide(tg, tgH);
          },
          progress(p, v, c) {
            const f1 = ease(clamp(p / 0.2)), f2 = ease(clamp((p - 0.25) / 0.6));
            pose(v, f2, c.F * f1);
            show(tg, `${fmt(c.F * f1, 2)} N`, dyn.group.position.clone().addScaledVector(ib.dir(), -0.1).add(V(0.02, -0.06, 0)));
            if (p >= 1) show(tgH, `h = ${fmt(v.h, 2)} m`, V(ib.at(S0 + 0.5).x + 0.13, 0.06, 0.08)); else hide(tgH);
          }
        };
      }
    }
  });
})();
