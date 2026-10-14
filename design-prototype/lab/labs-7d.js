// Empira — 7-sinf Fizika labs, V bob «Tashqi kuchlar ta’sirida jismlarning harakati» (§26–§35). Same definition shape as labs-8.js.
// Each lab follows the textbook (Fizika 7-sinf, 2017): the book's own experiments (90–91, 94, 98, 109, 112–113-rasm, 3-laboratoriya
// ishi) and its numbers; virtual experiments (Kavendish, lift, tower, satellite, braking) are table-top models and say so.
// 3D equipment comes from kit.js + kit-7.js + kit-7d.js.
(function () {
  const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',').replace('-', '−');
  const uniq = (runs, key) => new Set(runs.map((r) => String(r[key]))).size;
  const has = (runs, key, val) => runs.some((r) => String(r[key]) === String(val));
  const where = (runs, obj) => runs.filter((r) => Object.entries(obj).every(([k, v]) => String(r[k]) === String(v)));
  const ease = (p) => p * p * (3 - 2 * p);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const G = 9.8;
  const opt = (vals, unit, d = 0) => vals.map((v) => ({ v, label: `${fmt(v, d)} ${unit}`.trim() }));
  // damped settling 0 → 1 (exactly 1 at q = 1): springs, torsion beams
  const settle = (q, n = 3) => (q <= 0 ? 0 : q >= 1 ? 1 : 1 - (1 - q) * (1 - q) * Math.cos(n * Math.PI * q));
  // a larger instrument (timer screen readable from afar): scale its meshes, keep its name label at the normal size
  const big = (tool, f) => { tool.group.children.forEach((o) => { o.position.multiplyScalar(f); if (!o.isSprite) o.scale.multiplyScalar(f); }); return tool; };
  // force arrow with its own value label (kit-7 arrow().hide() cannot hide its label: sizeLabels re-shows sprites every frame)
  const forceArrow = (k, color = k.C.blue) => {
    const a = k.arrow(color), lab = k.label('', k.V(0, 0, 0), { color: '#' + new k.THREE.Color(color).getHexString() });
    lab.userData.hidden = true;
    return {
      set(from, vec, text) {
        a.set(from, vec); const L = vec.length();
        if (L < 1e-4 || text === undefined) { lab.userData.hidden = true; return; }
        lab.setText(text); lab.position.copy(from).addScaledVector(vec.clone().normalize(), L + 0.03); lab.userData.hidden = false;
      },
      hide() { a.hide(); lab.userData.hidden = true; }
    };
  };
  const arc = (a, b, u, hgt) => a.clone().lerp(b, ease(u)).setY(a.y + (b.y - a.y) * ease(u) + Math.sin(Math.PI * u) * hgt);

  window.EMPIRA_LABS = window.EMPIRA_LABS || {};
  Object.assign(window.EMPIRA_LABS, {

    /* ================= §26 Butun olam tortishish qonuni: Kavendish buralma tarozisi (virtual) ================= */
    'kavendish-tajribasi': {
      controls: [
        { key: 'M', label: 'Katta shar massasi, M', type: 'choice', value: 100, options: opt([50, 100, 150], 'kg') },
        { key: 'r', label: 'Sharlar markazlari orasidagi masofa, r', type: 'choice', value: 0.2, options: opt([0.2, 0.3, 0.4], 'm', 1) }
      ],
      compute: (v) => { const F = 6.67e-11 * 1 * v.M / (v.r * v.r); return { F, x: F / 1e-8 }; },   // m = 1 kg; 1·10⁻⁸ N ↔ 1 mm
      // F is always shown in 10⁻⁸ N, so the engine's "→ ↑/↓" comparison of two readings stays right
      readouts: (v, c, done) => [['M', `${v.M} kg`], ['m', '1 kg'], ['r', `${fmt(v.r, 1)} m`],
        ['x (dog‘ siljishi)', done ? `${fmt(c.x, 1)} mm` : '—', true], ['F = G·m·M / r²', done ? `${fmt(c.F / 1e-8, 1)}·10⁻⁸ N` : '—', true]],
      run: ['Tarozini kuzatish', 'Koromislo burilmoqda (vaqt tezlashtirilgan)…', 'Qayta kuzatish'],
      duration: () => 3.2,
      steps: [
        { text: 'M = 100 kg li sharlarni r = 0,2 m ga qo‘yib, lazer dog‘ining siljishini o‘lchang', done: (s) => where(s.runs, { M: 100, r: 0.2 }).length > 0 },
        { text: 'Masofani r = 0,4 m ga oshirib, kuch necha marta kamayganini toping', done: (s) => where(s.runs, { M: 100, r: 0.4 }).length > 0 },
        { text: 'r = 0,2 m da 50 kg va 150 kg li sharlar bilan o‘lchang', done: (s) => where(s.runs, { M: 50, r: 0.2 }).length > 0 && where(s.runs, { M: 150, r: 0.2 }).length > 0 }
      ],
      cols: ['M', 'r', 'x', 'F'],
      row: (r) => [`${r.M} kg`, `${fmt(r.r, 1)} m`, `${fmt(r.x, 1)} mm`, `${fmt(r.F / 1e-8, 1)}·10⁻⁸ N`],
      demo: [{ M: 100, r: 0.2 }, { M: 100, r: 0.4 }, { M: 50, r: 0.2 }, { M: 150, r: 0.2 }],
      camera: { target: [0.03, 0.22, -0.1], dir: [0.28, 0.72, 1], fitW: 1.75, fitH: 1.2, min: 1.6 },
      build(k) {
        const { V } = k;
        const L = 0.2, Y = 0.2, K = 0.0028;                                    // beam turn shown: rad per mm of spot shift
        const bal = k.cavendishBalance(0, 0, { L, Y });
        const lb = k.leadBalls(0, 0, { L, Y });
        const ls = k.laserScale(0.06, -0.52, { y: 0.44 });
        const fa = [forceArrow(k), forceArrow(k)];
        const tag = k.label('', V(0, 0, 0)); tag.userData.hidden = true;
        const show = (mm) => {
          bal.set(-mm * K); ls.set(mm, bal.mirror);
          const L0 = mm > 0.05 ? 0.03 + mm * 0.003 : 0;
          fa[0].set(bal.ball(0).add(V(0.03, 0, 0)), V(L0, 0, 0));
          fa[1].set(bal.ball(1).add(V(-0.03, 0, 0)), V(-L0, 0, 0));
        };
        return {
          update(v) { lb.set(v.M, v.r); show(0); tag.userData.hidden = true; },
          progress(p, v, c) {
            const q = clamp01((p - 0.08) / 0.92);
            show(c.x * settle(q));
            if (p >= 1) { tag.setText(`x = ${fmt(c.x, 1)} mm`); tag.position.copy(ls.spotAt(c.x)).add(V(0, 0.085, 0)); tag.userData.hidden = false; }
          }
        };
      }
    },

    /* ================= §27 Og‘irlik kuchi: 1, 8 va 25 kg li yuklarni kuch datchigida tortish va 0,8 m dan tashlash ================= */
    // (the 3D stage shows about 1 m of height without fog, so the drop is 0,8 m — t = 0,40 s; a = 2h / t² is still 9,8 m/s²)
    'ogirlik-kuchi': {
      controls: [{ key: 'm', label: 'Yuk massasi, m', type: 'choice', value: 1, options: opt([1, 8, 25], 'kg') }],
      compute: (v) => { const h = 0.8, t = Math.sqrt(2 * h / G); return { F: v.m * G, t, a: 2 * h / (t * t), Fm: G, h }; },
      readouts: (v, c, done) => [['m', `${v.m} kg`], ['Fog‘', done ? `${fmt(c.F, 1)} N` : '—', true], ['Fog‘ / m', done ? `${fmt(c.Fm, 1)} N/kg` : '—'],
        ['t (h = 0,8 m)', done ? `${fmt(c.t, 2)} s` : '—', true], ['a = 2h / t²', done ? `${fmt(c.a, 1)} m/s²` : '—']],
      run: ['Tortish va tashlash', 'O‘lchanmoqda…', 'Qayta o‘lchash'],
      duration: (v, c) => 2.2 + 3 * c.t + 0.4,
      steps: [
        { text: '1 kg li yukni kuch datchigiga qo‘yib torting, so‘ng 0,8 m balandlikdan tashlab, tushish vaqtini o‘lchang', done: (s) => has(s.runs, 'm', 1) },
        { text: '8 kg li yuk bilan takrorlang', done: (s) => has(s.runs, 'm', 8) },
        { text: '25 kg li yuk bilan takrorlang va Fog‘ / m hamda a ni solishtiring', done: (s) => has(s.runs, 'm', 25) }
      ],
      cols: ['m', 'Fog‘', 'Fog‘ / m', 't', 'a'],
      row: (r) => [`${r.m} kg`, `${fmt(r.F, 1)} N`, `${fmt(r.Fm, 1)} N/kg`, `${fmt(r.t, 2)} s`, `${fmt(r.a, 1)} m/s²`],
      demo: [{ m: 1 }, { m: 8 }, { m: 25 }],
      camera: { target: [0.12, 0.55, 0], dir: [0.1, 0.24, 1], fitW: 1.45, fitH: 1.44, min: 1.5 },
      build(k) {
        const { V } = k;
        const st = k.stand(0.02, -0.02, 1.05, 0.24);
        const X = st.tip.x, Z = st.tip.z, SAND = 0.033, DROP = 0.8;
        const tray = k.group(X, 0, Z);
        k.add(tray, k.box(0.3, 0.03, 0.24, 0x8A6A44, { roughness: 0.8 }), 0, 0.015, 0);
        k.add(tray, k.box(0.28, 0.004, 0.22, 0xD9C28E, { roughness: 1 }), 0, 0.031, 0);
        const em = k.releaseMagnet(st.tip);
        const fs = k.forceSensor(-0.32, 0.1);
        const SLOTS = [[0.42, 0.14], [0.56, 0.16], [0.75, 0.12]];
        const loads = k.kettleLoads(SLOTS);
        const tm = big(k.timer(-0.36, -0.2, { name: 'Elektron sekundomer', digits: 2 }), 1.6);
        const rl = k.ruler(1.0, { vertical: true, name: 'Chizg‘ich, sm', width: 0.04 }); rl.place(X + 0.2, SAND, Z - 0.06);
        k.add(rl.group, k.box(0.07, 0.005, 0.01, k.C.amber), -0.035, DROP, 0.004);
        k.label('h = 0,8 m', V(0.1, DROP, 0), { parent: rl.group, minor: true });
        const fa = forceArrow(k);
        let i = 0, hold = 0;
        const slot = (j) => V(SLOTS[j][0], loads.height(j), SLOTS[j][1]);
        const arrowAt = (top, F) => { const len = 0.04 + F * 0.00035, cy = top.y - loads.height(i) / 2; fa.set(V(top.x - loads.items[i].r - 0.02, cy + len / 2, top.z + 0.02), V(0, -len, 0), `Fog‘ = ${fmt(F, 1)} N`); };
        return {
          update(v) {
            i = [1, 8, 25].indexOf(v.m); loads.restAll();
            hold = SAND + DROP + loads.height(i);
            em.set(hold).on(false); fs.set(0); tm.set(0); fa.hide();
          },
          progress(p, v, c) {
            const T = p * (2.2 + 3 * c.t + 0.4), onPlate = fs.top().add(V(0, loads.height(i), 0)), held = V(X, hold, Z);
            if (T < 0.7) { loads.hang(i, arc(slot(i), onPlate, T / 0.7, 0.1)); fs.set(0); em.on(false); fa.hide(); tm.set(0); return; }
            if (T < 1.3) { loads.hang(i, onPlate); fs.set(c.F * settle(clamp01((T - 0.7) / 0.45), 2)); arrowAt(onPlate, c.F); em.on(false); tm.set(0); return; }
            if (T < 2.2) { loads.hang(i, arc(onPlate, held, (T - 1.3) / 0.9, 0.12)); fs.set(0); em.on(T > 2.05); arrowAt(loads.items[i].it.position, c.F); tm.set(0); return; }
            const t = Math.min(c.t, (T - 2.2) / 3), d = Math.min(DROP, G * t * t / 2) + (t >= c.t ? 0.01 : 0);
            em.on(false); fs.set(0);
            const top = V(X, hold - d, Z); loads.hang(i, top); arrowAt(top, c.F); tm.set(t);
          }
        };
      }
    },

    /* ================= §28 Jismning og‘irligi: prujinaga osilgan va prujinali tayanchdagi yuk (90–91-rasm) ================= */
    'jism-ogirligi': {
      controls: [
        { key: 'm', label: 'Yuk massasi, m', type: 'choice', value: 100, options: opt([50, 80, 100, 200], 'g') },
        { key: 'pos', label: 'Yuk qayerda', type: 'choice', value: 'osma', options: [{ v: 'osma', label: 'Prujinaga osilgan' }, { v: 'tayanch', label: 'Tayanch ustida' }] }
      ],
      compute: (v) => { const P = v.m / 1000 * G; return { P, Fog: P, x: P / 40 * 100 }; },          // k = 40 N/m
      readouts: (v, c, done) => [['m', `${v.m} g`], ['Holat', v.pos === 'osma' ? 'osmada' : 'tayanchda'], ['x', done ? `${fmt(c.x, 1)} sm (${v.pos === 'osma' ? 'cho‘zilish' : 'siqilish'})` : '—'],
        ['P = Fₑₗ', done ? `${fmt(c.P, 2)} N` : '—', true], ['Fog‘ = mg', done ? `${fmt(c.Fog, 2)} N` : '—', true]],
      run: ['Yukni qo‘yish', 'Prujina deformatsiyalanmoqda…', 'Qayta qo‘yish'],
      duration: () => 2.7,
      steps: [
        { text: '100 g li yukni prujinaga osing va muvozanatda cho‘zilishni o‘lchang', done: (s) => where(s.runs, { m: 100, pos: 'osma' }).length > 0 },
        { text: 'Yukni 200 g ga almashtirib, o‘lchang', done: (s) => where(s.runs, { m: 200, pos: 'osma' }).length > 0 },
        { text: '80 g li yukni prujinali tayanchga qo‘yib, P ni mg bilan solishtiring', done: (s) => where(s.runs, { m: 80, pos: 'tayanch' }).length > 0 }
      ],
      cols: ['m', 'Holat', 'x', 'P', 'Fog‘'],
      row: (r) => [`${r.m} g`, r.pos === 'osma' ? 'osmada' : 'tayanchda', `${fmt(r.x, 1)} sm`, `${fmt(r.P, 2)} N`, `${fmt(r.Fog, 2)} N`],
      demo: [{ m: 100, pos: 'osma' }, { m: 200, pos: 'osma' }, { m: 80, pos: 'tayanch' }],
      camera: { target: [-0.02, 0.26, 0], dir: [0.12, 0.26, 1], fitW: 0.66, fitH: 0.74, min: 0.9 },
      build(k) {
        const { V } = k;
        const st = k.stand(-0.17, 0, 0.47, 0.17);
        const sp = k.spring(st.tip, { l0: 0.1, name: null });
        k.label('Prujina (k = 40 N/m)', V(0.09, 0.03, 0), { parent: sp.group, minor: true });
        const rl = k.ruler(0.3, { vertical: true, name: null, width: 0.03 }); rl.place(st.tip.x + 0.05, 0.13, -0.006);
        k.label('Chizg‘ich, sm', V(0.085, 0.17, 0), { parent: rl.group, minor: true });
        const pl = k.springPlatform(0.13, 0);
        const ld = k.gramLoad();
        const fg = forceArrow(k), fe = forceArrow(k, 0x2E7D5B);
        const REST = V(-0.0, 0, 0.12);
        const forces = (top, h, P, Fe, osma) => {
          const cy = top.y - h / 2;
          fg.set(V(top.x - 0.03, cy, top.z), V(0, -(0.03 + P * 0.05), 0), `Fog‘ = ${fmt(P, 2)} N`);
          if (Fe > 0.004) fe.set(V(top.x + (osma ? -0.03 : 0.03), osma ? top.y - 0.004 : top.y - h, top.z), V(0, 0.03 + Fe * 0.05, 0), `Fₑₗ = ${fmt(Fe, 2)} N`); else fe.hide();
        };
        return {
          update(v) { ld.set(v.m).standOn(REST); sp.set(0.1); pl.set(0); fg.hide(); fe.hide(); },
          progress(p, v, c) {
            const T = p * 2.7, osma = v.pos === 'osma', xe = c.x / 100;
            const x = T < 0.75 ? 0 : xe * settle(clamp01((T - 0.75) / 1.8), 4);
            sp.set(0.1 + (osma ? x : 0)); pl.set(osma ? 0 : x);
            const target = osma ? sp.end() : pl.top().add(V(0, ld.h, 0));
            const from = REST.clone().add(V(0, ld.h, 0));
            if (T < 0.75) { ld.hangFrom(arc(from, target, T / 0.75, 0.12)); fg.hide(); fe.hide(); return; }
            ld.hangFrom(target);
            forces(target, ld.h, c.P, 40 * x, osma);
          }
        };
      }
    },

    /* ================= §29 Yuklama va vaznsizlik: liftdagi tarozi (94–95-rasm, virtual model) ================= */
    'liftdagi-tarozi': {
      controls: [
        { key: 'dir', label: 'Lift harakati', type: 'choice', value: 'tinch', options: [{ v: 'tinch', label: 'Tinch' }, { v: 'yuqori', label: 'Yuqoriga' }, { v: 'past', label: 'Pastga' }, { v: 'erkin', label: 'Erkin tushish' }] },
        { key: 'a', label: 'Tezlanish, a', type: 'choice', value: 5, options: opt([2.5, 5], 'm/s²', 1) }
      ],
      compute: (v) => {
        const a = { tinch: 0, yuqori: v.a, past: -v.a, erkin: -G }[v.dir];
        const P = 45 * (G + a);
        return { acc: a, P, Fog: 45 * G, n: P / (45 * G) };
      },
      readouts: (v, c, done) => [['Harakat', { tinch: 'tinch', yuqori: 'yuqoriga', past: 'pastga', erkin: 'erkin tushish' }[v.dir]],
        ['a', v.dir === 'erkin' ? 'g = 9,8 m/s²' : `${fmt(Math.abs(c.acc), 1)} m/s²`], ['Fog‘ = mg', `${fmt(c.Fog, 0)} N`],
        ['P (tarozi)', done ? `${fmt(c.P, 1)} N` : '—', true], ['n = P / Fog‘', done ? fmt(c.n, 2) : '—', true]],
      run: ['Liftni yurgizish', 'Lift harakatlanmoqda…', 'Qayta yurgizish'],
      duration: () => 3.1,
      steps: [
        { text: 'Lift tinch turganda tarozi ko‘rsatishini yozing', done: (s) => has(s.runs, 'dir', 'tinch') },
        { text: 'Liftni 5 m/s² tezlanish bilan yuqoriga yurgizib, o‘lchang', done: (s) => where(s.runs, { dir: 'yuqori', a: 5 }).length > 0 },
        { text: 'Liftni 5 m/s² bilan pastga, so‘ng erkin tushirib o‘lchang', done: (s) => where(s.runs, { dir: 'past', a: 5 }).length > 0 && has(s.runs, 'dir', 'erkin') }
      ],
      cols: ['Harakat', 'a', 'P', 'n'],
      row: (r) => [{ tinch: 'tinch', yuqori: 'yuqoriga', past: 'pastga', erkin: 'erkin tushish' }[r.dir], `${fmt(Math.abs(r.acc), 1)} m/s²`, `${fmt(r.P, 1)} N`, fmt(r.n, 2)],
      demo: [{ dir: 'tinch' }, { dir: 'yuqori', a: 5 }, { dir: 'past', a: 5 }, { dir: 'erkin' }],
      camera: { target: [0.02, 0.54, 0], dir: [0.22, 0.2, 1], fitW: 1.0, fitH: 1.32, min: 1.2 },
      build(k) {
        const { V } = k;
        const lc = k.liftCabin(0, 0);
        const sc = k.floorScale();
        const man = k.liftMannequin();
        const aA = forceArrow(k, k.C.amber), pA = forceArrow(k);
        const Y0 = { tinch: 0.3, yuqori: 0.07, past: 0.54, erkin: 0.54 };
        let y0 = 0.3, showP = false;
        const place = (y, cut, P, float) => {
          lc.set(y, cut); const f = lc.floor();
          sc.place(V(f.x - 0.01, f.y, f.z + 0.01)).set(P);
          man.place(V(f.x - 0.01, f.y + 0.018, f.z + 0.01)).lift(float);
          if (P > 1 && showP) pA.set(V(f.x + 0.045, f.y + 0.017, f.z + 0.05), V(0, -0.012 - 0.07 * P / 441, 0)); else pA.hide();
          return f;
        };
        return {
          update(v, c) { y0 = Y0[v.dir]; showP = false; place(y0, 0, c.Fog, 0); aA.hide(); },
          progress(p, v, c) {
            showP = true;
            const T = p * 3.1, tau = Math.max(0, T - 0.8), A = 2 * 0.045 * Math.abs(c.acc) / (2.3 * 2.3);
            const y = y0 + Math.sign(c.acc) * A * tau * tau / 2, cut = v.dir === 'erkin' && T >= 0.8;
            const P = T < 0.8 ? c.Fog : c.Fog + (c.P - c.Fog) * clamp01((T - 0.8) / 0.12);
            const f = place(y, cut, P, cut ? 0.008 * clamp01(tau / 0.5) : 0);
            if (c.acc && T >= 0.8) aA.set(V(f.x - 0.25, f.y + 0.16, f.z), V(0, Math.sign(c.acc) * (0.04 + 0.01 * Math.abs(c.acc)), 0), v.dir === 'erkin' ? 'a = g' : `a = ${fmt(Math.abs(c.acc), 1)} m/s²`);
            else aA.hide();
          }
        };
      }
    },

    /* ================= §30 Gorizontal otilgan jism: minoradan ikki shar (98-rasm, g = 10 m/s²) ================= */
    'gorizontal-otish': {
      controls: [
        { key: 'h', label: 'Minora balandligi, h', type: 'choice', value: 80, options: opt([20, 45, 80], 'm') },
        { key: 'u0', label: 'Gorizontal tezlik, υ₀', type: 'choice', value: 10, options: opt([0, 5, 10, 15, 20], 'm/s') }
      ],
      compute: (v) => { const t = Math.sqrt(2 * v.h / 10); return { t, s: v.u0 * t, tA: t, tB: t }; },
      readouts: (v, c, done) => [['h', `${v.h} m`], ['υ₀', `${v.u0} m/s`], ['t (tik tashlangan)', done ? `${fmt(c.tA, 1)} s` : '—', true],
        ['t (gorizontal otilgan)', done ? `${fmt(c.tB, 1)} s` : '—', true], ['s = υ₀·t', done ? `${fmt(c.s, 0)} m` : '—', true]],
      run: ['Sharlarni qo‘yib yuborish', 'Sharlar uchmoqda…', 'Qayta otish'],
      duration: (v, c) => c.t + 0.5,
      steps: [
        { text: 'h = 80 m, υ₀ = 10 m/s: ikkala sharning tushish vaqtini o‘lchang', done: (s) => where(s.runs, { h: 80, u0: 10 }).length > 0 },
        { text: 'υ₀ ni 20 m/s ga oshirib, vaqt va uchish uzoqligini o‘lchang', done: (s) => where(s.runs, { h: 80, u0: 20 }).length > 0 },
        { text: 'h = 45 m, υ₀ = 20 m/s da o‘lchang', done: (s) => where(s.runs, { h: 45, u0: 20 }).length > 0 }
      ],
      cols: ['h', 'υ₀', 't (tik)', 't (gor.)', 's'],
      row: (r) => [`${r.h} m`, `${r.u0} m/s`, `${fmt(r.tA, 1)} s`, `${fmt(r.tB, 1)} s`, `${fmt(r.s, 0)} m`],
      demo: [{ h: 80, u0: 10 }, { h: 80, u0: 20 }, { h: 45, u0: 20 }],
      camera: { target: [-0.08, 0.5, 0], dir: [0.06, 0.2, 1], fitW: 1.35, fitH: 1.28, min: 1.4 },
      build(k) {
        const { V } = k;
        const R = 0.012, S = 1 / 100;                                           // model 1 : 100
        const tw = k.towerModel(-0.58, 0);
        const bA = k.ball(R, {}), bB = k.ball(R, {});
        const gr = k.ruler(0.85, { name: 'Yer shkalasi (1 : 100), m', width: 0.04 }); gr.place(-0.455, 0, 0.09);
        const tm = big(k.timer(0.3, -0.24, { name: 'Elektron sekundomer', digits: 1 }), 1.5);
        const sb = k.strobeLamp(0.47, 0.08);
        const gm = new k.THREE.MeshStandardMaterial({ color: 0xC9CED9, transparent: true, opacity: 0.45, metalness: 0.5, roughness: 0.3, depthWrite: false });
        const ghosts = [...Array(8)].map(() => { const m = k.add(k.group(), new k.THREE.Mesh(new k.THREE.SphereGeometry(R, 16, 12), gm)); m.parent.visible = false; return m.parent; });
        const lm = k.mat(k.C.amber, { emissive: k.C.amber, emissiveIntensity: 0.3 });
        const links = [...Array(4)].map(() => { const g = k.group(); k.add(g, new k.THREE.Mesh(new k.THREE.CylinderGeometry(0.0012, 0.0012, 1, 6), lm)).rotation.z = Math.PI / 2; g.visible = false; return g; });
        const htags = [...Array(3)].map(() => { const l = k.label('', V(0, 0, 0), { minor: true }); l.userData.hidden = true; return l; });
        const sTag = k.label('', V(0, 0, 0)); sTag.userData.hidden = true;
        const posA = (v, t) => tw.start(R, false).add(V(0, -10 * t * t / 2 * S, 0));
        const posB = (v, t) => tw.start(R, true).add(V(v.u0 * t * S, -10 * t * t / 2 * S, 0));
        return {
          update(v) {
            tw.set(v.h).fire(0); bA.put(posA(v, 0)); bB.put(posB(v, 0)); tm.set(0); sb.flash(0);
            ghosts.forEach((g) => { g.visible = false; }); links.forEach((g) => { g.visible = false; }); htags.forEach((l) => { l.userData.hidden = true; }); sTag.userData.hidden = true;
          },
          progress(p, v, c) {
            const T = p * (c.t + 0.5), t = Math.min(T, c.t);
            tw.fire(clamp01(T / 0.06));
            bA.put(posA(v, t)); bB.put(posB(v, t)); tm.set(t);
            const ph = T % 1; sb.flash(T > 0.5 && t < c.t + 0.2 ? Math.max(0, 1 - ph / 0.12) : 0);
            for (let n = 1; n <= 4; n++) {
              const on = n < c.t - 1e-6 && t >= n - 1e-6;
              const ga = ghosts[2 * n - 2], gb = ghosts[2 * n - 1], ln = links[n - 1];
              ga.visible = gb.visible = ln.visible = on;
              if (!on) { if (htags[n - 1]) htags[n - 1].userData.hidden = true; continue; }
              const a = posA(v, n), b = posB(v, n); ga.position.copy(a); gb.position.copy(b);
              ln.position.copy(a).lerp(b, 0.5); ln.scale.set(Math.max(0.001, b.distanceTo(a)), 1, 1); ln.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
              if (htags[n - 1]) { htags[n - 1].setText(`${n} s: ${fmt(v.h - 5 * n * n, 0)} m`); htags[n - 1].position.set(-0.7, a.y, 0); htags[n - 1].userData.hidden = false; }
            }
            if (p >= 1) { sTag.setText(`s = ${fmt(c.s, 0)} m`); sTag.position.copy(posB(v, c.t)).add(V(0, 0.07, 0)); sTag.userData.hidden = false; }
          }
        };
      }
    },

    /* ================= §31 Yerning sun’iy yo‘ldoshlari: yo‘ldoshni orbitaga chiqarish (virtual, vaqt tezlashtirilgan) ================= */
    'suniy-yoldosh': (() => {
      const GM = 4.0e14, RE = 6.4e6;
      const orbit = (h, u) => {
        const r = RE + h * 1e3, v = u * 1000, u1 = Math.sqrt(GM / r) / 1000, u2 = Math.SQRT2 * u1;
        const a = 1 / (2 / r - v * v / GM), other = 2 * a - r;
        const shape = Math.abs(u - u1) < 0.05 ? 'aylana' : u >= u2 - 1e-9 ? 'tark' : other < RE + 100e3 ? 'tushadi' : 'ellips';
        const T = shape === 'aylana' ? 2 * Math.PI * r / (u1 * 1000) / 60 : shape === 'ellips' ? 2 * Math.PI * Math.sqrt(a * a * a / GM) / 60 : 0;
        return { gh: GM / (r * r), u1, u2, shape, T };
      };
      const NAME = { aylana: 'aylana', ellips: 'ellips', tushadi: 'Yerga qaytib tushadi', tark: 'Yerni tark etadi' };
      // trajectory in the orbit plane (metres), launched horizontally at the left point, moving up (clockwise)
      const simulate = (h, u) => {
        const r0 = RE + h * 1e3; let x = -r0, y = 0, vx = 0, vy = u * 1000, t = 0, turned = 0, ang = Math.atan2(y, x), end = 'orbit';
        const dt = 3, pts = [[0, x, y]];
        const acc = (px, py) => { const r3 = Math.pow(px * px + py * py, 1.5); return [-GM * px / r3, -GM * py / r3]; };
        let [ax, ay] = acc(x, y);
        for (let i = 1; i < 200000; i++) {
          vx += ax * dt / 2; vy += ay * dt / 2; x += vx * dt; y += vy * dt; [ax, ay] = acc(x, y); vx += ax * dt / 2; vy += ay * dt / 2; t += dt;
          const a2 = Math.atan2(y, x); let da = a2 - ang; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; turned += Math.abs(da); ang = a2;
          const r = Math.hypot(x, y);
          if (i % 8 === 0) pts.push([t, x, y]);
          if (r < RE) { end = 'hit'; break; }
          if (r > 2.5 * RE) { end = 'away'; break; }
          if (turned >= 2 * Math.PI) { end = 'orbit'; break; }
        }
        pts.push([t, x, y]);
        return { pts, tEnd: t, end };
      };
      return {
        controls: [
          { key: 'h', label: 'Orbita balandligi, h', type: 'choice', value: 300, options: opt([300, 1000, 2000], 'km') },
          { key: 'u', label: 'Yo‘ldosh tezligi, υ', type: 'range', min: 6.5, max: 12, step: 0.1, value: 7, unit: 'km/s', d: 1 }
        ],
        compute: (v) => orbit(v.h, v.u),
        readouts: (v, c, done) => [['h', `${v.h} km`], ['υ', `${fmt(v.u, 1)} km/s`], ['gₕ', `${fmt(c.gh, 1)} m/s²`],
          ['υ₁ (aylana)', done ? `${fmt(c.u1, 1)} km/s` : '—', true], ['Orbita', done ? NAME[c.shape] : '—', true],
          ['T', done && c.T ? `${fmt(c.T, 0)} min` : '—']],
        run: ['Yo‘ldoshni uchirish', 'Yo‘ldosh uchmoqda (vaqt tezlashtirilgan)…', 'Qayta uchirish'],
        duration: () => 4.4,
        steps: [
          { text: 'h = 300 km da tezlikni tanlab, aylana orbitani hosil qiling', done: (s) => s.runs.some((r) => r.h === 300 && r.shape === 'aylana') },
          { text: 'h = 2000 km da aylana orbita uchun tezlikni toping', done: (s) => s.runs.some((r) => r.h === 2000 && r.shape === 'aylana') },
          { text: 'h = 300 km da tezlikni 11,2 km/s gacha oshirib, orbita shaklini kuzating', done: (s) => s.runs.some((r) => r.h === 300 && r.shape === 'tark') }
        ],
        cols: ['h', 'υ', 'υ₁', 'Orbita', 'T'],
        row: (r) => [`${r.h} km`, `${fmt(r.u, 1)} km/s`, `${fmt(r.u1, 1)} km/s`, NAME[r.shape], r.T ? `${fmt(r.T, 0)} min` : '—'],
        demo: [{ h: 300, u: 7.7 }, { h: 2000, u: 6.9 }, { h: 300, u: 11.2 }],
        camera: { target: [0.12, 0.5, 0], dir: [0.05, 0.12, 1], fitW: 1.4, fitH: 1.2, min: 1.3 },
        build(k) {
          const { V, THREE } = k;
          const Y = 0.44, R = 0.18, S = R / RE;
          const em = k.earthModel(0, Y, 0, R);
          const sat = k.satelliteModel();
          const tm = big(k.timer(0.5, -0.12, { name: 'Vaqt (tezlashtirilgan)', digits: 0 }), 1.5);
          const MAX = 30000, buf = new Float32Array(MAX * 3);
          const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(buf, 3)); geo.setDrawRange(0, 0);
          const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xFFB21E })); line.frustumCulled = false; k.group().add(line);
          const rocketM = new THREE.MeshStandardMaterial({ color: 0xFF8A3D, emissive: 0xFF8A3D, emissiveIntensity: 1.5 });
          const flame = k.add(k.group(), new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.03, 10), rocketM)); flame.parent.visible = false;
          const tag = k.label('', V(0, 0, 0)); tag.userData.hidden = true;
          let sim = null, n = 0;
          const P = (x, y) => V(x * S, Y + y * S, 0.0);
          const launch = (hKm, u) => { const r0 = (RE + hKm * 1e3) * S; return { s: V(-R * 0.94, Y - R * 0.34, 0), c: V(-r0, Y - 0.35 * r0, 0), e: V(-r0, Y, 0) }; };
          const bez = (L, q) => L.s.clone().multiplyScalar((1 - q) ** 2).add(L.c.clone().multiplyScalar(2 * q * (1 - q))).add(L.e.clone().multiplyScalar(q * q));
          return {
            update(v) {
              em.setRing(v.h); sim = simulate(v.h, v.u); n = Math.min(MAX, sim.pts.length);
              const step = sim.pts.length / n;
              for (let i = 0; i < n; i++) { const [, x, y] = sim.pts[Math.min(sim.pts.length - 1, Math.floor(i * step))]; const p = P(x, y); buf[3 * i] = p.x; buf[3 * i + 1] = p.y; buf[3 * i + 2] = p.z; }
              geo.attributes.position.needsUpdate = true; geo.setDrawRange(0, 0); geo.computeBoundingSphere();
              const L = launch(v.h, v.u); sat.put(L.s, 0); flame.parent.visible = false; tm.set(0, 'min'); tag.userData.hidden = true;
            },
            progress(p, v, c) {
              const L = launch(v.h, v.u);
              if (p < 0.16) {
                const q = ease(p / 0.16), a = bez(L, q), b = bez(L, Math.min(1, q + 0.01));
                sat.put(a, Math.atan2(b.y - a.y, b.x - a.x) - Math.PI / 2);
                flame.parent.visible = true; flame.position.copy(a).add(V(0, -0.025, 0)); geo.setDrawRange(0, 0); tm.set(0, 'min'); return;
              }
              flame.parent.visible = false;
              const q = (p - 0.16) / 0.84, i = Math.min(n - 1, Math.floor(q * (n - 1)));
              geo.setDrawRange(0, i + 1);
              const a = V(buf[3 * i], buf[3 * i + 1], 0), j = Math.min(n - 1, i + 1), b = V(buf[3 * j], buf[3 * j + 1], 0);
              sat.put(a, i < n - 1 ? Math.atan2(b.y - a.y, b.x - a.x) : 0);
              tm.set(q * sim.tEnd / 60, 'min');
              if (p >= 1) {
                tag.setText({ aylana: `Aylana orbita: υ₁ = ${fmt(c.u1, 1)} km/s`, ellips: 'Ellips orbita', tushadi: 'Yerga qaytib tushdi', tark: 'Yerni tark etmoqda' }[c.shape]);
                const e = V(buf[3 * (n - 1)], buf[3 * (n - 1) + 1], 0);
                tag.position.copy(c.shape === 'tark' ? e.add(V(-0.05, -0.07, 0)) : c.shape === 'ellips' ? V(0.3, Y - 0.06, 0) : V(-(R + v.h * 1e3 * S) - 0.02, Y - 0.1, 0.05)); tag.userData.hidden = false;
              }
            },
            animate(dt) { em.spin((performance.now() / 1000) * 0.05); }
          };
        }
      };
    })(),

    /* ================= §32 Tinchlikdagi ishqalanish: brusokni asta-sekin kuchayuvchi kuch bilan tortish (109-rasm) ================= */
    'tinchlikdagi-ishqalanish': {
      controls: [
        { key: 'F', label: 'Tortish kuchi (eng katta), F', type: 'range', min: 0, max: 2, step: 0.1, value: 0.2, unit: 'N', d: 1 },
        { key: 'load', label: 'Brusok ustidagi yuk', type: 'choice', value: 0, options: opt([0, 100, 200], 'g') }
      ],
      compute: (v) => {
        const m = 0.1 + v.load / 1000, Fmax = 0.5 * m * G, Fs = 0.4 * m * G, moved = v.F > Fmax + 1e-9;   // yog‘och–yog‘och: μ = 0,4 (3-jadval); qo‘zg‘alish chegarasi taxminan 0,5·mg
        return { m, Fmax, Fs, moved, Ft: moved ? Fmax : v.F, tth: moved ? 3 * Fmax / v.F : 0 };
      },
      readouts: (v, c, done) => [['m', `${fmt(c.m, 1)} kg`], ['F', `${fmt(v.F, 1)} N`], ['Brusok', done ? (c.moved ? 'qo‘zg‘aldi' : 'tinch turibdi') : '—', true],
        ['Fᵢ(t)', done ? (c.moved ? `${fmt(c.Ft, 2)} N (eng katta)` : `${fmt(c.Ft, 2)} N`) : '—', true], ['Fᵢ(s)', done && c.moved ? `${fmt(c.Fs, 2)} N` : '—']],
      run: ['Asta-sekin tortish', 'Kuch ortmoqda…', 'Qayta tortish'],
      duration: () => 3.7,
      steps: [
        { text: 'Yuksiz brusokni 0,2 N kuch bilan torting: u qo‘zg‘aladimi? Fᵢ(t) ni yozing', done: (s) => s.runs.some((r) => r.load === 0 && Math.abs(r.F - 0.2) < 1e-6 && !r.moved) },
        { text: 'Kuchni oshirib boring va brusok qo‘zg‘algan paytdagi eng katta kuchni yozing', done: (s) => where(s.runs, { load: 0, moved: true }).length > 0 },
        { text: 'Brusokka 100 g yuk qo‘yib, qo‘zg‘alish chegarasini qayta o‘lchang', done: (s) => where(s.runs, { load: 100, moved: true }).length > 0 }
      ],
      cols: ['m', 'F', 'Brusok', 'Fᵢ(t)'],
      row: (r) => [`${fmt(r.m, 1)} kg`, `${fmt(r.F, 1)} N`, r.moved ? 'qo‘zg‘aldi' : 'tinch', `${fmt(r.Ft, 2)} N`],
      demo: [{ load: 0, F: 0.2 }, { load: 0, F: 0.5 }, { load: 100, F: 1.0 }],
      camera: { target: [0.0, 0.17, -0.1], dir: [0.0, 0.42, 1], fitW: 1.25, fitH: 0.82, min: 1.2 },
      build(k) {
        const { V } = k;
        const wr = k.woodRuler(-0.52, 0.06, 1.0);
        const bl = k.block({ name: 'Brusok (100 g)' });
        const dy = k.dynamometer(V(0, 0.05, 0.06)); dy.group.rotation.z = -Math.PI / 2;
        const ws = k.weights(0.38, 0.24, 2, { name: 'Yuklar', mass: '100 g' });
        const ch = k.chartBoard(-0.08, 0.1, -0.3, { w: 0.56, h: 0.3, xMax: 4, yMax: 2, xStep: 0.5, yStep: 0.5, xLabel: 't, s', yLabel: 'F, N', name: 'Dinamometr ko‘rsatishi F(t)' });
        const fA = forceArrow(k), iA = forceArrow(k, k.C.red);
        const S0 = 0.24;
        const reading = (t, v, c) => (!c.moved ? v.F * Math.min(t, 3) / 3 : t < c.tth ? v.F * t / 3 : t < c.tth + 0.12 ? c.Fmax + (c.Fs - c.Fmax) * (t - c.tth) / 0.12 : c.Fs);
        const place = (s, F, Fi) => {
          bl.put(wr, s); const hk = bl.hook();
          dy.set(F); const d = Math.min(0.1, F * 0.06); dy.group.position.set(hk.x + 0.185 + d, hk.y, hk.z);
          if (F > 0.005) { fA.set(V(hk.x, hk.y + 0.045, hk.z), V(0.03 + F * 0.08, 0, 0), `F = ${fmt(F, 2)} N`); iA.set(V(hk.x - bl.w - 0.01, wr.top + 0.006, hk.z + 0.03), V(-(0.03 + Fi * 0.08), 0, 0), `Fᵢ = ${fmt(Fi, 2)} N`); } else { fA.hide(); iA.hide(); }
        };
        return {
          update(v) { const n = v.load / 100; bl.setLoad(n); ws.set(2 - n); place(S0, 0, 0); ch.clear(); },
          progress(p, v, c) {
            const t = p * 3.7, F = reading(t, v, c), s = S0 + (c.moved && t > c.tth ? 0.07 * (t - c.tth) : 0);
            place(s, F, F);
            const pts = []; for (let q = 0; q <= t + 1e-9; q += 0.04) pts.push([q, reading(q, v, c)]); pts.push([t, F]);
            const list = [{ color: '#3B4CFF', pts }];
            if (c.moved && t > c.tth) list.push({ color: '#E5484D', dash: true, pts: [[0, c.Fmax], [4, c.Fmax]] }, { color: '#E5484D', pts: [[0, c.Fmax], [0.02, c.Fmax]], name: 'Fᵢ(t) eng katta' });
            ch.set(list);
          }
        };
      }
    },

    /* ================= §33 Sirpanish va dumalanish ishqalanish: aravacha (112–113-rasm) ================= */
    'sirpanish-dumalanish': {
      controls: [
        { key: 'tur', label: 'G‘ildiraklar', type: 'choice', value: 's', options: [{ v: 's', label: 'Qulflangan (sirpanish)' }, { v: 'd', label: 'Erkin (dumalanish)' }] },
        { key: 'm', label: 'Aravacha va yuk massasi, m', type: 'choice', value: 0.5, options: opt([0.5, 1.0, 1.5], 'kg', 1) }
      ],
      compute: (v) => { const P = v.m * G, F = v.tur === 's' ? 0.12 * P : 0.0002 * P / 0.01; return { P, F, mu: F / P, mud: F * 0.01 / P * 1000 }; },   // po‘lat–po‘lat: μ = 0,12; μd = 0,2 mm; r = 1 sm
      readouts: (v, c, done, runs) => {
        const sl = where(runs, { tur: 's', m: v.m }).pop(), rl = where(runs, { tur: 'd', m: v.m }).pop();
        return [['Harakat', v.tur === 's' ? 'sirpanish' : 'dumalanish'], ['m', `${fmt(v.m, 1)} kg`], ['P = mg', `${fmt(c.P, 1)} N`],
          ['F', done ? `${fmt(c.F, 2)} N` : '—', true], ['μ = F / P', done && v.tur === 's' ? fmt(c.mu, 2) : '—'], ['μd = F·r / P', done && v.tur === 'd' ? `${fmt(c.mud, 1)} mm` : '—'],
          ['Fᵢ(s) / Fᵢ(d)', sl && rl ? `${fmt(sl.F / rl.F, 1)} marta` : '—', true]];
      },
      run: ['Tekis tortish', 'Aravacha tortilmoqda…', 'Qayta tortish'],
      duration: () => 2.6,
      steps: [
        { text: 'G‘ildiraklarni qulflab, 0,5 kg li aravachani tekis torting', done: (s) => where(s.runs, { tur: 's', m: 0.5 }).length > 0 },
        { text: 'G‘ildiraklarni bo‘shatib, xuddi shunday torting', done: (s) => where(s.runs, { tur: 'd', m: 0.5 }).length > 0 },
        { text: 'Aravachaga 0,5 kg yuk qo‘yib (1,0 kg), ikkala holatni takrorlang', done: (s) => where(s.runs, { tur: 's', m: 1 }).length > 0 && where(s.runs, { tur: 'd', m: 1 }).length > 0 }
      ],
      cols: ['Harakat', 'm', 'F', 'μ / μd'],
      row: (r) => [r.tur === 's' ? 'sirpanish' : 'dumalanish', `${fmt(r.m, 1)} kg`, `${fmt(r.F, 2)} N`, r.tur === 's' ? `μ = ${fmt(r.mu, 2)}` : `μd = ${fmt(r.mud, 1)} mm`],
      demo: [{ tur: 's', m: 0.5 }, { tur: 'd', m: 0.5 }, { tur: 'd', m: 1 }, { tur: 's', m: 1 }],
      camera: { target: [-0.03, 0.05, 0.04], dir: [0.06, 0.62, 1], fitW: 1.18, fitH: 0.5, min: 1.05 },
      build(k) {
        const { V } = k;
        const tr = k.track(-0.55, 0.04, 1.1);
        const c = k.cart({ name: 'Aravacha (0,5 kg)' });
        const lockM = k.mat(k.C.red, { roughness: 0.5 });
        const locks = [];
        [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => locks.push(k.add(c.group, new k.THREE.Mesh(new k.THREE.BoxGeometry(0.007, 0.022, 0.006), lockM), sx * 0.032 - sx * 0.0145, 0.016, sz * 0.036))));
        const wheels = c.group.children.filter((o) => o.isGroup);
        const dd = k.digitalDynamometer();
        const ws = k.weights(0.36, 0.24, 2, { name: 'Yuklar', mass: '0,5 kg' });
        const fA = forceArrow(k), iA = forceArrow(k, k.C.red);
        const S0 = 0.16;
        let locked = true;
        const place = (s, F, name) => {
          c.put(tr, s); if (locked) wheels.forEach((w) => { w.rotation.z = 0; });
          const f = c.front(); dd.put(f).set(F);
          if (F > 0.003) { fA.set(f.clone().add(V(0.005, -0.012, 0.05)), V(0.03 + F * 0.12, 0, 0), `F = ${fmt(F, 2)} N`); iA.set(c.back().add(V(-0.004, -0.024, 0.04)), V(-(0.03 + F * 0.12), 0, 0), `${name} = ${fmt(F, 2)} N`); } else { fA.hide(); iA.hide(); }
        };
        return {
          update(v) { locked = v.tur === 's'; locks.forEach((l) => { l.visible = locked; }); const n = Math.round((v.m - 0.5) / 0.5); c.setLoad(n); ws.set(2 - n); place(S0, 0); },
          progress(p, v, cc) {
            const T = p * 2.6, F = cc.F * ease(clamp01(T / 0.3)), s = S0 + 0.12 * Math.max(0, T - 0.3);
            place(s, F, v.tur === 's' ? 'Fᵢ(s)' : 'Fᵢ(d)');
          }
        };
      }
    },

    /* ================= §34 3-laboratoriya ishi: sirpanish ishqalanish koeffitsiyentini aniqlash (p.122–123) ================= */
    'ishqalanish-koeffitsiyenti': {
      controls: [{ key: 'tosh', label: 'Taxtacha ustidagi tosh', type: 'choice', value: 0, options: [{ v: 0, label: 'Toshsiz' }, { v: 100, label: '100 g' }, { v: 200, label: '200 g' }] }],
      // taxtacha 200 g; dinamometr ko‘rsatishi bo‘linma (0,05 N) gacha yaxlitlangan; μ = Fᵢ(s) / P — kitobdagi (2) formula, 119-bet
      compute: (v) => { const m = 0.2 + v.tosh / 1000, P = m * G, F = { 0: 0.8, 100: 1.15, 200: 1.6 }[v.tosh]; return { m, P, F, mu: F / P }; },
      readouts: (v, c, done, runs) => {
        const out = [['Tosh', v.tosh ? `${v.tosh} g` : 'yo‘q'], ['m (tarozi)', done ? `${fmt(c.m, 3)} kg` : '—'], ['P = mg', done ? `${fmt(c.P, 2)} N` : '—'],
          ['Fᵢ(s) (dinamometr)', done ? `${fmt(c.F, 2)} N` : '—', true], ['μ = Fᵢ(s) / P', done ? fmt(c.mu, 3) : '—', true]];
        if (uniq(runs, 'tosh') >= 3) {
          const set = [0, 100, 200].map((n) => runs.filter((r) => r.tosh === n).pop().mu);
          const avg = set.reduce((a, b) => a + b, 0) / 3, dav = set.reduce((a, b) => a + Math.abs(avg - b), 0) / 3;
          out.push(['μₒ‘ᵣₜ', `${fmt(avg, 2)} ± ${fmt(dav, 2)}`, true], ['ε', `${fmt(dav / avg * 100, 1)} %`]);
        }
        return out;
      },
      run: ['Tortib, so‘ng sirpantirish', 'O‘lchanmoqda…', 'Qayta o‘lchash'],
      duration: () => 4.6,
      steps: [
        { text: 'Taxtachani tarozida torting, so‘ng chizg‘ich bo‘ylab tekis sirpantirib, μ₁ ni toping', done: (s) => has(s.runs, 'tosh', 0) },
        { text: 'Taxtacha ustiga 100 g li tosh qo‘yib, μ₂ ni toping', done: (s) => has(s.runs, 'tosh', 100) },
        { text: '200 g li tosh bilan μ₃ ni toping va μₒ‘ᵣₜ ni hisoblang', done: (s) => has(s.runs, 'tosh', 200) }
      ],
      cols: ['m', 'P', 'Fᵢ(s)', 'μ'],
      row: (r) => [`${fmt(r.m, 3)} kg`, `${fmt(r.P, 2)} N`, `${fmt(r.F, 2)} N`, fmt(r.mu, 3)],
      demo: [{ tosh: 0 }, { tosh: 100 }, { tosh: 200 }],
      camera: { target: [-0.08, 0.1, -0.06], dir: [0.0, 0.55, 1], fitW: 1.22, fitH: 0.62, min: 1.1 },
      build(k) {
        const { V } = k;
        const wr = k.woodRuler(-0.56, 0.08, 1.0);
        const bl = k.block({ name: 'Taxtacha (200 g)', w: 0.1, h: 0.025, d: 0.06 });
        const dy = k.dynamometer(V(0, 0.05, 0.08)); dy.group.rotation.z = -Math.PI / 2;
        const sb = k.scaleBal(0.3, -0.2, { name: 'Tarozi' });
        const ws = k.weights(-0.28, -0.2, 3, { name: 'Tarozi toshlari', mass: '100 g' });
        const fA = forceArrow(k), iA = forceArrow(k, k.C.red);
        const S0 = 0.16;
        const dyAt = (hk, F) => { dy.set(F); const d = Math.min(0.1, F * 0.06); dy.group.position.set(hk.x + 0.185 + d, hk.y, hk.z); };
        const forces = (F) => {
          const hk = bl.hook();
          if (F > 0.005) { fA.set(V(hk.x, hk.y + 0.045, hk.z), V(0.03 + F * 0.07, 0, 0), `F = ${fmt(F, 2)} N`); iA.set(V(hk.x - bl.w - 0.01, wr.top + 0.006, hk.z + 0.035), V(-(0.03 + F * 0.07), 0, 0), `Fᵢ(s) = ${fmt(F, 2)} N`); } else { fA.hide(); iA.hide(); }
        };
        return {
          update(v) { const n = v.tosh / 100; bl.setLoad(n); ws.set(3 - n); bl.put(wr, S0); dyAt(bl.hook(), 0); sb.set('0,000 kg'); forces(0); },
          progress(p, v, c) {
            const T = p * 4.6, home = wr.at(S0), onScale = sb.top.clone();
            if (T < 0.7) { bl.group.position.copy(arc(home, onScale, T / 0.7, 0.08)); sb.set('0,000 kg'); forces(0); return; }
            if (T < 1.3) { bl.group.position.copy(onScale); sb.set(`${fmt(c.m * clamp01((T - 0.7) / 0.25), 3)} kg`); forces(0); return; }
            if (T < 2.0) { bl.group.position.copy(arc(onScale, home, (T - 1.3) / 0.7, 0.08)); sb.set('0,000 kg'); forces(0); return; }
            const F = c.F * ease(clamp01((T - 2.0) / 0.3)), s = S0 + 0.1 * Math.max(0, T - 2.3);
            bl.put(wr, s); dyAt(bl.hook(), F); forces(F);
          }
        };
      }
    },

    /* ================= §35 Tabiatda va texnikada ishqalanish: avtomobilning tormozlanish yo‘li (virtual model) ================= */
    'tormozlanish-yoli': (() => {
      const MU = { beton: 0.75, asfalt: 0.4, qum: 0.3, muz: 0.1 };                 // 0,75: kitobdagi rezina–beton (3-jadval); qolganlari taxminiy
      const SURF = { beton: 'quruq beton', asfalt: 'ho‘l asfalt', qum: 'qum sepilgan muz', muz: 'muz' };
      const TB = (c) => Math.min(3.45, 0.8 + 0.13 * c.t), AP = 0.45;
      return {
        controls: [
          { key: 'q', label: 'Yo‘l qoplamasi', type: 'choice', value: 'beton', options: Object.entries(SURF).map(([v, label]) => ({ v, label })) },
          { key: 'u', label: 'Boshlang‘ich tezlik, υ₀', type: 'choice', value: 36, options: opt([36, 54, 72], 'km/soat') }
        ],
        compute: (v) => { const mu = MU[v.q], u0 = v.u / 3.6; return { mu, u0, s: u0 * u0 / (2 * mu * G), t: u0 / (mu * G) }; },
        readouts: (v, c, done) => [['Qoplama', SURF[v.q]], ['μ', v.q === 'beton' ? '0,75 (kitobdan)' : `≈ ${fmt(c.mu, 2)} (taxminiy)`], ['υ₀', `${v.u} km/soat = ${fmt(c.u0, 0)} m/s`],
          ['s (tormozlanish yo‘li)', done ? `${fmt(c.s, 1)} m` : '—', true], ['t (to‘xtash vaqti)', done ? `${fmt(c.t, 1)} s` : '—']],
        run: ['Tormozlash', 'Avtomobil tormozlanmoqda…', 'Qayta tormozlash'],
        duration: (v, c) => AP + TB(c) + 0.35,
        steps: [
          { text: 'Quruq betonda 36 km/soat tezlikdan tormozlang va tormozlanish yo‘lini o‘lchang', done: (s) => where(s.runs, { q: 'beton', u: 36 }).length > 0 },
          { text: 'Tezlikni 72 km/soat ga oshirib, takrorlang: yo‘l necha marta uzaydi?', done: (s) => where(s.runs, { q: 'beton', u: 72 }).length > 0 },
          { text: '36 km/soat da muzda, so‘ng qum sepilgan muzda tormozlang', done: (s) => where(s.runs, { q: 'muz', u: 36 }).length > 0 && where(s.runs, { q: 'qum', u: 36 }).length > 0 }
        ],
        cols: ['Qoplama', 'μ', 'υ₀', 's', 't'],
        row: (r) => [SURF[r.q], fmt(r.mu, 2), `${r.u} km/soat`, `${fmt(r.s, 1)} m`, `${fmt(r.t, 1)} s`],
        demo: [{ q: 'beton', u: 36 }, { q: 'beton', u: 72 }, { q: 'muz', u: 36 }, { q: 'qum', u: 36 }],
        camera: { target: [-0.09, 0.03, 0.0], dir: [0.0, 0.85, 1], fitW: 1.56, fitH: 0.62, min: 1.25 },
        build(k) {
          const { V } = k;
          const X0 = -0.48, Z = 0.0, SC = 200;
          const rd = k.roadStrip(X0, Z, 1.1, { approach: 0.32, scale: SC });
          const car = big(k.testCar(), 0.6);                                   // model car (not to the road's scale)
          const tm = big(k.timer(0.26, -0.17, { name: 'Sekundomer', digits: 1 }), 1.4);
          const rad = k.speedRadar(-0.62, -0.13);
          const skidM = k.mat(0x1A1C22, { roughness: 0.9 });
          const skids = [-1, 1].map((s) => { const g = k.group(0, 0.0068, Z + s * 0.024); k.add(g, new k.THREE.Mesh(new k.THREE.BoxGeometry(1, 0.0008, 0.007), skidM)); g.visible = false; return g; });
          const bar = k.group(0, 0.004, Z + 0.105); k.add(bar, k.box(1, 0.006, 0.008, k.C.amber, { emissive: k.C.amber, emissiveIntensity: 0.3 })); bar.visible = false;
          const tag = k.label('', V(0, 0, 0)); tag.userData.hidden = true;
          const put = (sM, braking) => {
            const front = rd.at(sM); car.put(front - 0.027, Z, braking ? 0 : (sM / SC)).brake(braking);
            const rear = front - 0.044, len = rear - X0;
            skids.forEach((g) => { g.visible = braking && len > 0.002; g.scale.x = Math.max(0.001, len); g.position.x = X0 + len / 2; });
          };
          return {
            update(v, c) { rd.setSurface(v.q); const f = c.t / TB(c); put(-c.u0 * AP * f, false); rad.set(0); tm.set(0); bar.visible = false; tag.userData.hidden = true; },
            progress(p, v, c) {
              const T = p * (AP + TB(c) + 0.35), f = c.t / TB(c), a = c.mu * G;
              if (T < AP) { put(-c.u0 * (AP - T) * f, false); rad.set(v.u); tm.set(0); return; }
              const tau = Math.min(c.t, (T - AP) * f), s = c.u0 * tau - a * tau * tau / 2;
              put(s, true); rad.set((c.u0 - a * tau) * 3.6); tm.set(tau);
              if (p >= 1) {
                const x1 = rd.at(c.s); bar.visible = true; bar.scale.x = Math.max(0.001, x1 - X0); bar.position.x = (X0 + x1) / 2;
                tag.setText(`s = ${fmt(c.s, 1)} m`); tag.position.set(Math.max(X0 + 0.06, (X0 + x1) / 2), 0.01, Z + 0.17); tag.userData.hidden = false;
              }
            }
          };
        }
      };
    })()
  });
})();
