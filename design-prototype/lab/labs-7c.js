// Empira — 7-sinf Fizika labs, IV bob «Harakat qonunlari» (§18–§25). Same definition shape as labs-8.js / labs-7b.js.
// Each lab follows the textbook (Fizika 7-sinf, 2017): 58–59, 61, 66–67, 68, 75, 76, 80–86 and 87-rasm, with the book's
// numbers (g = 10 m/s²). 3D equipment comes from kit.js + kit-7.js + kit-7c.js.
(function () {
  const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',').replace('-', '−');
  const uniq = (runs, key) => new Set(runs.map((r) => String(r[key]))).size;
  const has = (runs, key, val) => runs.some((r) => String(r[key]) === String(val));
  const where = (runs, obj) => runs.filter((r) => Object.entries(obj).every(([k, v]) => String(r[k]) === String(v)));
  const ease = (p) => p * p * (3 - 2 * p);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const opt = (vals, unit, d = 0) => vals.map((v) => ({ v, label: `${fmt(v, d)} ${unit}`.trim() }));
  const g10 = 10;                                                            // the book: g = 10 m/s²
  // damped settling 0 → 1 (a spring with a load, a dynamometer)
  const settle = (t) => (t <= 0 ? 0 : 1 - Math.exp(-5 * t) * Math.cos(13 * t));
  // a world offset → the local offset inside a group that is only rotated (for labels on a turned dynamometer)
  const lp = (g, w) => w.clone().applyQuaternion(g.quaternion.clone().invert());
  const hiddenLabel = (k, minor = false) => { const l = k.label('', k.V(0, 0, 0), { minor }); l.userData.hidden = true; return l; };
  const showAt = (l, text, p) => { l.setText(text); l.position.copy(p); l.userData.hidden = false; };
  // a force/velocity arrow with its own name label (kit-7 arrow labels are not hidden by hide(): the label pass re-shows them)
  const arrowL = (k, color) => {
    const a = k.arrow(color), l = k.label('', k.V(0, 0, 0), { color: '#' + new k.THREE.Color(color).getHexString() }); l.userData.hidden = true;
    return {
      set(from, vec, text) { a.set(from, vec); const L = vec.length(); if (L < 1e-4) { l.userData.hidden = true; return; } showAt(l, text, from.clone().addScaledVector(vec.clone().normalize(), L + 0.035)); },
      hide() { a.hide(); l.userData.hidden = true; }
    };
  };

  window.EMPIRA_LABS = window.EMPIRA_LABS || {};
  Object.assign(window.EMPIRA_LABS, {

    /* ================= §18 Kuchlarni qo‘shish: aravacha, ikki blok, pallachalar, dinamometr (58–59-rasm) ================= */
    'kuchlarni-qoshish': {
      controls: [
        { key: 'F1', label: '1-pallacha kuchi, F₁', type: 'choice', value: 3, options: opt([1, 2, 3, 4], 'N') },
        { key: 'dir', label: 'F₁ ning yo‘nalishi', type: 'choice', value: 'chap', options: [{ v: 'chap', label: '← chapga' }, { v: 'ong', label: 'o‘ngga →' }] },
        { key: 'F2', label: '2-pallacha kuchi, F₂ (o‘ngga)', type: 'choice', value: 5, options: opt([1, 2, 3, 4, 5], 'N') }
      ],
      compute: (v) => {
        const f = v.dir === 'ong' ? v.F1 + v.F2 : v.F2 - v.F1;
        const M = 0.5 + (v.F1 + v.F2) / g10;                                  // aravacha 0,5 kg + yuklar (100 g = 1 N)
        return { F: Math.abs(f), sgn: Math.sign(f), a: Math.abs(f) / M };
      },
      readouts: (v, c, done) => [
        ['F₁', `${v.F1} N ${v.dir === 'ong' ? '→' : '←'}`], ['F₂', `${v.F2} N →`],
        ['D ko‘rsatishi', done ? `${fmt(c.F, 1)} N` : '—', true],
        ['Natijaviy kuch F', done ? `${c.F} N (${v.F2} ${v.dir === 'ong' ? '+' : '−'} ${v.F1})` : '—'],
        ['Aravacha', done ? (c.sgn > 0 ? 'o‘ngga yuradi' : c.sgn < 0 ? 'chapga yuradi' : 'tinch turadi') : '—', true]
      ],
      run: ['Yuklarni osish', 'Kuchlar ta’sir etmoqda…', 'Qayta tajriba'],
      duration: () => 2.6,
      steps: [
        { text: 'F₁ = 3 N chapga, F₂ = 5 N o‘ngga: dinamometr ko‘rsatishini yozing va aravacha qayoqqa yurishini kuzating', done: (s) => where(s.runs, { F1: 3, F2: 5, dir: 'chap' }).length > 0 },
        { text: 'F₁ ni ham o‘ngga yo‘naltiring (3 N va 5 N bir tomonga): natijaviy kuchni o‘lchang', done: (s) => where(s.runs, { F1: 3, F2: 5, dir: 'ong' }).length > 0 },
        { text: 'F₁ = 4 N chapga, F₂ = 4 N o‘ngga qo‘yib, aravacha muvozanatda turishini tekshiring', done: (s) => where(s.runs, { F1: 4, F2: 4, dir: 'chap' }).length > 0 }
      ],
      cols: ['F₁', 'F₂', 'D ko‘rsatishi', 'Aravacha'],
      row: (r) => [`${r.F1} N ${r.dir === 'ong' ? '→' : '←'}`, `${r.F2} N →`, `${fmt(r.F, 1)} N`, r.sgn > 0 ? 'o‘ngga' : r.sgn < 0 ? 'chapga' : 'tinch'],
      demo: [{ F1: 3, F2: 5, dir: 'chap' }, { F1: 3, F2: 5, dir: 'ong' }, { F1: 4, F2: 4, dir: 'chap' }],
      camera: { target: [-0.01, 0.24, -0.04], dir: [0.04, 0.3, 1], fitW: 1.6, fitH: 0.66, min: 1.35 },
      build(k) {
        const { V, C } = k;
        const L = 1.1, X0 = -0.55, LEGS = 0.3, R = 0.022, DROP = 0.14, LMAX = 0.12, SC = L / 2;
        const tr = k.track(X0, 0, L, { legs: LEGS });
        const TOP = tr.at(0).y;
        const c = k.cart({ name: 'Aravacha' });
        k.add(c.group, k.cyl(0.0025, 0.05, C.steel, { metalness: 0.6 }, 8), 0, 0.073, 0);   // ilgakli ustuncha (dinamometr ipi uchun)
        const PY = TOP + 0.03 - R;
        const pu1 = k.pulley(V(X0 - 0.04, PY, 0)), pu2 = k.pulley(V(X0 + L + 0.04, PY, 0));
        const pn1 = k.pan({ name: '1-pallacha' }), pn2 = k.pan({ name: '2-pallacha' });
        const th1 = k.thread(0x3A4166, { owner: pu1 }), th2 = k.thread(0x3A4166, { owner: pu2 });
        const YD = TOP + 0.098;                                               // dinamometr o‘qi = ustuncha uchi balandligi
        const dyn = k.dynamometer(V(0, YD, 0));
        const dName = k.label('Dinamometr', V(0, 0, 0), { parent: dyn.group, minor: true });
        const dRead = k.label('', V(0, 0, 0), { parent: dyn.group, color: '#B26B00', border: '#FFB21E' });
        const hd = k.holder(0, -0.12, { h: YD + 0.05 });
        const thD = k.thread(0x3A4166, { owner: dyn });
        const a1 = arrowL(k, C.blue), a2 = arrowL(k, C.blue), aF = arrowL(k, 0xE08A00);
        const res = hiddenLabel(k);
        let side = -1, P1 = null, P2 = null;
        const hookEnd = () => k.world(dyn.hook, V(0, -0.03, 0));
        // where the pulley for each force stands: F₁ on the left (chapga) or a second block on the right (o‘ngga)
        const setup = (v) => {
          const right = V(X0 + L + 0.04, PY, 0), left = V(X0 - 0.04, PY, 0);
          P1 = v.dir === 'ong' ? right.clone().setZ(0.022) : left; P2 = v.dir === 'ong' ? right.clone().setZ(-0.022) : right;
          pu1.group.position.copy(P1); pu1.group.rotation.y = v.dir === 'ong' ? 0 : Math.PI;
          pu2.group.position.copy(P2);
          pn1.label.position.set(0, v.dir === 'ong' ? -0.115 : -0.075, 0);
          pn2.label.position.set(0, -0.075, 0);
        };
        const place = (v, x, F, held, n1, n2) => {
          c.put(tr, SC + x);
          const s1 = v.dir === 'ong' ? 1 : -1;                                 // which side the F₁ thread hangs on
          const y1 = PY - DROP - s1 * x, y2 = PY - DROP - x;                    // the pan on the pulling side goes down
          const h1 = V(P1.x + s1 * R, PY, P1.z), h2 = V(P2.x + R, PY, P2.z);
          pn1.hangFrom(V(h1.x, y1, h1.z)).set(n1); pn2.hangFrom(V(h2.x, y2, h2.z)).set(n2);
          const at1 = (s1 > 0 ? c.front() : c.back()).add(V(0, 0, P1.z)), at2 = c.front().add(V(0, 0, P2.z));
          th1.set(at1, V(P1.x, PY + R, P1.z), h1, V(h1.x, y1, h1.z));
          th2.set(at2, V(P2.x, PY + R, P2.z), h2, V(h2.x, y2, h2.z));
          pu1.spin(-s1 * x / R); pu2.spin(x / R);
          // dynamometer: fixed on its stand on the side away from the pull; it reads F while it holds the cart
          dyn.set(held ? F * 0.16 : 0);
          if (held) thD.set(hookEnd(), c.top(0).add(V(0, 0.05, 0))); else thD.set(hookEnd(), hookEnd().add(V(0, -0.025, 0.004)));
        };
        const arrows = (v, cc, q) => {
          const z = V(0, 0, 0.05);
          a1.set(v.dir === 'ong' ? c.front().add(z).add(V(0, 0.02, 0)) : c.back().add(z), V(v.dir === 'ong' ? 1 : -1, 0, 0).multiplyScalar(v.F1 * 0.035 * q), `F₁ = ${v.F1} N`);
          a2.set(c.front().add(z).add(V(0, v.dir === 'ong' ? -0.016 : 0, 0)), V(v.F2 * 0.035 * q, 0, 0), `F₂ = ${v.F2} N`);
          if (cc.F > 0) aF.set(c.top(0).add(V(0, 0.15, 0)), V(cc.sgn * cc.F * 0.035 * q, 0, 0), `F = ${cc.F} N`); else aF.hide();
        };
        return {
          update(v, cc) {
            setup(v);
            side = cc.sgn < 0 ? 1 : -1;                                       // net pull to the right → dynamometer on the left
            const tx = tr.at(SC).x + side * 0.33;
            dyn.group.position.set(tx, YD, 0); dyn.group.rotation.z = side < 0 ? Math.PI / 2 : -Math.PI / 2;
            hd.group.position.x = tx; hd.hold(V(tx, YD, 0));
            dName.position.copy(lp(dyn.group, V(-side * 0.08, 0.035, 0)));
            dRead.position.copy(lp(dyn.group, V(-side * 0.08, 0.075, 0))); dRead.setText('D = 0,0 N');
            pn1.label.setText(`1-pallacha: ${v.F1} N`); pn2.label.setText(`2-pallacha: ${v.F2} N`);
            place(v, 0, 0, true, 0, 0);
            a1.hide(); a2.hide(); aF.hide(); res.userData.hidden = true;
          },
          progress(p, v, cc) {
            const T = p * 2.6;
            const q = clamp01(T / 0.9);                                          // the slotted weights go onto the pans one by one
            const n1 = Math.round(q * v.F1), n2 = Math.round(q * v.F2);
            arrows(v, cc, ease(q));
            if (T < 1.3) { place(v, 0, cc.F * ease(q), true, n1, n2); dRead.setText(`D = ${fmt(cc.F * ease(q), 1)} N`); return; }
            dRead.setText(`D = ${fmt(cc.F, 1)} N`);
            const t = T - 1.3, x = cc.sgn * Math.min(LMAX, cc.a * t * t / 2);    // released: the cart starts under the resultant force
            place(v, x, 0, false, v.F1, v.F2);
            arrows(v, cc, 1);
            if (p >= 1) showAt(res, cc.sgn === 0 ? 'Kuchlar muvozanatda: aravacha tinch turadi' : `Aravacha ${cc.sgn > 0 ? 'o‘ngga →' : '← chapga'} yurdi`, c.top(0).add(V(0, -0.13, 0.08)));
          }
        };
      }
    },

    /* ================= §19 Inersiya: qiyalikdan tushgan aravacha qum to‘siqqa kiradi (61-rasm) ================= */
    'inersiya': {
      controls: [
        { key: 'sirt', label: 'Yo‘lak sirti', type: 'choice', value: 'qalin', options: [{ v: 'qalin', label: 'Qalin qum' }, { v: 'yupqa', label: 'Yupqa qum' }, { v: 'silliq', label: 'Qumsiz' }, { v: 'yoq', label: 'Ishqalanishsiz' }] },
        { key: 'h', label: 'Qo‘yib yuborish balandligi, h', type: 'choice', value: 5, options: [{ v: 2.5, label: '2,5 sm' }, { v: 5, label: '5 sm' }] }
      ],
      compute: (v) => {
        const u0 = Math.sqrt(2 * g10 * v.h / 100);                          // qiyalik etagidagi tezlik: h = 5 sm → 1 m/s
        const s5 = { qalin: 0.10, yupqa: 0.35, silliq: 1.0, yoq: Infinity }[v.sirt];
        const stop = v.sirt !== 'yoq', s = s5 * u0 * u0;                     // to‘xtash yo‘li υ₀² ga proporsional
        return { u0, stop, s: stop ? s : 0, t: stop ? 2 * s / u0 : 0 };
      },
      readouts: (v, c, done) => [
        ['Sirt', { qalin: 'qalin qum', yupqa: 'yupqa qum', silliq: 'qumsiz', yoq: 'ishqalanishsiz' }[v.sirt]], ['h', `${fmt(v.h, v.h % 1 ? 1 : 0)} sm`],
        ['υ₀', done ? `${fmt(c.u0, 2)} m/s` : '—'],
        ['s (to‘xtash yo‘li)', done ? (c.stop ? `${fmt(c.s, 2)} m` : 'to‘xtamaydi') : '—', true],
        ['t (to‘xtash vaqti)', done ? (c.stop ? `${fmt(c.t, 2)} s` : '∞') : '—', true],
        ['Harakat', done ? (c.stop ? 'sekinlashib to‘xtadi' : `tekis: 1 s da ${fmt(c.u0, 1)} m`) : '—']
      ],
      run: ['Aravachani qo‘yib yuborish', 'Aravacha harakatlanmoqda…', 'Qayta qo‘yib yuborish'],
      duration: (v, c) => Math.sqrt(2 * 0.18 / (c.u0 * c.u0 / (2 * 0.18))) + (c.stop ? c.t : 1 / c.u0) + 0.35,
      steps: [
        { text: 'Qalin qum sepilgan yo‘lakda aravachani h = 5 sm dan qo‘yib yuboring: to‘xtash yo‘lini o‘lchang', done: (s) => where(s.runs, { sirt: 'qalin', h: 5 }).length > 0 },
        { text: 'Qumni yupqa qiling, so‘ng butunlay olib tashlang: ikki holatda ham s ni o‘lchang', done: (s) => where(s.runs, { sirt: 'yupqa', h: 5 }).length > 0 && where(s.runs, { sirt: 'silliq', h: 5 }).length > 0 },
        { text: '«Ishqalanishsiz» sirtni tanlang: aravacha 1 s da qancha yo‘l o‘tishini va to‘xtash-to‘xtamasligini kuzating', done: (s) => has(s.runs, 'sirt', 'yoq') }
      ],
      cols: ['Sirt', 'h', 's', 't', 'Harakat'],
      row: (r) => [{ qalin: 'qalin qum', yupqa: 'yupqa qum', silliq: 'qumsiz', yoq: 'ishqalanishsiz' }[r.sirt], `${fmt(r.h, r.h % 1 ? 1 : 0)} sm`, r.stop ? `${fmt(r.s, 2)} m` : '—', r.stop ? `${fmt(r.t, 2)} s` : '—', r.stop ? 'to‘xtadi' : 'tekis harakat'],
      demo: [{ sirt: 'qalin', h: 5 }, { sirt: 'yupqa', h: 5 }, { sirt: 'silliq', h: 5 }, { sirt: 'yoq', h: 5 }],
      camera: { target: [0.02, 0.05, -0.06], dir: [0.04, 0.5, 1], fitW: 1.6, fitH: 0.5, min: 1.4 },
      build(k) {
        const { V, C } = k;
        const RL = 0.3, FL = 1.05, XJ = -0.36, F0 = 0.12, DI = RL - F0;     // ramp, flat, junction x; cart front starts 0.18 m above the foot
        const ramp = k.track(XJ - RL, 0, RL, { ticks: false });
        const tr = k.track(XJ, 0, FL);
        const sand = k.sandStrip(tr, 0, FL);
        const c = k.cart({ name: 'Aravacha' });
        const tm = k.timer(0.45, -0.22, { name: 'Sekundomer', digits: 2 });
        const stopM = k.add(tr.inner, k.box(0.004, 0.028, 0.085, C.amber), 0, tr.top + 0.014, 0); stopM.visible = false;
        const zero = k.add(tr.inner, k.box(0.004, 0.02, 0.085, 0x2E7D5B), 0.002, tr.top + 0.01, 0);
        const tag = hiddenLabel(k);
        let ti = 0, ai = 0;
        const put = (front) => {                                              // front: distance of the cart's front from the ramp top
          const ctr = front - 0.05;
          if (ctr <= RL) c.put(ramp, ctr); else c.put(tr, ctr - RL);
        };
        return {
          update(v, cc) {
            const H = v.h / 100 * RL / DI;                                     // ramp lift so that the cart drops h before the flat part
            ramp.setTilt(H);
            ramp.group.position.x = XJ - RL * Math.cos(Math.asin(H / RL));
            ai = cc.u0 * cc.u0 / (2 * DI); ti = Math.sqrt(2 * DI / ai);
            sand.set(v.sirt); put(F0); tm.set(0); stopM.visible = false; tag.userData.hidden = true;
          },
          progress(p, v, cc) {
            const T = p * (ti + (cc.stop ? cc.t : 1 / cc.u0) + 0.35);
            if (T < ti) { put(F0 + ai * T * T / 2); tm.set(0); return; }
            const tEnd = cc.stop ? cc.t : 1 / cc.u0, t = Math.min(T - ti, tEnd);
            const dec = cc.stop ? cc.u0 / cc.t : 0, x = cc.u0 * t - dec * t * t / 2;
            put(RL + x); tm.set(t);
            if (p >= 1) {
              stopM.position.x = x; stopM.visible = true;
              showAt(tag, cc.stop ? `s = ${fmt(cc.s, 2)} m` : `1 s da ${fmt(cc.u0, 1)} m: υ = const`, tr.at(Math.min(x, 0.85), -0.01).add(V(0, 0, 0.1)));
            }
          }
        };
      }
    },

    /* ================= §20 Jism massasi: elastik plastinka itargan ikki aravacha (66–67-rasm) ================= */
    'aravachalar-inertligi': {
      controls: [{ key: 'yuk', label: 'II aravachadagi yuk', type: 'choice', value: 0, options: [{ v: 0, label: 'yuksiz' }, { v: 0.5, label: '0,5 kg' }, { v: 1, label: '1,0 kg' }] }],
      compute: (v) => {
        const m1 = 0.5, m2 = 0.5 + v.yuk, E = 0.08;                          // plastinka energiyasi: yuksizda 0,40 m/s dan
        const u1 = Math.sqrt(2 * E / (m1 * (1 + m1 / m2))), u2 = u1 * m1 / m2;  // m₁υ₁ = m₂υ₂
        return { m1, m2, s1: u1 * 1, s2: u2 * 1, r: u1 / u2 };
      },
      readouts: (v, c, done) => [
        ['m₁', `${fmt(c.m1, 1)} kg`], ['m₂', `${fmt(c.m2, 1)} kg`],
        ['s₁ (1 s da)', done ? `${fmt(c.s1, 2)} m` : '—'], ['s₂ (1 s da)', done ? `${fmt(c.s2, 2)} m` : '—'],
        ['s₁ / s₂ = a₁ / a₂', done ? fmt(c.r, 1) : '—', true], ['m₂ / m₁', fmt(c.m2 / c.m1, 1), true]
      ],
      run: ['Ipni kesish', 'Aravachalar harakatlanmoqda…', 'Qayta tajriba'],
      duration: () => 1.75,
      steps: [
        { text: 'Yuksiz aravachalar orasidagi ipni kesing: 1 s da bosib o‘tilgan yo‘llarni o‘lchang', done: (s) => has(s.runs, 'yuk', 0) },
        { text: 'II aravachaga 0,5 kg yuk qo‘yib, tajribani takrorlang', done: (s) => has(s.runs, 'yuk', 0.5) },
        { text: 'Yukni 1,0 kg ga yetkazing: s₁ / s₂ ni m₂ / m₁ bilan solishtiring', done: (s) => has(s.runs, 'yuk', 1) }
      ],
      cols: ['m₂', 's₁', 's₂', 's₁ / s₂', 'm₂ / m₁'],
      row: (r) => [`${fmt(r.m2, 1)} kg`, `${fmt(r.s1, 2)} m`, `${fmt(r.s2, 2)} m`, fmt(r.r, 1), fmt(r.m2 / r.m1, 1)],
      demo: [{ yuk: 0 }, { yuk: 0.5 }, { yuk: 1 }],
      camera: { target: [0.0, 0.05, -0.02], dir: [0.03, 0.5, 1], fitW: 1.42, fitH: 0.46, min: 1.25 },
      build(k) {
        const { V, C } = k;
        const L = 1.3, X0 = -0.65, MID = 0.65;
        const tr = k.track(X0, 0, L);
        const c1 = k.cart({ name: 'I aravacha' }), c2 = k.cart({ name: 'II aravacha', color: 0x2B3A78 });
        c1.label.position.x = -0.035; c2.label.position.x = 0.035;
        const pl = k.elasticPlate(); c1.carry(pl, V(0.05, 0.048, 0));
        const th = k.thread(0x3A4166, { owner: pl });
        const wt = k.weights(0.42, 0.17, 2, { name: 'Yuklar', mass: '0,5 kg' });
        const tm = k.timer(0.02, -0.42, { name: 'Sekundomer', digits: 2 });
        const mk = (color) => { const m = k.add(tr.inner, k.box(0.004, 0.024, 0.085, color), 0, tr.top + 0.012, 0); m.visible = false; return m; };
        const m0 = mk(0x2E7D5B), m1 = mk(C.amber), m2 = mk(C.amber);
        const t1 = hiddenLabel(k), t2 = hiddenLabel(k);
        const S1 = MID - 0.056, S2 = MID + 0.057;                          // cart centres: I front and II back meet at MID
        const put = (x1, x2, bend) => { c1.put(tr, S1 - x1); c2.put(tr, S2 + x2); pl.set(bend); };
        return {
          update(v) {
            c2.setLoad(Math.round(v.yuk / 0.5), 0xB89A4A); wt.set(2 - Math.round(v.yuk / 0.5));
            put(0, 0, 1); th.set(pl.tip(), pl.peg()); tm.set(0);
            m0.position.x = MID; m0.visible = true; m1.visible = m2.visible = false; t1.userData.hidden = t2.userData.hidden = true;
          },
          progress(p, v, cc) {
            const T = p * 1.75, t = Math.min(1, Math.max(0, T - 0.4));        // the thread is cut at 0,4 s of the run
            if (T < 0.4) { put(0, 0, 1); th.set(pl.tip(), pl.peg()); tm.set(0); return; }
            th.hide();
            const kick = clamp01(t / 0.06);                                    // the plate straightens in a few hundredths of a second
            put(cc.s1 * t, cc.s2 * t, 1 - ease(kick));
            tm.set(t);
            if (p >= 1) {
              m1.position.x = MID - cc.s1; m2.position.x = MID + cc.s2; m1.visible = m2.visible = true;
              showAt(t1, `s₁ = ${fmt(cc.s1, 2)} m`, tr.at(MID - cc.s1 / 2, -0.01).add(V(0, 0, 0.09)));
              showAt(t2, `s₂ = ${fmt(cc.s2, 2)} m`, tr.at(MID + cc.s2 / 2, -0.01).add(V(0, 0, 0.09)));
            }
          }
        };
      }
    },

    /* ================= §21 Nyutonning ikkinchi qonuni: dinamometrli aravacha, g‘altak, pallacha (68-rasm) ================= */
    'nyuton-ikkinchi-qonuni': {
      controls: [
        { key: 'F', label: 'Kuch (dinamometr), F', type: 'choice', value: 0.1, options: opt([0.1, 0.2, 0.3], 'N', 1) },
        { key: 'm', label: 'Aravacha massasi, m', type: 'choice', value: 1, options: [{ v: 1, label: '1 kg' }, { v: 2, label: '2 kg' }, { v: 3, label: '3 kg' }] }
      ],
      compute: (v) => { const a0 = v.F / v.m, t = Math.sqrt(2 * 1 / a0); return { t, a: 2 * 1 / (t * t), Fm: v.F / v.m }; },
      readouts: (v, c, done) => [['F', `${fmt(v.F, 1)} N`], ['m', `${v.m} kg`], ['s', '1 m'], ['t', done ? `${fmt(c.t, 2)} s` : '—', true], ['a = 2s / t²', done ? `${fmt(c.a, 3)} m/s²` : '—', true], ['F / m', done ? `${fmt(c.Fm, 3)} m/s²` : '—']],
      run: ['Aravachani qo‘yib yuborish', 'Aravacha harakatlanmoqda…', 'Qayta qo‘yib yuborish'],
      duration: (v, c) => 0.3 + Math.min(c.t, 3.6) + 0.4,
      steps: [
        { text: 'F = 0,1 N, m = 1 kg: aravacha 1 m ni o‘tish vaqtini o‘lchang va a = 2s / t² ni hisoblang', done: (s) => where(s.runs, { F: 0.1, m: 1 }).length > 0 },
        { text: 'm = 1 kg da kuchni 0,2 N va 0,3 N ga oshirib, tezlanishlarni solishtiring', done: (s) => where(s.runs, { F: 0.2, m: 1 }).length > 0 && where(s.runs, { F: 0.3, m: 1 }).length > 0 },
        { text: 'F = 0,1 N da massani 2 kg va 3 kg ga oshiring (ustiga aravacha to‘ntarib qo‘ying)', done: (s) => where(s.runs, { F: 0.1, m: 2 }).length > 0 && where(s.runs, { F: 0.1, m: 3 }).length > 0 }
      ],
      cols: ['F', 'm', 't', 'a', 'F / m'],
      row: (r) => [`${fmt(r.F, 1)} N`, `${r.m} kg`, `${fmt(r.t, 2)} s`, `${fmt(r.a, 3)} m/s²`, `${fmt(r.Fm, 3)} m/s²`],
      demo: [{ F: 0.1, m: 1 }, { F: 0.2, m: 1 }, { F: 0.3, m: 1 }, { F: 0.1, m: 2 }, { F: 0.1, m: 3 }],
      camera: { target: [0.01, 1.09, -0.04], dir: [0.04, 0.4, 1], fitW: 1.84, fitH: 0.5, min: 1.55 },
      build(k) {
        const { V, C } = k;
        const H = 1.06, L = 1.45, X0 = -0.75, CL = 0.14, S0 = 0.09, R = 0.022;
        k.bench(X0 - 0.03, X0 + L + 0.09, 0, H, 0.36);
        const tr = k.track(X0, 0, L, { y: H });
        const TOP = tr.at(0).y;
        const c = k.cart({ name: 'Aravacha (1 kg)', len: CL });
        const c2 = k.cart({ name: '', len: CL }), c3 = k.cart({ name: '', len: CL });
        c.label.position.x = -0.03;
        const dyn = k.dynamometer(V(0, 0, 0));
        c.group.add(dyn.group); dyn.group.position.set(CL / 2 + 0.014, 0.036, 0); dyn.group.rotation.z = Math.PI / 2;
        const dRead = k.label('', lp(dyn.group, V(0.1, 0.045, 0)), { parent: dyn.group, color: '#B26B00', border: '#FFB21E' });
        const PX = X0 + L + 0.045, PY = TOP + 0.036 - R;
        const pu = k.pulley(V(PX, PY, 0));
        const pn = k.pan({ name: 'Pallacha P' });
        const th = k.thread(0x3A4166, { owner: pu });
        const tm = k.timer(-0.2, -0.13, { name: 'Sekundomer', digits: 2 }); tm.group.position.y = H;
        const line = (s, color) => k.add(tr.inner, k.box(0.004, 0.022, 0.085, color), s, tr.top + 0.011, 0);
        line(S0 + CL / 2, 0x2E7D5B); line(S0 + CL / 2 + 1, C.amber);
        k.label('start', tr.local(S0 + CL / 2, -0.02).add(V(0, 0, 0.1)), { parent: tr.inner, minor: true });
        k.label('finish (1 m)', tr.local(S0 + CL / 2 + 1, -0.02).add(V(0, 0, 0.1)), { parent: tr.inner, minor: true });
        const aF = arrowL(k, C.blue);
        const lapse = hiddenLabel(k, true);
        const hookEnd = () => k.world(dyn.hook, V(0, -0.03, 0));
        const stack = (m) => {                                                // extra 1 kg carts upside down on top, the rest wait on the bench
          [c2, c3].forEach((x, i) => {
            if (i < m - 1) { x.group.rotation.set(Math.PI, 0, 0); x.place(c.group.position.x, TOP + 0.048 + 0.044 + i * 0.056, 0); }
            else { x.group.rotation.set(0, 0, 0); x.place(X0 + 0.25 + i * 0.2, H, -0.13); }
          });
        };
        const place = (v, s, F) => {
          c.put(tr, S0 + s); stack(v.m);
          dyn.set(F * 4); c.group.updateMatrixWorld(true);
          const he = hookEnd(), drop = he.distanceTo(V(PX, PY + R, 0));
          const yP = PY - 0.04 - s;                                              // the pan reaches the floor when the cart crosses the finish
          pn.hangFrom(V(PX + R, yP + 0.0, 0)); th.set(he, V(PX, PY + R, 0), V(PX + R, PY, 0), V(PX + R, yP, 0));
          pu.spin(s / R);
          return drop;
        };
        return {
          update(v) {
            pn.set(Math.round(v.F * 10)); place(v, 0, v.F); tm.set(0);
            dRead.setText(`D = ${fmt(v.F, 2)} N`); aF.hide(); lapse.userData.hidden = true;
          },
          progress(p, v, cc) {
            const D = Math.min(cc.t, 3.6), tt = clamp01((p * (0.3 + D + 0.4) - 0.3) / D) * cc.t;   // real time (time-lapse for long runs)
            const s = cc.a * tt * tt / 2;
            place(v, s, v.F); tm.set(tt);
            aF.set(c.top(-0.06).add(V(0, 0.11 + (v.m - 1) * 0.056, 0)), V(0.1 + v.F * 0.3, 0, 0), 'F');
            if (cc.t > 3.6 && p < 1) showAt(lapse, `Tezlashtirilgan ko‘rinish (×${fmt(cc.t / 3.6, 1)}), sekundomer real vaqtni ko‘rsatadi`, V(0.02, H + 0.3, -0.12));
            else lapse.userData.hidden = true;
          }
        };
      }
    },

    /* ================= §22 Nyutonning uchinchi qonuni: magnitli va temirli aravachalar, ikki dinamometr (75-rasm) ================= */
    'tasir-aks-tasir': {
      controls: [
        { key: 'd', label: 'Magnit va temir orasidagi masofa, d', type: 'choice', value: 3, options: opt([3, 2, 1], 'sm') },
        { key: 'yuk', label: 'II aravachadagi yuk', type: 'choice', value: 0, options: [{ v: 0, label: 'yuksiz' }, { v: 1, label: '1 kg' }] }
      ],
      compute: (v) => { const F = { 3: 0.3, 2: 0.6, 1: 1.5 }[v.d]; return { F1: F, F2: F }; },
      readouts: (v, c, done) => [['d', `${v.d} sm`], ['II aravachadagi yuk', v.yuk ? '1 kg' : 'yo‘q'], ['F₁ (1-dinamometr)', done ? `${fmt(c.F1, 1)} N` : '—', true], ['F₂ (2-dinamometr)', done ? `${fmt(c.F2, 1)} N` : '—', true], ['|F₁ − F₂|', done ? `${fmt(Math.abs(c.F1 - c.F2), 1)} N` : '—']],
      run: ['Aravachalarni qo‘yib yuborish', 'Magnit temirni tortmoqda…', 'Qayta tajriba'],
      duration: () => 2.0,
      steps: [
        { text: 'd = 3 sm: aravachalar muvozanatga kelgach, ikkala dinamometrni o‘qing', done: (s) => where(s.runs, { d: 3, yuk: 0 }).length > 0 },
        { text: 'Masofani 1 sm gacha kamaytiring: kuchlar o‘zgaradimi, tengligicha qoladimi?', done: (s) => where(s.runs, { d: 1, yuk: 0 }).length > 0 },
        { text: 'II aravachaga 1 kg yuk qo‘yib (d = 1 sm), yana o‘lchang', done: (s) => where(s.runs, { d: 1, yuk: 1 }).length > 0 }
      ],
      cols: ['d', 'Yuk (II)', 'F₁', 'F₂', '|F₁ − F₂|'],
      row: (r) => [`${r.d} sm`, r.yuk ? '1 kg' : '—', `${fmt(r.F1, 1)} N`, `${fmt(r.F2, 1)} N`, `${fmt(Math.abs(r.F1 - r.F2), 1)} N`],
      demo: [{ d: 3, yuk: 0 }, { d: 1, yuk: 0 }, { d: 1, yuk: 1 }],
      camera: { target: [0.0, 0.06, -0.04], dir: [0.03, 0.5, 1], fitW: 1.12, fitH: 0.4, min: 1.0 },
      build(k) {
        const { V, C } = k;
        const L = 1.0, X0 = -0.5, YD = 0.05;
        const tr = k.track(X0, 0, L);
        const c1 = k.magnetCart(), c2 = k.ironCart();
        const load = k.add(c2.group, k.cyl(0.017, 0.03, 0xB89A4A, { metalness: 0.7, roughness: 0.3 }), 0.022, 0.063, 0); load.visible = false;
        const loadL = k.label('1 kg', V(0.03, 0.1, 0.03), { parent: c2.group, minor: true });
        const d1 = k.dynamometer(V(0, YD, 0)), d2 = k.dynamometer(V(0, YD, 0));
        d1.group.rotation.z = Math.PI / 2; d2.group.rotation.z = -Math.PI / 2;
        const h1 = k.holder(0, -0.1, { h: 0.16 }), h2 = k.holder(0, -0.1, { h: 0.16 });
        k.label('1-dinamometr', lp(d1.group, V(0.09, 0.035, 0)), { parent: d1.group, minor: true });
        k.label('2-dinamometr', lp(d2.group, V(-0.09, 0.035, 0)), { parent: d2.group, minor: true });
        const r1 = k.label('', lp(d1.group, V(0.09, 0.07, 0)), { parent: d1.group, color: '#B26B00', border: '#FFB21E' });
        const r2 = k.label('', lp(d2.group, V(-0.09, 0.07, 0)), { parent: d2.group, color: '#B26B00', border: '#FFB21E' });
        const t1 = k.thread(0x3A4166, { owner: d1 }), t2 = k.thread(0x3A4166, { owner: d2 });
        const a1 = k.arrow(C.blue), a2 = k.arrow(C.blue);
        const l1 = hiddenLabel(k), l2 = hiddenLabel(k), gap = hiddenLabel(k, true);
        const SM = L / 2, ST = (F) => F * 0.75 * 0.06;                     // dynamometer stretch for a force (0–2 N scale)
        let x1 = 0, x2 = 0;
        const place = (v, F, q) => {
          const s = ST(F) * q, sF = ST(F);
          c1.put(tr, SM - v.d / 200 - 0.06 - (sF - s)); c2.put(tr, SM + v.d / 200 + 0.06 + (sF - s));
          d1.set(F * 0.75 * q); d2.set(F * 0.75 * q);
          const e1 = k.world(d1.hook, V(0, -0.03, 0)), e2 = k.world(d2.hook, V(0, -0.03, 0));
          t1.set(e1, c1.back()); t2.set(e2, c2.front());
          r1.setText(`F₁ = ${fmt(F * q, 1)} N`); r2.setText(`F₂ = ${fmt(F * q, 1)} N`);
        };
        return {
          update(v, cc) {
            // stands are set so that the carts stop with the gap d when the dynamometers read F
            const sF = ST(cc.F1);
            x1 = tr.at(SM - v.d / 200 - 0.12).x - 0.012 - 0.02 - 0.185 - sF; x2 = tr.at(SM + v.d / 200 + 0.12).x + 0.012 + 0.02 + 0.185 + sF;
            d1.group.position.set(x1, YD, 0); d2.group.position.set(x2, YD, 0);
            h1.group.position.x = x1; h1.hold(V(x1, YD, 0)); h2.group.position.x = x2; h2.hold(V(x2, YD, 0));
            load.visible = v.yuk > 0; loadL.visible = v.yuk > 0; loadL.userData.hidden = !(v.yuk > 0);
            place(v, cc.F1, 0); a1.hide(); a2.hide(); l1.userData.hidden = l2.userData.hidden = gap.userData.hidden = true;
          },
          progress(p, v, cc) {
            const q = ease(clamp01(p / 0.6));
            place(v, cc.F1, q);
            if (q > 0.05) {
              a1.set(c1.top(-0.01).add(V(0, -0.018, 0.04)), V(cc.F1 * 0.04 * q, 0, 0)); a2.set(c2.top(0.01).add(V(0, -0.018, 0.04)), V(-cc.F2 * 0.04 * q, 0, 0));
              showAt(l1, 'F₁', c1.top(-0.03).add(V(0, -0.075, 0.06))); showAt(l2, 'F₂', c2.top(0.03).add(V(0, -0.075, 0.06)));
            }
            if (p >= 1) showAt(gap, `d = ${v.d} sm`, tr.at(SM, -0.03).add(V(0, 0, 0.08)));
          }
        };
      }
    },

    /* ================= §23 Markazga intilma kuch: aylanayotgan sterjendagi sharcha va dinamometr (76-rasm) ================= */
    'markazga-intilma-kuch': {
      controls: [
        { key: 'm', label: 'Sharcha massasi, m', type: 'choice', value: 100, options: opt([50, 100, 200], 'g') },
        { key: 'R', label: 'Aylanish radiusi, R', type: 'choice', value: 0.25, options: opt([0.25, 0.5], 'm', 2) },
        { key: 'n', label: 'Aylanishlar soni, n', type: 'choice', value: 1, options: [{ v: 1, label: '1 ayl/s' }, { v: 1.5, label: '1,5 ayl/s' }, { v: 2, label: '2 ayl/s' }] }
      ],
      compute: (v) => {
        const T = 1 / v.n, u = 2 * Math.PI * v.R / T, ai = u * u / v.R;
        return { t4: 4 * T, T, u, ai, F: v.m / 1000 * ai };
      },
      readouts: (v, c, done) => [['m', `${v.m} g`], ['R', `${fmt(v.R, 2)} m`], ['T = t₄ / 4', done ? `${fmt(c.T, 2)} s` : '—'], ['υ = 2πR / T', done ? `${fmt(c.u, 2)} m/s` : '—', true], ['Fᵢ = mυ² / R', done ? `${fmt(c.F, 2)} N` : '—', true], ['Dinamometr', done ? `${fmt(c.F, 1)} N` : '—', true]],
      run: ['Mashinani aylantirish', 'Aylanmoqda…', 'Qayta aylantirish'],
      duration: (v, c) => 0.25 + c.t4 + 0.15,
      steps: [
        { text: 'm = 100 g, R = 0,25 m, n = 1 ayl/s: 4 ta aylanish vaqtini va dinamometr ko‘rsatishini o‘lchang', done: (s) => where(s.runs, { m: 100, R: 0.25, n: 1 }).length > 0 },
        { text: 'Aylanishlar sonini 2 ayl/s ga oshiring: tezlik 2 marta ortganda kuch necha marta ortadi?', done: (s) => where(s.runs, { m: 100, R: 0.25, n: 2 }).length > 0 },
        { text: 'n = 1 ayl/s da sharchani 200 g ga almashtiring yoki radiusni 0,5 m qiling: kuchni solishtiring', done: (s) => where(s.runs, { m: 200, n: 1 }).length > 0 || where(s.runs, { m: 100, R: 0.5, n: 1 }).length > 0 }
      ],
      cols: ['m', 'R', 't₄', 'υ', 'aᵢ', 'Fᵢ'],
      row: (r) => [`${r.m} g`, `${fmt(r.R, 2)} m`, `${fmt(r.t4, 2)} s`, `${fmt(r.u, 2)} m/s`, `${fmt(r.ai, 1)} m/s²`, `${fmt(r.F, 2)} N`],
      demo: [{ m: 100, R: 0.25, n: 1 }, { m: 100, R: 0.25, n: 2 }, { m: 200, R: 0.25, n: 1 }],
      camera: { target: [0.06, 0.12, 0.02], dir: [0.0, 1.2, 1], fitW: 1.25, fitH: 0.92, min: 1.05 },
      build(k) {
        const { V, C } = k;
        const sm = k.spinMachine(0, 0, { rod: 0.58 });
        const b = k.ball(0.0145, {});
        const dyn = k.dynamometer(V(0, 0, 0));
        sm.rotor.add(b.group); sm.rotor.add(dyn.group);
        dyn.group.position.set(0.02, 0.016, 0); dyn.group.rotation.z = Math.PI / 2; dyn.group.scale.setScalar(0.75);
        const th = k.thread(0x3A4166, { owner: dyn });
        const tm = k.timer(0.42, -0.42, { name: 'Sekundomer (4 aylanish)', digits: 2 });
        const aF = arrowL(k, C.blue), aU = arrowL(k, 0x2E7D5B);
        const fLab = hiddenLabel(k), nLab = hiddenLabel(k, true);
        let r = 0.0145;
        const WR = (n, tau) => (tau < 0.25 ? n * tau * tau / 0.5 : n * (tau - 0.125));   // turns done (spin-up in 0,25 s)
        const pose = (v, cc, turns, F) => {
          sm.set(-Math.PI / 4 - turns * 2 * Math.PI);                          // clockwise seen from above
          b.group.position.set(v.R, -r, 0);
          dyn.set(F * 0.06);
          sm.rotor.updateMatrixWorld(true);
          const he = k.world(dyn.hook, V(0, -0.03, 0)), bc = k.world(b.group, V(0, 0.0145, 0));
          const tip = bc.clone().add(he.clone().sub(bc).setLength(r));
          th.set(he, tip);
          return bc;
        };
        let t0 = 0;
        return {
          update(v, cc) {
            r = 0.0145 * Math.cbrt(v.m / 100); b.group.scale.setScalar(r / 0.0145);
            t0 = WR(v.n, 0.25 + cc.t4 + 0.15);
            pose(v, cc, -t0, 0); sm.setKnob(v.n); tm.set(0);
            aF.hide(); aU.hide(); fLab.userData.hidden = true; nLab.userData.hidden = true;
          },
          progress(p, v, cc) {
            const tau = p * (0.25 + cc.t4 + 0.15), sp = Math.min(1, tau / 0.25);
            const turns = WR(v.n, tau) - t0;                                    // ends with the ball at the front right
            const F = cc.F * sp * sp;
            const bc = pose(v, cc, turns, F);
            const tMeas = Math.max(0, Math.min(cc.t4, tau - 0.25));
            tm.set(tMeas);
            const toC = V(-bc.x, 0, -bc.z).normalize();                           // towards the axis
            const tang = V(toC.z, 0, -toC.x);                                     // velocity along the circle (clockwise seen from above)
            aF.set(bc.clone().add(toC.clone().multiplyScalar(r + 0.005)).add(V(0, 0.03, 0)), toC.clone().multiplyScalar(0.05 + cc.F * 0.025 * sp * sp), 'Fᵢ');
            aU.set(bc.clone().add(V(0, 0.03, 0)), tang.multiplyScalar(0.05 + cc.u * 0.025 * sp), 'υ');
            showAt(nLab, `Aylanishlar: ${Math.min(4, Math.floor(tMeas * v.n + 1e-6))}`, V(-0.4, 0.2, -0.3));
            showAt(fLab, `Dinamometr: ${fmt(F, 1)} N`, V(-0.02, 0.3, -0.06));
          }
        };
      }
    },

    /* ================= §24 Guk qonuni: shtativdagi prujina, millimetrli chizg‘ich, 100 g li yuklar (80–86-rasm) ================= */
    'guk-qonuni': {
      controls: [{ key: 'm', label: 'Osilgan yuk massasi, m', type: 'choice', value: 100, options: opt([100, 200, 300], 'g') }],
      compute: (v) => {
        const F = v.m / 1000 * g10, LIM = 2.3;                                 // elastiklik chegarasi 2,3 N (86-rasm)
        const dl = F <= LIM ? F : 3.5, rest = F <= LIM ? 0 : 0.4;              // k = 100 N/m: 1 N → 1 sm; 3 N da proporsionallik buziladi
        return { F, dl, l: 10 + dl, after: 10 + rest, k: F / (dl / 100), plastic: F > LIM };
      },
      readouts: (v, c, done) => [['m', `${v.m} g`], ['Fₜ = mg', `${fmt(c.F, 1)} N`], ['l', done ? `${fmt(c.l, 1)} sm` : '—'], ['Δl = l − l₀', done ? `${fmt(c.dl, 1)} sm` : '—', true], ['Fₜ / Δl', done ? `${fmt(c.k, 0)} N/m` : '—'], ['Yuk olingach l', done ? `${fmt(c.after, 1)} sm` : '—', true]],
      run: ['Yukni osish va olish', 'Prujina cho‘zilmoqda…', 'Qayta osish'],
      duration: () => 3.2,
      steps: [
        { text: '100 g yuk osing: uzayishni o‘lchang va yuk olingach prujina 10,0 sm ga qaytishini tekshiring', done: (s) => has(s.runs, 'm', 100) },
        { text: '200 g yuk osing: kuch 2 marta ortganda uzayish ham 2 marta ortadimi?', done: (s) => has(s.runs, 'm', 200) },
        { text: '300 g yuk osing (Fₜ > 2,3 N): Δl ni va yuk olingandan keyingi uzunlikni o‘lchang', done: (s) => has(s.runs, 'm', 300) }
      ],
      cols: ['m', 'Fₜ', 'l', 'Δl', 'Fₜ / Δl', 'Yuk olingach', 'Deformatsiya'],
      row: (r) => [`${r.m} g`, `${fmt(r.F, 1)} N`, `${fmt(r.l, 1)} sm`, `${fmt(r.dl, 1)} sm`, `${fmt(r.k, 0)} N/m`, `${fmt(r.after, 1)} sm`, r.plastic ? 'plastik' : 'elastik'],
      demo: [{ m: 100 }, { m: 200 }, { m: 300 }],
      camera: { target: [0.06, 0.25, -0.02], dir: [0.18, 0.22, 1], fitW: 0.66, fitH: 0.7, min: 0.8 },
      build(k) {
        const { V, C } = k;
        const st = k.stand(-0.02, 0, 0.47, 0.16);
        const top = st.tip.clone();
        const sp = k.spring(top, { l0: 0.1, name: 'Prujina', turns: 18, r: 0.01 });
        sp.label.position.set(-0.06, -0.05, 0);
        const rl = k.millimetreRuler(20); rl.place(top.x + 0.05, top.y, top.z - 0.004);
        const l0M = k.add(rl.group, k.box(0.03, 0.0016, 0.002, 0x2E7D5B), 0, -0.1, 0.003);
        const lM = k.add(rl.group, k.box(0.03, 0.0016, 0.002, C.amber), 0, -0.13, 0.0032); lM.visible = false;
        const wt = k.weights(0.24, -0.04, 3, { name: 'Yuklar', mass: '100 g' });
        const hw = [0, 1, 2].map(() => { const g = k.hookWeight(0xB89A4A, 0.03, 0.011); g.visible = false; return g; });
        const lTag = hiddenLabel(k), aTag = hiddenLabel(k), warn = hiddenLabel(k, true);
        const hang = (n, len) => {
          sp.set(len);
          const e = sp.end();
          hw.forEach((g, i) => { g.visible = i < n; g.position.set(e.x, e.y + 0.006 - i * 0.036, e.z); });
          wt.set(3 - n);
        };
        return {
          update() { hang(0, 0.1); lM.visible = false; lTag.userData.hidden = aTag.userData.hidden = warn.userData.hidden = true; },
          progress(p, v, cc) {
            const T = p * 3.2, n = v.m / 100;
            if (T < 1.6) {                                                      // the load hangs: the spring stretches and settles
              hang(n, 0.1 + cc.dl / 100 * settle(T - 0.15));
              if (T > 1.0) { lM.position.y = -cc.l / 100; lM.visible = true; showAt(lTag, `l = ${fmt(cc.l, 1)} sm`, V(top.x - 0.11, top.y - cc.l / 100, top.z)); }
              aTag.userData.hidden = true; return;
            }
            const back = 0.1 + cc.dl / 100 - (cc.dl - (cc.after - 10)) / 100 * settle(T - 1.7);   // load taken off at 1,7 s
            hang(T < 1.7 ? n : 0, T < 1.7 ? 0.1 + cc.dl / 100 : back);
            if (T > 2.6) showAt(aTag, `Yuk olingach: ${fmt(cc.after, 1)} sm`, V(top.x + 0.19, top.y - cc.after / 100 - 0.025, top.z));
            if (cc.plastic && T > 2.6) showAt(warn, 'Elastiklik chegarasi (2,3 N) oshdi: qoldiq deformatsiya', V(top.x + 0.1, top.y - 0.3, top.z + 0.02));
          }
        };
      }
    },

    /* ================= §25 2-laboratoriya ishi: prujina bikirligini aniqlash (87-rasm) ================= */
    'prujina-bikirligi': {
      controls: [{ key: 'm', label: 'Yuk massasi', type: 'choice', value: 100, options: [{ v: 100, label: 'm₁ = 100 g' }, { v: 200, label: 'm₂ = 200 g' }, { v: 300, label: 'm₃ = 300 g' }] }],
      compute: (v) => {
        const F = v.m / 1000 * g10;                                            // Fₜ = mg, g = 10 m/s²
        const dl = { 100: 2.4, 200: 5.1, 300: 7.5 }[v.m];                     // millimetrli qog‘ozdan o‘qilgan (±1 mm)
        return { F, dl, k: F / (dl / 100) };
      },
      readouts: (v, c, done, runs) => {
        const out = [['m', `${fmt(v.m / 1000, 1)} kg`], ['Fₜ = mg', `${fmt(c.F, 1)} N`], ['Δl', done ? `${fmt(c.dl, 1)} sm = ${fmt(c.dl / 100, 3)} m` : '—', true], ['k = Fₜ / Δl', done ? `${fmt(c.k, 1)} N/m` : '—', true]];
        if (uniq(runs, 'm') >= 3) {
          const ks = [100, 200, 300].map((m) => runs.filter((r) => r.m === m).pop().k);
          const avg = ks.reduce((x, y) => x + y, 0) / 3, dav = ks.reduce((x, y) => x + Math.abs(avg - y), 0) / 3;
          out.push(['kₒ‘ᵣₜ', `${fmt(avg, 1)} N/m`, true], ['Δkₒ‘ᵣₜ', `${fmt(dav, 1)} N/m`], ['ε', `${fmt(dav / avg * 100, 1)} %`, true]);
        }
        return out;
      },
      run: ['Yukni ilish', 'Prujina cho‘zilmoqda…', 'Qayta ilish'],
      duration: () => 2.2,
      steps: [
        { text: 'Ko‘rsatkichning boshlang‘ich vaziyatini belgilang, ilgakka m₁ = 100 g yukni iling: Δl₁ ni o‘lchang, Fₜ₁ = m₁g va k₁ = Fₜ₁ / Δl₁ ni toping', done: (s) => has(s.runs, 'm', 100) },
        { text: 'm₂ = 200 g yuk uchun Δl₂ ni o‘lchang va k₂ ni hisoblang', done: (s) => has(s.runs, 'm', 200) },
        { text: 'm₃ = 300 g yuk uchun Δl₃ va k₃ ni toping; so‘ng kₒ‘ᵣₜ = (k₁ + k₂ + k₃) / 3, Δkₒ‘ᵣₜ va ε = Δkₒ‘ᵣₜ / kₒ‘ᵣₜ · 100 % ni hisoblang', done: (s) => has(s.runs, 'm', 300) }
      ],
      cols: ['m', 'Fₜ', 'Δl', 'k'],
      row: (r) => [`${fmt(r.m / 1000, 1)} kg`, `${fmt(r.F, 1)} N`, `${fmt(r.dl / 100, 3)} m`, `${fmt(r.k, 1)} N/m`],
      demo: [{ m: 100 }, { m: 200 }, { m: 300 }],
      camera: { target: [0.06, 0.25, -0.02], dir: [0.2, 0.22, 1], fitW: 0.64, fitH: 0.7, min: 0.8 },
      build(k) {
        const { V } = k;
        const st = k.stand(-0.02, 0, 0.47, 0.15);
        const top = st.tip.clone();
        const L0 = 0.06;
        const dn = k.paperDynamometer(top, { l0: L0, cm: 10 });
        const wt = k.weights(0.24, -0.04, 3, { name: 'Yuklar', mass: '100 g' });
        const hw = [0, 1, 2].map(() => { const g = k.hookWeight(0xB89A4A, 0.03, 0.011); g.visible = false; return g; });
        const tag = hiddenLabel(k);
        const hang = (n, len) => {
          dn.set(len);
          const e = dn.end();
          hw.forEach((g, i) => { g.visible = i < n; g.position.set(e.x, e.y + 0.006 - i * 0.036, e.z); });
          wt.set(3 - n);
        };
        return {
          update() { hang(0, L0); dn.mark(0, L0); dn.mark(1, null); tag.userData.hidden = true; },
          progress(p, v, cc) {
            const T = p * 2.2, n = v.m / 100;
            hang(n, L0 + cc.dl / 100 * settle(T - 0.15));
            if (T > 1.5) { dn.mark(1, L0 + cc.dl / 100); showAt(tag, `Δl = ${fmt(cc.dl, 1)} sm`, V(top.x + 0.16, top.y - 0.02 - L0 - cc.dl / 200, top.z)); }
          }
        };
      }
    }
  });
})();
