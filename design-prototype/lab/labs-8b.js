// Empira — 8-sinf Fizika labs, batch 2: Chapter II–III topics (from the textbook's demonstration experiments).
// Same definition shape as labs-8.js. Values follow the textbook formulas.
(function () {
  const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',');
  const uniq = (runs, key) => new Set(runs.map((r) => String(r[key]))).size;
  const has = (runs, key, val) => runs.some((r) => String(r[key]) === String(val));
  const ease = (p) => p * p * (3 - 2 * p);
  const on = (p) => (p <= 0.4 ? 0 : ease((p - 0.4) / 0.6));
  const cam = { target: [0.04, 0.03, 0], dir: [0.05, 1.15, 1], fitW: 0.86, fitH: 0.56, min: 0.85 };
  const lampR = (U) => 6 + 2.4 * U;            // small 6,3 V lamp: filament resistance grows as it heats

  Object.assign(window.EMPIRA_LABS, {

    /* ===== 9-§ Elektr toki haqida tushuncha (p.33): electrophore + neon lamp ===== */
    'elektr-toki-neon': {
      controls: [{ key: 'mode', label: 'Elektrofor mashinasi', type: 'choice', value: 'uzluksiz', options: [{ v: 'uzluksiz', label: 'Uzluksiz aylantirish' }, { v: 'bir', label: 'Bir marta zaryadlash' }] }],
      compute: (v) => ({ glow: v.mode === 'uzluksiz' ? 'uzluksiz yondi' : 'bir zum yondi' }),
      readouts: (v, c, done) => [['Rejim', v.mode === 'uzluksiz' ? 'uzluksiz' : 'bir marta'], ['Neon lampa', done ? c.glow : '—', true]],
      run: ['Boshlash', 'Kuzatilmoqda…', 'Qayta boshlash'],
      duration: () => 3,
      steps: [
        { text: 'Dastani uzluksiz aylantirib, neon lampani kuzating', done: (s) => has(s.runs, 'mode', 'uzluksiz') },
        { text: 'Bir marta zaryadlab, farqni kuzating', done: (s) => has(s.runs, 'mode', 'bir') },
        { text: 'Uzluksiz tok uchun nima kerakligini xulosa qiling', done: (s) => has(s.runs, 'mode', 'uzluksiz') && has(s.runs, 'mode', 'bir') }
      ],
      cols: ['Rejim', 'Neon lampa'],
      row: (r) => [r.mode === 'uzluksiz' ? 'Uzluksiz' : 'Bir marta', r.glow],
      demo: [{ mode: 'uzluksiz' }, { mode: 'bir' }],
      camera: { target: [0.05, 0.12, 0.03], dir: [0.12, 0.55, 1], fitW: 0.5, fitH: 0.36, min: 0.7 },
      build(k) {
        const m = k.electrophore(-0.06, 0);
        const neon = k.neonLamp(0.17, 0.045, 0.1);
        const block = k.box(0.06, 0.1, 0.04, 0x3A4166); block.position.set(0.17, 0.05 + k.BY, 0.045); k.group().add(block);
        const ballL = k.world(m.group, k.V(-0.06, 0.155, 0.045));
        k.wire(m.ball, neon.a, 0.04); k.wire(neon.b, k.V(0.24, 0.02, 0.045), 0.03);
        k.wire(ballL, k.V(-0.12, 0.02, 0.1), 0.03);
        k.label('Yerga', k.V(0.25, 0.04, 0.045), { minor: true });
        let angle = 0, mode = 'uzluksiz', t = 0;
        return {
          update(v) { mode = v.mode; neon.set(0); t = 0; },
          progress(p) { t = p; if (mode === 'uzluksiz') neon.set(p < 1 ? 0.8 + Math.sin(p * 60) * 0.15 : 0); else neon.set(p > 0.3 && p < 0.4 ? 1 : 0); },
          animate(dt, phase) { if (phase === 'running' && (mode === 'uzluksiz' || t < 0.3)) { angle += dt * 6; m.set(angle); } }
        };
      }
    },

    /* ===== 10-§ Tok manbalari (p.35): Volta cell ===== */
    'volta-elementi': {
      controls: [{ key: 'pl', label: 'Plastinkalar', type: 'choice', value: 'zn-cu', options: [{ v: 'zn-cu', label: 'Rux + mis' }, { v: 'cu-cu', label: 'Mis + mis' }, { v: 'zn-zn', label: 'Rux + rux' }] }],
      compute: (v) => { const U = v.pl === 'zn-cu' ? 1.0 : 0; return { U, lit: U > 0 }; },
      readouts: (v, c, done) => [['Plastinkalar', { 'zn-cu': 'Zn + Cu', 'cu-cu': 'Cu + Cu', 'zn-zn': 'Zn + Zn' }[v.pl]], ['U', done ? `${fmt(c.U, 1)} V` : '—', true], ['Lampochka', done ? (c.lit ? 'yonadi' : 'yonmaydi') : '—']],
      run: ['Zanjirni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 0.9,
      steps: [
        { text: 'Rux va mis plastinkalar bilan zanjirni ulang', done: (s) => has(s.runs, 'pl', 'zn-cu') },
        { text: 'Bir xil metalli plastinkalarni sinab ko‘ring', done: (s) => has(s.runs, 'pl', 'cu-cu') || has(s.runs, 'pl', 'zn-zn') },
        { text: 'Tok hosil bo‘lish shartini xulosa qiling', done: (s) => has(s.runs, 'pl', 'zn-cu') && (has(s.runs, 'pl', 'cu-cu') || has(s.runs, 'pl', 'zn-zn')) }
      ],
      cols: ['Plastinkalar', 'U', 'Lampochka'],
      row: (r) => [{ 'zn-cu': 'Zn + Cu', 'cu-cu': 'Cu + Cu', 'zn-zn': 'Zn + Zn' }[r.pl], `${fmt(r.U, 1)} V`, r.lit ? 'yonadi' : 'yonmaydi'],
      demo: [{ pl: 'zn-cu' }, { pl: 'cu-cu' }],
      camera: { target: [0.03, 0.06, 0], dir: [0.05, 0.75, 1], fitW: 0.5, fitH: 0.36, min: 0.65 },
      build(k) {
        k.board(0.44, 0.34, 0.03, 0);
        const cell = k.voltaCell(-0.08, 0), lp = k.lamp(0.13, 0.08, 'Lampochka'), Vm = k.meter(0.13, -0.08, 'V');
        k.wire(cell.a, lp.a, 0.05); k.wire(lp.b, cell.b, 0.06);
        k.wire(Vm.a, cell.b, 0.05); k.wire(Vm.b, cell.a, 0.07);
        return {
          update(v) { const [a, b] = v.pl.split('-'); cell.setMetals(a, b); lp.set(0); Vm.set(0, 'V'); },
          progress(p, v, c) { const f = ease(p); lp.set(c.lit ? 0.35 * f : 0); Vm.set((c.U / 2) * f, p >= 1 ? `${fmt(c.U, 1)} V` : 'V'); }
        };
      }
    },

    /* ===== 11-§ Kuchlanish va uni o‘lchash (p.40) ===== */
    'kuchlanish-olchash': {
      controls: [
        { key: 'U', label: 'Manba kuchlanishi, U', type: 'range', min: 2, max: 6, step: 2, value: 4, unit: 'V', d: 0 },
        { key: 'vc', label: 'Voltmetr ulanishi', type: 'choice', value: 'par', options: [{ v: 'par', label: 'Lampochkaga parallel' }, { v: 'ser', label: 'Ketma-ket (xato)' }] }
      ],
      compute: (v) => v.vc === 'par' ? { Uv: v.U, I: v.U / lampR(v.U), lit: true } : { Uv: v.U, I: 0.0005, lit: false },
      readouts: (v, c, done) => [['U', `${v.U} V`], ['Voltmetr', done ? `${fmt(c.Uv, 1)} V` : '—', true], ['Lampochka', done ? (c.lit ? 'yonadi' : 'yonmaydi') : '—']],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 0.9,
      steps: [
        { text: 'Voltmetrni lampochkaga parallel ulab, kuchlanishni o‘lchang', done: (s) => has(s.runs, 'vc', 'par') },
        { text: 'Manba kuchlanishini o‘zgartirib, qayta o‘lchang', done: (s) => uniq(s.runs.filter((r) => r.vc === 'par'), 'U') >= 2 },
        { text: 'Voltmetrni ketma-ket ulab, nima bo‘lishini kuzating', done: (s) => has(s.runs, 'vc', 'ser') }
      ],
      cols: ['Ulanish', 'U', 'Lampochka'],
      row: (r) => [r.vc === 'par' ? 'Parallel' : 'Ketma-ket', `${fmt(r.Uv, 1)} V`, r.lit ? 'yonadi' : 'yonmaydi'],
      demo: [{ U: 4, vc: 'par' }, { U: 6, vc: 'par' }, { U: 6, vc: 'ser' }],
      camera: cam,
      build(k) {
        k.board(0.7, 0.46, 0.03, -0.02);
        const ps = k.powerSupply(-0.22, 0.0), sw = k.switchK(-0.06, 0.15), lp = k.lamp(0.16, 0.05, 'Lampochka'), Vm = k.meter(0, 0, 'V');
        return {
          update(v) {
            ps.set(v.U); sw.set(false); lp.set(0); Vm.set(0, 'V'); k.clearWires();
            k.wire(ps.plus, sw.a);
            if (v.vc === 'par') { Vm.group.position.set(0.16, k.BY, -0.15); k.wire(sw.b, lp.a); k.wire(lp.b, ps.minus, 0.06); k.wire(Vm.a, lp.a, 0.05); k.wire(Vm.b, lp.b, 0.05); }
            else { Vm.group.position.set(0.1, k.BY, 0.17); k.wire(sw.b, Vm.a); k.wire(Vm.b, lp.a); k.wire(lp.b, ps.minus, 0.06); }
          },
          progress(p, v, c) { sw.set(p > 0.3); const f = on(p); lp.set(c.lit ? (v.U / 6) * 0.9 * f : 0); Vm.set((c.Uv / 8) * f, f > 0.99 ? `${fmt(c.Uv, 1)} V` : 'V'); }
        };
      }
    },

    /* ===== 12-§ Tok kuchi va uni o‘lchash (p.44) ===== */
    'tok-kuchi-olchash': {
      controls: [{ key: 'U', label: 'Manba kuchlanishi, U', type: 'range', min: 1, max: 6, step: 1, value: 2, unit: 'V', d: 0 }],
      compute: (v) => { const I = v.U / lampR(v.U); return { I, mA: I * 1000 }; },
      readouts: (v, c, done) => [['U', `${v.U} V`], ['I', done ? `${fmt(c.mA, 0)} mA` : '—', true]],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 0.9,
      steps: [
        { text: 'Milliampermetrni ketma-ket ulab, tok kuchini o‘lchang', done: (s) => s.runs.length > 0 },
        { text: 'Manba kuchlanishini oshirib, qayta o‘lchang', done: (s) => uniq(s.runs, 'U') >= 2 },
        { text: '4 xil kuchlanishda o‘lchab, jadvalni to‘ldiring', done: (s) => uniq(s.runs, 'U') >= 4 }
      ],
      cols: ['U', 'I'],
      row: (r) => [`${r.U} V`, `${fmt(r.mA, 0)} mA`],
      demo: [{ U: 1 }, { U: 2 }, { U: 4 }, { U: 6 }],
      camera: cam,
      build(k) {
        k.board(0.7, 0.46, 0.03, -0.02);
        const ps = k.powerSupply(-0.22, 0.0), sw = k.switchK(-0.06, 0.15), mA = k.meter(0.13, 0.15, 'mA'), lp = k.lamp(0.13, -0.08, 'Lampochka');
        k.wire(ps.plus, sw.a); k.wire(sw.b, mA.a); k.wire(mA.b, lp.b); k.wire(lp.a, ps.minus);
        return {
          update(v) { ps.set(v.U); sw.set(false); lp.set(0); mA.set(0, 'mA'); },
          progress(p, v, c) { sw.set(p > 0.3); const f = on(p); lp.set((v.U / 6) * 0.9 * f); mA.set((c.mA / 350) * f, f > 0.99 ? `${fmt(c.mA, 0)} mA` : 'mA'); }
        };
      }
    },

    /* ===== 15-§ Elektr qarshilik (p.49–50): R = ρ·l/S ===== */
    'qarshilik-sim': {
      controls: [
        { key: 'mat', label: 'Sim moddasi', type: 'choice', value: 'nixrom', options: [{ v: 'mis', label: 'Mis' }, { v: 'nikelin', label: 'Nikelin' }, { v: 'nixrom', label: 'Nixrom' }] },
        { key: 'l', label: 'Uzunlik, l', type: 'choice', value: 1, options: [{ v: 0.5, label: '0,5 m' }, { v: 1, label: '1 m' }, { v: 1.5, label: '1,5 m' }] },
        { key: 'S', label: 'Ko‘ndalang kesim, S', type: 'choice', value: 0.5, options: [{ v: 0.5, label: '0,5 mm²' }, { v: 1, label: '1 mm²' }] }
      ],
      compute: (v) => { const rho = { mis: 0.017, nikelin: 0.42, nixrom: 1.1 }[v.mat]; const R = (rho * v.l) / v.S; return { rho, R, I: 2 / (R + 1) }; },
      readouts: (v, c, done) => [['ρ', `${fmt(c.rho, 3)} Ω·mm²/m`], ['R = ρl/S', `${fmt(c.R, 2)} Ω`, true], ['I', done ? `${fmt(c.I, 2)} A` : '—', true]],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 0.9,
      steps: [
        { text: 'Sim uzunligini o‘zgartirib, tok kuchini solishtiring', done: (s) => uniq(s.runs, 'l') >= 2 },
        { text: 'Ko‘ndalang kesimni o‘zgartirib, solishtiring', done: (s) => uniq(s.runs, 'S') >= 2 },
        { text: 'Turli moddadagi simlarni solishtiring', done: (s) => uniq(s.runs, 'mat') >= 2 }
      ],
      cols: ['Modda', 'l', 'S', 'R', 'I'],
      row: (r) => [r.mat, `${fmt(r.l, 1)} m`, `${fmt(r.S, 1)}`, `${fmt(r.R, 2)} Ω`, `${fmt(r.I, 2)} A`],
      demo: [{ mat: 'nixrom', l: 0.5, S: 0.5 }, { mat: 'nixrom', l: 1, S: 0.5 }, { mat: 'nixrom', l: 1, S: 1 }, { mat: 'nikelin', l: 1, S: 1 }],
      camera: cam,
      build(k) {
        k.board(0.72, 0.48, 0.04, -0.02);
        const ps = k.powerSupply(-0.25, 0.04), sw = k.switchK(-0.08, 0.17), A = k.meter(0.12, 0.17, 'A'), wb = k.wireBoard(0.1, -0.12);
        ps.set(2);
        k.wire(ps.plus, sw.a); k.wire(sw.b, A.a); k.wire(ps.minus, wb.a, 0.05);
        return {
          update(v) { wb.setWire(v.mat, v.S); wb.setLength(v.l / 1.5); sw.set(false); A.set(0, 'A'); k.clearWires(); k.wire(ps.plus, sw.a); k.wire(sw.b, A.a); k.wire(ps.minus, wb.a, 0.05); k.wire(A.b, wb.b, 0.06); },
          progress(p, v, c) { sw.set(p > 0.3); const f = on(p); A.set((c.I / 2.2) * f, f > 0.99 ? `${fmt(c.I, 2)} A` : 'A'); }
        };
      }
    },

    /* ===== 16-§ Reostat potensiometr sifatida (p.54) ===== */
    'potensiometr': {
      controls: [{ key: 'x', label: 'Surgich holati', type: 'range', min: 0, max: 100, step: 10, value: 50, text: (v) => `${v} %` }],
      compute: (v) => ({ UL: (6 * v.x) / 100 }),
      readouts: (v, c, done) => [['U (manba)', '6 V'], ['Surgich', `${v.x} %`], ['U (lampochka)', done ? `${fmt(c.UL, 1)} V` : '—', true]],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 0.9,
      steps: [
        { text: 'Kalitni ulab, lampochkadagi kuchlanishni o‘lchang', done: (s) => s.runs.length > 0 },
        { text: 'Surgichni siljitib, kuchlanishni o‘zgartiring', done: (s) => uniq(s.runs, 'x') >= 3 },
        { text: 'Kuchlanishni 0 dan 6 V gacha rostlang', done: (s) => has(s.runs, 'x', 0) && has(s.runs, 'x', 100) }
      ],
      cols: ['Surgich', 'U (lampochka)'],
      row: (r) => [`${r.x} %`, `${fmt(r.UL, 1)} V`],
      demo: [{ x: 0 }, { x: 50 }, { x: 100 }],
      camera: cam,
      build(k) {
        k.board(0.74, 0.48, 0.05, -0.02);
        const ps = k.powerSupply(-0.25, 0.0), sw = k.switchK(-0.08, 0.16), rh = k.rheostat(0.15, 0.15), lp = k.lamp(0.14, -0.1, 'Lampochka'), Vm = k.meter(0.32, -0.1, 'V');
        ps.set(6);
        k.wire(ps.plus, sw.a); k.wire(sw.b, rh.c, 0.05); k.wire(rh.a, ps.minus, 0.07);
        k.wire(rh.b, lp.b, 0.05); k.wire(lp.a, ps.minus, 0.04);
        k.wire(Vm.a, lp.b, 0.05); k.wire(Vm.b, lp.a, 0.06);
        return {
          update(v) { rh.set(v.x / 100); sw.set(false); lp.set(0); Vm.set(0, 'V'); },
          progress(p, v, c) { sw.set(p > 0.3); const f = on(p); lp.set((c.UL / 6) * 0.9 * f); Vm.set((c.UL / 8) * f, f > 0.99 ? `${fmt(c.UL, 1)} V` : 'V'); }
        };
      }
    },

    /* ===== 17-§ Tok kuchining qarshilikka bog‘liqligi (p.56) ===== */
    'tok-va-qarshilik': {
      controls: [{ key: 'R', label: 'O‘tkazgich qarshiligi, R', type: 'choice', value: 2, options: [{ v: 2, label: '2 Ω' }, { v: 4, label: '4 Ω' }, { v: 8, label: '8 Ω' }] }],
      compute: (v) => ({ I: 4 / v.R }),
      readouts: (v, c, done, runs) => {
        const out = [['U', '4 V'], ['R', `${v.R} Ω`], ['I', done ? `${fmt(c.I, 2)} A` : '—', true]];
        if ([2, 4, 8].every((x) => has(runs, 'R', x))) out.push(['I · R', '4 V (o‘zgarmas)', true]);
        return out;
      },
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 0.9,
      steps: [
        { text: 'R = 2 Ω da tok kuchini o‘lchang', done: (s) => has(s.runs, 'R', 2) },
        { text: 'Qarshilikni 2 marta oshirib, o‘lchang', done: (s) => has(s.runs, 'R', 4) },
        { text: 'Yana 2 marta oshirib, I · R ni solishtiring', done: (s) => has(s.runs, 'R', 8) }
      ],
      cols: ['R', 'I', 'U'],
      row: (r) => [`${r.R} Ω`, `${fmt(r.I, 2)} A`, '4 V'],
      demo: [{ R: 2 }, { R: 4 }, { R: 8 }],
      camera: cam,
      build(k) {
        k.board(0.7, 0.46, 0.03, -0.02);
        const ps = k.powerSupply(-0.22, 0.0), sw = k.switchK(-0.06, 0.15), A = k.meter(0.14, 0.15, 'A'), R = k.resistor(0.14, -0.04, 'R = 2 Ω'), Vm = k.meter(0.14, -0.17, 'V');
        ps.set(4);
        k.wire(ps.plus, sw.a); k.wire(sw.b, A.a); k.wire(A.b, R.b); k.wire(R.a, ps.minus);
        k.wire(Vm.a, R.b, 0.05); k.wire(Vm.b, R.a, 0.05);
        return {
          update(v) { R.lab.setText(`R = ${v.R} Ω`); sw.set(false); A.set(0, 'A'); Vm.set(0, 'V'); },
          progress(p, v, c) { sw.set(p > 0.3); const f = on(p); A.set((c.I / 2.5) * f, f > 0.99 ? `${fmt(c.I, 2)} A` : 'A'); Vm.set((4 / 6) * f, f > 0.99 ? '4 V' : 'V'); }
        };
      }
    },

    /* ===== 21-§ Iste’molchilarni ketma-ket ulash (p.64): lamps in series ===== */
    'ketma-ket-lampalar': {
      controls: [
        { key: 'L2', label: 'Ikkinchi lampochka', type: 'choice', value: 'bor', options: [{ v: 'bor', label: 'L₂ o‘rnida' }, { v: 'yoq', label: 'L₂ burab olingan' }] },
        { key: 'vm', label: 'Voltmetr ulangan', type: 'choice', value: 'L1', options: [{ v: 'L1', label: 'L₁' }, { v: 'L2', label: 'L₂' }, { v: 'AB', label: 'Umumiy' }] }
      ],
      compute: (v) => { const open = v.L2 === 'yoq'; const I = open ? 0 : 4 / 20; const Uv = v.vm === 'AB' ? 4 : open ? (v.vm === 'L2' ? 4 : 0) : 2; return { I, Uv, lit: !open }; },
      readouts: (v, c, done) => [['I', done ? `${fmt(c.I, 2)} A` : '—', true], [v.vm === 'AB' ? 'U' : `U (${v.vm === 'L1' ? 'L₁' : 'L₂'})`, done ? `${fmt(c.Uv, 1)} V` : '—', true], ['L₁', done ? (c.lit ? 'yonadi' : 'yonmaydi') : '—']],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 0.9,
      steps: [
        { text: 'Kalitni ulab, I, U₁ va U₂ ni o‘lchang', done: (s) => s.runs.some((r) => r.L2 === 'bor' && r.vm !== 'AB') },
        { text: 'Umumiy kuchlanishni o‘lchang: U = U₁ + U₂', done: (s) => s.runs.some((r) => r.L2 === 'bor' && r.vm === 'AB') },
        { text: 'L₂ ni burab olib, L₁ ni kuzating', done: (s) => has(s.runs, 'L2', 'yoq') }
      ],
      cols: ['L₂', 'Voltmetr', 'I', 'U'],
      row: (r) => [r.L2 === 'bor' ? 'o‘rnida' : 'olingan', r.vm === 'AB' ? 'Umumiy' : (r.vm === 'L1' ? 'L₁' : 'L₂'), `${fmt(r.I, 2)} A`, `${fmt(r.Uv, 1)} V`],
      demo: [{ L2: 'bor', vm: 'L1' }, { L2: 'bor', vm: 'AB' }, { L2: 'yoq', vm: 'L1' }],
      camera: cam,
      build(k) {
        k.board(0.76, 0.5, 0.04, -0.02);
        const ps = k.powerSupply(-0.25, 0.0), sw = k.switchK(-0.1, 0.15), A = k.meter(0.02, 0.15, 'A');
        const L1 = k.lamp(0.16, 0.15, 'L₁'), L2 = k.lamp(0.14, -0.1, 'L₂'), Vm = k.meter(0.33, -0.17, 'V');
        ps.set(4);
        k.wire(ps.plus, sw.a); k.wire(sw.b, A.a); k.wire(A.b, L1.a); k.wire(L1.b, L2.b, 0.06); k.wire(L2.a, ps.minus);
        const vw = [];
        return {
          update(v) {
            L2.setRemoved(v.L2 === 'yoq'); sw.set(false); L1.set(0); L2.set(0); A.set(0, 'A'); Vm.set(0, 'V');
            vw.forEach((m) => { m.parent.remove(m); m.geometry.dispose(); }); vw.length = 0;
            const [p1, p2] = v.vm === 'L1' ? [L1.a, L1.b] : v.vm === 'L2' ? [L2.b, L2.a] : [L1.a, L2.a];
            vw.push(k.wire(Vm.a, p1, 0.06), k.wire(Vm.b, p2, 0.06));
          },
          progress(p, v, c) { sw.set(p > 0.3); const f = on(p); L1.set(c.lit ? 0.45 * f : 0); L2.set(c.lit ? 0.45 * f : 0); A.set((c.I / 0.5) * f, f > 0.99 ? `${fmt(c.I, 2)} A` : 'A'); Vm.set((c.Uv / 8) * f, f > 0.99 ? `${fmt(c.Uv, 1)} V` : 'V'); }
        };
      }
    },

    /* ===== 22-§ Iste’molchilarni parallel ulash (p.67): lamps in parallel ===== */
    'parallel-lampalar': {
      controls: [
        { key: 'L2', label: 'Ikkinchi lampochka', type: 'choice', value: 'bor', options: [{ v: 'bor', label: 'L₂ o‘rnida' }, { v: 'yoq', label: 'L₂ burab olingan' }] },
        { key: 'am', label: 'Ampermetr ulangan', type: 'choice', value: 'total', options: [{ v: 'total', label: 'Umumiy' }, { v: 'L1', label: 'L₁' }, { v: 'L2', label: 'L₂' }] }
      ],
      compute: (v) => { const I1 = 0.2, I2 = v.L2 === 'bor' ? 0.2 : 0; return { Ia: v.am === 'L1' ? I1 : v.am === 'L2' ? I2 : I1 + I2, lit2: v.L2 === 'bor' }; },
      readouts: (v, c, done) => [['U', '4 V'], [v.am === 'total' ? 'I' : (v.am === 'L1' ? 'I₁' : 'I₂'), done ? `${fmt(c.Ia, 2)} A` : '—', true], ['L₁', done ? 'yonadi' : '—']],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 0.9,
      steps: [
        { text: 'Umumiy tok kuchini o‘lchang', done: (s) => s.runs.some((r) => r.am === 'total' && r.L2 === 'bor') },
        { text: 'Tarmoqlardagi I₁ va I₂ ni o‘lchang', done: (s) => s.runs.some((r) => r.am === 'L1' && r.L2 === 'bor') && s.runs.some((r) => r.am === 'L2' && r.L2 === 'bor') },
        { text: 'L₂ ni burab olib, L₁ ni kuzating', done: (s) => has(s.runs, 'L2', 'yoq') }
      ],
      cols: ['L₂', 'Ampermetr', 'I'],
      row: (r) => [r.L2 === 'bor' ? 'o‘rnida' : 'olingan', r.am === 'total' ? 'Umumiy' : (r.am === 'L1' ? 'L₁' : 'L₂'), `${fmt(r.Ia, 2)} A`],
      demo: [{ L2: 'bor', am: 'total' }, { L2: 'bor', am: 'L1' }, { L2: 'bor', am: 'L2' }, { L2: 'yoq', am: 'total' }],
      camera: cam,
      build(k) {
        k.board(0.8, 0.52, 0.06, -0.03);
        const ps = k.powerSupply(-0.25, 0.0), sw = k.switchK(-0.08, 0.16), A = k.meter(0, 0, 'A');
        const L1 = k.lamp(0.2, 0.04, 'L₁'), L2 = k.lamp(0.2, -0.12, 'L₂');
        const nodeA = k.group(0.04, k.BY, -0.04), nodeB = k.group(0.36, k.BY, -0.04);
        [nodeA, nodeB].forEach((n) => { const p = k.cyl(0.006, 0.016, 0x0B1026, { metalness: 0.4 }, 12); p.position.y = 0.008; n.add(p); });
        const NA = () => k.world(nodeA, k.V(0, 0.016, 0)), NB = () => k.world(nodeB, k.V(0, 0.016, 0));
        ps.set(4);
        return {
          update(v) {
            L2.setRemoved(v.L2 === 'yoq'); sw.set(false); L1.set(0); L2.set(0); A.set(0, 'A'); k.clearWires();
            const slot = { total: [0.1, 0.16], L1: [0.07, 0.08], L2: [0.07, -0.19] }[v.am];
            A.group.position.set(slot[0], k.BY, slot[1]);
            k.wire(ps.plus, sw.a);
            if (v.am === 'total') { k.wire(sw.b, A.a); k.wire(A.b, NA()); } else k.wire(sw.b, NA());
            if (v.am === 'L1') { k.wire(NA(), A.a); k.wire(A.b, L1.a); } else k.wire(NA(), L1.a);
            if (v.am === 'L2') { k.wire(NA(), A.a); k.wire(A.b, L2.a); } else k.wire(NA(), L2.a);
            k.wire(L1.b, NB()); k.wire(L2.b, NB()); k.wire(NB(), ps.minus, 0.07);
          },
          progress(p, v, c) { sw.set(p > 0.3); const f = on(p); L1.set(0.6 * f); L2.set(c.lit2 ? 0.6 * f : 0); A.set((c.Ia / 0.5) * f, f > 0.99 ? `${fmt(c.Ia, 2)} A` : 'A'); }
        };
      }
    },

    /* ===== 27-§ Elektr sig‘imi. Kondensatorlar (p.79): C = ε·ε₀·S/d ===== */
    'kondensator': {
      controls: [
        { key: 'd', label: 'Qoplamalar orasidagi masofa, d', type: 'range', min: 1, max: 5, step: 1, value: 3, unit: 'mm', d: 0 },
        { key: 'S', label: 'Qoplamalarning ustma-ust yuzasi, S', type: 'choice', value: 100, options: [{ v: 50, label: '50 sm²' }, { v: 100, label: '100 sm²' }] },
        { key: 'eps', label: 'Qoplamalar orasida', type: 'choice', value: 'havo', options: [{ v: 'havo', label: 'Havo (ε = 1)' }, { v: 'shisha', label: 'Shisha (ε = 7)' }] }
      ],
      compute: (v) => { const eps = v.eps === 'shisha' ? 7 : 1; return { C: (eps * 8.85e-12 * (v.S / 10000)) / (v.d / 1000) * 1e12 }; },
      readouts: (v, c, done) => [['d', `${v.d} mm`], ['S', `${v.S} sm²`], ['ε', v.eps === 'shisha' ? '7' : '1'], ['C', done ? `${fmt(c.C, 0)} pF` : '—', true]],
      run: ['Sig‘imni o‘lchash', 'O‘lchanmoqda…', 'Qayta o‘lchash'],
      duration: () => 0.8,
      steps: [
        { text: 'Qoplamalar orasidagi masofani o‘zgartirib, sig‘imni o‘lchang', done: (s) => uniq(s.runs, 'd') >= 2 },
        { text: 'Qoplamalar yuzasini o‘zgartiring', done: (s) => uniq(s.runs, 'S') >= 2 },
        { text: 'Orasiga shisha qo‘yib, sig‘imni solishtiring', done: (s) => has(s.runs, 'eps', 'shisha') }
      ],
      cols: ['d', 'S', 'ε', 'C'],
      row: (r) => [`${r.d} mm`, `${r.S} sm²`, r.eps === 'shisha' ? '7' : '1', `${fmt(r.C, 0)} pF`],
      demo: [{ d: 3, S: 100, eps: 'havo' }, { d: 1, S: 100, eps: 'havo' }, { d: 1, S: 50, eps: 'havo' }, { d: 1, S: 100, eps: 'shisha' }],
      camera: { target: [0.03, 0.09, 0.02], dir: [0.02, 0.35, 1], fitW: 0.36, fitH: 0.28, min: 0.5 },
      build(k) {
        k.board(0.44, 0.3, 0.06, 0);
        const cp = k.capacitor(0, 0), m = k.meter(0.13, 0.06, 'pF');
        k.label('d', k.V(0, 0.2, 0.05), { color: '#3B4CFF', border: '#3B4CFF' });
        k.wire(cp.a, m.a, 0.05); k.wire(cp.b, m.b, 0.04);
        return {
          update(v) { cp.set(v.d, v.S / 100, v.eps === 'shisha'); m.set(0, 'pF'); },
          progress(p, v, c) { const f = ease(p); m.set((c.C / 700) * f, p >= 1 ? `${fmt(c.C, 0)} pF` : 'pF'); }
        };
      }
    },

    /* ===== 34-§ Qizish / energiya (p.99): 60 W vs 7 W LED ===== */
    'lampochka-energiyasi': {
      controls: [{ key: 't', label: 'Yonish vaqti, t', type: 'range', min: 1, max: 10, step: 1, value: 10, unit: 'soat', d: 0 }],
      compute: (v) => ({ Wi: 0.06 * v.t, Wl: 0.007 * v.t }),
      readouts: (v, c, done) => [['t', `${v.t} soat`], ['W (60 W)', done ? `${fmt(c.Wi, 2)} kW·soat` : '—', true], ['W (LED 7 W)', done ? `${fmt(c.Wl, 3)} kW·soat` : '—', true], ['Farq', done ? `${fmt(c.Wi / c.Wl, 1)} marta` : '—']],
      run: ['Yoqish', 'Yonmoqda…', 'Qayta yoqish'],
      duration: () => 2.5,
      steps: [
        { text: 'Lampochkalarni yoqib, sarflangan energiyani o‘lchang', done: (s) => s.runs.length > 0 },
        { text: 'Vaqtni o‘zgartirib, qayta o‘lchang', done: (s) => uniq(s.runs, 't') >= 2 },
        { text: '10 soatdagi sarfni solishtiring', done: (s) => has(s.runs, 't', 10) }
      ],
      cols: ['t', '60 W', 'LED'],
      row: (r) => [`${r.t} soat`, `${fmt(r.Wi, 2)}`, `${fmt(r.Wl, 3)}`],
      demo: [{ t: 1 }, { t: 10 }],
      camera: { target: [0, 0.05, 0], dir: [0.05, 0.75, 1], fitW: 0.5, fitH: 0.32, min: 0.62 },
      build(k) {
        k.board(0.46, 0.28, 0, 0);
        const inc = k.lamp(-0.1, 0, 'Cho‘g‘lanma 60 W'), led = k.lamp(0.1, 0, 'LED 7 W', { color: 0xFFFFFF });
        const cI = k.label('0,00 kW·soat', k.V(-0.1, 0.03, 0.08)), cL = k.label('0,000 kW·soat', k.V(0.1, 0.03, 0.08));
        return {
          update() { inc.set(0); led.set(0); cI.setText('0,00 kW·soat'); cL.setText('0,000 kW·soat'); },
          progress(p, v, c) { inc.set(p < 1 ? 0.9 : 0); led.set(p < 1 ? 0.9 : 0); cI.setText(`${fmt(c.Wi * p, 2)} kW·soat`); cL.setText(`${fmt(c.Wl * p, 3)} kW·soat`); }
        };
      }
    },

    /* ===== 36-§ Joul–Lens qonuni (p.102): Q = I²·R·t ===== */
    'joul-lens': {
      controls: [
        { key: 'I', label: 'Tok kuchi, I', type: 'range', min: 1, max: 3, step: 1, value: 1, unit: 'A', d: 0 },
        { key: 'R', label: 'Spiral qarshiligi, R', type: 'choice', value: 4, options: [{ v: 2, label: '2 Ω' }, { v: 4, label: '4 Ω' }] },
        { key: 't', label: 'Vaqt, t', type: 'range', min: 60, max: 300, step: 60, value: 120, unit: 's', d: 0 }
      ],
      compute: (v) => { const Q = v.I * v.I * v.R * v.t; return { Q, dT: Q / (4200 * 0.2) }; },
      readouts: (v, c, done) => [['I', `${v.I} A`], ['R', `${v.R} Ω`], ['t', `${v.t} s`], ['Q = I²Rt', done ? `${fmt(c.Q, 0)} J` : '—', true], ['Δt', done ? `${fmt(c.dT, 1)} °C` : '—', true]],
      run: ['Tokni ulash', 'Isimoqda…', 'Qayta o‘lchash'],
      duration: () => 3,
      steps: [
        { text: 'Tokni ulab, Q va suv haroratining o‘zgarishini aniqlang', done: (s) => s.runs.length > 0 },
        { text: 'Tok kuchini 2 marta oshirib, Q ni solishtiring', done: (s) => s.runs.some((a) => s.runs.some((b) => b.I === 2 * a.I && b.R === a.R && b.t === a.t)) },
        { text: 'Spiral qarshiligini o‘zgartirib, solishtiring', done: (s) => uniq(s.runs, 'R') >= 2 }
      ],
      cols: ['I', 'R', 't', 'Q', 'Δt'],
      row: (r) => [`${r.I} A`, `${r.R} Ω`, `${r.t} s`, `${fmt(r.Q, 0)} J`, `${fmt(r.dT, 1)} °C`],
      demo: [{ I: 1, R: 4, t: 120 }, { I: 2, R: 4, t: 120 }, { I: 2, R: 2, t: 120 }],
      camera: { target: [0.05, 0.06, 0], dir: [0.05, 0.85, 1], fitW: 0.8, fitH: 0.5, min: 0.8 },
      build(k) {
        k.board(0.72, 0.46, 0.03, -0.02);
        const ps = k.powerSupply(-0.24, 0.0), sw = k.switchK(-0.1, 0.15), A = k.meter(0.08, 0.15, 'A'), cal = k.calorimeter(0.12, -0.08), sw2 = k.stopwatch(0.3, 0.13);
        k.wire(ps.plus, sw.a); k.wire(sw.b, A.a); k.wire(A.b, cal.b, 0.06); k.wire(cal.a, ps.minus, 0.08);
        return {
          update(v) { ps.set(v.I * v.R); sw.set(false); A.set(0, 'A'); cal.setTemp(20); cal.setHeat(0); sw2.set(0); },
          progress(p, v, c) { sw.set(p < 1); A.set(p < 1 ? v.I / 3.5 : 0, `${v.I} A`); cal.setHeat(p < 1 ? v.I / 3 : 0); cal.setTemp(20 + c.dT * ease(p)); sw2.set((v.t * p) / 1); }
        };
      }
    },

    /* ===== 37-§ Xonadonlardagi elektr zanjirlar (p.106): finding the phase wire ===== */
    'faza-indikator': {
      controls: [{ key: 'hole', label: 'Indikator tekkiziladigan teshik', type: 'choice', value: 'chap', options: [{ v: 'chap', label: 'Chap teshik' }, { v: 'ong', label: 'O‘ng teshik' }] }],
      compute: (v) => ({ phase: v.hole === 'ong' }),
      readouts: (v, c, done) => [['Teshik', v.hole === 'chap' ? 'chap' : 'o‘ng'], ['Indikator', done ? (c.phase ? 'yondi' : 'yonmadi') : '—', true], ['Sim', done ? (c.phase ? 'faza (L)' : 'nol (N)') : '—', true]],
      run: ['Indikatorni tekkizish', 'Tekshirilmoqda…', 'Qayta tekshirish'],
      duration: () => 1.2,
      steps: [
        { text: 'Indikatorni chap teshikka tekkizing', done: (s) => has(s.runs, 'hole', 'chap') },
        { text: 'Indikatorni o‘ng teshikka tekkizing', done: (s) => has(s.runs, 'hole', 'ong') },
        { text: 'Faza simi qaysi teshikda ekanini aniqlang', done: (s) => has(s.runs, 'hole', 'chap') && has(s.runs, 'hole', 'ong') }
      ],
      cols: ['Teshik', 'Indikator', 'Sim'],
      row: (r) => [r.hole === 'chap' ? 'Chap' : 'O‘ng', r.phase ? 'yondi' : 'yonmadi', r.phase ? 'faza' : 'nol'],
      demo: [{ hole: 'chap' }, { hole: 'ong' }],
      camera: { target: [0, 0.13, 0.02], dir: [0.25, 0.25, 1], fitW: 0.4, fitH: 0.32, min: 0.55 },
      build(k) {
        const st = k.socketTester(0, 0);
        k.label('Faqat virtual tajriba: haqiqiy rozetkani faqat kattalar tekshiradi', k.V(0, 0.035, -0.03), { minor: true });
        return {
          update(v) { st.setTool(v.hole === 'chap' ? -0.02 : 0.02, 0); st.setGlow(0); },
          progress(p, v, c) { const inF = ease(Math.min(1, p * 2)); st.setTool(v.hole === 'chap' ? -0.02 : 0.02, inF); st.setGlow(c.phase && p > 0.5 ? 1 : 0); }
        };
      }
    }
  });
})();
