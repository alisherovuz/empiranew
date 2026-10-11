// Empira — 8-sinf Fizika labs, batch 5: Chapter IV (current in different media) topics, from the textbook's demonstrations.
(function () {
  const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',');
  const uniq = (runs, key) => new Set(runs.map((r) => String(r[key]))).size;
  const has = (runs, key, val) => runs.some((r) => String(r[key]) === String(val));
  const ease = (p) => p * p * (3 - 2 * p);
  const CU = 0x2F6FD0, CLEAR = 0xCFE0F5;
  const SWAP = (cond, a, b) => (cond ? [a, b] : [b, a]);

  Object.assign(window.EMPIRA_LABS, {

    /* ===== 40-§ Metallarda elektr toki (p.116): free electrons drift against the current ===== */
    'metall-elektronlar': {
      controls: [
        { key: 'U', label: 'Kuchlanish, U', type: 'range', min: 2, max: 6, step: 2, value: 4, unit: 'V', d: 0 },
        { key: 'pol', label: 'Manba qutblari', type: 'choice', value: 'tog', options: [{ v: 'tog', label: 'To‘g‘ri' }, { v: 'tes', label: 'Almashtirilgan' }] }
      ],
      compute: (v) => ({ I: 0.05 * v.U, side: v.pol === 'tog' ? 'o‘ngga' : 'chapga' }),
      readouts: (v, c, done) => [['I', done ? `${fmt(c.I, 2)} A` : '—', true], ['Galvanometr', done ? c.side : '—'], ['Elektronlar', done ? 'tokka teskari' : '—']],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 2.4,
      steps: [
        { text: 'Kalitni ulab, elektronlar harakatini kuzating', done: (s) => s.runs.length > 0 },
        { text: 'Manba qutblarini almashtiring', done: (s) => uniq(s.runs, 'pol') >= 2 },
        { text: 'Kuchlanishni oshirib, solishtiring', done: (s) => uniq(s.runs, 'U') >= 2 }
      ],
      cols: ['U', 'I', 'Galvanometr'],
      row: (r) => [`${r.U} V`, `${fmt(r.I, 2)} A`, r.side],
      demo: [{ U: 4, pol: 'tog' }, { U: 4, pol: 'tes' }, { U: 6, pol: 'tog' }],
      camera: { target: [0.02, 0.04, 0], dir: [0.2, 0.9, 1], fitW: 0.6, fitH: 0.42, min: 0.6 },
      build(k) {
        k.board(0.64, 0.42, 0.02, 0);
        const ps = k.powerSupply(-0.2, 0.09), sw = k.switchK(-0.2, -0.1), G = k.meter(-0.04, -0.11, 'G');
        const cv = k.conductorView(0.07, 0.08), L = k.lamp(0.22, -0.1);
        let closed = false, speed = 0, sign = 1;
        return {
          update(v) {
            ps.set(v.U); sw.set(false); G.set(0.5); L.set(0); closed = false; speed = v.U; sign = v.pol === 'tog' ? 1 : -1;
            k.clearWires(); const [p, m] = SWAP(v.pol === 'tog', ps.plus, ps.minus);
            k.wire(p, sw.a); k.wire(sw.b, G.a); k.wire(G.b, cv.a, 0.05); k.wire(cv.b, L.b); k.wire(L.a, m, 0.07);
          },
          progress(p, v, c) { const e = ease(Math.max(0, (p - 0.3) / 0.7)); closed = p > 0.3; sw.set(closed); G.set(0.5 + sign * (v.U / 6) * 0.4 * e); L.set(closed ? 0.6 * (v.U / 6) * e : 0); },
          animate(dt, phase) { if (closed && phase !== 'idle') cv.drift(-sign * speed * dt * 0.012); }
        };
      }
    },

    /* ===== 41-§ Suyuqliklarda elektr toki (p.118): which liquids conduct ===== */
    'suyuqlik-otkazuvchanligi': {
      controls: [
        { key: 'liq', label: 'Idishdagi suyuqlik', type: 'choice', value: 'suv', options: [{ v: 'suv', label: 'Distillangan suv' }, { v: 'tuz', label: 'Osh tuzi eritmasi' }, { v: 'shakar', label: 'Shakar eritmasi' }, { v: 'kuporos', label: 'Mis kuporosi' }] }
      ],
      compute: (v) => { const I = { suv: 0, tuz: 0.25, shakar: 0, kuporos: 0.2 }[v.liq]; return { I, lit: I > 0 }; },
      readouts: (v, c, done) => [['Lampochka', done ? (c.lit ? 'yonadi' : 'yonmaydi') : '—', true], ['I', done ? `${fmt(c.I, 2)} A` : '—'], ['Eritma', done ? (c.lit ? 'elektrolit' : 'tok o‘tkazmaydi') : '—']],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 1.6,
      steps: [
        { text: 'Distillangan suvni tekshiring', done: (s) => has(s.runs, 'liq', 'suv') },
        { text: 'Suvga osh tuzi soling va tekshiring', done: (s) => has(s.runs, 'liq', 'tuz') },
        { text: 'Shakar eritmasini tekshiring', done: (s) => has(s.runs, 'liq', 'shakar') }
      ],
      cols: ['Suyuqlik', 'I', 'Lampochka'],
      row: (r) => [{ suv: 'distillangan suv', tuz: 'osh tuzi eritmasi', shakar: 'shakar eritmasi', kuporos: 'mis kuporosi' }[r.liq], `${fmt(r.I, 2)} A`, r.lit ? 'yonadi' : 'yonmaydi'],
      demo: [{ liq: 'suv' }, { liq: 'tuz' }, { liq: 'shakar' }],
      camera: { target: [0.03, 0.06, 0], dir: [0.2, 0.75, 1], fitW: 0.58, fitH: 0.4, min: 0.6 },
      build(k) {
        k.board(0.62, 0.42, 0.02, 0);
        const ps = k.powerSupply(-0.2, 0.09), sw = k.switchK(-0.19, -0.11), L = k.lamp(0.0, -0.12);
        const B = k.bath(0.15, 0.05, { liquid: CLEAR, anode: 0x5A6285 });
        ps.set(6);
        k.wire(ps.plus, sw.a); k.wire(sw.b, L.a); k.wire(L.b, B.a, 0.05); k.wire(B.b, ps.minus, 0.12);
        let moving = false;
        return {
          update(v, c) { sw.set(false); L.set(0); moving = false; B.setLiquid(v.liq === 'kuporos' ? CU : CLEAR, v.liq === 'kuporos' ? 0.5 : 0.35); B.showIons(c.lit); },
          progress(p, v, c) { sw.set(p > 0.3); moving = p > 0.3 && c.lit; L.set(moving ? 0.7 * ease((p - 0.3) / 0.7) : 0); },
          animate(dt, phase) { if (moving && phase !== 'idle') B.stepIons(dt * 0.02); }
        };
      }
    },

    /* ===== 42-§ Elektroliz. Faradeyning birinchi qonuni (p.120): m = k·I·t ===== */
    'elektroliz': {
      controls: [
        { key: 'I', label: 'Tok kuchi, I', type: 'range', min: 0.5, max: 2, step: 0.5, value: 1, unit: 'A', d: 1 },
        { key: 't', label: 'Vaqt, t', type: 'choice', value: 10, options: [{ v: 5, label: '5 min' }, { v: 10, label: '10 min' }, { v: 20, label: '20 min' }] }
      ],
      compute: (v) => { const q = v.I * v.t * 60; return { q, m: 0.33 * q }; },
      readouts: (v, c, done) => [['q = I·t', `${c.q} Kl`], ['Katodda mis, m', done ? `${fmt(c.m, 0)} mg` : '—', true], ['k = m/q', done ? '0,33 mg/Kl' : '—']],
      run: ['Elektrolizni boshlash', 'Mis ajralmoqda…', 'Qayta boshlash'],
      duration: () => 2.4,
      steps: [
        { text: 'Elektrolizni o‘tkazib, katoddagi misni o‘lchang', done: (s) => s.runs.length > 0 },
        { text: 'Tok kuchini o‘zgartirib, massani solishtiring', done: (s) => uniq(s.runs, 'I') >= 2 },
        { text: 'Vaqtni o‘zgartirib, massani solishtiring', done: (s) => uniq(s.runs, 't') >= 2 }
      ],
      cols: ['I', 't', 'q', 'm'],
      row: (r) => [`${fmt(r.I, 1)} A`, `${r.t} min`, `${r.q} Kl`, `${fmt(r.m, 0)} mg`],
      demo: [{ I: 1, t: 10 }, { I: 2, t: 10 }, { I: 2, t: 20 }],
      camera: { target: [0.03, 0.06, 0], dir: [0.2, 0.7, 1], fitW: 0.58, fitH: 0.4, min: 0.6 },
      build(k) {
        k.board(0.62, 0.42, 0.02, 0);
        const ps = k.powerSupply(-0.2, 0.09), sw = k.switchK(-0.19, -0.11), A = k.meter(0.0, -0.12, 'A');
        const B = k.bath(0.15, 0.05, { liquid: CU });
        k.label('CuSO₄', k.V(0.15, 0.05, 0.12), { minor: true });
        k.wire(ps.plus, sw.a); k.wire(sw.b, A.a); k.wire(A.b, B.a, 0.06); k.wire(B.b, ps.minus, 0.12);
        let moving = false;
        return {
          update(v) { ps.set(v.I * 4); sw.set(false); A.set(0); B.setCoat(0); moving = false; },
          progress(p, v, c) { const e = Math.max(0, (p - 0.2) / 0.8); sw.set(p > 0.2); moving = p > 0.2 && p < 1; A.set(p > 0.2 ? v.I / 2.5 : 0); B.setCoat(e * Math.min(1, c.m / 800)); },
          animate(dt) { if (moving) B.stepIons(dt * 0.02); }
        };
      }
    },

    /* ===== 43-§ Faradeyning ikkinchi qonuni (p.123): two baths in series, same charge ===== */
    'faradey-ikkinchi': {
      controls: [
        { key: 'I', label: 'Tok kuchi, I', type: 'range', min: 0.5, max: 2, step: 0.5, value: 1, unit: 'A', d: 1 },
        { key: 't', label: 'Vaqt, t', type: 'choice', value: 10, options: [{ v: 10, label: '10 min' }, { v: 20, label: '20 min' }] }
      ],
      compute: (v) => { const q = v.I * v.t * 60; return { q, cu: 0.329 * q, ag: 1.118 * q }; },
      readouts: (v, c, done) => [['q', `${c.q} Kl`], ['Mis', done ? `${fmt(c.cu, 0)} mg` : '—'], ['Kumush', done ? `${fmt(c.ag, 0)} mg` : '—'], ['mAg / mCu', done ? fmt(c.ag / c.cu, 1) : '—', true]],
      run: ['Elektrolizni boshlash', 'Moddalar ajralmoqda…', 'Qayta boshlash'],
      duration: () => 2.4,
      steps: [
        { text: 'Ikkala vannadan bir xil tok o‘tkazing', done: (s) => s.runs.length > 0 },
        { text: 'Zaryad miqdorini o‘zgartiring', done: (s) => uniq(s.runs, 'q') >= 2 },
        { text: 'Massalar nisbatini solishtiring: u o‘zgaradimi?', done: (s) => uniq(s.runs, 'q') >= 3 }
      ],
      cols: ['q', 'Mis', 'Kumush', 'Nisbat'],
      row: (r) => [`${r.q} Kl`, `${fmt(r.cu, 0)} mg`, `${fmt(r.ag, 0)} mg`, fmt(r.ag / r.cu, 1)],
      demo: [{ I: 1, t: 10 }, { I: 2, t: 10 }, { I: 2, t: 20 }],
      camera: { target: [0.07, 0.06, 0], dir: [0.15, 0.75, 1], fitW: 0.76, fitH: 0.42, min: 0.7 },
      build(k) {
        k.board(0.7, 0.42, 0.06, 0);
        const ps = k.powerSupply(-0.18, 0.1), sw = k.switchK(-0.21, -0.11), A = k.meter(-0.07, -0.13, 'A');
        const B1 = k.bath(0.08, 0.06, { liquid: CU }), B2 = k.bath(0.28, 0.06, { liquid: CLEAR, anode: 0xD8DBE3 });
        k.label('CuSO₄', k.V(0.08, 0.05, 0.13), { minor: true }); k.label('AgNO₃', k.V(0.28, 0.05, 0.13), { minor: true });
        k.wire(ps.plus, sw.a); k.wire(sw.b, A.a); k.wire(A.b, B1.a, 0.06); k.wire(B1.b, B2.a, 0.04); k.wire(B2.b, ps.minus, 0.14);
        let moving = false;
        return {
          update(v) { ps.set(v.I * 4); sw.set(false); A.set(0); B1.setCoat(0); B2.setCoat(0, 0xEEF0F5); moving = false; },
          progress(p, v, c) { const e = Math.max(0, (p - 0.2) / 0.8); sw.set(p > 0.2); moving = p > 0.2 && p < 1; A.set(p > 0.2 ? v.I / 2.5 : 0); B1.setCoat(e * Math.min(1, c.cu / 800)); B2.setCoat(e * Math.min(1, c.ag / 1600)); },
          animate(dt) { if (moving) { B1.stepIons(dt * 0.02); B2.stepIons(dt * 0.02); } }
        };
      }
    },

    /* ===== 45-§ Elektrolizdan foydalanish (p.128): electroplating a spoon ===== */
    'galvanostegiya': {
      controls: [
        { key: 'met', label: 'Qoplama metali', type: 'choice', value: 'mis', options: [{ v: 'mis', label: 'Mis' }, { v: 'nikel', label: 'Nikel' }, { v: 'kumush', label: 'Kumush' }] },
        { key: 't', label: 'Vaqt, t', type: 'choice', value: 10, options: [{ v: 10, label: '10 min' }, { v: 20, label: '20 min' }, { v: 30, label: '30 min' }] }
      ],
      compute: (v) => {
        const M = { mis: [0.329, 8.9], nikel: [0.304, 8.9], kumush: [1.118, 10.5] }[v.met];
        const m = M[0] * 0.5 * v.t * 60;                 // mg, I = 0,5 A
        return { m, d: (m / 1000) / M[1] / 20 * 1e4 };   // μm, S = 20 cm²
      },
      readouts: (v, c, done) => [['I', '0,5 A'], ['Qoplama massasi', done ? `${fmt(c.m, 0)} mg` : '—'], ['Qalinligi', done ? `${fmt(c.d, 0)} μm` : '—', true]],
      run: ['Qoplashni boshlash', 'Qoshiq qoplanmoqda…', 'Qayta qoplash'],
      duration: () => 2.4,
      steps: [
        { text: 'Qoshiqni mis bilan qoplang', done: (s) => has(s.runs, 'met', 'mis') },
        { text: 'Uzoqroq vaqt qoplab, qalinlikni solishtiring', done: (s) => uniq(s.runs, 't') >= 2 },
        { text: 'Boshqa metall bilan qoplang', done: (s) => uniq(s.runs, 'met') >= 2 }
      ],
      cols: ['Metall', 't', 'm', 'Qalinlik'],
      row: (r) => [r.met, `${r.t} min`, `${fmt(r.m, 0)} mg`, `${fmt(r.d, 0)} μm`],
      demo: [{ met: 'mis', t: 10 }, { met: 'mis', t: 30 }, { met: 'kumush', t: 30 }],
      camera: { target: [0.06, 0.07, 0], dir: [0.25, 0.55, 1], fitW: 0.52, fitH: 0.38, min: 0.55 },
      build(k) {
        k.board(0.6, 0.4, 0.02, 0);
        const ps = k.powerSupply(-0.17, 0.08), sw = k.switchK(-0.15, -0.11);
        const B = k.bath(0.14, 0.03, { item: 'spoon' });
        k.label('Qoshiq', k.V(0.2, 0.13, 0.03), { minor: true });
        ps.set(2);
        k.wire(ps.plus, sw.a); k.wire(sw.b, B.a, 0.06); k.wire(B.b, ps.minus, 0.12);
        const COL = { mis: 0xB87333, nikel: 0xC9CED9, kumush: 0xEEF0F5 }, LIQ = { mis: CU, nikel: 0x7FCFC0, kumush: CLEAR }, AN = { mis: 0xB87333, nikel: 0xA9AEB8, kumush: 0xE3E6EC };
        let moving = false;
        return {
          update(v) { sw.set(false); moving = false; B.setLiquid(LIQ[v.met], 0.4); B.setCoat(0, COL[v.met]); },
          progress(p, v) { const e = Math.max(0, (p - 0.2) / 0.8); sw.set(p > 0.2); moving = p > 0.2 && p < 1; B.setCoat(e * (0.35 + 0.65 * v.t / 30)); },
          animate(dt) { if (moving) B.stepIons(dt * 0.02); }
        };
      }
    },

    /* ===== 46-§ Vakuumda elektr toki (p.129): Edison effect / vacuum diode ===== */
    'vakuum-diod': {
      controls: [
        { key: 'heat', label: 'Katod', type: 'choice', value: 'yoq', options: [{ v: 'yoq', label: 'Sovuq' }, { v: 'bor', label: 'Qizdirilgan' }] },
        { key: 'an', label: 'Anodga ulangan qutb', type: 'choice', value: 'plus', options: [{ v: 'plus', label: '+' }, { v: 'minus', label: '−' }] }
      ],
      compute: (v) => { const on = v.heat === 'bor' && v.an === 'plus'; return { on, I: on ? 12 : 0 }; },
      readouts: (v, c, done) => [['Katod', v.heat === 'bor' ? 'qizdirilgan' : 'sovuq'], ['Tok, I', done ? `${c.I} mA` : '—', true], ['Elektronlar', done ? (c.on ? 'katoddan anodga' : 'oqmaydi') : '—']],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 2,
      steps: [
        { text: 'Katod sovuq holda tokni tekshiring', done: (s) => has(s.runs, 'heat', 'yoq') },
        { text: 'Katodni qizdirib, anodga + ulang', done: (s) => s.runs.some((r) => r.on) },
        { text: 'Anodga − ulab tekshiring', done: (s) => s.runs.some((r) => r.heat === 'bor' && r.an === 'minus') }
      ],
      cols: ['Katod', 'Anod', 'I'],
      row: (r) => [r.heat === 'bor' ? 'qizdirilgan' : 'sovuq', r.an === 'plus' ? '+' : '−', `${r.I} mA`],
      demo: [{ heat: 'yoq', an: 'plus' }, { heat: 'bor', an: 'plus' }, { heat: 'bor', an: 'minus' }],
      camera: { target: [0.02, 0.07, 0], dir: [0.15, 0.55, 1], fitW: 0.54, fitH: 0.38, min: 0.55 },
      build(k) {
        k.board(0.6, 0.4, 0.02, 0);
        const ps = k.powerSupply(-0.18, 0.08), sw = k.switchK(-0.17, -0.11), G = k.meter(0.03, -0.12, 'mA');
        const T = k.vacuumTube(0.17, 0.04);
        ps.set(6);
        let flowing = false;
        return {
          update(v) {
            sw.set(false); G.set(0); T.heat(v.heat === 'bor' ? 1 : 0); flowing = false; T.flow(0, false);
            k.clearWires(); const [toAnode, toCathode] = SWAP(v.an === 'plus', ps.plus, ps.minus);
            k.wire(toAnode, sw.a); k.wire(sw.b, G.a); k.wire(G.b, T.an, 0.05); k.wire(T.k, toCathode, 0.1);
          },
          progress(p, v, c) { sw.set(p > 0.3); flowing = p > 0.3 && c.on; G.set(flowing ? 0.6 * ease((p - 0.3) / 0.7) : 0); },
          animate(dt, phase) { T.flow(dt * 1.2, flowing && phase !== 'idle'); }
        };
      }
    },

    /* ===== 47-§ Gazlarda elektr toki (p.131): a flame ionises air and discharges the electrometer ===== */
    'gaz-ionlash': {
      controls: [
        { key: 'gap', label: 'Plastinkalar orasida', type: 'choice', value: 'havo', options: [{ v: 'havo', label: 'Oddiy havo' }, { v: 'sham', label: 'Sham alangasi' }] }
      ],
      compute: (v) => ({ end: v.gap === 'sham' ? 0 : 48 }),
      readouts: (v, c, done) => [['Elektrometr', done ? `50° → ${c.end}°` : '50°', true], ['Havo', done ? (v.gap === 'sham' ? 'ionlashdi, tok o‘tdi' : 'tok o‘tkazmaydi') : '—']],
      run: ['Kuzatish', 'Kuzatilmoqda…', 'Qayta zaryadlab kuzatish'],
      duration: () => 3,
      steps: [
        { text: 'Zaryadlangan elektrometrni oddiy havoda kuzating', done: (s) => has(s.runs, 'gap', 'havo') },
        { text: 'Plastinkalar orasiga sham qo‘ying', done: (s) => has(s.runs, 'gap', 'sham') },
        { text: 'Shamni olib, qayta tekshiring', done: (s) => { const i = s.runs.findIndex((r) => r.gap === 'sham'); return i >= 0 && s.runs.slice(i + 1).some((r) => r.gap === 'havo'); } }
      ],
      cols: ['Orasida', 'Elektrometr'],
      row: (r) => [r.gap === 'sham' ? 'sham alangasi' : 'havo', `50° → ${r.end}°`],
      demo: [{ gap: 'havo' }, { gap: 'sham' }, { gap: 'havo' }],
      camera: { target: [0.0, 0.13, 0], dir: [0.3, 0.45, 1], fitW: 0.46, fitH: 0.42, min: 0.55 },
      build(k) {
        const es = k.electroscope(-0.13, 0);
        const plate = (x, col) => { const p = k.box(0.004, 0.11, 0.09, col, { metalness: 0.5, roughness: 0.35 }); p.position.set(x, 0.12, 0); k.group().add(p); const st = k.cyl(0.004, 0.065, 0xF2F4F8, {}, 8); st.position.set(x, 0.0325, 0); k.group().add(st); const b = k.box(0.04, 0.01, 0.05, 0x3A4166); b.position.set(x, 0.005, 0); k.group().add(b); };
        plate(0.03, 0x9AA1BC); plate(0.13, 0x9AA1BC);
        k.label('Plastinkalar', k.V(0.08, 0.21, 0), { minor: true });
        k.wire(es.ball, k.V(0.03, 0.17, 0), 0.04);
        const cd = k.candle(0.08, 0);
        return {
          update(v) { es.set(50); cd.group.visible = v.gap === 'sham'; },
          progress(p, v, c) { es.set(50 + (c.end - 50) * ease(p)); },
          animate(dt) { if (cd.group.visible) cd.animate(dt); }
        };
      }
    },

    /* ===== 48-§ Elektr razryadlarning turlari (p.133–136): spark, arc, glow ===== */
    'razryad-turlari': {
      controls: [
        { key: 'type', label: 'Razryad turi', type: 'choice', value: 'uchqun', options: [{ v: 'uchqun', label: 'Uchqun' }, { v: 'yoy', label: 'Elektr yoyi' }, { v: 'miltillama', label: 'Miltillama' }] }
      ],
      compute: (v) => ({ ...{ uchqun: { cond: 'juda yuqori kuchlanish', use: 'chaqmoq, dvigatel shami' }, yoy: { cond: 'katta tok, cho‘g‘langan ko‘mir', use: 'elektr payvandlash' }, miltillama: { cond: 'past bosimdagi gaz', use: 'reklama lampalari' } }[v.type] }),
      readouts: (v, c, done) => [['Sharti', c.cond], ['Qo‘llanilishi', done ? c.use : '—', true]],
      run: ['Kuchlanish berish', 'Razryad…', 'Qayta berish'],
      duration: () => 2.5,
      steps: [
        { text: 'Uchqun razryadini kuzating', done: (s) => has(s.runs, 'type', 'uchqun') },
        { text: 'Elektr yoyini kuzating', done: (s) => has(s.runs, 'type', 'yoy') },
        { text: 'Miltillama razryadni kuzating', done: (s) => has(s.runs, 'type', 'miltillama') }
      ],
      cols: ['Turi', 'Qo‘llanilishi'],
      row: (r) => [{ uchqun: 'uchqun', yoy: 'elektr yoyi', miltillama: 'miltillama' }[r.type], r.use],
      demo: [{ type: 'uchqun' }, { type: 'yoy' }, { type: 'miltillama' }],
      camera: { target: [0.04, 0.08, -0.04], dir: [0.15, 0.6, 1], fitW: 0.52, fitH: 0.36, min: 0.6 },
      build(k) {
        k.board(0.56, 0.4, 0.02, 0);
        const ps = k.powerSupply(-0.17, 0.09);
        const sg = k.sparkGap(0.1, 0.0), ar = k.arcLamp(0.1, 0.0), dt0 = k.dischargeTube(0.1, 0.03);
        const parts = { uchqun: sg, yoy: ar, miltillama: dt0 };
        let cur = 'uchqun', on = false;
        return {
          update(v) {
            cur = v.type; on = false;
            Object.entries(parts).forEach(([key, t]) => { t.group.visible = key === cur; t.set(key === 'miltillama' ? 0 : false); });
            dt0.pump.visible = cur === 'miltillama';
            ps.set({ uchqun: '50 000', yoy: '40', miltillama: '5 000' }[cur]);
            k.clearWires(); const t = parts[cur]; k.wire(ps.plus, t.a, 0.06); k.wire(ps.minus, t.b, 0.1);
          },
          progress(p) { on = p > 0.25; const t = parts[cur]; t.set(cur === 'miltillama' ? (on ? ease(Math.min(1, (p - 0.25) / 0.4)) : 0) : on); },
          animate(dt) { parts[cur].animate(dt); }
        };
      }
    }
  });
})();
