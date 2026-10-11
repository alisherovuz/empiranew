// Empira — 8-sinf Fizika labs, batch 3: Chapter V (magnetism) topics, from the textbook's demonstrations.
(function () {
  const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',');
  const uniq = (runs, key) => new Set(runs.map((r) => String(r[key]))).size;
  const has = (runs, key, val) => runs.some((r) => String(r[key]) === String(val));
  const ease = (p) => p * p * (3 - 2 * p);
  const on = (p) => (p <= 0.4 ? 0 : ease((p - 0.4) / 0.6));
  const NORTH = Math.PI / 2;            // needle angle when pointing to the room's north (−z)
  const lerpAngle = (a, b, t) => a + (Math.atan2(Math.sin(b - a), Math.cos(b - a))) * t;

  Object.assign(window.EMPIRA_LABS, {

    /* ===== 50-§ Magnit maydonni xarakterlovchi parametrlar (p.143–144) ===== */
    'magnit-kuch-chiziqlari': {
      controls: [
        { key: 'flip', label: 'Magnit holati', type: 'choice', value: 'ong', options: [{ v: 'ong', label: 'N qutb o‘ngda' }, { v: 'chap', label: 'N qutb chapda' }] },
        { key: 'fil', label: 'Karton ustida', type: 'choice', value: 'yoq', options: [{ v: 'yoq', label: 'Faqat strelkalar' }, { v: 'bor', label: 'Temir qipig‘i sepilgan' }] }
      ],
      readouts: (v, c, done) => [['N qutb', v.flip === 'ong' ? 'o‘ngda' : 'chapda'], ['Strelkalar', done ? 'kuch chiziqlari bo‘ylab' : '—', true], ['Kuch chiziqlari', done ? 'N dan S ga' : '—']],
      run: ['Kuzatish', 'Strelkalar burilmoqda…', 'Qayta kuzatish'],
      duration: () => 1.2,
      steps: [
        { text: 'Magnit atrofidagi strelkalarni kuzating', done: (s) => s.runs.length > 0 },
        { text: 'Magnitni teskari aylantirib, strelkalarni solishtiring', done: (s) => uniq(s.runs, 'flip') >= 2 },
        { text: 'Temir qipig‘ini sepib, kuch chiziqlarini ko‘ring', done: (s) => has(s.runs, 'fil', 'bor') }
      ],
      cols: ['N qutb', 'Karton', 'Strelkalar'],
      row: (r) => [r.flip === 'ong' ? 'o‘ngda' : 'chapda', r.fil === 'bor' ? 'qipiq' : 'strelka', 'N → S'],
      demo: [{ flip: 'ong', fil: 'yoq' }, { flip: 'chap', fil: 'yoq' }, { flip: 'ong', fil: 'bor' }],
      camera: { target: [0, 0.01, 0.01], dir: [0, 1.7, 1], fitW: 0.44, fitH: 0.34, min: 0.5 },
      build(k) {
        const card = k.box(0.44, 0.002, 0.32, 0xFFFFFF, { roughness: 0.95 }); card.position.y = 0.001; k.group().add(card);
        const mag = k.flatMagnet(0, 0), fl = k.fieldLines(0, 0); fl.group.position.y = 0.003;
        const pts = [];
        for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; pts.push([Math.cos(a) * 0.13, Math.sin(a) * 0.09]); }
        pts.push([0, 0.05], [0, -0.05]);
        const needles = pts.map(([x, z]) => ({ n: k.needle(x, z), x, z }));
        let from = [];
        const target = (v, n) => { const [bx, bz] = fl.field(n.x, n.z); const sg = v.flip === 'ong' ? 1 : -1; return Math.atan2(-sg * bz, sg * bx); };
        return {
          update(v) { mag.setFlip(v.flip === 'chap'); fl.show(false); fl.group.scale.x = v.flip === 'chap' ? -1 : 1; needles.forEach((n) => n.n.set(NORTH)); from = needles.map(() => NORTH); },
          progress(p, v) { needles.forEach((n, i) => n.n.set(lerpAngle(from[i], target(v, n), ease(p)))); fl.show(v.fil === 'bor' && p > 0.5); }
        };
      }
    },

    /* ===== 51-§ Yerning magnit maydoni (p.145) ===== */
    'yer-magnit-maydoni': {
      controls: [
        { key: 'ang', label: 'Stolni burish', type: 'range', min: 0, max: 270, step: 90, value: 0, unit: '°', d: 0 },
        { key: 'mag', label: 'Kompas yonida', type: 'choice', value: 'yoq', options: [{ v: 'yoq', label: 'Hech narsa' }, { v: 'bor', label: 'Doimiy magnit' }] }
      ],
      compute: (v) => ({ dev: v.mag === 'bor' ? 35 : 0 }),
      readouts: (v, c, done) => [['Stol', `${v.ang}°`], ['Strelka', done ? (c.dev ? 'magnitdan 35° qochdi' : 'shimolni ko‘rsatadi') : '—', true]],
      run: ['Kuzatish', 'Strelka tinchlanmoqda…', 'Qayta kuzatish'],
      duration: () => 1.4,
      steps: [
        { text: 'Kompas strelkasi qayerni ko‘rsatishini kuzating', done: (s) => has(s.runs, 'mag', 'yoq') },
        { text: 'Stolni burib, strelka yo‘nalishini tekshiring', done: (s) => uniq(s.runs.filter((r) => r.mag === 'yoq'), 'ang') >= 2 },
        { text: 'Yoniga magnit qo‘yib, strelkani kuzating', done: (s) => has(s.runs, 'mag', 'bor') }
      ],
      cols: ['Stol', 'Yonida', 'Strelka'],
      row: (r) => [`${r.ang}°`, r.mag === 'bor' ? 'magnit' : '—', r.dev ? '35° og‘di' : 'shimol'],
      demo: [{ ang: 0, mag: 'yoq' }, { ang: 90, mag: 'yoq' }, { ang: 90, mag: 'bor' }],
      camera: { target: [0, 0.01, 0], dir: [0.2, 1.4, 1], fitW: 0.42, fitH: 0.34, min: 0.5 },
      build(k) {
        const plate = k.group(0, 0, 0);
        const card = k.box(0.3, 0.004, 0.3, 0xF2F4F8, { roughness: 0.9 }); card.position.y = 0.002; plate.add(card);
        const arrow = k.box(0.008, 0.002, 0.05, 0x3A4166); arrow.position.set(-0.11, 0.005, -0.09); plate.add(arrow);
        k.label('Stol', k.V(-0.11, 0.03, -0.12), { parent: plate, minor: true });
        const cp = k.compass(0, 0);
        k.label('Shimol', k.V(0, 0.03, -0.2)); k.label('Janub', k.V(0, 0.03, 0.2), { minor: true });
        const magG = k.group(0.13, 0, 0.0);
        const mN = k.box(0.04, 0.014, 0.018, 0xE5484D), mS = k.box(0.04, 0.014, 0.018, 0x3B4CFF);
        mN.position.set(-0.02, 0.007, 0); mS.position.set(0.02, 0.007, 0); magG.add(mN); magG.add(mS);
        let start = NORTH;
        return {
          update(v) { plate.rotation.y = -v.ang * Math.PI / 180; magG.visible = v.mag === 'bor'; start = NORTH + 0.9; cp.set(start * 180 / Math.PI); },
          progress(p, v, c) { const tgt = NORTH + c.dev * Math.PI / 180; const wob = Math.exp(-4 * p) * Math.sin(p * 18) * 0.5; cp.set((lerpAngle(start, tgt, ease(Math.min(1, p * 1.4))) + wob * (1 - p)) * 180 / Math.PI); }
        };
      }
    },

    /* ===== 52-§ Tokning magnit maydoni — Ersted tajribasi (p.146) ===== */
    'ersted': {
      controls: [
        { key: 'I', label: 'Tok kuchi, I', type: 'range', min: 0.5, max: 3, step: 0.5, value: 1, unit: 'A', d: 1 },
        { key: 'dir', label: 'Tok yo‘nalishi', type: 'choice', value: 'sh', options: [{ v: 'sh', label: 'Shimolga' }, { v: 'j', label: 'Janubga' }] }
      ],
      compute: (v) => { const th = Math.round(Math.atan(v.I) * 180 / Math.PI); return { th, side: v.dir === 'sh' ? 'g‘arbga' : 'sharqqa' }; },
      readouts: (v, c, done) => [['I', `${fmt(v.I, 1)} A`], ['Tok', v.dir === 'sh' ? 'shimolga' : 'janubga'], ['Strelka og‘ishi', done ? `${c.th}° ${c.side}` : '—', true]],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 1.2,
      steps: [
        { text: 'Tokni ulab, strelkani kuzating', done: (s) => s.runs.length > 0 },
        { text: 'Tok yo‘nalishini o‘zgartiring', done: (s) => uniq(s.runs, 'dir') >= 2 },
        { text: 'Tok kuchini oshirib, og‘ishni solishtiring', done: (s) => uniq(s.runs, 'I') >= 2 }
      ],
      cols: ['I', 'Tok', 'Og‘ish'],
      row: (r) => [`${fmt(r.I, 1)} A`, r.dir === 'sh' ? 'shimolga' : 'janubga', `${r.th}° ${r.side}`],
      demo: [{ I: 1, dir: 'sh' }, { I: 1, dir: 'j' }, { I: 3, dir: 'sh' }],
      camera: { target: [0.04, 0.03, 0], dir: [0.3, 1.2, 1], fitW: 0.56, fitH: 0.42, min: 0.6 },
      build(k) {
        k.board(0.62, 0.42, 0.02, 0);
        const ps = k.powerSupply(-0.2, 0.08), sw = k.switchK(-0.08, -0.12), cp = k.needle(0.12, 0, k.BY, 2.2);
        const posts = [-0.15, 0.15].map((z) => { const p = k.cyl(0.004, 0.06, 0x3A4166, { metalness: 0.4 }, 10); p.position.set(0.12, k.BY + 0.03, z); k.group().add(p); return k.V(0.12, k.BY + 0.06, z); });
        const wireRod = k.cyl(0.0025, 0.3, 0xB87333, { metalness: 0.6 }, 10); wireRod.rotation.x = Math.PI / 2; wireRod.position.set(0.12, k.BY + 0.058, 0); k.group().add(wireRod);
        k.label('Shimol', k.V(0.12, 0.03, -0.22), { minor: true }); k.label('O‘tkazgich', k.V(0.12, 0.09, -0.11), { minor: true }); k.label('Kompas', k.V(0.18, 0.04, 0.04), { minor: true });
        return {
          update(v) {
            ps.set(v.I * 2); sw.set(false); cp.set(NORTH); k.clearWires();
            const [near, far] = v.dir === 'sh' ? [posts[1], posts[0]] : [posts[0], posts[1]];
            k.wire(ps.plus, sw.a); k.wire(sw.b, near, 0.05); k.wire(far, ps.minus, 0.08);
          },
          progress(p, v, c) { sw.set(p > 0.3); const sg = v.dir === 'sh' ? 1 : -1; cp.set(NORTH + sg * (c.th * Math.PI / 180) * on(p)); }
        };
      }
    },

    /* ===== 53-§ Magnit maydonning tokli o‘tkazgichga ta’siri — Amper tajribasi (p.149) ===== */
    'amper': {
      controls: [
        { key: 'I', label: 'Tok kuchi, I', type: 'range', min: 1, max: 3, step: 1, value: 1, unit: 'A', d: 0 },
        { key: 'dir', label: 'Tok yo‘nalishi', type: 'choice', value: 'ab', options: [{ v: 'ab', label: 'A → B' }, { v: 'ba', label: 'B → A' }] }
      ],
      compute: (v) => { const F = 0.1 * v.I * 0.05; const ang = Math.atan(F / 0.049) * 180 / Math.PI; return { F, ang, way: v.dir === 'ab' ? 'magnit ichiga' : 'tashqariga' }; },
      readouts: (v, c, done) => [['I', `${v.I} A`], ['F = B·I·l', done ? `${fmt(c.F * 1000, 1)} mN` : '—', true], ['O‘tkazgich', done ? `${fmt(c.ang, 0)}° ${c.way}` : '—', true]],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 1.2,
      steps: [
        { text: 'Tokni ulab, o‘tkazgich harakatini kuzating', done: (s) => s.runs.length > 0 },
        { text: 'Tok yo‘nalishini o‘zgartiring', done: (s) => uniq(s.runs, 'dir') >= 2 },
        { text: 'Tok kuchini oshirib, burilishni solishtiring', done: (s) => uniq(s.runs, 'I') >= 2 }
      ],
      cols: ['I', 'Yo‘nalish', 'F', 'Burilish'],
      row: (r) => [`${r.I} A`, r.dir === 'ab' ? 'A → B' : 'B → A', `${fmt(r.F * 1000, 1)} mN`, `${fmt(r.ang, 0)}° ${r.way}`],
      demo: [{ I: 1, dir: 'ab' }, { I: 1, dir: 'ba' }, { I: 3, dir: 'ab' }],
      camera: { target: [0.06, 0.14, 0], dir: [0.55, 0.45, 1], fitW: 0.7, fitH: 0.42, min: 0.7 },
      build(k) {
        // horseshoe magnet lying on its side: S pole below, N pole above the conductor (field vertical)
        const mg = k.group(0, 0, 0);
        const back = k.box(0.09, 0.15, 0.02, 0x3A4166); back.position.set(0, 0.075, -0.085); mg.add(back);
        const sP = k.box(0.09, 0.03, 0.12, 0x3B4CFF, { roughness: 0.5 }); sP.position.set(0, 0.03, -0.025); mg.add(sP);
        const nP = k.box(0.09, 0.03, 0.12, 0xE5484D, { roughness: 0.5 }); nP.position.set(0, 0.165, -0.025); mg.add(nP);
        k.label('N', k.V(0.07, 0.19, 0)); k.label('S', k.V(0.07, 0.05, 0));
        [-0.11, 0.11].forEach((x) => { const r = k.cyl(0.005, 0.3, 0x3A4166, { metalness: 0.4 }, 10); r.position.set(x, 0.15, -0.015); k.group().add(r); const f = k.box(0.05, 0.01, 0.06, 0x3A4166); f.position.set(x, 0.005, -0.015); k.group().add(f); });
        const sw0 = k.swing(0, -0.015, 0.3, 0.12, 0.2);
        k.label('A', k.V(-0.1, 0.32, 0)); k.label('B', k.V(0.1, 0.32, 0));
        const ps = k.powerSupply(0.3, 0.1), sw = k.switchK(0.25, -0.13);
        return {
          update(v) { ps.set(v.I * 2); sw.set(false); sw0.set(0); k.clearWires(); const [p1, p2] = v.dir === 'ab' ? [sw0.a, sw0.b] : [sw0.b, sw0.a]; k.wire(ps.plus, sw.a); k.wire(sw.b, p2, 0.06); k.wire(p1, ps.minus, 0.1); },
          progress(p, v, c) { sw.set(p > 0.3); const sg = v.dir === 'ab' ? 1 : -1; sw0.set(sg * (c.ang * Math.PI / 180) * on(p)); }
        };
      }
    },

    /* ===== 55-§ Bir jinsli magnit maydonda tokli ramka (p.154): the moving-coil meter ===== */
    'tokli-ramka': {
      controls: [
        { key: 'I', label: 'Ramkadagi tok kuchi, I', type: 'range', min: 0.5, max: 2, step: 0.5, value: 1, unit: 'A', d: 1 },
        { key: 'dir', label: 'Tok yo‘nalishi', type: 'choice', value: 'tog', options: [{ v: 'tog', label: 'To‘g‘ri' }, { v: 'tes', label: 'Teskari' }] }
      ],
      compute: (v) => ({ ang: (v.dir === 'tog' ? 1 : -1) * 30 * v.I }),
      readouts: (v, c, done) => [['I', `${fmt(v.I, 1)} A`], ['Ramka burildi', done ? `${c.ang > 0 ? '+' : ''}${c.ang}°` : '—', true]],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 1.2,
      steps: [
        { text: 'Tokni ulab, ramka burilishini kuzating', done: (s) => s.runs.length > 0 },
        { text: 'Tok kuchini oshiring: burilish qanday o‘zgaradi?', done: (s) => uniq(s.runs, 'I') >= 2 },
        { text: 'Tok yo‘nalishini o‘zgartiring', done: (s) => has(s.runs, 'dir', 'tes') }
      ],
      cols: ['I', 'Yo‘nalish', 'Burilish'],
      row: (r) => [`${fmt(r.I, 1)} A`, r.dir === 'tog' ? 'to‘g‘ri' : 'teskari', `${r.ang > 0 ? '+' : ''}${r.ang}°`],
      demo: [{ I: 1, dir: 'tog' }, { I: 2, dir: 'tog' }, { I: 1, dir: 'tes' }],
      camera: { target: [0.02, 0.06, 0], dir: [0.15, 0.8, 1], fitW: 0.52, fitH: 0.36, min: 0.6 },
      build(k) {
        k.board(0.56, 0.36, 0.02, 0);
        const fm = k.frameMeter(0.1, -0.02), ps = k.powerSupply(-0.17, 0.02), sw = k.switchK(-0.02, 0.13);
        return {
          update(v) { ps.set(v.I * 2); sw.set(false); fm.set(0); k.clearWires(); k.wire(ps.plus, sw.a); const [p1, p2] = v.dir === 'tog' ? [fm.a, fm.b] : [fm.b, fm.a]; k.wire(sw.b, p1, 0.05); k.wire(p2, ps.minus, 0.06); },
          progress(p, v, c) { sw.set(p > 0.3); fm.set(-(c.ang * Math.PI / 180) * on(p)); }
        };
      }
    },

    /* ===== 57-§ Elektromagnitlar (p.157): lifting force ∝ I and turns ===== */
    'elektromagnit-kuchi': {
      controls: [
        { key: 'I', label: 'Tok kuchi, I', type: 'range', min: 0.5, max: 2, step: 0.5, value: 1, unit: 'A', d: 1 },
        { key: 'N', label: 'G‘altakdagi o‘ramlar soni', type: 'choice', value: 100, options: [{ v: 50, label: '50' }, { v: 100, label: '100' }, { v: 200, label: '200' }] }
      ],
      compute: (v) => ({ n: Math.min(24, Math.round((v.I * v.N) / 25)) }),
      readouts: (v, c, done) => [['I', `${fmt(v.I, 1)} A`], ['O‘ramlar', `${v.N}`], ['Ko‘tarilgan skrepkalar', done ? `${c.n} ta` : '—', true]],
      run: ['Kalitni ulash', 'Ulanmoqda…', 'Qayta ulash'],
      duration: () => 1,
      steps: [
        { text: 'Kalitni ulab, nechta skrepka ko‘tarilishini sanang', done: (s) => s.runs.length > 0 },
        { text: 'Tok kuchini oshirib, qayta sanang', done: (s) => uniq(s.runs, 'I') >= 2 },
        { text: 'O‘ramlar sonini oshirib, solishtiring', done: (s) => uniq(s.runs, 'N') >= 2 }
      ],
      cols: ['I', 'O‘ramlar', 'Skrepkalar'],
      row: (r) => [`${fmt(r.I, 1)} A`, `${r.N}`, `${r.n} ta`],
      demo: [{ I: 1, N: 100 }, { I: 2, N: 100 }, { I: 2, N: 200 }],
      camera: { target: [0.0, 0.16, 0], dir: [0.3, 0.4, 1], fitW: 0.6, fitH: 0.46, min: 0.7 },
      build(k) {
        const em = k.liftMagnet(-0.06, 0, 0.32);
        const ps = k.powerSupply(-0.25, 0.12), sw = k.switchK(-0.22, -0.1);
        const top = k.world(em.group, k.V(0, -0.02, 0.02)), bot = k.world(em.group, k.V(0, -0.08, 0.02));
        k.wire(ps.plus, sw.a); k.wire(sw.b, bot, 0.05); k.wire(top, ps.minus, 0.1);
        return {
          update(v) { em.setTurns(v.N / 100 * 0.6 + 0.4); em.set(0); sw.set(false); },
          progress(p, v, c) { sw.set(p > 0.3); em.set(c.n, p > 0.6 ? 1 : 0); }
        };
      }
    },

    /* ===== 59-§ O‘zgarmas tok elektr dvigateli (p.162) ===== */
    'elektr-dvigatel': {
      controls: [
        { key: 'U', label: 'Kuchlanish, U', type: 'range', min: 2, max: 6, step: 2, value: 4, unit: 'V', d: 0 },
        { key: 'pol', label: 'Manba qutblari', type: 'choice', value: 'tog', options: [{ v: 'tog', label: 'To‘g‘ri' }, { v: 'tes', label: 'Almashtirilgan' }] }
      ],
      compute: (v) => ({ rpm: 300 * v.U, way: v.pol === 'tog' ? 'soat strelkasi bo‘yicha' : 'teskari' }),
      readouts: (v, c, done) => [['U', `${v.U} V`], ['Tezlik', done ? `${c.rpm} ayl/min` : '—', true], ['Aylanish', done ? c.way : '—', true]],
      run: ['Ulash', 'Aylanmoqda…', 'Qayta ulash'],
      duration: () => 3,
      steps: [
        { text: 'Dvigatelni ulab, rotorni kuzating', done: (s) => s.runs.length > 0 },
        { text: 'Kuchlanishni oshirib, tezlikni solishtiring', done: (s) => uniq(s.runs, 'U') >= 2 },
        { text: 'Manba qutblarini almashtiring', done: (s) => has(s.runs, 'pol', 'tes') }
      ],
      cols: ['U', 'Tezlik', 'Aylanish'],
      row: (r) => [`${r.U} V`, `${r.rpm} ayl/min`, r.pol === 'tog' ? 'to‘g‘ri' : 'teskari'],
      demo: [{ U: 2, pol: 'tog' }, { U: 6, pol: 'tog' }, { U: 6, pol: 'tes' }],
      camera: { target: [0.05, 0.06, 0], dir: [0.5, 0.7, 1], fitW: 0.5, fitH: 0.34, min: 0.6 },
      build(k) {
        k.board(0.56, 0.36, 0.02, 0);
        const mo = k.motor(0.1, -0.03), ps = k.powerSupply(-0.17, 0.02), sw = k.switchK(-0.02, 0.13);
        let speed = 0, sign = 1;
        return {
          update(v) { ps.set(v.U); sw.set(false); speed = v.U; sign = v.pol === 'tog' ? 1 : -1; k.clearWires(); k.wire(ps.plus, sw.a); const [p1, p2] = v.pol === 'tog' ? [mo.a, mo.b] : [mo.b, mo.a]; k.wire(sw.b, p1, 0.05); k.wire(p2, ps.minus, 0.06); },
          progress(p) { sw.set(p < 1); },
          animate(dt, phase) { if (phase === 'running') mo.spin(-sign * speed * dt * 2.2); }
        };
      }
    }
  });
})();
