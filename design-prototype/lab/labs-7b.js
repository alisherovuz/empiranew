// Empira — 7-sinf Fizika labs, II bob «To‘g‘ri chiziqli harakat» (§5–§14). Same definition shape as labs-8.js.
// Each lab follows the textbook (Fizika 7-sinf, 2017): its own experiment where the book has one (24, 25, 33, 41, 43-rasm),
// otherwise a classroom experiment that agrees with the book's numbers. 3D equipment comes from kit.js + kit-7.js.
(function () {
  const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',').replace('-', '−');
  const uniq = (runs, key) => new Set(runs.map((r) => String(r[key]))).size;
  const has = (runs, key, val) => runs.some((r) => String(r[key]) === String(val));
  const where = (runs, obj) => runs.filter((r) => Object.entries(obj).every(([k, v]) => String(r[k]) === String(v)));
  const ease = (p) => p * p * (3 - 2 * p);
  const G = 9.8;
  const opt = (vals, unit, d = 0) => vals.map((v) => ({ v, label: `${fmt(v, d)} ${unit}`.trim() }));
  const spd = (u) => `${String(u).replace('.', ',')} m/s`;
  const SPEEDS = [0.125, 0.25, 0.5].map((v) => ({ v, label: spd(v) }));

  window.EMPIRA_LABS = window.EMPIRA_LABS || {};
  Object.assign(window.EMPIRA_LABS, {

    /* ================= §5 Tekis va notekis harakat: tomizg‘ichli aravacha (24–25-rasm) ================= */
    'tomizgichli-aravacha': {
      controls: [{ key: 'm', label: 'Osilgan yuk massasi, m', type: 'choice', value: 20, options: opt([20, 30, 50], 'g') }],
      compute: (v) => {
        const a = Math.max(0, (v.m / 1000 * G - 0.196) / (0.5 + v.m / 1000)), T = 0.4, u0 = 0.2;
        const ds = [0, 1, 2].map((i) => (u0 * T + a * T * T * (i + 0.5)) * 100);
        return { a, d1: ds[0], d2: ds[1], d3: ds[2], uni: Math.abs(ds[2] - ds[0]) < 0.05 };
      },
      readouts: (v, c, done) => [['m', `${v.m} g`], ['Δs₁', done ? `${fmt(c.d1)} sm` : '—'], ['Δs₂', done ? `${fmt(c.d2)} sm` : '—'], ['Δs₃', done ? `${fmt(c.d3)} sm` : '—'],
        ['Harakat', done ? (c.uni ? 'tekis' : 'notekis') : '—', true]],
      run: ['Aravachani turtib yuborish', 'Aravacha harakatlanmoqda…', 'Qayta turtib yuborish'],
      duration: () => 1.25,
      steps: [
        { text: '20 g yuk osib, tomchilar orasidagi masofalarni o‘lchang', done: (s) => has(s.runs, 'm', 20) },
        { text: 'Yukni 30 g ga oshirib, tajribani takrorlang', done: (s) => has(s.runs, 'm', 30) },
        { text: '50 g yuk bilan o‘lchab, qaysi holda harakat tekis ekanini aniqlang', done: (s) => has(s.runs, 'm', 50) }
      ],
      cols: ['m', 'Δs₁', 'Δs₂', 'Δs₃', 'Harakat'],
      row: (r) => [`${r.m} g`, `${fmt(r.d1)} sm`, `${fmt(r.d2)} sm`, `${fmt(r.d3)} sm`, r.uni ? 'tekis' : 'notekis'],
      demo: [{ m: 20 }, { m: 30 }, { m: 50 }],
      camera: { target: [0.1, 0.66, 0], dir: [0.12, 0.42, 1], fitW: 1.5, fitH: 0.75, min: 1.35 },
      build(k) {
        const { V } = k;
        k.bench(-0.72, 0.625, 0, 0.75);
        const tr = k.track(-0.62, 0, 1.2, { y: 0.75 });
        const c = k.cart({ name: 'Aravacha' });
        const dr = k.dropper(); c.carry(dr, V(-0.025, 0.048, 0));
        const top = tr.at(1.2);
        const pu = k.pulley(V(top.x + 0.04, top.y + 0.03 - 0.022, 0));
        const pn = k.pan({ name: 'Yuk' });
        const th = k.thread(0x3A4166, { owner: pu });
        const sp = k.spots(tr);
        const tags = [0, 1, 2].map(() => { const l = k.label('', V(0, 0, 0), { minor: true }); l.userData.hidden = true; return l; });
        const T = 0.4, s0 = 0.12, u0 = 0.2;
        let a = 0;
        const place = (t) => {
          const s = s0 + u0 * t + a * t * t / 2;
          c.put(tr, s);
          const drop = pu.outSide.y - 0.05 - (s - s0);
          pn.hangFrom(V(pu.outSide.x, drop, 0));
          th.set(c.front(), pu.inTop, pu.outSide, V(pu.outSide.x, drop, 0));
          pu.spin((s - s0) / pu.r);
          return s;
        };
        return {
          update(v, cc) { a = cc.a; pn.set(v.m / 10); sp.clear(); tags.forEach((l) => { l.userData.hidden = true; }); place(0); dr.drip(0); },
          progress(p, v, cc) {
            const t = p * 1.25, s = place(t);
            while (sp.count < 4 && t >= sp.count * T - 1e-6) sp.add(s0 + u0 * sp.count * T + a * (sp.count * T) ** 2 / 2 - 0.025);
            const ph = (t % T) / T; dr.drip(ph < 0.25 ? 1 - ph * 4 : 0);
            if (p >= 1) {
              const pos = [0, 1, 2, 3].map((i) => s0 - 0.025 + u0 * i * T + a * (i * T) ** 2 / 2);
              [cc.d1, cc.d2, cc.d3].forEach((d, i) => { const l = tags[i]; l.setText(`${fmt(d)} sm`); l.position.copy(tr.at((pos[i] + pos[i + 1]) / 2, 0.035)); l.userData.hidden = false; });
            }
          }
        };
      }
    },

    /* ================= §6 Tekis harakat tezligi: suvli naydagi havo pufagi ================= */
    'havo-pufagi': {
      controls: [
        { key: 'al', label: 'Nayning qiyaligi, α', type: 'choice', value: 30, options: opt([15, 30, 45], '°') },
        { key: 's', label: 'O‘lchanadigan yo‘l, s', type: 'choice', value: 20, options: opt([20, 40, 60], 'sm') }
      ],
      compute: (v) => { const u = { 15: 1.5, 30: 2.5, 45: 3.0 }[v.al]; return { u, t: v.s / u }; },
      readouts: (v, c, done) => [['α', `${v.al}°`], ['s', `${v.s} sm`], ['t', done ? `${fmt(c.t)} s` : '—', true], ['υ = s / t', done ? `${fmt(c.u)} sm/s` : '—', true]],
      run: ['Pufakni kuzatish', 'Pufak ko‘tarilmoqda…', 'Qayta kuzatish'],
      duration: (v, c) => 1 + c.t / 8,
      steps: [
        { text: 'α = 30° da pufakning 20 sm yo‘lni o‘tish vaqtini o‘lchang', done: (s) => where(s.runs, { al: 30, s: 20 }).length > 0 },
        { text: 'Shu qiyalikda 40 va 60 sm uchun o‘lchab, υ = s / t ni solishtiring', done: (s) => where(s.runs, { al: 30, s: 40 }).length > 0 && where(s.runs, { al: 30, s: 60 }).length > 0 },
        { text: 'Qiyalikni 45° ga o‘zgartirib, tezlikni toping', done: (s) => has(s.runs, 'al', 45) }
      ],
      cols: ['α', 's', 't', 'υ'],
      row: (r) => [`${r.al}°`, `${r.s} sm`, `${fmt(r.t)} s`, `${fmt(r.u)} sm/s`],
      demo: [{ al: 30, s: 20 }, { al: 30, s: 40 }, { al: 30, s: 60 }, { al: 45, s: 60 }],
      camera: { target: [0.02, 0.26, -0.05], dir: [0.12, 0.38, 1], fitW: 1.15, fitH: 0.8, min: 1.1 },
      build(k) {
        const { V } = k;
        const tube = k.bubbleTube(-0.42, 0, 1.0);
        const tm = k.timer(0.36, -0.2, { name: 'Sekundomer', digits: 1 });
        const mk = (color) => { const m = k.add(tube.pivot, k.box(0.006, 0.04, 0.04, color), 0, 0, 0); return m; };
        const startM = mk(0x2E7D5B), endM = mk(k.C.amber);
        const START = 0.1;
        return {
          update(v) { tube.setAngle(v.al); tube.setBubble(START - 0.05); tm.set(0); startM.position.x = 0.03 + START; endM.position.x = 0.03 + START + v.s / 100; },
          progress(p, v, c) {
            const T = p * (c.t + 2.0), t = T - 2.0;                            // the bubble passes the start mark at t = 0
            tube.setBubble(START + (c.u / 100) * t);
            tm.set(Math.max(0, Math.min(c.t, t)));
          }
        };
      }
    },

    /* ================= §7 Tekis harakat grafigi: ikki aravachaning yo‘l grafigi ================= */
    'yol-grafigi': {
      controls: [
        { key: 'u1', label: '1-aravacha tezligi, υ₁', type: 'choice', value: 0.125, options: SPEEDS },
        { key: 'u2', label: '2-aravacha tezligi, υ₂', type: 'choice', value: 0.25, options: SPEEDS }
      ],
      compute: (v) => ({ t1: 1 / v.u1, t2: 1 / v.u2 }),
      readouts: (v, c, done) => [['υ₁', spd(v.u1)], ['υ₂', spd(v.u2)], ['t₁ (1 m)', done ? `${fmt(c.t1)} s` : '—', true], ['t₂ (1 m)', done ? `${fmt(c.t2)} s` : '—', true]],
      run: ['Aravachalarni yurgizish', 'Aravachalar yurmoqda…', 'Qayta yurgizish'],
      duration: (v, c) => Math.min(5, Math.max(c.t1, c.t2)),
      steps: [
        { text: 'Ikkala aravachani yurgizib, 1 m ni o‘tish vaqtini o‘lchang', done: (s) => s.runs.length > 0 },
        { text: 'Tezliklar har xil bo‘lsin: grafiklarning qiyaligini solishtiring', done: (s) => s.runs.some((r) => r.u1 !== r.u2) },
        { text: 'Uchinchi tezlikni ham sinab ko‘ring', done: (s) => new Set(s.runs.flatMap((r) => [r.u1, r.u2])).size >= 3 }
      ],
      cols: ['υ₁', 'υ₂', 't₁ (1 m)', 't₂ (1 m)'],
      row: (r) => [spd(r.u1), spd(r.u2), `${fmt(r.t1)} s`, `${fmt(r.t2)} s`],
      demo: [{ u1: 0.125, u2: 0.25 }, { u1: 0.5, u2: 0.25 }],
      camera: { target: [0.0, 0.17, -0.05], dir: [0.05, 0.42, 1], fitW: 1.3, fitH: 0.6, min: 1.15 },
      build(k) {
        const { V } = k;
        const t1 = k.track(-0.62, 0.06, 1.15), t2 = k.track(-0.62, -0.07, 1.15);
        const c1 = k.cart({ name: '1', motor: true, color: 0x1C2347 }), c2 = k.cart({ name: '2', motor: true, color: 0x3B4CFF });
        const ch = k.chartBoard(0.05, 0.1, -0.24, { w: 0.62, h: 0.36, xMax: 8, yMax: 1, xStep: 1, yStep: 0.25, xLabel: 't, s', yLabel: 's, m', name: 'Yo‘l grafigi s(t)' });
        const tm = k.timer(0.5, -0.24, { digits: 1 });
        const S0 = 0.07;
        const line = (u, t, color, name) => { const tt = Math.min(t, 1 / u); const dots = [0.25, 0.5, 0.75, 1].filter((s) => s / u <= t + 1e-6).map((s) => [s / u, s]); return { color, pts: [[0, 0], [tt, u * tt]], dots, name }; };
        return {
          update() { c1.put(t1, S0); c2.put(t2, S0); ch.clear(); tm.set(0); },
          progress(p, v, c) {
            const T = p * Math.max(c.t1, c.t2);
            c1.put(t1, S0 + Math.min(1, v.u1 * T)); c2.put(t2, S0 + Math.min(1, v.u2 * T));
            ch.set([line(v.u1, T, '#1C2347', '1'), line(v.u2, T, '#3B4CFF', '2')]);
            tm.set(T);
          }
        };
      }
    },

    /* ================= §8 Notekis harakatda tezlik: o‘rtacha va oniy tezlik (fotodatchik) ================= */
    'oniy-tezlik': {
      controls: [
        { key: 'A', label: 'Datchik joyi (startdan), A', type: 'choice', value: 0.5, options: opt([0.25, 0.5, 0.75], 'm', 2) },
        { key: 'w', label: 'Bayroqcha kengligi, Δs', type: 'choice', value: 10, options: opt([10, 5, 1], 'sm') }
      ],
      compute: (v) => {
        const a = 0.4, L = 1, t = Math.sqrt(2 * L / a), w = v.w / 100;
        const dt = Math.sqrt(2 * (v.A + w) / a) - Math.sqrt(2 * v.A / a);
        return { t, uavg: L / t, dt, ui: w / dt, utrue: Math.sqrt(2 * a * v.A) };
      },
      readouts: (v, c, done) => [['A', `${fmt(v.A, 2)} m`], ['Δs', `${v.w} sm`], ['Δt', done ? `${fmt(c.dt, 3)} s` : '—'], ['υ ≈ Δs / Δt', done ? `${fmt(c.ui, 2)} m/s` : '—', true], ['υₒ‘ᵣₜ (1 m)', done ? `${fmt(c.uavg, 2)} m/s` : '—', true]],
      run: ['Aravachani qo‘yib yuborish', 'Aravacha tushmoqda…', 'Qayta qo‘yib yuborish'],
      duration: (v, c) => c.t + 0.15,
      steps: [
        { text: 'Aravachani qo‘yib yuborib, 1 m dagi o‘rtacha tezlikni toping', done: (s) => s.runs.length > 0 },
        { text: 'A = 0,5 m da 10, 5 va 1 sm li bayroqchalar bilan Δt ni o‘lchang', done: (s) => uniq(where(s.runs, { A: 0.5 }), 'w') >= 3 },
        { text: '1 sm li bayroqcha bilan datchikni 0,25 m va 0,75 m ga qo‘yib o‘lchang', done: (s) => where(s.runs, { A: 0.25, w: 1 }).length > 0 && where(s.runs, { A: 0.75, w: 1 }).length > 0 }
      ],
      cols: ['A', 'Δs', 'Δt', 'υ', 'υₒ‘ᵣₜ'],
      row: (r) => [`${fmt(r.A, 2)} m`, `${r.w} sm`, `${fmt(r.dt, 3)} s`, `${fmt(r.ui, 2)} m/s`, `${fmt(r.uavg, 2)} m/s`],
      demo: [{ A: 0.5, w: 10 }, { A: 0.5, w: 5 }, { A: 0.5, w: 1 }, { A: 0.25, w: 1 }, { A: 0.75, w: 1 }],
      camera: { target: [0.0, 0.08, -0.05], dir: [0.32, 0.5, 1], fitW: 1.3, fitH: 0.55, min: 1.15 },
      build(k) {
        const { V } = k;
        const tr = k.track(-0.6, 0, 1.2).setTilt(0.048);
        const c = k.cart({ name: 'Aravacha' });
        const flag = k.add(c.group, k.box(0.1, 0.03, 0.003, k.C.amber, { roughness: 0.5 }), 0, 0.064, 0);
        const g = k.photogate();
        const tmA = k.timer(0.12, -0.2, { name: 'Δt (datchik)', digits: 3 }), tmL = k.timer(0.36, -0.2, { name: 't (1 m)', digits: 2 });
        const S0 = 0.08;                                                    // flag front edge at the start line
        const markStart = k.add(tr.inner, k.box(0.004, 0.006, 0.07, 0x2E7D5B), 0, tr.top, 0), markEnd = k.add(tr.inner, k.box(0.004, 0.006, 0.07, 0x2E7D5B), 0, tr.top, 0);
        let w = 0.1;
        const put = (front) => c.put(tr, S0 + front - 0.05);
        return {
          update(v) { w = v.w / 100; flag.scale.x = w / 0.1; flag.position.x = 0.05 - w / 2; put(0); g.put(tr, S0 + v.A); g.cut(false); tmA.set(0); tmL.set(0); markStart.position.x = S0; markEnd.position.x = S0 + 1; },
          progress(p, v, c2) {
            const t = Math.min(c2.t, p * (c2.t + 0.15)), front = 0.4 * t * t / 2;
            put(front);
            const inBeam = front >= v.A && front - w < v.A; g.cut(inBeam);
            const t1 = Math.sqrt(2 * v.A / 0.4);
            tmA.set(t < t1 ? 0 : Math.min(c2.dt, t - t1), 's'); tmL.set(t);
          }
        };
      }
    },

    /* ================= §9 Tezlanish: qiya tekislikdagi tomizg‘ichli aravacha (33-rasm) ================= */
    'qiya-aravacha-tezlanish': {
      controls: [{ key: 'h', label: 'Taxta uchining balandligi, h', type: 'choice', value: 4, options: opt([2, 3, 4], 'sm') }],
      compute: (v) => {
        const a = v.h / 10, T = 0.5;                                        // a = g·h / L, L = 1 m (g ≈ 10 m/s²)
        const x = [0, 1, 2, 3, 4].map((i) => a * (i * T) ** 2 / 2 * 100);
        const ds = [1, 2, 3, 4].map((i) => x[i] - x[i - 1]);
        return { a, ds, dd: ds[1] - ds[0], du: (ds[1] - ds[0]) / T };
      },
      readouts: (v, c, done) => [['h', `${v.h} sm`], ['Oraliqlar', done ? `${c.ds.map((d) => fmt(d)).join('; ')} sm` : '—'], ['Δ(Δs)', done ? `${fmt(c.dd)} sm` : '—'], ['Δυ (0,5 s da)', done ? `${fmt(c.du, 0)} sm/s` : '—'], ['a', done ? `${fmt(c.a, 1)} m/s²` : '—', true]],
      run: ['Aravachani qo‘yib yuborish', 'Aravacha tushmoqda…', 'Qayta qo‘yib yuborish'],
      duration: () => 2.15,
      steps: [
        { text: 'h = 4 sm da tomchilar orasidagi masofalarni o‘lchang', done: (s) => has(s.runs, 'h', 4) },
        { text: 'Qiyalikni h = 2 sm ga kamaytirib, takrorlang', done: (s) => has(s.runs, 'h', 2) },
        { text: 'h = 3 sm da o‘lchab, tezlanishlarni solishtiring', done: (s) => has(s.runs, 'h', 3) }
      ],
      cols: ['h', 'Δs₁', 'Δs₂', 'Δs₃', 'Δs₄', 'a'],
      row: (r) => [`${r.h} sm`, ...r.ds.map((d) => `${fmt(d)} sm`), `${fmt(r.a, 1)} m/s²`],
      demo: [{ h: 4 }, { h: 2 }, { h: 3 }],
      camera: { target: [0.0, 0.08, 0], dir: [0.1, 0.5, 1], fitW: 1.15, fitH: 0.42, min: 1.05 },
      build(k) {
        const { V } = k;
        const tr = k.track(-0.55, 0, 1.05);
        const c = k.cart({ name: 'Aravacha' });
        const dr = k.dropper(); c.carry(dr, V(-0.025, 0.048, 0));
        const sp = k.spots(tr);
        const S0 = 0.08, T = 0.5;
        let a = 0.4;
        return {
          update(v, cc) { a = cc.a; tr.setTilt(v.h / 100); sp.clear(); c.put(tr, S0); dr.drip(0); },
          progress(p) {
            const t = Math.min(2.0, p * 2.15), s = S0 + a * t * t / 2;
            c.put(tr, s);
            while (sp.count < 5 && t >= sp.count * T - 1e-6) sp.add(S0 - 0.025 + a * (sp.count * T) ** 2 / 2);
            const ph = (t % T) / T; dr.drip(ph < 0.25 ? 1 - ph * 4 : 0);
          }
        };
      }
    },

    /* ================= §10 Tekis o‘zgaruvchan harakat tezligi: qiyalikka itarilgan aravacha ================= */
    'itarilgan-aravacha': {
      controls: [
        { key: 'u0', label: 'Boshlang‘ich tezlik, υ₀', type: 'choice', value: 0.8, options: opt([0.4, 0.6, 0.8], 'm/s', 1) },
        { key: 'sa', label: 'Yo‘lka qiyaligi, sin α', type: 'choice', value: 0.1, options: [{ v: 0.05, label: '0,05' }, { v: 0.1, label: '0,10' }] }
      ],
      compute: (v) => { const a = -G * v.sa, t0 = v.u0 / -a; return { a, t0, u02: v.u0 + a * 0.2, d: v.u0 * v.u0 / (2 * -a) }; },
      readouts: (v, c, done) => [['υ₀', `${fmt(v.u0, 1)} m/s`], ['sin α', fmt(v.sa, 2)], ['υ (0,2 s da)', done ? `${fmt(c.u02, 2)} m/s` : '—'], ['a = (υ − υ₀) / t', done ? `${fmt(c.a, 2)} m/s²` : '—', true], ['To‘xtash vaqti t₀', done ? `${fmt(c.t0, 2)} s` : '—', true]],
      run: ['Aravachani itarish', 'Aravacha harakatlanmoqda…', 'Qayta itarish'],
      duration: (v, c) => 2 * c.t0 + 0.2,
      steps: [
        { text: 'sin α = 0,10 da aravachani υ₀ = 0,8 m/s bilan itaring', done: (s) => where(s.runs, { sa: 0.1, u0: 0.8 }).length > 0 },
        { text: 'Boshqa υ₀ bilan takrorlang: a o‘zgarmasligini tekshiring', done: (s) => uniq(where(s.runs, { sa: 0.1 }), 'u0') >= 2 },
        { text: 'Qiyalikni 0,05 ga kamaytirib, to‘xtash vaqtini o‘lchang', done: (s) => has(s.runs, 'sa', 0.05) }
      ],
      cols: ['υ₀', 'sin α', 'υ (0,2 s)', 'a', 't₀'],
      row: (r) => [`${fmt(r.u0, 1)} m/s`, fmt(r.sa, 2), `${fmt(r.u02, 2)} m/s`, `${fmt(r.a, 2)} m/s²`, `${fmt(r.t0, 2)} s`],
      demo: [{ u0: 0.8, sa: 0.1 }, { u0: 0.6, sa: 0.1 }, { u0: 0.6, sa: 0.05 }],
      camera: { target: [0.05, 0.16, -0.06], dir: [0.1, 0.42, 1], fitW: 1.3, fitH: 0.62, min: 1.15 },
      build(k) {
        const { V } = k;
        const L = 1.0;
        const tr = k.track(-0.55, 0.04, L);
        const c = k.cart({ name: 'Aravacha' });
        const ms = k.motionSensor();
        const ch = k.chartBoard(0.0, 0.12, -0.22, { w: 0.6, h: 0.34, xMax: 3.5, yMax: 1, yMin: -1, xStep: 0.5, yStep: 0.5, xLabel: 't, s', yLabel: 'υ, m/s', name: 'Tezlik grafigi υ(t)' });
        const SB = L - 0.1;                                                   // start near the low end, pushed up (s decreases)
        return {
          update(v) { tr.setTilt(v.sa * L); c.put(tr, SB); ms.put(tr, L + 0.04); ch.clear(); },
          progress(p, v, cc) {
            const t = p * (2 * cc.t0 + 0.2), tt = Math.min(t, 2 * cc.t0);
            const x = v.u0 * tt + cc.a * tt * tt / 2;                          // distance up the slope
            c.put(tr, SB - x);
            const pts = []; for (let i = 0; i <= 40; i++) { const q = tt * i / 40; pts.push([q, v.u0 + cc.a * q]); }
            const dots = [0, 0.2, 0.4, 0.6].filter((q) => q <= tt).map((q) => [q, v.u0 + cc.a * q]);
            ch.set([{ color: '#3B4CFF', pts, dots, name: `υ₀ = ${fmt(v.u0, 1)}` }]);
          }
        };
      }
    },

    /* ================= §11 Bosib o‘tilgan yo‘l: Galiley novi, s ~ t² ================= */
    'galiley-novi': {
      controls: [{ key: 'h', label: 'Nov uchining balandligi, h', type: 'choice', value: 2, options: opt([1, 2, 3], 'sm') }],
      compute: (v) => { const a = v.h * 0.05; const s = [1, 2, 3, 4].map((t) => a * t * t / 2 * 100); return { a, s }; },
      readouts: (v, c, done) => [['h', `${v.h} sm`], ['s (1, 2, 3, 4 s)', done ? `${c.s.map((x) => fmt(x)).join('; ')} sm` : '—'], ['s₁ : s₂ : s₃ : s₄', done ? '1 : 4 : 9 : 16' : '—', true], ['a = 2s₁ / t²', done ? `${fmt(c.a, 2)} m/s²` : '—', true]],
      run: ['Sharchani qo‘yib yuborish', 'Sharcha dumalamoqda…', 'Qayta qo‘yib yuborish'],
      duration: () => 4.1,
      steps: [
        { text: 'h = 2 sm da 4 ta metronom zarbasidagi belgilarni o‘lchang', done: (s) => has(s.runs, 'h', 2) },
        { text: 'Qiyalikni o‘zgartirib, s₂ / s₁ = 4 va s₃ / s₁ = 9 ekanini tekshiring', done: (s) => uniq(s.runs, 'h') >= 2 },
        { text: 'Uchinchi qiyalikda o‘lchab, tezlanishlarni solishtiring', done: (s) => uniq(s.runs, 'h') >= 3 }
      ],
      cols: ['h', 's₁', 's₂', 's₃', 's₄', 'a'],
      row: (r) => [`${r.h} sm`, ...r.s.map((x) => `${fmt(x)} sm`), `${fmt(r.a, 2)} m/s²`],
      demo: [{ h: 2 }, { h: 3 }, { h: 1 }],
      camera: { target: [0.0, 0.06, -0.02], dir: [0.1, 0.62, 1], fitW: 1.42, fitH: 0.5, min: 1.25 },
      build(k) {
        const { V } = k;
        const ch = k.chute(-0.66, 0, 1.32);
        const b = k.ball(0.012, { name: 'Sharcha' });
        const mt = k.metronome(0.5, -0.16);
        const sp = k.spots(ch, 0xFFB21E);
        const tags = [0, 1, 2, 3].map(() => { const l = k.label('', V(0, 0, 0), { minor: true }); l.userData.hidden = true; return l; });
        const S0 = 0.04;
        let a = 0.1;
        return {
          update(v, c) { a = c.a; ch.setTilt(v.h / 100); b.onRail(ch, S0); sp.clear(); tags.forEach((l) => { l.userData.hidden = true; }); mt.set(0); },
          progress(p, v, c) {
            const t = Math.min(4, p * 4.1), s = S0 + a * t * t / 2;
            b.onRail(ch, s); mt.set(t);
            while (sp.count < 4 && t >= sp.count + 1 - 1e-6) { const i = sp.count; sp.add(S0 + a * (i + 1) ** 2 / 2); tags[i].setText(`${i + 1} s: ${fmt(c.s[i])} sm`); tags[i].position.copy(ch.at(S0 + a * (i + 1) ** 2 / 2, 0.045 + (i % 2) * 0.03)); tags[i].userData.hidden = false; }
          }
        };
      }
    },

    /* ================= §12 1-laboratoriya ishi: qiya novdagi sharcha tezlanishi (41-rasm) ================= */
    'sharcha-tezlanishi': {
      controls: [
        { key: 'h', label: 'Novning qiyaligi (1 m ga), h', type: 'choice', value: 10, options: opt([5, 10, 15], 'sm') },
        { key: 's', label: 'Silindrgacha yo‘l, s', type: 'choice', value: 1, options: [{ v: 0.6, label: '0,60 m' }, { v: 0.8, label: '0,80 m' }, { v: 1, label: '1,00 m' }] },
        { key: 'n', label: 'O‘lchash', type: 'choice', value: 1, options: [{ v: 1, label: '1-marta' }, { v: 2, label: '2-marta' }, { v: 3, label: '3-marta' }] }
      ],
      compute: (v) => {
        const at = { 5: 0.272, 10: 0.544, 15: 0.817 }[v.h];                 // a ≈ g·h / 1,8 (dumalayotgan sharcha)
        const t = Math.sqrt(2 * v.s / at) + [0, -0.04, 0.03, 0][v.n];          // qo‘lda bosilgan sekundomer: ±0,05 s
        return { t, a: 2 * v.s / (t * t) };
      },
      readouts: (v, c, done, runs) => {
        const out = [['h', `${v.h} sm`], ['s', `${fmt(v.s, 2)} m`], ['t', done ? `${fmt(c.t, 2)} s` : '—', true], ['a = 2s / t²', done ? `${fmt(c.a, 3)} m/s²` : '—', true]];
        const same = where(runs, { h: v.h, s: v.s });
        if (uniq(same, 'n') >= 3) {
          const set = [1, 2, 3].map((n) => same.filter((r) => r.n === n).pop().a);
          const avg = set.reduce((x, y) => x + y, 0) / 3, dav = set.reduce((x, y) => x + Math.abs(avg - y), 0) / 3;
          out.push(['aₒ‘ᵣₜ', `${fmt(avg, 3)} m/s²`, true], ['ε', `${fmt(dav / avg * 100, 1)} %`]);
        }
        return out;
      },
      run: ['Sharchani qo‘yib yuborish', 'Sharcha dumalamoqda…', 'Qayta qo‘yib yuborish'],
      duration: (v, c) => c.t + 0.25,
      steps: [
        { text: 'h = 10 sm, s = 1 m: vaqtni 3 marta o‘lchang (1-, 2-, 3-marta)', done: (s) => uniq(where(s.runs, { h: 10, s: 1 }), 'n') >= 3 },
        { text: 'Novni 5 sm qiyalikka qo‘yib, 3 marta o‘lchang', done: (s) => [0.6, 0.8, 1].some((x) => uniq(where(s.runs, { h: 5, s: x }), 'n') >= 3) },
        { text: '15 sm qiyalikda 3 marta o‘lchab, aₒ‘ᵣₜ larni solishtiring', done: (s) => [0.6, 0.8, 1].some((x) => uniq(where(s.runs, { h: 15, s: x }), 'n') >= 3) }
      ],
      cols: ['h', 's', 'O‘lchash', 't', 'a'],
      row: (r) => [`${r.h} sm`, `${fmt(r.s, 2)} m`, `${r.n}-marta`, `${fmt(r.t, 2)} s`, `${fmt(r.a, 3)} m/s²`],
      demo: [1, 2, 3].map((n) => ({ h: 10, s: 1, n })).concat([1, 2, 3].map((n) => ({ h: 5, s: 1, n })), [1, 2, 3].map((n) => ({ h: 15, s: 1, n }))),
      camera: { target: [0.0, 0.1, -0.04], dir: [0.18, 0.45, 1], fitW: 1.25, fitH: 0.5, min: 1.1 },
      build(k) {
        const { V } = k;
        const ch = k.chute(-0.56, 0, 1.12);
        const st = k.holder(-0.53, -0.1);
        const b = k.ball(0.011, { name: 'Po‘lat sharcha' });
        const cy = k.stopCylinder();
        const tm = k.timer(0.3, -0.2, { name: 'Sekundomer', digits: 2 });
        const S0 = 0.04;
        return {
          update(v) { ch.setTilt(v.h / 100 * 1.12); st.hold(ch.at(0.03)); b.onRail(ch, S0); cy.put(ch, S0 + v.s + 0.03); tm.set(0); },
          progress(p, v, c) {
            const t = Math.min(c.t, p * (c.t + 0.25)), s = S0 + Math.min(v.s, v.s * (t / c.t) ** 2);
            b.onRail(ch, s); tm.set(t);
          }
        };
      }
    },

    /* ================= §13 Erkin tushish: Nyuton nayi (43-rasm) ================= */
    'nyuton-nayi': {
      controls: [{ key: 'air', label: 'Naydagi havo', type: 'choice', value: 'bor', options: [{ v: 'bor', label: 'Havo bor' }, { v: 'qisman', label: 'Qisman so‘rilgan' }, { v: 'yoq', label: 'Havo so‘rilgan' }] }],
      compute: (v) => { const tb = Math.sqrt(2 * 1 / G); const tf = { bor: 1.8, qisman: 0.8, yoq: tb }[v.air]; return { tb, tf, dt: tf - tb, lvl: { bor: 0, qisman: 0.55, yoq: 1 }[v.air] }; },
      readouts: (v, c, done) => [['Havo', { bor: 'bor', qisman: 'qisman', yoq: 'yo‘q' }[v.air]], ['t (sharcha)', done ? `${fmt(c.tb, 2)} s` : '—', true], ['t (pat)', done ? `${fmt(c.tf, 2)} s` : '—', true], ['Farq', done ? (c.dt < 0.01 ? 'bir vaqtda' : `${fmt(c.dt, 2)} s`) : '—']],
      run: ['Nayni to‘ntarish', 'Jismlar tushmoqda…', 'Qayta to‘ntarish'],
      duration: (v, c) => 0.6 + c.tf + 0.3,
      steps: [
        { text: 'Havo bor nayni to‘ntarib, sharcha va pat tushish vaqtini o‘lchang', done: (s) => has(s.runs, 'air', 'bor') },
        { text: 'Havoni qisman so‘rib olib, takrorlang', done: (s) => has(s.runs, 'air', 'qisman') },
        { text: 'Havoni to‘liq so‘rib olib, tajribani takrorlang', done: (s) => has(s.runs, 'air', 'yoq') }
      ],
      cols: ['Havo', 't (sharcha)', 't (pat)', 'Natija'],
      row: (r) => [{ bor: 'bor', qisman: 'qisman', yoq: 'yo‘q' }[r.air], `${fmt(r.tb, 2)} s`, `${fmt(r.tf, 2)} s`, r.dt < 0.01 ? 'bir vaqtda' : 'pat kechikdi'],
      demo: [{ air: 'bor' }, { air: 'qisman' }, { air: 'yoq' }],
      camera: { target: [0.08, 0.52, 0], dir: [0.2, 0.22, 1], fitW: 0.75, fitH: 1.22, min: 1.0 },
      build(k) {
        const { V } = k;
        const nt = k.newtonTube(-0.05, 0, 1.0);
        const pm = k.vacuumPump(0.24, 0.02, nt.hosePt);
        const tm = k.timer(0.26, -0.12, { name: 'Sekundomer', digits: 2 });
        const len = 1.0, D = 0.96;
        return {
          update(v, c) { nt.setAir(1 - c.lvl); pm.set(c.lvl); nt.set(0, 0, 0); tm.set(0); },
          progress(p, v, c) {
            const T = p * (0.6 + c.tf + 0.3);
            if (T < 0.6) { nt.set(0, 0, ease(T / 0.6)); tm.set(0); return; }      // turn the tube over: ball and feather are carried to the top
            const t = T - 0.6;                                                  // then both fall towards the (new) bottom
            const yb = Math.min(D, G * t * t / 2);
            const yf = c.air === 'yoq' ? yb : D * Math.min(1, t / c.tf) ** (c.air === 'qisman' ? 1.3 : 1.15);
            nt.set(yb, yf, 1); tm.set(Math.min(t, c.tf));
          }
        };
      }
    },

    /* ================= §14 Yuqoriga tik otilgan jism ================= */
    'tik-otish': {
      controls: [{ key: 'u0', label: 'Otilish tezligi, υ₀', type: 'choice', value: 4, options: opt([3, 4, 5], 'm/s') }],
      compute: (v) => { const tu = v.u0 / G; return { tu, td: tu, h: v.u0 * v.u0 / (2 * G), ub: v.u0 }; },
      readouts: (v, c, done) => [['υ₀', `${v.u0} m/s`], ['t (ko‘tarilish)', done ? `${fmt(c.tu, 2)} s` : '—', true], ['t (tushish)', done ? `${fmt(c.td, 2)} s` : '—', true], ['h', done ? `${fmt(c.h, 2)} m` : '—', true], ['υ (qaytishda)', done ? `${fmt(c.ub, 1)} m/s` : '—']],
      run: ['Sharchani otish', 'Sharcha uchmoqda (sekinlashtirilgan)…', 'Qayta otish'],
      duration: (v, c) => 0.3 + 2 * (c.tu + c.td),
      steps: [
        { text: 'υ₀ = 4 m/s da sharchani otib, balandlik va vaqtni o‘lchang', done: (s) => has(s.runs, 'u0', 4) },
        { text: 'υ₀ = 3 m/s bilan takrorlang', done: (s) => has(s.runs, 'u0', 3) },
        { text: 'υ₀ = 5 m/s da o‘lchab, t = υ₀ / g ekanini tekshiring', done: (s) => has(s.runs, 'u0', 5) }
      ],
      cols: ['υ₀', 't (ko‘t.)', 't (tush.)', 'h'],
      row: (r) => [`${r.u0} m/s`, `${fmt(r.tu, 2)} s`, `${fmt(r.td, 2)} s`, `${fmt(r.h, 2)} m`],
      demo: [{ u0: 4 }, { u0: 3 }, { u0: 5 }],
      camera: { target: [0.08, 0.7, 0], dir: [0.25, 0.18, 1], fitW: 0.7, fitH: 1.55, min: 1.2 },
      build(k) {
        const { V } = k;
        const ln = k.launcher(0, 0);
        const rl = k.ruler(1.4, { vertical: true, name: 'Shkala (1,4 m)', width: 0.04 }); rl.place(-0.06, 0.104, -0.01);
        const b = k.ball(0.012, {});
        const tm = k.timer(0.22, -0.08, { digits: 2 });
        const mark = k.add(k.group(), k.box(0.07, 0.006, 0.01, k.C.amber), -0.03, 0.1, 0.0);
        const Y0 = 0.104 - 0.012;
        return {
          update() { b.put(V(0, Y0, 0)); ln.set(1); tm.set(0); mark.position.y = Y0 + 0.012; },
          progress(p, v, c) {
            const T = p * (0.3 + 2 * (c.tu + c.td));
            if (T < 0.3) { ln.set(1 - T / 0.3); return; }
            const t = Math.min(c.tu + c.td, (T - 0.3) / 2);                    // slow motion ×2
            ln.set(0);
            const y = v.u0 * t - G * t * t / 2;
            b.put(V(0, Y0 + Math.max(0, y), 0)); tm.set(t);
            mark.position.y = Math.max(mark.position.y, Y0 + 0.012 + Math.max(0, y));
          }
        };
      }
    }
  });
})();
