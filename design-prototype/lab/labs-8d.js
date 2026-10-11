// Empira — 8-sinf Fizika labs, batch 4: Chapter I (electrostatics) topics, from the textbook's demonstrations.
(function () {
  const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',');
  const uniq = (runs, key) => new Set(runs.map((r) => String(r[key]))).size;
  const has = (runs, key, val) => runs.some((r) => String(r[key]) === String(val));
  const ease = (p) => p * p * (3 - 2 * p);
  const ROD = { shisha: 'shisha (+)', ebonit: 'ebonit (−)' };
  const rodOpts = [{ v: 'shisha', label: 'Shisha' }, { v: 'ebonit', label: 'Ebonit' }];

  Object.assign(window.EMPIRA_LABS, {

    /* ===== 1-§ Jismlarning zaryadlanishi (p.5): two kinds of charge ===== */
    'elektrlanish-turlari': {
      controls: [
        { key: 'a', label: 'Ipga osilgan tayoqcha', type: 'choice', value: 'shisha', options: rodOpts },
        { key: 'b', label: 'Yaqinlashtirilgan tayoqcha', type: 'choice', value: 'shisha', options: rodOpts }
      ],
      compute: (v) => ({ res: v.a === v.b ? 'itarishadi' : 'tortishadi' }),
      readouts: (v, c, done) => [['Osilgan', ROD[v.a]], ['Yaqinlashtirilgan', ROD[v.b]], ['Natija', done ? c.res : '—', true]],
      run: ['Yaqinlashtirish', 'Yaqinlashtirilmoqda…', 'Qayta yaqinlashtirish'],
      duration: () => 1.6,
      steps: [
        { text: 'Bir xil tayoqchalarni yaqinlashtiring', done: (s) => s.runs.some((r) => r.a === r.b) },
        { text: 'Har xil tayoqchalarni yaqinlashtiring', done: (s) => s.runs.some((r) => r.a !== r.b) },
        { text: 'Yana bir juftlikni tekshiring', done: (s) => new Set(s.runs.map((r) => r.a + r.b)).size >= 3 }
      ],
      cols: ['Osilgan', 'Yaqinlashtirilgan', 'Natija'],
      row: (r) => [ROD[r.a], ROD[r.b], r.res],
      demo: [{ a: 'shisha', b: 'shisha' }, { a: 'shisha', b: 'ebonit' }, { a: 'ebonit', b: 'ebonit' }],
      camera: { target: [0.1, 0.21, 0.08], dir: [0.9, 0.5, 1], fitW: 0.52, fitH: 0.48, min: 0.6 },
      build(k) {
        const hr = k.hangingRod(-0.02, 0, 0.36);
        const end = hr.tip.x + 0.1;
        const rod = k.chargeRod(0.2); rod.group.rotation.y = Math.PI / 2;
        const near = hr.tip.z + 0.135, far = hr.tip.z + 0.32;
        const place = (zz) => rod.group.position.set(end, hr.tip.y, zz);
        return {
          update(v) { hr.setKind(v.a); rod.setKind(v.b); hr.set(0); place(far); },
          progress(p, v, c) {
            const a = ease(Math.min(1, p / 0.55)), b = ease(Math.max(0, (p - 0.45) / 0.55));
            place(far + (near - far) * a);
            hr.set((c.res === 'itarishadi' ? 0.55 : -0.3) * b);
          }
        };
      }
    },

    /* ===== 2-§ Elektr zaryad (p.10): charging an electroscope step by step ===== */
    'elektroskop': {
      controls: [
        { key: 'n', label: 'Sharchaga tegizishlar soni', type: 'range', min: 1, max: 4, step: 1, value: 1, unit: 'marta', d: 0 },
        { key: 'rod', label: 'Tayoqcha', type: 'choice', value: 'shisha', options: rodOpts }
      ],
      compute: (v) => ({ q: 2 * v.n, ang: 14 * v.n, sg: v.rod === 'shisha' ? '+' : '−' }),
      readouts: (v, c, done) => [['Tegizish', `${v.n} marta`], ['Zaryad', done ? `${c.sg}${c.q} nKl` : '—'], ['Barglar', done ? `${c.ang}°` : '—', true]],
      run: ['Zaryadlash', 'Zaryadlanmoqda…', 'Zaryadsizlab, qayta zaryadlash'],
      duration: (v) => 0.9 * v.n + 0.3,
      steps: [
        { text: 'Tayoqchani sharchaga bir marta tegizing', done: (s) => s.runs.length > 0 },
        { text: 'Ko‘proq tegizib, barglarni solishtiring', done: (s) => uniq(s.runs, 'n') >= 2 },
        { text: 'Boshqa tayoqcha bilan zaryadlang', done: (s) => uniq(s.runs, 'rod') >= 2 }
      ],
      cols: ['Tegizish', 'Zaryad', 'Barglar'],
      row: (r) => [`${r.n}`, `${r.sg}${r.q} nKl`, `${r.ang}°`],
      demo: [{ n: 1, rod: 'shisha' }, { n: 3, rod: 'shisha' }, { n: 3, rod: 'ebonit' }],
      camera: { target: [0.06, 0.17, 0], dir: [0.3, 0.35, 1], fitW: 0.4, fitH: 0.4, min: 0.5 },
      build(k) {
        const es = k.electroscope(0, 0);
        const rod = k.chargeRod(0.14); rod.group.rotation.z = Math.PI + 0.6;
        const dir = k.V(Math.cos(0.6), Math.sin(0.6), 0), ball = es.ball;
        const place = (gap) => rod.group.position.copy(ball).addScaledVector(dir, 0.021 + gap + 0.07);
        return {
          update(v) { rod.setKind(v.rod); es.set(0); place(0.04); },
          progress(p, v, c) {
            const ph = p * v.n, frac = ph % 1;
            place(p >= 1 ? 0.04 : 0.04 * (1 - Math.sin(Math.PI * frac)));
            es.set(14 * Math.min(v.n, Math.floor(ph + 0.5)));
          }
        };
      }
    },

    /* ===== 3-§ Zaryadlarning o‘zaro ta’siri. Kulon qonuni (p.12): torsion balance ===== */
    'kulon-qonuni': {
      controls: [
        { key: 'r', label: 'Sharlar orasidagi masofa, r', type: 'range', min: 2, max: 6, step: 1, value: 2, unit: 'sm', d: 0 },
        { key: 'q', label: 'Sharchadagi zaryad', type: 'choice', value: 1, options: [{ v: 1, label: 'q' }, { v: 0.5, label: 'q/2' }, { v: 0.25, label: 'q/4' }] }
      ],
      compute: (v) => { const F = 9 * v.q / Math.pow(v.r / 2, 2); return { F, th: Math.round(F * 10) }; },
      readouts: (v, c, done) => [['r', `${v.r} sm`], ['F', done ? `${fmt(c.F, 2)} mN` : '—', true], ['Burish burchagi', done ? `${c.th}°` : '—']],
      run: ['Zaryadlash', 'Sharchalar itarishmoqda…', 'Qayta o‘lchash'],
      duration: () => 1.6,
      steps: [
        { text: 'Sharchalarni zaryadlab, kuchni o‘lchang', done: (s) => s.runs.length > 0 },
        { text: 'Masofani 2 marta oshirib, kuchni solishtiring', done: (s) => s.runs.some((a) => s.runs.some((b) => b.q === a.q && b.r === 2 * a.r)) },
        { text: 'Zaryadni ikki marta kamaytiring (q/2)', done: (s) => has(s.runs, 'q', 0.5) }
      ],
      cols: ['r', 'q', 'F', 'Burchak'],
      row: (r) => [`${r.r} sm`, r.q === 1 ? 'q' : r.q === 0.5 ? 'q/2' : 'q/4', `${fmt(r.F, 2)} mN`, `${r.th}°`],
      demo: [{ r: 2, q: 1 }, { r: 4, q: 1 }, { r: 4, q: 0.5 }],
      camera: { target: [0.02, 0.18, 0], dir: [0.35, 0.5, 1], fitW: 0.36, fitH: 0.44, min: 0.5 },
      build(k) {
        const tb = k.torsionBalance(0, 0);
        k.label('Buralish boshchasi', k.V(0.1, 0.355, 0), { minor: true });
        k.label('Qo‘zg‘almas shar', k.V(0.1, 0.13, 0.06), { minor: true });
        return {
          update() { tb.set(0.01, 0); },
          progress(p, v, c) { const e = ease(p); tb.set(0.01 + (v.r / 100 - 0.01) * e, c.th * e); }
        };
      }
    },

    /* ===== 5-§ Elektr maydon (p.18): field patterns with fibres in oil ===== */
    'elektr-maydon-chiziqlari': {
      controls: [
        { key: 'cfg', label: 'Elektrodlar', type: 'choice', value: 'bir', options: [{ v: 'bir', label: 'Bitta zaryad' }, { v: 'qarama', label: '+ va −' }, { v: 'birxil', label: '+ va +' }, { v: 'plast', label: 'Plastinkalar' }] }
      ],
      compute: (v) => ({ shape: { bir: 'yulduzsimon (radial)', qarama: '+ dan − ga yoysimon', birxil: 'bir-biridan qochadi', plast: 'parallel, bir jinsli' }[v.cfg] }),
      readouts: (v, c, done) => [['Tolalar', done ? 'kuch chiziqlari bo‘ylab' : 'tartibsiz'], ['Shakl', done ? c.shape : '—', true]],
      run: ['Kuchlanish berish', 'Tolalar tizilmoqda…', 'Qayta berish'],
      duration: () => 1.6,
      steps: [
        { text: 'Bitta zaryad atrofidagi tolalarni kuzating', done: (s) => has(s.runs, 'cfg', 'bir') },
        { text: 'Qarama-qarshi zaryadlarni sinang (+ va −)', done: (s) => has(s.runs, 'cfg', 'qarama') },
        { text: 'Ikki plastinka orasidagi maydonni ko‘ring', done: (s) => has(s.runs, 'cfg', 'plast') }
      ],
      cols: ['Elektrodlar', 'Shakl'],
      row: (r) => [{ bir: 'bitta zaryad', qarama: '+ va −', birxil: '+ va +', plast: 'plastinkalar' }[r.cfg], r.shape],
      demo: [{ cfg: 'bir' }, { cfg: 'qarama' }, { cfg: 'plast' }],
      camera: { target: [0, 0.01, 0.01], dir: [0, 1.7, 1], fitW: 0.32, fitH: 0.3, min: 0.4 },
      build(k) {
        const ff = k.fieldFibres(0, 0);
        return {
          update(v) { ff.set(v.cfg); },
          progress(p) { ff.align(ease(Math.min(1, p * 1.2))); }
        };
      }
    },

    /* ===== 8-§ Tabiatdagi elektr hodisalar (p.29): distance to lightning, d = 340·t ===== */
    'chaqmoq-masofasi': {
      controls: [
        { key: 's', label: 'Momaqaldiroq', type: 'choice', value: 'orta', options: [{ v: 'yaqin', label: 'Yaqin' }, { v: 'orta', label: 'O‘rtacha' }, { v: 'uzoq', label: 'Uzoq' }] }
      ],
      compute: (v) => { const t = { yaqin: 2, orta: 5, uzoq: 9 }[v.s]; return { t, d: 340 * t }; },
      readouts: (v, c, done) => [['Vaqt, t', done ? `${c.t} s` : '—', true], ['Masofa, d = 340·t', done ? `${fmt(c.d / 1000, 2)} km` : '—', true]],
      run: ['Chaqmoqni kuzatish', 'Momaqaldiroqni kuting…', 'Qayta kuzatish'],
      duration: (v, c) => 0.45 * c.t + 0.5,
      steps: [
        { text: 'Chaqmoq va momaqaldiroq orasidagi vaqtni o‘lchang', done: (s) => s.runs.length > 0 },
        { text: 'Boshqa momaqaldiroqni o‘lchang', done: (s) => uniq(s.runs, 's') >= 2 },
        { text: 'Uchala holatni solishtiring', done: (s) => uniq(s.runs, 's') >= 3 }
      ],
      cols: ['Momaqaldiroq', 't', 'd'],
      row: (r) => [{ yaqin: 'yaqin', orta: 'o‘rtacha', uzoq: 'uzoq' }[r.s], `${r.t} s`, `${fmt(r.d / 1000, 2)} km`],
      demo: [{ s: 'yaqin' }, { s: 'orta' }, { s: 'uzoq' }],
      camera: { target: [0.02, 0.1, 0], dir: [0.1, 0.55, 1], fitW: 0.84, fitH: 0.4, min: 0.8 },
      build(k) {
        const OX = -0.28;
        const ground = k.box(0.76, 0.006, 0.2, 0xE4E7EF, { roughness: 0.9 }); ground.position.set(0.04, 0.003, 0); k.group().add(ground);
        // observer + house
        const person = k.group(OX, 0, 0.03);
        k.add(person, k.cyl(0.008, 0.04, 0x3A4166), 0, 0.026, 0); k.add(person, k.sphere(0.008, 0xE9DCC4), 0, 0.054, 0);
        const house = k.group(OX - 0.05, 0, -0.03);
        k.add(house, k.box(0.05, 0.04, 0.04, 0xF2F4F8), 0, 0.023, 0);
        const roof = k.add(house, new k.THREE.Mesh(new k.THREE.ConeGeometry(0.04, 0.025, 4), k.mat(0x3A4166)), 0, 0.055, 0); roof.rotation.y = Math.PI / 4;
        const sw = k.stopwatch(OX + 0.06, 0.06);
        const boom = k.label('Gumbur!', k.V(OX, 0.1, 0.03)); boom.userData.hidden = true;
        // cloud + bolt
        const storm = k.group(0, 0, 0);
        const cloudMat = k.mat(0x8A90A8, { roughness: 1 });
        [[0, 0, 0, 0.035], [0.035, 0.005, 0, 0.028], [-0.035, 0.003, 0.004, 0.026], [0.012, 0.022, -0.004, 0.026]].forEach(([x, y, z, r]) => k.add(storm, new k.THREE.Mesh(new k.THREE.SphereGeometry(r, 20, 14), cloudMat), x, 0.2 + y, z));
        const boltMat = new k.THREE.MeshStandardMaterial({ color: 0xFFB21E, emissive: 0xFFB21E, emissiveIntensity: 2 });
        const pts = [[0, 0.18], [-0.012, 0.13], [0.008, 0.11], [-0.01, 0.06], [0.006, 0.04], [0, 0.006]].map(([x, y]) => k.V(x, y, 0));
        const bolt = k.add(storm, new k.THREE.Mesh(new k.THREE.TubeGeometry(new k.THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1), 24, 0.0025, 6), boltMat));
        const flashLight = new k.THREE.PointLight(0xFFD27A, 0, 0.6); flashLight.position.set(0, 0.15, 0.05); storm.add(flashLight);
        const ringMat = new k.THREE.MeshBasicMaterial({ color: 0x3B4CFF, transparent: true, opacity: 0.45 });
        const ring = new k.THREE.Mesh(new k.THREE.TorusGeometry(1, 0.01, 6, 64), ringMat); ring.rotation.x = Math.PI / 2; ring.position.y = 0.012; storm.add(ring);
        const dist = k.label('', k.V(0, 0.27, 0), { parent: storm, minor: true });
        let D = 0.3;
        return {
          update(v, c) {
            storm.position.x = OX + 0.06 + 0.055 * c.t; D = storm.position.x - OX;
            dist.setText({ yaqin: 'Yaqin', orta: 'O‘rtacha', uzoq: 'Uzoq' }[v.s]);
            bolt.visible = false; flashLight.intensity = 0; ring.visible = false; boom.userData.hidden = true; sw.set(0);
          },
          progress(p, v, c) {
            const F = 0.08, f = Math.max(0, Math.min(1, (p - F) / (1 - F)));
            const flash = p > 0.01 && p < F + 0.1;
            bolt.visible = flash; flashLight.intensity = flash ? 3 : 0;
            sw.set(c.t * f);
            ring.visible = p > F && p < 1; const r = Math.max(0.001, D * f); ring.scale.set(r, r, r);
            boom.userData.hidden = p < 1;
          }
        };
      }
    }
  });
})();
