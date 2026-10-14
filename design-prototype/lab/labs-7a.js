// Empira — 7-sinf Fizika labs, I bob (§1, §3, §4) and III bob «Tekis aylanma harakat» (§15–§17). Same shape as labs-7b.js.
// The book has no formal laboratoriya ishi in these chapters, so each lab is a classroom experiment built on the book's
// own pictures and numbers: 3-rasm (platform, 10 + 1 = 11 m/s), 10-rasm (lake: path vs displacement), 15-rasm
// (υ⃗₁ + υ⃗₂ = υ⃗₃), 46–48-rasm (disk, radian), 49-rasm (20 turns in 8 s → T = 0,4 s), 50–51-rasm (velocity ⟂ radius).
// Equipment: kit.js + kit-7.js + kit-7a.js.
(function () {
  const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',').replace('-', '−');
  const uniq = (runs, key) => new Set(runs.map((r) => String(r[key]))).size;
  const has = (runs, key, val) => runs.some((r) => String(r[key]) === String(val));
  const where = (runs, obj) => runs.filter((r) => Object.entries(obj).every(([k, v]) => String(r[k]) === String(v)));
  const opt = (vals, unit, d = 0) => vals.map((v) => ({ v, label: `${fmt(v, d)} ${unit}`.trim() }));
  const dec = (v) => String(v).replace('.', ',');                     // 0.075 → "0,075"
  const trim = (v, d) => fmt(v, d).replace(/(,\d*?)0+$/, '$1').replace(/,$/, '');   // 0,180 → "0,18"; 0,100 → "0,1"
  const G = 9.8, TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* Ball on a string driven by spinAxle (§16, §17): rest pose → spin-up → circle at the hub height */
  function stringBall(k, ax, b, th, H, PHI0) {
    const rb = b.r;
    const rest = (R) => {
      const Ls = R - ax.eye;                                           // string length (knot → ball centre)
      const yh = H - Ls;
      if (yh >= rb + 0.016) return { rho: ax.eye, y: yh };                // hangs down beside the axle
      return { rho: ax.eye + Math.sqrt(Math.max(0, Ls * Ls - (H - rb) ** 2)), y: rb };   // lies on the table, string slanted
    };
    const put = (rho, y, phi) => {
      const c = k.V(ax.axis.x + rho * Math.cos(phi), y, ax.axis.z - rho * Math.sin(phi));
      b.put(c.clone().setY(y - rb)); ax.spin(phi);
      th.set(ax.knot(phi), c);
      return c;
    };
    return {
      rest,
      put,
      // spin-up over q: 0 → 1 (one turn, speeding up), ends on the circle at PHI0
      spinUp(R, q) { const r0 = rest(R), e = q * q * (3 - 2 * q); return put(r0.rho + (R - r0.rho) * e, r0.y + (H - r0.y) * e, PHI0 + TAU * q * q - TAU); }
    };
  }

  window.EMPIRA_LABS = window.EMPIRA_LABS || {};
  Object.assign(window.EMPIRA_LABS, {

    /* ================= §1 Harakatning nisbiyligi: aravacha (platforma) ustida yurgan o‘yinchoq (3-rasm) ================= */
    'harakat-nisbiyligi': {
      controls: [
        { key: 'ua', label: 'Aravacha tezligi (stolga nisbatan), υₐ', type: 'choice', value: 0, options: [{ v: 0, label: '0 (tinch)' }, { v: 0.2, label: '0,2 m/s' }, { v: 0.3, label: '0,3 m/s' }] },
        { key: 'up', label: 'O‘yinchoq tezligi (aravachaga nisbatan), υ′', type: 'choice', value: 0.1, options: opt([0.1, 0.2], 'm/s', 1) },
        { key: 'dir', label: 'O‘yinchoq yo‘nalishi', type: 'choice', value: 'bir', options: [{ v: 'bir', label: 'Aravacha bilan bir tomonga' }, { v: 'teskari', label: 'Teskari tomonga' }] }
      ],
      // signs: the cart's direction of motion (to the right) is positive
      compute: (v) => { const t = 2, u1 = (v.dir === 'bir' ? 1 : -1) * v.up, u = v.ua + u1; return { t, u1, u, s1: u1 * t * 100, s: u * t * 100 }; },
      readouts: (v, c, done) => [['υₐ', `${v.ua ? fmt(v.ua, 1) : '0'} m/s`], ['t', `${fmt(c.t, 1)} s`],
        ['s′ (aravachaga nisbatan)', done ? `${fmt(c.s1, 0)} sm` : '—'], ['s (stolga nisbatan)', done ? `${fmt(c.s, 0)} sm` : '—'],
        ['υ′ = s′ / t', done ? `${fmt(c.u1, 1)} m/s` : '—', true], ['υ = s / t', done ? `${fmt(c.u, 1)} m/s` : '—', true]],
      run: ['Aravacha va o‘yinchoqni yurgizish', 'Harakatlanmoqda…', 'Qayta yurgizish'],
      duration: () => 2.9,
      steps: [
        { text: 'Aravacha tinch tursin (υₐ = 0): o‘yinchoqning 2 s dagi ko‘chishini ikkala lineyka bo‘yicha o‘lchang', done: (s) => has(s.runs, 'ua', 0) },
        { text: 'Aravachani 0,3 m/s bilan yurgizing, o‘yinchoq u bilan bir tomonga yursin', done: (s) => where(s.runs, { ua: 0.3, dir: 'bir' }).length > 0 },
        { text: 'Harakatlanayotgan aravachada o‘yinchoqni teskari tomonga yurgizib, υ ni solishtiring', done: (s) => s.runs.some((r) => r.dir === 'teskari' && r.ua > 0) }
      ],
      cols: ['υₐ', 'Yo‘nalish', 's′', 's', 'υ′', 'υ'],
      row: (r) => [`${fmt(r.ua, 1)} m/s`, r.dir === 'bir' ? 'bir tomonga' : 'teskari', `${fmt(r.s1, 0)} sm`, `${fmt(r.s, 0)} sm`, `${fmt(r.u1, 1)} m/s`, `${fmt(r.u, 1)} m/s`],
      demo: [{ ua: 0, up: 0.1, dir: 'bir' }, { ua: 0.3, up: 0.1, dir: 'bir' }, { ua: 0.3, up: 0.1, dir: 'teskari' }],
      camera: { target: [0.02, 0.09, -0.02], dir: [0.05, 0.42, 1], fitW: 1.36, fitH: 0.5, min: 1.2 },
      build(k) {
        const { V, THREE } = k;
        const tr = k.track(-0.62, 0, 1.24);
        const c = k.cart({ len: 0.5, name: 'Aravacha (platforma)' });
        c.label.position.set(0.15, 0.012, 0.07);
        // the platform's own 44 sm ruler (the cart's reference frame), a small motor at its rear end
        const rul = k.add(c.group, new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.034), new THREE.MeshStandardMaterial({ map: k.tickTexture(0.44, { bg: '#FFF8E6', h: 96 }), roughness: 0.85 })), 0, 0.0484, 0);
        rul.rotation.x = -Math.PI / 2;
        k.add(c.group, k.box(0.024, 0.02, 0.04, 0x2E7D5B, { roughness: 0.5 }), -0.236, 0.058, 0);
        const toy = k.walkerToy({ name: 'O‘yinchoq' });
        const tm = k.timer(0.6, -0.2, { name: 'Sekundomer', digits: 1 });
        // start flags: green one stands on the table by the track (table frame), amber one is fixed on the platform (cart frame)
        const flagT = k.add(tr.group, new THREE.Group(), 0, 0, -0.06);
        k.add(flagT, k.cyl(0.0018, 0.1, k.C.ink700, {}, 6), 0, 0.05, 0);
        k.add(flagT, k.box(0.03, 0.018, 0.002, 0x2E7D5B), 0.015, 0.09, 0);
        k.add(flagT, k.box(0.03, 0.01, 0.03, k.C.ink700), 0, 0.005, 0);
        const flagC = k.add(c.group, new THREE.Group(), 0, 0.048, -0.024);
        k.add(flagC, k.cyl(0.0015, 0.05, k.C.ink700, {}, 6), 0, 0.025, 0);
        k.add(flagC, k.box(0.022, 0.013, 0.002, k.C.amber), 0.011, 0.043, 0);
        const aC = k.arrow(k.C.blue), aT = k.arrow(0x2E7D5B);
        const lC = k.label('', V(0, 0, 0), { color: '#3B4CFF' }), lT = k.label('', V(0, 0, 0), { color: '#2E7D5B' });
        const S0 = 0.27, T0 = 0.4;
        let u0 = -0.2, sg = 1;
        const place = (v, t) => {
          c.put(tr, S0 + v.ua * t);
          const u = u0 + sg * v.up * t;
          toy.place(k.world(c.group, V(u, 0.0486, 0.004)), sg).walk(t * v.up / 0.007);
          return u;
        };
        const hideAll = () => { aC.hide(); aT.hide(); lC.userData.hidden = true; lT.userData.hidden = true; toy.label.userData.hidden = false; };
        return {
          update(v) { sg = v.dir === 'bir' ? 1 : -1; u0 = -0.2 * sg; flagC.position.x = u0; flagT.position.x = S0 + u0; place(v, 0); tm.set(0); hideAll(); },
          progress(p, v, cc) {
            const t = clamp(p * 2.9 - T0, 0, 2);
            const u = place(v, t); tm.set(t);
            if (p < 1) { hideAll(); return; }
            const pc0 = k.world(c.group, V(u0, 0.105, 0)), pc1 = k.world(c.group, V(u, 0.105, 0));
            aC.set(pc0, pc1.clone().sub(pc0)); lC.setText(`s′ = ${fmt(cc.s1, 0)} sm`); lC.position.copy(pc0.clone().lerp(pc1, 0.5)).add(V(0, 0.04, 0)); toy.label.userData.hidden = true; lC.userData.hidden = false;
            const x0 = tr.at(S0 + u0).x, x1 = x0 + cc.s / 100;
            const pt0 = V(x0, 0.03, 0.075), pt1 = V(x1, 0.03, 0.075);
            if (Math.abs(cc.s) > 0.5) aT.set(pt0, pt1.clone().sub(pt0)); else aT.hide();
            lT.setText(`s = ${fmt(cc.s, 0)} sm`); lT.position.copy(pt0.clone().lerp(pt1, 0.5)).add(V(0, -0.005, 0.07)); lT.userData.hidden = false;
          }
        };
      }
    },

    /* ================= §3 Yo‘l va ko‘chish: flomasterli mashina katakli vatmanda (10-rasm, ko‘l) ================= */
    'yol-va-kochish': (() => {
      const A = [-0.2, 0.1], B = [0.2, 0.1], CC = [0.2, -0.2], O = [0, 0.1], RR = 0.2;
      const NAMES = { togri: 'To‘g‘ri chiziq A → B', siniq: 'Siniq chiziq A → B → C', yarim: 'Ko‘l bo‘yi (yarim aylana)' };
      const SHORT = { togri: 'to‘g‘ri', siniq: 'siniq', yarim: 'yarim aylana' };
      // each route: length L (m), point at distance u: [x, z, heading]
      const ROUTES = {
        togri: { L: 0.4, at: (u) => [A[0] + u, A[1], 0] },
        siniq: { L: 0.7, at: (u) => (u <= 0.4 ? [A[0] + u, A[1], 0] : [B[0], B[1] - (u - 0.4), Math.PI / 2]) },
        yarim: { L: Math.PI * RR, at: (u) => { const th = Math.PI - u / RR; return [O[0] + RR * Math.cos(th), O[1] - RR * Math.sin(th), th - Math.PI / 2]; } }
      };
      const SPEED = 0.2, T0 = 0.3;
      return {
        controls: [{ key: 'route', label: 'Marshrut', type: 'choice', value: 'togri', options: Object.entries(NAMES).map(([v, label]) => ({ v, label })) }],
        compute: (v) => {
          const r = ROUTES[v.route], e = r.at(r.L), dx = e[0] - A[0], dz = e[1] - A[1];
          const s = r.L * 100, d = Math.hypot(dx, dz) * 100;
          return { s, d, diff: s - d, eq: Math.abs(s - d) < 0.05, t: r.L / SPEED };
        },
        readouts: (v, c, done) => [['Marshrut', SHORT[v.route]], ['s (yo‘l)', done ? `${fmt(c.s, 1)} sm` : '—', true], ['Ko‘chish moduli', done ? `${fmt(c.d, 1)} sm` : '—', true],
          ['Yo‘l − ko‘chish', done ? `${fmt(c.diff, 1)} sm` : '—']],
        run: ['Mashinani yurgizish', 'Mashina iz qoldirmoqda…', 'Qayta yurgizish'],
        duration: (v, c) => T0 + c.t + 0.4,
        steps: [
          { text: 'Mashinani A dan B ga to‘g‘ri chiziq bo‘ylab yurgizib, yo‘l va ko‘chishni o‘lchang', done: (s) => has(s.runs, 'route', 'togri') },
          { text: 'Siniq chiziq bo‘ylab yurgizing: 40 sm sharqqa, so‘ng 30 sm shimolga', done: (s) => has(s.runs, 'route', 'siniq') },
          { text: 'Ko‘l bo‘yidagi yarim aylana so‘qmoqdan A dan B ga yurgizib, yo‘l va ko‘chishni solishtiring', done: (s) => has(s.runs, 'route', 'yarim') }
        ],
        cols: ['Marshrut', 'Yo‘l s', 'Ko‘chish', 'Farq', 'Tengmi?'],
        row: (r) => [NAMES[r.route], `${fmt(r.s, 1)} sm`, `${fmt(r.d, 1)} sm`, `${fmt(r.diff, 1)} sm`, r.eq ? 'ha, teng' : 'yo‘q, yo‘l katta'],
        demo: [{ route: 'togri' }, { route: 'siniq' }, { route: 'yarim' }],
        camera: { target: [0.0, 0.0, 0.03], dir: [0, 1.3, 1], fitW: 0.95, fitH: 0.78, min: 0.95 },
        build(k) {
          const { V } = k;
          const MZ = -0.02;
          const mat = k.gridMat(0, MZ, 0.8, 0.6, { px: 960, lake: { x: 0, z: 0.085, r: 0.15 }, points: [['A', A[0], A[1]], ['B', B[0], B[1]], ['C', CC[0], CC[1]]], labelAt: V(0.32, 0.03, 0.33) });
          const car = k.toyCar({ name: 'Mashina' });
          const rl = k.ruler(0.5, { name: 'Chizg‘ich' });
          rl.group.children.forEach((o) => { if (o.isSprite) o.position.set(0.12, 0.03, 0.05); });
          const disp = k.arrow(k.C.blue);
          const sLab = k.label('', V(0, 0, 0), { color: '#E5484D' }), dLab = k.label('', V(0, 0, 0), { color: '#3B4CFF' });
          const W = (x, z, y = 0.003) => V(x, y, z + MZ);
          let lastU = 0;
          const putCar = (r, u) => { const [x, z, h] = r.at(u); car.place(x, z + MZ, h, u); };
          const SL = { togri: [0, -0.04], siniq: [0.3, -0.06], yarim: [0, -0.17] };
          const DL = { togri: [0, 0.11], siniq: [-0.06, 0.04], yarim: [0, 0.11] };
          return {
            update(v) {
              mat.clear(); lastU = 0; putCar(ROUTES[v.route], 0);
              rl.place(-0.25, 0.0025, 0.33 + MZ + 0.03, 0); disp.hide();
              sLab.userData.hidden = true; dLab.userData.hidden = true;
            },
            progress(p, v, c) {
              const r = ROUTES[v.route];
              const u = clamp((p * (T0 + c.t + 0.4) - T0) * SPEED, 0, r.L);
              if (u > lastU) {
                const pts = []; for (let q = lastU; q < u; q += 0.004) pts.push(r.at(q)); pts.push(r.at(u));
                mat.line(pts.map(([x, z]) => [x, z]), { color: '#E5484D', width: 0.005 });
                lastU = u;
              }
              putCar(r, u);
              if (p < 1) return;
              const e = r.at(r.L), a = W(A[0], A[1], 0.014), b = W(e[0], e[1], 0.014);
              // the ruler is laid from A to the end point; the displacement arrow lies along its edge
              rl.place(A[0], 0.0025, A[1] + MZ, Math.atan2(-(e[1] - A[1]), e[0] - A[0]));
              disp.set(a, b.clone().sub(a));
              sLab.setText(`s = ${fmt(c.s, 1)} sm`); sLab.position.copy(W(SL[v.route][0], SL[v.route][1], 0.04)); sLab.userData.hidden = false;
              const m = a.clone().lerp(b, 0.5);
              dLab.setText(`ko‘chish = ${fmt(c.d, 1)} sm`); dLab.position.set(m.x + DL[v.route][0], 0.04, m.z + DL[v.route][1]); dLab.userData.hidden = false;
            }
          };
        }
      };
    })(),

    /* ================= §4 Daryodan suzib o‘tish: tezliklarni qo‘shish (15-rasm, υ⃗₁ + υ⃗₂ = υ⃗₃) ================= */
    'daryodan-suzib-otish': {
      controls: [
        { key: 'u1', label: 'Qayiqning suvga nisbatan tezligi, υ₁', type: 'choice', value: 0.1, options: opt([0.1, 0.2], 'm/s', 1) },
        { key: 'u2', label: 'Oqim tezligi, υ₂', type: 'choice', value: 0, options: [{ v: 0, label: '0 (oqimsiz)' }, { v: 0.075, label: '0,075 m/s' }, { v: 0.15, label: '0,15 m/s' }] }
      ],
      compute: (v) => { const AB = 0.4, t = AB / v.u1, BC = v.u2 * t, AC = Math.hypot(AB, BC); return { t, BC: BC * 100, AC: AC * 100, u3: AC / t, sum: v.u1 + v.u2 }; },
      readouts: (v, c, done) => [['υ₁', `${dec(v.u1)} m/s`], ['υ₂', `${dec(v.u2)} m/s`], ['t', done ? `${fmt(c.t, 1)} s` : '—'], ['BC', done ? `${fmt(c.BC, 0)} sm` : '—'], ['AC', done ? `${fmt(c.AC, 0)} sm` : '—'],
        ['υ₃ = AC / t', done ? `${trim(c.u3, 3)} m/s` : '—', true], ['υ₁ + υ₂', done ? `${trim(c.sum, 3)} m/s` : '—', true]],
      run: ['Qayiqni yurgizish', 'Qayiq suzmoqda…', 'Qayta yurgizish'],
      duration: (v, c) => 0.3 + c.t + 0.4,
      steps: [
        { text: 'Oqim yo‘q (υ₂ = 0): qayiq A dan B ga necha sekundda o‘tishini o‘lchang', done: (s) => has(s.runs, 'u2', 0) },
        { text: 'Oqimni 0,075 m/s ga qo‘yib, surilish BC va ko‘chish AC ni o‘lchang', done: (s) => has(s.runs, 'u2', 0.075) },
        { text: 'υ₂ = 0,15 m/s da o‘lchab, υ₃ ni υ₁ + υ₂ yig‘indi bilan solishtiring', done: (s) => has(s.runs, 'u2', 0.15) }
      ],
      cols: ['υ₁', 'υ₂', 't', 'BC', 'AC', 'υ₃', 'υ₁ + υ₂'],
      row: (r) => [`${dec(r.u1)} m/s`, `${dec(r.u2)} m/s`, `${fmt(r.t, 1)} s`, `${fmt(r.BC, 0)} sm`, `${fmt(r.AC, 0)} sm`, `${trim(r.u3, 3)} m/s`, `${trim(r.sum, 3)} m/s`],
      demo: [{ u1: 0.1, u2: 0 }, { u1: 0.1, u2: 0.075 }, { u1: 0.1, u2: 0.15 }],
      camera: { target: [0.06, 0.02, 0.03], dir: [0, 1.0, 1], fitW: 1.42, fitH: 0.78, min: 1.2 },
      build(k) {
        const { V, THREE } = k;
        const ch = k.waterChannel(0, 0, { len: 1.0, width: 0.48 });
        const boat = k.toyBoat({ name: 'Qayiq' });
        const tm = k.timer(0.64, -0.14, { name: 'Sekundomer', digits: 1 });
        const rl = k.ruler(1.0, { name: 'Chizg‘ich (1 m)' }); rl.place(-0.5, 0, 0.345);
        const A = V(-0.3, ch.surf, 0.2), Bp = V(-0.3, ch.surf, -0.2);
        const lA = k.label('A', V(A.x - 0.05, ch.surf + 0.02, A.z), { parent: ch.group }), lB = k.label('B', V(Bp.x - 0.05, ch.surf + 0.02, Bp.z), { parent: ch.group });
        const lCc = k.label('C', V(0, 0, 0), { parent: ch.group });
        // marks of the boat's path (children of the channel)
        const dm = new THREE.MeshBasicMaterial({ color: k.C.amber });
        const marks = [...Array(48)].map(() => { const m = k.add(ch.group, new THREE.Mesh(new THREE.CircleGeometry(0.0035, 10), dm), 0, ch.surf + 0.0012, 0); m.rotation.x = -Math.PI / 2; m.visible = false; return m; });
        const a1 = k.arrow(k.C.blue), a2 = k.arrow(0x2E7D5B), a3 = k.arrow(k.C.red);
        const l1 = k.label('υ₁', V(0, 0, 0), { color: '#3B4CFF' }), l2 = k.label('υ₂', V(0, 0, 0), { color: '#2E7D5B' }), l3 = k.label('υ₃', V(0, 0, 0), { color: '#E5484D' });
        const dAB = k.arrow(k.C.blue), dBC = k.arrow(0x2E7D5B), dAC = k.arrow(k.C.red);
        const tAB = k.label('', V(0, 0, 0), { color: '#3B4CFF' }), tBC = k.label('', V(0, 0, 0), { color: '#2E7D5B' }), tAC = k.label('', V(0, 0, 0), { color: '#E5484D' });
        const VL = [l1, l2, l3], DL = [tAB, tBC, tAC];
        const SC = 1.5, T0 = 0.3;
        let running = false, prop = 0;
        const boatAt = (v, t) => V(A.x + v.u2 * t, ch.surf, A.z - v.u1 * t);
        const hide = (list) => list.forEach((l) => { l.userData.hidden = true; });
        return {
          update(v) {
            ch.setFlow(v.u2); boat.place(A.clone().setY(ch.surf)); tm.set(0); running = false;
            marks.forEach((m) => { m.visible = false; }); [a1, a2, a3, dAB, dBC, dAC].forEach((a) => a.hide()); hide(VL); hide(DL); lCc.userData.hidden = true;
          },
          progress(p, v, c) {
            const t = clamp(p * (0.3 + c.t + 0.4) - T0, 0, c.t);
            const P = boatAt(v, t); boat.place(P);
            running = p < 1 && t > 0 && t < c.t;
            const nm = Math.floor((t / c.t) * (marks.length - 1));
            marks.forEach((m, i) => { m.visible = i <= nm && t > 0; if (m.visible) { const q = (i / (marks.length - 1)) * c.t; m.position.x = A.x + v.u2 * q; m.position.z = A.z - v.u1 * q; } });
            tm.set(t);
            if (p < 1) {
              const o = P.clone().setY(ch.surf + 0.035);
              const v1 = V(0, 0, -v.u1 * SC), v2 = V(v.u2 * SC, 0, 0), v3 = v1.clone().add(v2);
              a1.set(o, v1); l1.position.copy(o).add(v1).add(V(-0.03, 0.01, 0)); l1.userData.hidden = false;
              if (v.u2 > 0) {
                a2.set(o, v2); a3.set(o, v3);
                l2.position.copy(o).add(v2).add(V(0.03, 0.01, 0.0)); l3.position.copy(o).add(v3).add(V(0.035, 0.012, 0)); l2.userData.hidden = false; l3.userData.hidden = false;
              } else { a2.hide(); a3.hide(); l2.userData.hidden = true; l3.userData.hidden = true; }
              return;
            }
            [a1, a2, a3].forEach((a) => a.hide()); hide(VL);
            const y = ch.surf + 0.012, a = A.clone().setY(y), b = Bp.clone().setY(y), cpt = boatAt(v, c.t).setY(y);
            dAB.set(a, b.clone().sub(a));
            tAB.setText(c.BC > 0.5 ? `AB = 40 sm` : `AB = AC = 40 sm`); tAB.position.set(a.x - 0.11, y + 0.02, 0); tAB.userData.hidden = false;
            if (c.BC > 0.5) {
              dBC.set(b, cpt.clone().sub(b)); dAC.set(a, cpt.clone().sub(a));
              tBC.setText(`BC = ${fmt(c.BC, 0)} sm`); tBC.position.copy(b.clone().lerp(cpt, 0.5)).add(V(0, 0.02, -0.075)); tBC.userData.hidden = false;
              tAC.setText(`AC = ${fmt(c.AC, 0)} sm`); tAC.position.copy(a.clone().lerp(cpt, 0.5)).add(V(0.1, 0.02, 0.03)); tAC.userData.hidden = false;
              lCc.position.set(cpt.x + 0.045, ch.surf + 0.02, cpt.z); lCc.userData.hidden = false;
            } else { dBC.hide(); dAC.hide(); tBC.userData.hidden = true; tAC.userData.hidden = true; lCc.userData.hidden = true; }
          },
          animate(dt) { ch.animate(dt); if (running) { prop += dt * 40; boat.spin(prop); } }
        };
      }
    },

    /* ================= §15 Tekis aylanma harakat: aylanayotgan diskdagi nuqtalar (46–48-rasm) ================= */
    'aylanuvchi-disk': {
      controls: [
        { key: 'R', label: 'Belgining o‘qdan uzoqligi, R', type: 'choice', value: 5, options: opt([5, 10, 15], 'sm') },
        { key: 'dt', label: 'Kuzatish vaqti, Δt', type: 'choice', value: 2, options: opt([1, 2, 3], 's') },
        { key: 'w', label: 'Disk aylanishi', type: 'choice', value: 'sekin', options: [{ v: 'sekin', label: 'Sekin' }, { v: 'tez', label: 'Tez' }] }
      ],
      compute: (v) => { const om = v.w === 'sekin' ? 1 : 2, phi = om * v.dt, arc = phi * v.R; return { om, phi, deg: phi * 180 / Math.PI, arc, u: arc / 100 / v.dt }; },
      readouts: (v, c, done) => [['R', `${v.R} sm`], ['Δt', `${v.dt} s`], ['Δφ', done ? `${fmt(c.deg, 0)}° ≈ ${fmt(c.phi, 0)} rad` : '—'], ['Δs (yoy)', done ? `${fmt(c.arc, 0)} sm` : '—'],
        ['υ = Δs / Δt', done ? `${fmt(c.u, 2)} m/s` : '—', true], ['ω = Δφ / Δt', done ? `${fmt(c.om, 0)} rad/s` : '—', true]],
      run: ['Diskni aylantirish', 'Disk aylanmoqda…', 'Qayta aylantirish'],
      duration: (v) => 0.3 + v.dt + 0.4,
      steps: [
        { text: 'R = 5 sm li belgining burilish burchagi Δφ va yoy uzunligi Δs ni o‘lchang', done: (s) => has(s.runs, 'R', 5) },
        { text: 'Δt va disk tezligini o‘zgartirmay, R = 10 va 15 sm li belgilar uchun o‘lchang', done: (s) => [1, 2, 3].some((dt) => ['sekin', 'tez'].some((w) => uniq(where(s.runs, { dt, w }), 'R') >= 3)) },
        { text: 'Diskni tez aylantirib, υ va ω qanday o‘zgarishini toping', done: (s) => has(s.runs, 'w', 'tez') }
      ],
      cols: ['R', 'Δt', 'Δφ', 'Δs (yoy)', 'υ', 'ω'],
      row: (r) => [`${r.R} sm`, `${r.dt} s`, `${fmt(r.deg, 0)}°`, `${fmt(r.arc, 0)} sm`, `${fmt(r.u, 2)} m/s`, `${fmt(r.om, 0)} rad/s`],
      demo: [{ R: 5, dt: 2, w: 'sekin' }, { R: 10, dt: 2, w: 'sekin' }, { R: 15, dt: 2, w: 'sekin' }, { R: 15, dt: 2, w: 'tez' }],
      camera: { target: [0.06, 0.05, 0.0], dir: [0, 1.25, 1], fitW: 0.92, fitH: 0.64, min: 0.95 },
      build(k) {
        const { V } = k;
        const X = -0.06;
        const d = k.rotatingDisk(X, 0, { r: 0.2 });
        const pr = k.bigProtractor(X, 0, { r0: 0.205, r1: 0.265, y: d.top - 0.003 });
        const tm = k.timer(0.37, -0.12, { name: 'Sekundomer', digits: 1 });
        const lPhi = k.label('', V(0, 0, 0), { color: '#B7791F' }), lArc = k.label('', V(0, 0, 0), { color: '#0B1026' });
        const T0 = 0.3;
        const onDisk = (rho, a, y) => V(X + rho * Math.cos(a), y, -rho * Math.sin(a));
        return {
          update(v) { d.set(0).sweep(0, v.R / 100); tm.set(0); lPhi.userData.hidden = true; lArc.userData.hidden = true; },
          progress(p, v, c) {
            const t = clamp(p * (0.3 + v.dt + 0.4) - T0, 0, v.dt), phi = c.om * t;
            d.set(phi).sweep(phi, v.R / 100); tm.set(t);
            if (p < 1) return;
            lPhi.setText(`Δφ = ${fmt(c.deg, 0)}°`); lPhi.position.copy(onDisk(0.31, c.phi / 2, pr.y + 0.02)); lPhi.userData.hidden = false;
            lArc.setText(`Δs (yoy) = ${fmt(c.arc, 0)} sm`); lArc.position.copy(onDisk(v.R / 100, c.phi / 2, d.top + 0.03)); lArc.userData.hidden = false;
          }
        };
      }
    },

    /* ================= §16 Aylanish davri va chastotasi: ipga bog‘langan sharcha (49-rasm: 20 marta 8 s da) ================= */
    'aylanish-davri': (() => {
      const H = 0.56, SPIN = 0.6, PHI0 = -2.5;                               // the ball starts (and counts) front-left of the axle
      const NU = { sekin: 1, tez: 2.5 };
      const showDur = (dt) => Math.min(4, dt / 2);                           // time-lapse: the timer shows real time
      return {
        controls: [
          { key: 'R', label: 'Ip uzunligi (aylana radiusi), R', type: 'choice', value: 0.5, options: opt([0.25, 0.5], 'm', 2) },
          { key: 'sp', label: 'Aylantirish', type: 'choice', value: 'sekin', options: [{ v: 'sekin', label: 'Sekin' }, { v: 'tez', label: 'Tez' }] },
          { key: 'n', label: 'Sanaladigan aylanishlar soni, n', type: 'choice', value: 10, options: [{ v: 10, label: '10' }, { v: 20, label: '20' }] }
        ],
        compute: (v) => { const nu = NU[v.sp], dt = v.n / nu, T = dt / v.n; return { dt, T, nu: v.n / dt, om: TAU / T, u: TAU * v.R / T }; },
        readouts: (v, c, done) => [['R', `${fmt(v.R, 2)} m`], ['n', `${v.n}`], ['Δt', done ? `${fmt(c.dt, 1)} s` : '—'], ['T = Δt / n', done ? `${fmt(c.T, 2)} s` : '—', true],
          ['ν = n / Δt', done ? `${fmt(c.nu, 1)} 1/s` : '—'], ['ω = 2π / T', done ? `${fmt(c.om, 2)} rad/s` : '—'], ['υ = ω·R', done ? `${fmt(c.u, 2)} m/s` : '—', true]],
        run: ['Aylantirib, vaqtni o‘lchash', 'Sharcha aylanmoqda (tezlashtirilgan)…', 'Qayta o‘lchash'],
        duration: (v, c) => SPIN + showDur(c.dt) + 0.3,
        steps: [
          { text: 'R = 0,5 m, sekin aylantirishda 10 marta aylanish vaqtini o‘lchang', done: (s) => where(s.runs, { R: 0.5, sp: 'sekin', n: 10 }).length > 0 },
          { text: 'Tez aylantirib, 20 marta aylanish vaqtini o‘lchang: T va ν ni toping', done: (s) => where(s.runs, { sp: 'tez', n: 20 }).length > 0 },
          { text: 'Ipni 0,25 m ga qisqartiring (tez): ω va υ qanday o‘zgarishini tekshiring', done: (s) => where(s.runs, { R: 0.25, sp: 'tez' }).length > 0 }
        ],
        cols: ['R', 'n', 'Δt', 'T', 'ν', 'ω', 'υ'],
        row: (r) => [`${fmt(r.R, 2)} m`, `${r.n}`, `${fmt(r.dt, 1)} s`, `${fmt(r.T, 2)} s`, `${fmt(r.nu, 1)} 1/s`, `${fmt(r.om, 2)} rad/s`, `${fmt(r.u, 2)} m/s`],
        demo: [{ R: 0.5, sp: 'sekin', n: 10 }, { R: 0.5, sp: 'tez', n: 20 }, { R: 0.25, sp: 'tez', n: 20 }],
        camera: { target: [0.03, 0.45, 0.0], dir: [0, 0.78, 1], fitW: 1.25, fitH: 1.04, min: 1.25 },
        build(k) {
          const { V, THREE } = k;
          const ax = k.spinAxle(0, 0, { h: H, name: 'Aylantirgich' });
          const b = k.ball(0.014, {});
          const th = k.thread(0x3A4166, { owner: ax });
          const tm = k.timer(-0.38, -0.3, { name: 'Sekundomer', digits: 1 });
          const rl = k.ruler(0.5, { name: 'Chizg‘ich' }); rl.place(0.0, 0, 0.12);
          const sb = stringBall(k, ax, b, th, H, PHI0);
          // circle of the path and fading ghosts behind the ball: shown only while it spins (not equipment)
          const fx = k.group();
          const rings = [0.25, 0.5].map((R) => { const m = k.add(fx, new THREE.Mesh(new THREE.TorusGeometry(R, 0.0014, 6, 120), new THREE.MeshBasicMaterial({ color: k.C.amber, transparent: true, opacity: 0.7 })), ax.axis.x, H, ax.axis.z); m.rotation.x = Math.PI / 2; return m; });
          const ghosts = [0.55, 0.35, 0.2, 0.1].map((o) => k.add(fx, new THREE.Mesh(new THREE.SphereGeometry(0.013, 12, 8), new THREE.MeshBasicMaterial({ color: 0xA9B0C4, transparent: true, opacity: o, depthWrite: false }))));
          const uA = k.arrow(k.C.blue), uL = k.label('', V(0, 0, 0), { color: '#3B4CFF' });
          const fxShow = (on, R) => { rings.forEach((r, i) => { r.visible = on && [0.25, 0.5][i] === R; }); ghosts.forEach((g) => { g.visible = on; }); };
          return {
            update(v) { const r0 = sb.rest(v.R); sb.put(r0.rho, r0.y, PHI0); ax.count(0); tm.set(0); fxShow(false); uA.hide(); uL.userData.hidden = true; },
            progress(p, v, c) {
              const T = p * (SPIN + showDur(c.dt) + 0.3);
              if (T < SPIN) { sb.spinUp(v.R, T / SPIN); ax.count(0); tm.set(0); fxShow(false); uA.hide(); uL.userData.hidden = true; return; }
              const tr = clamp((T - SPIN) * c.dt / showDur(c.dt), 0, c.dt);     // real time
              const phi = PHI0 + TAU * c.nu * tr;
              sb.put(v.R, H, phi); tm.set(tr); ax.count(Math.min(v.n, Math.floor(c.nu * tr + 1e-6)));
              const spinning = p < 1 && tr < c.dt;
              fxShow(spinning, v.R);
              if (spinning) ghosts.forEach((g, i) => { const a = phi - (i + 1) * 0.16; g.position.set(ax.axis.x + v.R * Math.cos(a), H, ax.axis.z - v.R * Math.sin(a)); });
              if (p < 1) { uA.hide(); uL.userData.hidden = true; return; }
              const pb = V(ax.axis.x + v.R * Math.cos(PHI0), H, ax.axis.z - v.R * Math.sin(PHI0)), dir = V(-Math.sin(PHI0), 0, -Math.cos(PHI0));
              uA.set(pb.clone().addScaledVector(dir, 0.016), dir.clone().multiplyScalar(0.22)); uL.setText(`υ = ${fmt(c.u, 2)} m/s`); uL.position.copy(pb).addScaledVector(dir, 0.2).add(V(0.08, 0.04, 0)); uL.userData.hidden = false;
            }
          };
        }
      };
    })(),

    /* ================= §17 Markazga intilma tezlanish: aylanayotgan sharcha va qo‘yib yuborilgan ip (50–51-rasm) ================= */
    'markazga-intilma-tezlanish': (() => {
      const H = 0.18, SPIN = 0.5, PHI0 = -Math.PI / 2, N = 10, LAPSE = 3, FLY = 0.9;
      const WALL = 0.64;
      const flight = (v) => {
        const rb = 0.014, u = TAU * v.nu * v.R, tf = Math.sqrt(2 * (H - rb) / G);
        const xMax = WALL - 0.016 - rb;                                        // the ball stops at the wall's felt pad
        return { u, tf, xMax, xl: Math.min(u * tf, xMax), hit: u * tf > xMax };
      };
      return {
        controls: [
          { key: 'R', label: 'Aylana radiusi, R', type: 'choice', value: 0.5, options: opt([0.25, 0.5], 'm', 2) },
          { key: 'nu', label: 'Aylanish chastotasi, ν', type: 'choice', value: 1, options: [{ v: 1, label: '1 1/s' }, { v: 2, label: '2 1/s' }] },
          { key: 'rel', label: '10 marta aylangach, ip', type: 'choice', value: 'yoq', options: [{ v: 'yoq', label: 'Ushlab turiladi' }, { v: 'ha', label: 'Qo‘yib yuboriladi' }] }
        ],
        compute: (v) => { const dt = N / v.nu, u = TAU * (N / dt) * v.R; return { dt, u, a: u * u / v.R }; },
        readouts: (v, c, done) => {
          const out = [['R', `${fmt(v.R, 2)} m`], ['ν', `${v.nu} 1/s`], ['Δt (10 marta)', done ? `${fmt(c.dt, 1)} s` : '—'],
            ['υ = 2πνR', done ? `${fmt(c.u, 2)} m/s` : '—', true], ['a = υ² / R', done ? `${fmt(c.a, 1)} m/s²` : '—', true]];
          if (v.rel === 'ha') out.push(['Uchish yo‘nalishi va radius', done ? '90°' : '—']);
          return out;
        },
        run: ['Aylantirish', 'Sharcha aylanmoqda (tezlashtirilgan)…', 'Qayta aylantirish'],
        duration: (v, c) => SPIN + c.dt / LAPSE + (v.rel === 'ha' ? FLY + 0.3 : 0.3),
        steps: [
          { text: 'R = 0,5 m, ν = 1 1/s: 10 marta aylanish vaqtini o‘lchab, υ va a ni toping', done: (s) => where(s.runs, { R: 0.5, nu: 1 }).length > 0 },
          { text: 'R = 0,25 m, ν = 2 1/s: υ o‘sha, a necha marta o‘zgardi?', done: (s) => where(s.runs, { R: 0.25, nu: 2 }).length > 0 },
          { text: 'R = 0,25 m, ν = 1 1/s da ipni qo‘yib yuboring: sharcha qaysi tomonga uchadi?', done: (s) => where(s.runs, { R: 0.25, nu: 1, rel: 'ha' }).length > 0 }
        ],
        cols: ['R', 'ν', 'Δt', 'υ', 'a', 'Uchish'],
        row: (r) => [`${fmt(r.R, 2)} m`, `${r.nu} 1/s`, `${fmt(r.dt, 1)} s`, `${fmt(r.u, 2)} m/s`, `${fmt(r.a, 1)} m/s²`, r.rel === 'ha' ? 'urinma bo‘ylab (90°)' : '—'],
        demo: [{ R: 0.5, nu: 1, rel: 'yoq' }, { R: 0.25, nu: 2, rel: 'yoq' }, { R: 0.25, nu: 1, rel: 'ha' }],
        camera: { target: [0.07, 0.03, 0.05], dir: [0, 1.45, 1], fitW: 1.4, fitH: 1.12, min: 1.4 },
        build(k) {
          const { V, THREE } = k;
          const MX = 0.02, MZ = 0.01;
          const mat = k.gridMat(MX, MZ, 1.2, 1.12, { px: 840, name: 'Katakli vatman', labelAt: V(-0.44, 0.03, 0.5) });
          const ax = k.spinAxle(0, 0, { h: H, name: 'Aylantirgich' });
          const b = k.ball(0.014, {});
          const th = k.thread(0x3A4166, { owner: ax });
          const wall = k.catchWall(WALL, 0.17, { len: 0.76, h: 0.17 });
          const tm = k.timer(0.42, -0.45, { name: 'Sekundomer', digits: 1 });
          const sb = stringBall(k, ax, b, th, H, PHI0);
          const fx = k.group();
          const ghosts = [0.55, 0.35, 0.2, 0.1].map((o) => k.add(fx, new THREE.Mesh(new THREE.SphereGeometry(0.013, 12, 8), new THREE.MeshBasicMaterial({ color: 0xA9B0C4, transparent: true, opacity: o, depthWrite: false }))));
          const corner = k.add(fx, new THREE.Group());
          k.add(corner, k.box(0.03, 0.002, 0.002, k.C.ink700), 0.015, 0, -0.03);
          k.add(corner, k.box(0.002, 0.002, 0.03, k.C.ink700), 0.03, 0, -0.015);
          const uA = k.arrow(k.C.blue), aA = k.arrow(k.C.red), rA = k.arrow(k.C.ink700);
          const uL = k.label('', V(0, 0, 0), { color: '#3B4CFF' }), aL = k.label('', V(0, 0, 0), { color: '#E5484D' }), gL = k.label('90°', V(0, 0, 0), { color: '#0B1026' });
          const LL = [uL, aL, gL];
          const lx = (wx) => wx - MX, lz = (wz) => wz - MZ;
          const hideFx = () => { ghosts.forEach((g) => { g.visible = false; }); corner.visible = false; [uA, aA, rA].forEach((a) => a.hide()); LL.forEach((l) => { l.userData.hidden = true; }); };
          let drawnTo = 0;
          return {
            update(v) {
              mat.clear().circle(lx(ax.axis.x), lz(ax.axis.z), v.R, { color: '#A9B0C4', width: 0.003, dash: [0.012, 0.01] });
              const r0 = sb.rest(v.R); sb.put(r0.rho, r0.y, PHI0); ax.count(0); tm.set(0); hideFx(); drawnTo = 0;
            },
            progress(p, v, c) {
              const f = flight(v), rel = v.rel === 'ha';
              const T = p * (SPIN + c.dt / LAPSE + (rel ? FLY + 0.3 : 0.3));
              hideFx();
              if (T < SPIN) { sb.spinUp(v.R, T / SPIN); ax.count(0); tm.set(0); return; }
              const tr = clamp((T - SPIN) * LAPSE, 0, c.dt);
              const nu = N / c.dt;
              tm.set(tr); ax.count(Math.min(N, Math.floor(nu * tr + 1e-6)));
              const P0 = V(ax.axis.x, H, ax.axis.z + v.R);                      // release point, in front of the axle
              const T1 = SPIN + c.dt / LAPSE;
              if (T < T1 || !rel) {
                const phi = PHI0 + TAU * nu * tr;
                sb.put(v.R, H, phi);
                if (p < 1 && tr < c.dt) { ghosts.forEach((g, i) => { const a = phi - (i + 1) * 0.16; g.visible = true; g.position.set(ax.axis.x + v.R * Math.cos(a), H, ax.axis.z - v.R * Math.sin(a)); }); return; }
                if (p < 1) return;
                // held: velocity along the tangent, acceleration towards the centre
                uA.set(P0.clone().add(V(0.016, 0, 0)), V(0.05 * c.u, 0, 0)); uL.setText(`υ = ${fmt(c.u, 2)} m/s`); uL.position.copy(P0).add(V(0.05 * c.u + 0.09, 0.03, 0)); uL.userData.hidden = false;
                aA.set(P0.clone().add(V(0, 0, -0.016)), V(0, 0, -Math.min(v.R - 0.03, 0.005 * c.a))); aL.setText(`a = ${fmt(c.a, 1)} m/s²`); aL.position.copy(P0).add(V(-0.12, 0.05, -0.06)); aL.userData.hidden = false;
                return;
              }
              // released: the hub keeps turning, the ball flies straight on along the tangent (slow motion), the string goes with it
              const tf = Math.min(f.tf, (T - T1) / FLY * f.tf);
              const x = Math.min(f.u * tf, f.xMax), y = Math.max(b.r, H - G * tf * tf / 2);
              ax.spin(PHI0 + TAU * nu * (c.dt + tf));
              b.put(V(P0.x + x, y - b.r, P0.z)); th.hide();
              const want = x;
              if (want > drawnTo + 0.002) { mat.line([[lx(P0.x), lz(P0.z)], [lx(P0.x + want), lz(P0.z)]], { color: '#E5484D', width: 0.004, dash: [0.014, 0.01] }); drawnTo = want; }
              if (tf >= f.tf - 1e-6 && drawnTo < 1e3) { mat.dot(lx(P0.x + x), lz(P0.z), { color: '#FFB21E', r: 0.012 }); drawnTo = 1e3; }
              // radius to the release point and the velocity at that moment: they make 90°
              const F = 0.022, O = V(ax.axis.x, F, ax.axis.z + 0.095), Pf = P0.clone().setY(F);
              rA.set(O, Pf.clone().sub(O)); uA.set(Pf, V(0.16, 0, 0)); uL.setText('υ'); uL.position.copy(Pf).add(V(0.17, 0.03, -0.05)); uL.userData.hidden = false;
              corner.visible = true; corner.position.copy(Pf);
              gL.position.copy(Pf).add(V(0.065, 0.02, -0.065)); gL.userData.hidden = false;
            }
          };
        }
      };
    })()
  });
})();
