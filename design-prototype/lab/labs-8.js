// Empira — 8-sinf Fizika lab definitions (one per lab slug in ../topic/content.js).
// Each lab follows its textbook page: equipment, procedure (steps), measurement table and values.
// Physics uses the textbook formulas (Ohm's law, P = I·U, …). These are demo labs, not full simulators.
//
// Definition shape:
//   controls  [{ key, label, type: 'range', min, max, step, value, unit, d, text? } | { key, label, type: 'choice', value, options: [{ v, label }] }]
//   compute(v)                → derived values (merged into each measurement row)
//   readouts(v, c, done, runs)→ [[name, text, isKey]] pills over the scene
//   run [idle, running, again], duration(v, c) seconds
//   steps [{ text, done(state) }]  state = { runs, touched:Set, phase }
//   cols, row(r)              → measurement table
//   demo                      → values for &holat=tugadi
//   camera { target, dir, fitW, fitH, min }
//   build(kit) → { update(v, c), progress(p, v, c), animate?(dt, phase) }

(function () {
  const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',');
  const uniq = (runs, key) => new Set(runs.map((r) => String(r[key]))).size;
  const has = (runs, key, val) => runs.some((r) => String(r[key]) === String(val));
  const ease = (p) => p * p * (3 - 2 * p);
  const circuitCam = { target: [0.04, 0.03, 0], dir: [0.05, 1.15, 1], fitW: 0.86, fitH: 0.56, min: 0.85 };
  // switch closes in the first 40 % of a run, then the current rises
  const on = (p) => (p <= 0.4 ? 0 : ease((p - 0.4) / 0.6));

  window.EMPIRA_LABS = {

    /* ================= §6 Elektr shamoli (amaliy, p.24) ================= */
    'elektr-shamoli': {
      controls: [
        { key: 'speed', label: 'Aylantirish tezligi', type: 'range', min: 1, max: 3, step: 1, value: 2, text: (v) => ['sekin', 'o‘rtacha', 'tez'][v - 1] },
        { key: 'd', label: 'Uchdan shamgacha masofa', type: 'range', min: 2, max: 10, step: 2, value: 6, unit: 'sm', d: 0 }
      ],
      compute: (v) => ({ angle: Math.min(60, Math.round((9 * v.speed * 6) / v.d)) }),
      readouts: (v, c, done) => [['d', `${v.d} sm`], ['Tezlik', ['sekin', 'o‘rtacha', 'tez'][v.speed - 1]], ['Alanga og‘ishi', done ? `${c.angle}°` : '—', true]],
      run: ['Dastani aylantirish', 'Aylanmoqda…', 'Qayta aylantirish'],
      duration: () => 2.5,
      steps: [
        { text: 'Dastani aylantirib, sham alangasini kuzating', done: (s) => s.runs.length > 0 },
        { text: 'Shamni uchli jismga yaqinlashtirib, qayta kuzating', done: (s) => uniq(s.runs, 'd') >= 2 },
        { text: 'Aylantirish tezligini o‘zgartirib, og‘ishni solishtiring', done: (s) => uniq(s.runs, 'speed') >= 2 }
      ],
      cols: ['d', 'Tezlik', 'Og‘ish'],
      row: (r) => [`${r.d} sm`, ['sekin', 'o‘rtacha', 'tez'][r.speed - 1], `${r.angle}°`],
      demo: [{ speed: 2, d: 6 }, { speed: 2, d: 2 }, { speed: 3, d: 2 }],
      camera: { target: [0.06, 0.12, 0.03], dir: [0.15, 0.5, 1], fitW: 0.5, fitH: 0.36, min: 0.7 },
      build(k) {
        const { THREE, V } = k;
        const m = k.electrophore(-0.08, 0);
        const ball = m.ball;
        // pointed conductor fixed to the ball, pointing at the candle (+x)
        const rod = new THREE.Mesh(new THREE.ConeGeometry(0.004, 0.07, 16), k.mat(0xC9CED9, { metalness: 0.8, roughness: 0.25 }));
        rod.rotation.z = -Math.PI / 2; rod.position.set(ball.x + 0.05, ball.y, ball.z); rod.castShadow = true; k.group().add(rod);
        const tipX = ball.x + 0.085;
        const cand = k.candle(tipX + 0.06, ball.z);
        cand.group.position.y = 0.05;                                    // candle on a block: flame level with the point
        const block = k.box(0.06, 0.05, 0.06, 0x3A4166); block.position.y = -0.025; cand.group.add(block);
        k.label('Uchli jism', V(ball.x + 0.05, ball.y + 0.05, ball.z), { minor: true });
        let angle = 0, speed = 2, running = false;
        return {
          update(v) { speed = v.speed; running = false; cand.group.position.x = tipX + v.d / 100 + 0.012; cand.set(0); },
          progress(p, v, c) { running = p < 1; cand.set(c.angle * ease(Math.min(1, p * 1.6))); },
          animate(dt, phase) { if (phase === 'running') { angle += dt * speed * 3; m.set(angle); } cand.animate(dt); }
        };
      }
    },

    /* ================= §14 Zanjir yig‘ish (lab, p.46) ================= */
    'elektr-zanjir': {
      controls: [
        { key: 'U', label: 'Manba kuchlanishi, U', type: 'range', min: 2, max: 8, step: 2, value: 4, unit: 'V', d: 0 },
        { key: 'am', label: 'Ampermetr ulangan joy', type: 'choice', value: 1, options: [{ v: 1, label: 'L₁ dan oldin' }, { v: 2, label: 'L₁ va L₂ orasida' }, { v: 3, label: 'L₂ dan keyin' }] },
        { key: 'vm', label: 'Voltmetr ulangan joy', type: 'choice', value: 'L1', options: [{ v: 'L1', label: 'L₁' }, { v: 'L2', label: 'L₂' }, { v: 'AB', label: 'Umumiy' }] }
      ],
      compute: (v) => { const I = v.U / 20; return { I, Uv: v.vm === 'AB' ? v.U : v.U / 2 }; },
      readouts: (v, c, done) => [['U', `${v.U} V`], ['I', done ? `${fmt(c.I, 2)} A` : '—', true], [v.vm === 'AB' ? 'U (umumiy)' : `U (${v.vm === 'L1' ? 'L₁' : 'L₂'})`, done ? `${fmt(c.Uv, 1)} V` : '—', true]],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 0.9,
      steps: [
        { text: 'Kalitni ulab, tok kuchini o‘lchang', done: (s) => s.runs.length > 0 },
        { text: 'Ampermetrni boshqa joyga ulab, qayta o‘lchang', done: (s) => uniq(s.runs, 'am') >= 2 },
        { text: 'U₁, U₂ va umumiy U ni o‘lchang', done: (s) => ['L1', 'L2', 'AB'].every((x) => has(s.runs, 'vm', x)) }
      ],
      cols: ['Ampermetr', 'I', 'Voltmetr', 'U'],
      row: (r) => [`${r.am}-joy`, `${fmt(r.I, 2)} A`, r.vm === 'AB' ? 'Umumiy' : (r.vm === 'L1' ? 'L₁' : 'L₂'), `${fmt(r.Uv, 1)} V`],
      demo: [{ U: 4, am: 1, vm: 'L1' }, { U: 4, am: 2, vm: 'L2' }, { U: 4, am: 3, vm: 'AB' }],
      camera: circuitCam,
      build(k) {
        k.board(0.76, 0.5, 0.04, -0.02);
        const ps = k.powerSupply(-0.25, 0.0), sw = k.switchK(-0.1, 0.15);
        const L1 = k.lamp(0.14, 0.15, 'L₁'), L2 = k.lamp(0.14, -0.1, 'L₂');
        const A = k.meter(0, 0, 'A'), Vm = k.meter(0.33, -0.17, 'V');
        const slots = { 1: [0.02, 0.15], 2: [0.3, 0.03], 3: [0.0, -0.1] };
        let vm = 'L1';
        return {
          update(v) {
            vm = v.vm;
            A.group.position.set(slots[v.am][0], k.BY, slots[v.am][1]);
            ps.set(v.U); sw.set(false); L1.set(0); L2.set(0); A.set(0, 'A'); Vm.set(0, 'V');
            k.clearWires();
            // series loop: + → K → [1] → L1 → [2] → L2 → [3] → −
            const chain = [['out', ps.plus], ['in', sw.a], ['out', sw.b], 1, ['in', L1.a], ['out', L1.b], 2, ['in', L2.b], ['out', L2.a], 3, ['in', ps.minus]];
            let prev = null;
            chain.forEach((n) => {
              if (typeof n === 'number') { if (n === v.am) { k.wire(prev, A.a); prev = A.b; } return; }
              if (n[0] === 'in') k.wire(prev, n[1]); else prev = n[1];
            });
            const [p1, p2] = vm === 'L1' ? [L1.a, L1.b] : vm === 'L2' ? [L2.b, L2.a] : [L1.a, L2.a];
            k.wire(Vm.a, p1, 0.06); k.wire(Vm.b, p2, 0.06);
          },
          progress(p, v, c) {
            sw.set(p > 0.3); const f = on(p);
            L1.set((v.U / 2 / 4) * f); L2.set((v.U / 2 / 4) * f);
            A.set((c.I / 0.5) * f, f > 0.99 ? `${fmt(c.I, 2)} A` : 'A'); Vm.set((c.Uv / 10) * f, f > 0.99 ? `${fmt(c.Uv, 1)} V` : 'V');
          }
        };
      }
    },

    /* ================= §19 Om qonunini o‘rganish (lab, p.61) ================= */
    'om-qonuni': {
      controls: [{ key: 'U', label: 'Manba kuchlanishi, U', type: 'range', min: 4, max: 10, step: 2, value: 4, unit: 'V', d: 0 }],
      compute: (v) => { const I = v.U / 200; return { I, mA: I * 1000, R: v.U / I }; },
      readouts: (v, c, done, runs) => {
        const out = [['U', `${v.U} V`], ['I', done ? `${fmt(c.mA, 0)} mA` : '—', true], ['R = U / I', done ? `${fmt(c.R, 0)} Ω` : '—']];
        if (uniq(runs, 'U') >= 4) out.push(['Rₒ‘ᵣₜ', `${fmt(runs.reduce((a, r) => a + r.R, 0) / runs.length, 0)} Ω`, true]);
        return out;
      },
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 0.9,
      steps: [
        { text: 'U = 4 V da kalitni ulab, tok kuchini o‘lchang', done: (s) => has(s.runs, 'U', 4) },
        { text: 'Kuchlanishni oshirib, yana o‘lchang', done: (s) => uniq(s.runs, 'U') >= 2 },
        { text: '4 xil kuchlanishda o‘lchab, Rₒ‘ᵣₜ ni toping', done: (s) => uniq(s.runs, 'U') >= 4 }
      ],
      cols: ['U', 'I', 'R'],
      row: (r) => [`${r.U} V`, `${fmt(r.mA, 0)} mA`, `${fmt(r.R, 0)} Ω`],
      demo: [{ U: 4 }, { U: 6 }, { U: 8 }, { U: 10 }],
      camera: circuitCam,
      build(k) {
        k.board(0.7, 0.46, 0.03, -0.02);
        const ps = k.powerSupply(-0.22, 0.0), sw = k.switchK(-0.06, 0.15);
        const mA = k.meter(0.14, 0.15, 'mA'), R = k.resistor(0.14, -0.04, 'R'), Vm = k.meter(0.14, -0.17, 'V');
        const defaultWires = [['sp','ka'],['kb','ap'],['an','rp'],['rn','sn'],['vp','rp'],['vn','rn']];
        const terminals = { sp:ps.plus, sn:ps.minus, ka:sw.a, kb:sw.b, ap:mA.a, an:mA.b, rp:R.b, rn:R.a, vp:Vm.a, vn:Vm.b };
        function setConnections(wires) {
          k.clearWires();
          (wires || defaultWires).forEach(([a,b]) => {
            if (terminals[a] && terminals[b]) k.wire(terminals[a], terminals[b], 0.05);
          });
        }
        setConnections(null);
        return {
          setConnections,
          update(v) { ps.set(v.U); sw.set(false); mA.set(0, 'mA'); Vm.set(0, 'V'); },
          progress(p, v, c) { sw.set(p > 0.3); const f = on(p); mA.set((c.mA / 60) * f, f > 0.99 ? `${fmt(c.mA, 0)} mA` : 'mA'); Vm.set((v.U / 12) * f, f > 0.99 ? `${v.U} V` : 'V'); }
        };
      }
    },

    /* ================= §20 Reostat (amaliy, p.63) ================= */
    'reostat': {
      controls: [{ key: 'pos', label: 'Reostat surgichi', type: 'range', min: 1, max: 4, step: 1, value: 1, text: (v) => `${v}-holat` }],
      compute: (v) => { const Rr = [20, 14, 8, 2][v.pos - 1]; return { Rr, I: 8 / (6 + Rr) }; },
      readouts: (v, c, done) => [['U', '8 V'], ['Rᵣ', `${c.Rr} Ω`], ['R', '6 Ω'], ['I', done ? `${fmt(c.I, 2)} A` : '—', true]],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 0.9,
      steps: [
        { text: 'Surgichni 1-holatga qo‘yib, tok kuchini o‘lchang', done: (s) => has(s.runs, 'pos', 1) },
        { text: 'Surgichni siljitib, qayta o‘lchang', done: (s) => uniq(s.runs, 'pos') >= 2 },
        { text: '4 ta holatda o‘lchab, jadvalni to‘ldiring', done: (s) => uniq(s.runs, 'pos') >= 4 }
      ],
      cols: ['Holat', 'Rᵣ', 'I'],
      row: (r) => [`${r.pos}`, `${r.Rr} Ω`, `${fmt(r.I, 2)} A`],
      demo: [{ pos: 1 }, { pos: 2 }, { pos: 3 }, { pos: 4 }],
      camera: circuitCam,
      build(k) {
        k.board(0.76, 0.46, 0.05, -0.02);
        const ps = k.powerSupply(-0.24, 0.0), sw = k.switchK(-0.08, 0.15), rh = k.rheostat(0.15, 0.15);
        const A = k.meter(0.3, -0.06, 'A'), R = k.resistor(0.08, -0.14, 'R = 6 Ω');
        ps.set(8);
        k.wire(ps.plus, sw.a); k.wire(sw.b, rh.a); k.wire(rh.b, A.a); k.wire(A.b, R.b); k.wire(R.a, ps.minus);
        return {
          update(v) { rh.set((v.pos - 1) / 3); sw.set(false); A.set(0, 'A'); },
          progress(p, v, c) { sw.set(p > 0.3); const f = on(p); A.set((c.I / 1.2) * f, f > 0.99 ? `${fmt(c.I, 2)} A` : 'A'); }
        };
      }
    },

    /* ================= §23 Tok manbalarini ulash (amaliy, p.71) ================= */
    'tok-manbalari': {
      controls: [{ key: 'vm', label: 'Voltmetr ulangan', type: 'choice', value: '1', options: [{ v: '1', label: '1-element' }, { v: '2', label: '2-element' }, { v: '3', label: '3-element' }, { v: 'all', label: 'Ketma-ket (hammasi)' }] }],
      compute: (v) => { const cellsU = [1.52, 1.49, 1.51]; return { Uv: v.vm === 'all' ? cellsU.reduce((a, b) => a + b, 0) : cellsU[+v.vm - 1] }; },
      readouts: (v, c, done, runs) => {
        const out = [['Voltmetr', v.vm === 'all' ? 'ketma-ket' : `${v.vm}-element`], ['U', done ? `${fmt(c.Uv, 2)} V` : '—', true]];
        if (['1', '2', '3', 'all'].every((x) => has(runs, 'vm', x))) out.push(['U₁ + U₂ + U₃', `${fmt(1.52 + 1.49 + 1.51, 2)} V`]);
        return out;
      },
      run: ['O‘lchash', 'O‘lchanmoqda…', 'Qayta o‘lchash'],
      duration: () => 0.7,
      steps: [
        { text: 'Har bir elementning kuchlanishini o‘lchang', done: (s) => ['1', '2', '3'].every((x) => has(s.runs, 'vm', x)) },
        { text: 'Elementlarni ketma-ket ulab, Uᵤₘ ni o‘lchang', done: (s) => has(s.runs, 'vm', 'all') },
        { text: 'U₁ + U₂ + U₃ ni Uᵤₘ bilan solishtiring', done: (s) => ['1', '2', '3', 'all'].every((x) => has(s.runs, 'vm', x)) }
      ],
      cols: ['O‘lchandi', 'U'],
      row: (r) => [r.vm === 'all' ? 'Ketma-ket' : `${r.vm}-element`, `${fmt(r.Uv, 2)} V`],
      demo: [{ vm: '1' }, { vm: '2' }, { vm: '3' }, { vm: 'all' }],
      camera: { target: [0, 0.03, -0.03], dir: [0.05, 1.15, 1], fitW: 0.46, fitH: 0.4, min: 0.6 },
      build(k) {
        k.board(0.4, 0.34, 0, -0.03);
        const cs = k.cells(3, 0, 0.04), Vm = k.meter(0, -0.12, 'V');
        return {
          update(v) {
            Vm.set(0, 'V'); k.clearWires();
            const c = cs.cells;
            if (v.vm === 'all') { k.wire(c[0].minus, c[1].plus, 0.02); k.wire(c[1].minus, c[2].plus, 0.02); k.wire(Vm.a, c[0].plus, 0.06); k.wire(Vm.b, c[2].minus, 0.04); }
            else { const cell = c[+v.vm - 1]; k.wire(Vm.a, cell.plus, 0.06); k.wire(Vm.b, cell.minus, 0.04); }
          },
          progress(p, v, c) { const f = ease(p); Vm.set((c.Uv / 6) * f, p >= 1 ? `${fmt(c.Uv, 2)} V` : 'V'); }
        };
      }
    },

    /* ================= §24 Ketma-ket ulash (lab, p.72) ================= */
    'ketma-ket-ulash': {
      controls: [
        { key: 'U', label: 'Manba kuchlanishi, U', type: 'range', min: 4, max: 6, step: 2, value: 4, unit: 'V', d: 0 },
        { key: 'vm', label: 'Voltmetr ulangan', type: 'choice', value: 'R1', options: [{ v: 'R1', label: 'R₁' }, { v: 'R2', label: 'R₂' }, { v: 'AB', label: 'Umumiy (AB)' }] }
      ],
      compute: (v) => { const I = v.U / 250; return { I, mA: I * 1000, Uv: v.vm === 'R1' ? I * 100 : v.vm === 'R2' ? I * 150 : v.U }; },
      readouts: (v, c, done) => [['R₁, R₂', '100 Ω, 150 Ω'], ['I', done ? `${fmt(c.mA, 0)} mA` : '—', true], [v.vm === 'AB' ? 'Uᴬᴮ' : (v.vm === 'R1' ? 'U₁' : 'U₂'), done ? `${fmt(c.Uv, 1)} V` : '—', true]],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 0.9,
      steps: [
        { text: 'Voltmetrni R₁ ga ulab, U₁ va I ni o‘lchang', done: (s) => has(s.runs, 'vm', 'R1') },
        { text: 'Voltmetrni R₂ ga ulab, U₂ ni o‘lchang', done: (s) => has(s.runs, 'vm', 'R2') },
        { text: 'Umumiy kuchlanish Uᴬᴮ ni o‘lchang', done: (s) => has(s.runs, 'vm', 'AB') }
      ],
      cols: ['Voltmetr', 'U', 'I'],
      row: (r) => [r.vm === 'AB' ? 'AB' : (r.vm === 'R1' ? 'R₁' : 'R₂'), `${fmt(r.Uv, 1)} V`, `${fmt(r.mA, 0)} mA`],
      demo: [{ U: 4, vm: 'R1' }, { U: 4, vm: 'R2' }, { U: 4, vm: 'AB' }],
      camera: circuitCam,
      build(k) {
        k.board(0.76, 0.5, 0.04, -0.02);
        const ps = k.powerSupply(-0.25, 0.0), sw = k.switchK(-0.08, 0.15), mA = k.meter(0.12, 0.15, 'mA');
        const R1 = k.resistor(0.24, -0.06, 'R₁'), R2 = k.resistor(0.04, -0.06, 'R₂'), Vm = k.meter(0.14, -0.19, 'V');
        return {
          update(v) {
            ps.set(v.U); sw.set(false); mA.set(0, 'mA'); Vm.set(0, 'V'); k.clearWires();
            k.wire(ps.plus, sw.a); k.wire(sw.b, mA.a); k.wire(mA.b, R1.b); k.wire(R1.a, R2.b); k.wire(R2.a, ps.minus);
            const [p1, p2] = v.vm === 'R1' ? [R1.b, R1.a] : v.vm === 'R2' ? [R2.b, R2.a] : [R1.b, R2.a];
            k.wire(Vm.a, p1, 0.06); k.wire(Vm.b, p2, 0.06);
          },
          progress(p, v, c) { sw.set(p > 0.3); const f = on(p); mA.set((c.mA / 30) * f, f > 0.99 ? `${fmt(c.mA, 0)} mA` : 'mA'); Vm.set((c.Uv / 8) * f, f > 0.99 ? `${fmt(c.Uv, 1)} V` : 'V'); }
        };
      }
    },

    /* ================= §24 Parallel ulash (lab, p.73) ================= */
    'parallel-ulash': {
      controls: [
        { key: 'U', label: 'Manba kuchlanishi, U', type: 'range', min: 4, max: 6, step: 2, value: 4, unit: 'V', d: 0 },
        { key: 'am', label: 'Ampermetr ulangan', type: 'choice', value: 'total', options: [{ v: 'total', label: 'Umumiy' }, { v: 'R1', label: 'R₁' }, { v: 'R2', label: 'R₂' }] }
      ],
      compute: (v) => { const I1 = v.U / 200, I2 = v.U / 300; const Ia = v.am === 'R1' ? I1 : v.am === 'R2' ? I2 : I1 + I2; return { mA: Ia * 1000 }; },
      readouts: (v, c, done) => [['R₁, R₂', '200 Ω, 300 Ω'], ['U', done ? `${v.U} V` : '—', true], [v.am === 'total' ? 'I' : (v.am === 'R1' ? 'I₁' : 'I₂'), done ? `${fmt(c.mA, 1)} mA` : '—', true]],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 0.9,
      steps: [
        { text: 'Umumiy tok I va kuchlanish U ni o‘lchang', done: (s) => has(s.runs, 'am', 'total') },
        { text: 'Ampermetrni R₁ ga ulab, I₁ ni o‘lchang', done: (s) => has(s.runs, 'am', 'R1') },
        { text: 'Ampermetrni R₂ ga ulab, I₂ ni o‘lchang', done: (s) => has(s.runs, 'am', 'R2') }
      ],
      cols: ['Ampermetr', 'I', 'U'],
      row: (r) => [r.am === 'total' ? 'Umumiy' : (r.am === 'R1' ? 'R₁' : 'R₂'), `${fmt(r.mA, 1)} mA`, `${r.U} V`],
      demo: [{ U: 4, am: 'total' }, { U: 4, am: 'R1' }, { U: 4, am: 'R2' }],
      camera: circuitCam,
      build(k) {
        k.board(0.8, 0.52, 0.06, -0.03);
        const ps = k.powerSupply(-0.25, 0.0), sw = k.switchK(-0.08, 0.16), mA = k.meter(0, 0, 'mA');
        const R1 = k.resistor(0.2, 0.04, 'R₁'), R2 = k.resistor(0.2, -0.1, 'R₂'), Vm = k.meter(0.2, -0.23, 'V');
        const nodeA = k.group(0.04, k.BY, -0.03), nodeB = k.group(0.36, k.BY, -0.03);
        [nodeA, nodeB].forEach((n) => { const p = k.cyl(0.006, 0.016, 0x0B1026, { metalness: 0.4 }, 12); p.position.y = 0.008; n.add(p); });
        const A = () => nodeA.localToWorld(k.V(0, 0.016, 0)), B = () => nodeB.localToWorld(k.V(0, 0.016, 0));
        return {
          update(v) {
            ps.set(v.U); sw.set(false); mA.set(0, 'mA'); Vm.set(0, 'V'); k.clearWires();
            nodeA.updateMatrixWorld(true); nodeB.updateMatrixWorld(true);
            const slot = { total: [0.1, 0.16], R1: [0.07, 0.07], R2: [0.07, -0.17] }[v.am];
            mA.group.position.set(slot[0], k.BY, slot[1]);
            k.wire(ps.plus, sw.a);
            if (v.am === 'total') { k.wire(sw.b, mA.a); k.wire(mA.b, A()); } else k.wire(sw.b, A());
            if (v.am === 'R1') { k.wire(A(), mA.a); k.wire(mA.b, R1.a); } else k.wire(A(), R1.a);
            if (v.am === 'R2') { k.wire(A(), mA.a); k.wire(mA.b, R2.a); } else k.wire(A(), R2.a);
            k.wire(R1.b, B()); k.wire(R2.b, B()); k.wire(B(), ps.minus, 0.07);
            k.wire(Vm.a, A(), 0.05); k.wire(Vm.b, B(), 0.05);
          },
          progress(p, v, c) { sw.set(p > 0.3); const f = on(p); mA.set((c.mA / 60) * f, f > 0.99 ? `${fmt(c.mA, 1)} mA` : 'mA'); Vm.set((v.U / 8) * f, f > 0.99 ? `${v.U} V` : 'V'); }
        };
      }
    },

    /* ================= §33 Lampochka quvvati (lab, p.96) ================= */
    'lampochka-quvvati': {
      controls: [{ key: 'U', label: 'Lampochkadagi kuchlanish, U', type: 'range', min: 1.5, max: 4.5, step: 0.5, value: 3.5, unit: 'V', d: 1 }],
      compute: (v) => { const R = 8 + 1.6 * v.U; const I = v.U / R; const P = I * v.U; return { I, P, t: 5, W: P * 5 }; },
      readouts: (v, c, done, runs) => {
        const out = [['U', `${fmt(v.U, 1)} V`], ['I', done ? `${fmt(c.I, 2)} A` : '—'], ['P = I·U', done ? `${fmt(c.P, 2)} W` : '—', true], ['W = I·U·t', done ? `${fmt(c.W, 1)} J` : '—']];
        const same = runs.filter((r) => r.U === v.U);                     // book: 3 repeats of the same measurement
        if (same.length >= 3) out.push(['Pₒ‘ᵣₜ', `${fmt(same.slice(-3).reduce((a, r) => a + r.P, 0) / 3, 2)} W`, true]);
        return out;
      },
      run: ['Kalitni ulash', 'Lampochka yonmoqda…', 'Qayta o‘lchash'],
      duration: () => 5,
      steps: [
        { text: 'Kalitni ulab, I, U va vaqt t ni o‘lchang', done: (s) => s.runs.length > 0 },
        { text: 'Tajribani 3 marta takrorlang', done: (s) => s.runs.some((r) => s.runs.filter((x) => x.U === r.U).length >= 3) },
        { text: 'Pₒ‘ᵣₜ ni lampochkadagi «3,5 V; 0,26 A» yozuvi bilan solishtiring', done: (s) => s.runs.filter((x) => x.U === 3.5).length >= 3 }
      ],
      cols: ['U', 'I', 'P', 'W'],
      row: (r) => [`${fmt(r.U, 1)} V`, `${fmt(r.I, 2)} A`, `${fmt(r.P, 2)} W`, `${fmt(r.W, 1)} J`],
      demo: [{ U: 3.5 }, { U: 3.5 }, { U: 3.5 }],
      camera: { target: [0.07, 0.03, 0], dir: [0.05, 1.15, 1], fitW: 0.9, fitH: 0.56, min: 0.88 },
      build(k) {
        k.board(0.7, 0.46, 0.02, -0.02);
        const ps = k.powerSupply(-0.22, 0.0), sw = k.switchK(-0.06, 0.15), A = k.meter(0.13, 0.15, 'A');
        const lp = k.lamp(0.13, -0.06, 'Lampochka'), Vm = k.meter(0.13, -0.18, 'V'), sw2 = k.stopwatch(0.45, 0.1);
        k.wire(ps.plus, sw.a); k.wire(sw.b, A.a); k.wire(A.b, lp.b); k.wire(lp.a, ps.minus);
        k.wire(Vm.a, lp.b, 0.05); k.wire(Vm.b, lp.a, 0.05);
        return {
          update(v) { ps.set(v.U); sw.set(false); lp.set(0); A.set(0, 'A'); Vm.set(0, 'V'); sw2.set(0); },
          progress(p, v, c) {
            sw.set(true); const f = Math.min(1, p * 10);
            lp.set((c.P / 1.1) * f); A.set((c.I / 0.5) * f, `${fmt(c.I, 2)} A`); Vm.set((v.U / 6) * f, `${fmt(v.U, 1)} V`);
            sw2.set(5 * p);
          }
        };
      }
    },

    /* ================= §49 Magnitlar o‘zaro ta’siri (amaliy, p.142) ================= */
    'magnitlar-tasiri': {
      controls: [
        { key: 'poles', label: 'Qutblar', type: 'choice', value: 'har', options: [{ v: 'har', label: 'Har xil (N–S)' }, { v: 'bir', label: 'Bir xil (N–N)' }] },
        { key: 'd', label: 'Magnitlar orasidagi masofa', type: 'range', min: 1, max: 5, step: 1, value: 3, unit: 'sm', d: 0 }
      ],
      compute: (v) => { const P = 0.5, Fm = 0.4 / (v.d * v.d); const Ft = v.poles === 'har' ? P + Fm : Math.max(0, P - Fm); return { Ft, F: Math.abs(Ft - P) }; },
      readouts: (v, c, done) => [['d', `${v.d} sm`], ['Fₜ', done ? `${fmt(c.Ft, 2)} N` : '—', true], ['F', done ? `${fmt(c.F, 2)} N` : '—', true]],
      run: ['O‘lchash', 'O‘lchanmoqda…', 'Qayta o‘lchash'],
      duration: () => 1.2,
      steps: [
        { text: 'Har xil qutblarda tortilish kuchini o‘lchang', done: (s) => has(s.runs, 'poles', 'har') },
        { text: 'Masofani o‘zgartirib, qayta o‘lchang', done: (s) => uniq(s.runs, 'd') >= 2 },
        { text: 'Bir xil qutblarda itarilish kuchini o‘lchang', done: (s) => has(s.runs, 'poles', 'bir') }
      ],
      cols: ['Qutblar', 'd', 'Fₜ', 'F'],
      row: (r) => [r.poles === 'har' ? 'har xil' : 'bir xil', `${r.d} sm`, `${fmt(r.Ft, 2)} N`, `${fmt(r.F, 2)} N`],
      demo: [{ poles: 'har', d: 3 }, { poles: 'har', d: 1 }, { poles: 'bir', d: 2 }],
      camera: { target: [0.02, 0.27, 0], dir: [0.3, 0.25, 1], fitW: 0.36, fitH: 0.6, min: 0.75 },
      build(k) {
        const st = k.stand(0, 0, 0.5, 0.13);
        const dyn = k.dynamometer(st.tip);
        k.label('Dinamometr', k.V(st.tip.x + 0.06, st.tip.y - 0.08, st.tip.z), { minor: true });
        const top = k.barMagnet(); top.position.y = -0.065; top.userData.flip(false); dyn.hook.add(top);
        const lower = k.barMagnet(); const lowerG = k.group(st.tip.x, 0, st.tip.z); lowerG.add(lower);
        const clamp = k.box(0.12, 0.01, 0.012, 0x5A6285, { metalness: 0.5 }); lowerG.add(clamp);
        // bottom of the hanging magnet for a dynamometer reading F (hook drop = F·0,06 m, magnet length 7 sm)
        const bottomAt = (F) => st.tip.y - 0.155 - Math.min(0.1, F * 0.06) - 0.1;
        const place = (y) => { lower.position.y = y; clamp.position.set(-0.05, y - 0.04, 0); };
        k.label('N', k.V(st.tip.x + 0.03, bottomAt(0.5) + 0.02, st.tip.z), { minor: true });
        return {
          update(v) { lower.userData.flip(v.poles === 'bir'); dyn.set(0.5); place(bottomAt(0.5) - v.d / 100 - 0.035 - 0.08); },
          progress(p, v, c) {
            const F = 0.5 + (c.Ft - 0.5) * ease(Math.max(0, (p - 0.5) / 0.5));
            dyn.set(F);
            place(bottomAt(c.Ft) - v.d / 100 - 0.035 - 0.08 * (1 - ease(Math.min(1, p * 1.6))));
          }
        };
      }
    },

    /* ================= §58 Elektromagnit (lab, p.161) ================= */
    'elektromagnit': {
      controls: [
        { key: 'I', label: 'Tok kuchi (reostat bilan), I', type: 'range', min: 0.5, max: 2, step: 0.5, value: 1, unit: 'A', d: 1 },
        { key: 'core', label: 'G‘altak ichida', type: 'choice', value: 'yoq', options: [{ v: 'yoq', label: 'O‘zaksiz' }, { v: 'bor', label: 'Temir o‘zak' }] },
        { key: 'd', label: 'Kompasgacha masofa', type: 'range', min: 2, max: 12, step: 2, value: 4, unit: 'sm', d: 0 }
      ],
      compute: (v) => { const B = (4 * v.I * (v.core === 'bor' ? 20 : 1)) / (v.d ** 3); return { theta: Math.round((Math.atan(B) * 180) / Math.PI) }; },
      readouts: (v, c, done) => [['I', `${fmt(v.I, 1)} A`], ['O‘zak', v.core === 'bor' ? 'bor' : 'yo‘q'], ['d', `${v.d} sm`], ['Kompas og‘ishi', done ? `${c.theta}°` : '—', true]],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 1,
      steps: [
        { text: 'Zanjirni ulab, kompas og‘ishini kuzating', done: (s) => s.runs.length > 0 },
        { text: 'Kompasni g‘altakdan uzoqlashtirib, qayta kuzating', done: (s) => uniq(s.runs, 'd') >= 2 },
        { text: 'G‘altakka temir o‘zak qo‘yib, ta’sirni solishtiring', done: (s) => has(s.runs, 'core', 'bor') }
      ],
      cols: ['I', 'O‘zak', 'd', 'Og‘ish'],
      row: (r) => [`${fmt(r.I, 1)} A`, r.core === 'bor' ? 'bor' : 'yo‘q', `${r.d} sm`, `${r.theta}°`],
      demo: [{ I: 1, core: 'yoq', d: 4 }, { I: 1, core: 'yoq', d: 8 }, { I: 1, core: 'bor', d: 4 }],
      camera: { target: [0.06, 0.03, -0.01], dir: [0.05, 1.1, 1], fitW: 0.9, fitH: 0.56, min: 0.88 },
      build(k) {
        k.board(0.7, 0.46, 0.0, -0.02);
        const ps = k.powerSupply(-0.24, 0.0), sw = k.switchK(-0.08, 0.15), rh = k.rheostat(0.13, 0.15);
        const cl = k.coil(0.05, -0.1), cp = k.compass(0.2, -0.1);
        ps.set(4);
        k.wire(ps.plus, sw.a); k.wire(sw.b, rh.a); k.wire(rh.b, cl.b); k.wire(cl.a, ps.minus);
        return {
          update(v) { rh.set((v.I - 0.5) / 1.5); cl.setCore(v.core === 'bor'); sw.set(false); cp.group.position.x = cl.end.x + v.d / 100 + 0.03; cp.set(90); },
          progress(p, v, c) { sw.set(p > 0.3); cp.set(90 - c.theta * on(p)); }
        };
      }
    }
  };
})();
