// Empira — 7-sinf Fizika, V bob «Tashqi kuchlar ta’sirida jismlarning harakati» (§26–§35): equipment that kit.js and
// kit-7.js do not have. Same style and units (metres, table top y = 0, low-poly, navy instruments, amber = "it works").
// Each factory builds its meshes in its own top-level group(s), so Build Mode can hide a tool until the student picks it.
// Big things (tower, Earth, lift, road) are table-top MODELS and say so on their labels.
(function () {
  const ICON = {
    torsion: '<path d="M12 3v7"/><path d="M5 10h14"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><path d="M4 21h16"/>',
    leadBalls: '<circle cx="7" cy="14" r="4.5"/><circle cx="17" cy="9" r="4.5"/><path d="M3 21h18"/>',
    laser: '<rect x="2" y="10" width="7" height="4" rx="1"/><path d="M9 12l6-5"/><rect x="14" y="4" width="8" height="5" rx="0.5"/><circle cx="17" cy="6.5" r="0.8"/>',
    forceSensor: '<rect x="3" y="15" width="18" height="5" rx="1"/><path d="M5 15v-2h14v2"/><rect x="8" y="5" width="8" height="6" rx="1"/><path d="M12 11v2"/>',
    magnetHold: '<path d="M12 2v5"/><rect x="8" y="7" width="8" height="6" rx="1"/><path d="M8 10h8"/><path d="M12 16v2"/><path d="M12 20v1"/>',
    kettle: '<rect x="3" y="13" width="5" height="7" rx="1"/><rect x="10" y="10" width="5" height="10" rx="1"/><rect x="17" y="7" width="5" height="13" rx="1"/>',
    gramLoad: '<path d="M12 3v4"/><circle cx="12" cy="8" r="1.4"/><rect x="8" y="10" width="8" height="10" rx="1"/>',
    platform: '<path d="M5 6h14"/><path d="M12 6v2"/><path d="M8 9l8 2-8 2 8 2-8 2"/><path d="M5 20h14"/>',
    lift: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M12 3v4"/><rect x="8" y="9" width="8" height="9"/>',
    floorScale: '<rect x="4" y="12" width="16" height="6" rx="2"/><rect x="9" y="14" width="6" height="2"/>',
    person: '<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7"/><path d="M8 11h8"/><path d="M12 15l-3 6"/><path d="M12 15l3 6"/>',
    tower: '<path d="M8 21V4h5v17"/><path d="M13 7h5"/><circle cx="19" cy="9" r="1.2"/><path d="M4 21h16"/>',
    strobe: '<circle cx="12" cy="9" r="5"/><path d="M12 14v5"/><path d="M8 21h8"/><path d="M12 6v3l2 1"/>',
    earth: '<circle cx="12" cy="11" r="7"/><path d="M5 11h14"/><path d="M12 4c3 3 3 11 0 14"/><path d="M9 21h6"/>',
    satellite: '<rect x="10" y="10" width="4" height="4"/><path d="M3 9l5 3-5 3z"/><path d="M21 9l-5 3 5 3z"/>',
    woodRuler: '<rect x="2" y="9" width="20" height="6" rx="1"/><path d="M6 9v3"/><path d="M10 9v2"/><path d="M14 9v3"/><path d="M18 9v2"/>',
    dyn: '<rect x="8" y="9" width="12" height="6" rx="1.5"/><path d="M2 12h6"/><rect x="11" y="10.5" width="5" height="3"/>',
    car: '<path d="M3 15v-3l3-4h9l4 4h2v3z"/><circle cx="7" cy="16.5" r="2"/><circle cx="17" cy="16.5" r="2"/>',
    road: '<path d="M2 9h20"/><path d="M2 17h20"/><path d="M4 13h3"/><path d="M10 13h3"/><path d="M16 13h3"/>',
    radar: '<rect x="5" y="4" width="14" height="8" rx="1"/><path d="M12 12v8"/><path d="M8 21h8"/><path d="M8 8h4"/>'
  };
  window.EMPIRA_KIT_TYPES = Object.assign(window.EMPIRA_KIT_TYPES || {}, {
    cavendishBalance: { name: 'Buralma tarozi', icon: ICON.torsion, domain: 'k' },
    leadBalls: { name: 'Katta qo‘rg‘oshin sharlar', icon: ICON.leadBalls, domain: 'k' },
    laserScale: { name: 'Lazer va millimetrli shkala', icon: ICON.laser, domain: 'k' },
    forceSensor: { name: 'Kuch datchigi (0–300 N)', icon: ICON.forceSensor, domain: 'k' },
    releaseMagnet: { name: 'Elektromagnitli tutgich', icon: ICON.magnetHold, domain: 'k' },
    kettleLoads: { name: 'Yuklar (1, 8 va 25 kg)', icon: ICON.kettle, domain: 'k' },
    gramLoad: { name: 'Yuk (50–200 g)', icon: ICON.gramLoad, domain: 'k' },
    springPlatform: { name: 'Prujinali tayanch', icon: ICON.platform, domain: 'k' },
    liftCabin: { name: 'Lift kabinasi modeli', icon: ICON.lift, domain: 'k' },
    floorScale: { name: 'Elektron tarozi (N)', icon: ICON.floorScale, domain: 'k' },
    liftMannequin: { name: 'Bola manekeni (45 kg)', icon: ICON.person, domain: 'k' },
    towerModel: { name: 'Minora modeli', icon: ICON.tower, domain: 'k' },
    strobeLamp: { name: 'Stroboskop', icon: ICON.strobe, domain: 'k' },
    earthModel: { name: 'Yer modeli (globus)', icon: ICON.earth, domain: 'k' },
    satelliteModel: { name: 'Sun’iy yo‘ldosh modeli', icon: ICON.satellite, domain: 'k' },
    woodRuler: { name: 'Yog‘och chizg‘ich', icon: ICON.woodRuler, domain: 'k' },
    digitalDynamometer: { name: 'Elektron dinamometr', icon: ICON.dyn, domain: 'k' },
    testCar: { name: 'Avtomobil modeli', icon: ICON.car, domain: 'k' },
    roadStrip: { name: 'Sinov yo‘lagi', icon: ICON.road, domain: 'k' },
    speedRadar: { name: 'Tezlik o‘lchagich (radar)', icon: ICON.radar, domain: 'k' }
  });

  const base = window.EMPIRA_KIT;
  window.EMPIRA_KIT = function (THREE, scene) {
    const k = base(THREE, scene);
    const { C, V, mat, box, cyl, sphere, add, group, label, faceTexture, world } = k;
    const WOOD = k.WOOD || 0xD9B98C, LEAD = 0x8E94A3, IRON = 0x2C303B, BRASS = 0xB89A4A;
    const glass = (o = 0.2) => new THREE.MeshStandardMaterial({ color: 0xE8EEF8, roughness: 0.08, transparent: true, opacity: o, depthWrite: false, side: THREE.DoubleSide });
    const UP = V(0, 1, 0);
    const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',').replace('-', '−');
    // a thin cylinder from a to b (local points of its parent)
    const segment = (m, a, b) => { const d = a.distanceTo(b); m.visible = d > 1e-5; m.position.copy(a).lerp(b, 0.5); m.scale.set(1, Math.max(d, 1e-5), 1); m.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize()); };
    // a small digital screen (canvas) with green digits
    function screen(w, h, cw = 320, ch = 112) {
      const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55 }));
      let last = null;
      return {
        mesh,
        show(txt) {
          if (txt === last) return; last = txt;
          const c = cv.getContext('2d'); c.fillStyle = '#0B1026'; c.fillRect(0, 0, cw, ch);
          let fs = Math.round(ch * 0.62);
          do { c.font = `700 ${fs}px ui-monospace, Menlo, monospace`; fs -= 3; } while (c.measureText(txt).width > cw * 0.92 && fs > 12);
          c.fillStyle = '#7CF0B4'; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText(txt, cw / 2, ch * 0.54); tex.needsUpdate = true;
        }
      };
    }
    // a coil from y = 0 up to y = len (local), rebuilt when the length changes
    function coil(parent, m, { r = 0.012, turns = 10, wire = 0.0013 } = {}) {
      let mesh = null, L = -1;
      return (len) => {
        if (Math.abs(len - L) < 1e-5) return; L = len;
        if (mesh) { parent.remove(mesh); mesh.geometry.dispose(); }
        const pts = [], N = turns * 24;
        for (let i = 0; i <= N; i++) { const u = i / N, a = u * turns * Math.PI * 2; pts.push(V(Math.cos(a) * r, u * len, Math.sin(a) * r)); }
        mesh = add(parent, new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, wire, 6, false), m)); mesh.castShadow = true;
      };
    }

    /* ---------- §26 Buralma tarozi (Kavendish): a light beam along z with two 1 kg lead balls, hung on a thin fibre from a
       bracket at the back; a small mirror on the fibre; glass case against air draughts ---------- */
    function cavendishBalance(x, z, { L = 0.2, Y = 0.2 } = {}) {
      const g = group(x, 0, z), H = Y + 0.22, zb = -L - 0.11;
      add(g, box(0.12, 0.014, 0.1, C.navy, { roughness: 0.5 }), 0, 0.007, zb);
      add(g, cyl(0.007, H, C.steel, { metalness: 0.55, roughness: 0.3 }), 0, H / 2, zb);
      add(g, box(0.014, 0.014, -zb + 0.01, C.ink700), 0, H, zb / 2);
      add(g, cyl(0.013, 0.03, C.steel, { metalness: 0.6, roughness: 0.3 }), 0, H - 0.022, 0);        // torsion head
      add(g, cyl(0.0007, H - 0.037 - Y, 0x3A4166, {}, 6), 0, (H - 0.037 + Y) / 2, 0);                // thin fibre
      const cg = add(g, new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.17, 2 * L + 0.1), glass(0.14)), 0, Y + 0.035, 0);
      cg.renderOrder = 2;
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cg.geometry), new THREE.LineBasicMaterial({ color: 0x9AA1BC, transparent: true, opacity: 0.7 }));
      edges.position.copy(cg.position); g.add(edges);
      [-1, 1].forEach((s) => add(g, box(0.03, Y - 0.05, 0.03, C.ink700), 0, (Y - 0.05) / 2, s * (L + 0.03)));   // case supports
      const pivot = add(g, new THREE.Group(), 0, Y, 0);
      add(pivot, box(0.004, 0.004, 2 * L, 0xF2F4F8), 0, 0, 0);
      [-1, 1].forEach((s) => add(pivot, sphere(0.028, LEAD, { metalness: 0.4, roughness: 0.45 }), 0, 0, s * L));
      add(pivot, box(0.004, 0.09, 0.004, 0xF2F4F8), 0, 0.045, 0);
      add(pivot, box(0.024, 0.024, 0.003, 0xE8ECF5, { metalness: 0.95, roughness: 0.05 }), 0, 0.09, -0.003);   // mirror
      label('Buralma tarozi', V(0, H + 0.05, zb), { parent: g, minor: true });
      label('m = 1 kg', V(-0.06, Y + 0.06, L), { parent: g, minor: true });
      return { group: g, pivot, L, Y, mirror: V(x, Y + 0.09, z), ball: (i) => world(pivot, V(0, 0, i ? L : -L)), set(th) { pivot.rotation.y = th; } };
    }

    /* ---------- §26 Big lead balls on a swivel holder: one beside the back small ball (+x), one beside the front one (−x) ---------- */
    function leadBalls(x, z, { L = 0.2, Y = 0.2 } = {}) {
      const g = group(x, 0, z);
      const bar = add(g, box(1, 0.01, 0.034, C.ink700), 0, 0.005, 0);
      add(g, cyl(0.03, 0.014, C.navy), 0, 0.007, 0);
      const balls = [0, 1].map(() => {
        const b = add(g, new THREE.Group());
        const s = add(b, sphere(1, LEAD, { metalness: 0.4, roughness: 0.45 }));
        const col = add(b, cyl(0.012, 1, C.steel, { metalness: 0.55, roughness: 0.3 }));
        const cup = add(b, cyl(0.04, 0.012, C.ink700));
        return { b, s, col, cup };
      });
      const lab = label('Qo‘rg‘oshin shar', V(0, 0, 0), { parent: g, minor: true });
      return {
        group: g,
        set(M, r) {
          const R = Math.cbrt(3 * M / (4 * Math.PI * 11340));
          [[r, -L], [-r, L]].forEach(([bx, bz], i) => {
            const o = balls[i]; o.b.position.set(bx, 0, bz);
            o.s.scale.setScalar(R); o.s.position.y = Y;
            const ph = Y - R + 0.01; o.col.scale.y = ph; o.col.position.y = ph / 2; o.cup.position.y = ph - 0.004;
          });
          bar.scale.x = 2 * Math.hypot(L, r) + 0.06; bar.rotation.y = Math.atan2(L, r);
          lab.setText(`Qo‘rg‘oshin shar, M = ${M} kg`); lab.position.set(r + 0.04, Y + R + 0.045, -L);
        }
      };
    }

    /* ---------- §26 Laser pointer + millimetre scale (magnified view); the beam goes to the mirror and back ---------- */
    function laserScale(x, z, { y = 0.56, w = 0.4, mm = 30 } = {}) {
      const g = group(x, 0, z);
      [-1, 1].forEach((s) => add(g, box(0.012, y + 0.04, 0.012, C.ink700), s * (w / 2 + 0.005), (y + 0.04) / 2, -0.012));
      add(g, box(w + 0.03, 0.11, 0.012, C.ink700), 0, y, -0.014);
      const tex = faceTexture((ctx, W, H) => {
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#3A4166'; ctx.fillStyle = '#3A4166'; ctx.lineWidth = 3; ctx.textAlign = 'center';
        ctx.font = `700 ${Math.round(H * 0.3)}px Sora, system-ui, sans-serif`;
        const x0 = W * 0.06, x1 = W * 0.94;
        for (let i = 0; i <= mm; i++) {
          const px = x0 + (x1 - x0) * i / mm, big = i % 5 === 0;
          ctx.beginPath(); ctx.moveTo(px, H * 0.5); ctx.lineTo(px, H * (big ? 0.12 : 0.3)); ctx.stroke();
          if (big) ctx.fillText(String(i), px, H * 0.86);
        }
        ctx.textAlign = 'right'; ctx.font = `700 ${Math.round(H * 0.24)}px Sora, system-ui, sans-serif`; ctx.fillText('mm', W - 8, H * 0.62);
      }, 1024, 220);
      add(g, new THREE.Mesh(new THREE.PlaneGeometry(w, 0.086), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })), 0, y, -0.0075);
      const X0 = -w / 2 + w * 0.06, PER = (w * 0.88) / mm;
      const lp = V(-w / 2 - 0.07, y - 0.03, 0.03);
      const laser = add(g, new THREE.Group(), lp.x, lp.y, lp.z);
      add(laser, box(0.05, 0.012, 0.03, C.navy), 0, -0.012, 0);
      const tube = add(laser, cyl(0.009, 0.06, C.ink, { roughness: 0.4 }, 16)); tube.rotation.x = Math.PI / 2;
      const red = new THREE.MeshStandardMaterial({ color: C.red, emissive: C.red, emissiveIntensity: 1.4, transparent: true, opacity: 0.85 });
      const beams = [0, 1].map(() => add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.0011, 0.0011, 1, 6), red)));
      const spot = add(g, new THREE.Mesh(new THREE.CircleGeometry(0.007, 20), new THREE.MeshStandardMaterial({ color: C.red, emissive: C.red, emissiveIntensity: 2 })), X0, y + 0.012, -0.006);
      label('Lazer va mm shkala', V(-w / 2 - 0.07, y + 0.07, 0.03), { parent: g, minor: true });
      const local = (p) => p.clone().sub(g.position);
      const api = {
        group: g,
        spotAt: (xmm) => V(x + X0 + xmm * PER, y + 0.012, z),
        set(xmm, mirrorWorld) {
          spot.position.x = X0 + xmm * PER;
          const m = local(mirrorWorld), tip = V(lp.x, lp.y, lp.z);
          tube.parent.lookAt(mirrorWorld);
          segment(beams[0], tip, m); segment(beams[1], m, spot.position.clone().add(V(0, 0, 0.002)));
          return api;
        }
      };
      return api;
    }

    /* ---------- §27 Electronic force sensor as a platform (kuch datchigi, 0–300 N): a load put on it is weighed in newtons ---------- */
    function forceSensor(x, z) {
      const g = group(x, 0, z);
      add(g, box(0.2, 0.026, 0.18, C.navy, { roughness: 0.45 }), 0, 0.013, 0);
      add(g, box(0.18, 0.006, 0.16, 0xC9CED9, { metalness: 0.5, roughness: 0.3 }), 0, 0.029, 0);
      const pod = add(g, new THREE.Group(), 0, 0.026, 0.1); pod.rotation.x = -0.5;
      add(pod, box(0.12, 0.05, 0.02, C.navy, { roughness: 0.45 }), 0, 0.025, 0);
      const sc = screen(0.1, 0.034); add(pod, sc.mesh, 0, 0.026, 0.0102);
      label('Kuch datchigi', V(-0.15, 0.06, 0), { parent: g, minor: true });
      const api = {
        group: g,
        top: () => V(x, 0.032, z),
        set(F) { sc.show(`${fmt(F, 1)} N`); return api; }
      };
      return api.set(0);
    }

    /* ---------- §27 Electromagnetic holder hanging from a stand arm: holds an iron load by its top, lets it go when switched off ---------- */
    function releaseMagnet(top) {
      const g = group(top.x, top.y, top.z);
      const rod = add(g, cyl(0.004, 1, C.steel, { metalness: 0.6 }), 0, 0, 0);
      const head = add(g, new THREE.Group());
      add(head, cyl(0.03, 0.04, C.copper, { metalness: 0.55, roughness: 0.35 }), 0, 0.02, 0);
      add(head, cyl(0.033, 0.008, C.ink700), 0, 0.004, 0);
      add(head, cyl(0.033, 0.008, C.ink700), 0, 0.036, 0);
      const lm = new THREE.MeshStandardMaterial({ color: 0x7A5A10, emissive: C.amber, emissiveIntensity: 0 });
      add(head, new THREE.Mesh(new THREE.SphereGeometry(0.005, 10, 8), lm), 0.034, 0.03, 0.0);
      label('Elektromagnitli tutgich', V(-0.16, -0.0, 0), { parent: head, minor: true });
      const api = {
        group: g,
        // the magnet's bottom face at height y (world)
        set(y) { const d = top.y - y - 0.04; head.position.y = -d - 0.04; rod.scale.y = Math.max(0.001, d); rod.position.y = -d / 2; return api; },
        on(o) { lm.emissiveIntensity = o ? 1.6 : 0; return api; }
      };
      return api;
    }

    /* ---------- §27 Iron loads 1, 8 and 25 kg with top eyes; each can rest on the table or hang by its eye ---------- */
    function kettleLoads(slots) {
      const g = group();
      const DIM = [[0.03, 0.045], [0.056, 0.105], [0.085, 0.141]];     // radius, height (cast iron)
      const MASS = [1, 8, 25];
      const items = DIM.map(([r, h], i) => {
        const it = add(g, new THREE.Group());
        add(it, cyl(0.004, 0.012, C.steel, { metalness: 0.6 }), 0, -0.012, 0);
        const eye = add(it, new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.0024, 8, 18), mat(C.steel, { metalness: 0.6 })), 0, -0.006, 0); eye.rotation.y = Math.PI / 2;
        add(it, cyl(r, h, IRON, { metalness: 0.5, roughness: 0.45 }, 28), 0, -0.018 - h / 2, 0);
        add(it, cyl(r * 0.7, 0.004, 0xF2F4F8, { roughness: 0.6 }, 28), 0, -0.016, 0);
        label(`${MASS[i]} kg`, V(r + 0.035, -0.018 - h / 2, 0), { parent: it, minor: true });
        return { it, h: h + 0.018, r };
      });
      const api = {
        group: g, items,
        height: (i) => items[i].h,                // eye top → bottom
        hang(i, p) { items[i].it.position.copy(p); return api; },
        rest(i) { const s = slots[i]; items[i].it.position.set(s[0], items[i].h, s[1]); return api; },
        restAll() { items.forEach((_, i) => api.rest(i)); return api; }
      };
      return api.restAll();
    }

    /* ---------- §28 One slotted brass load with a hook (50–200 g): size follows the mass ---------- */
    function gramLoad() {
      const g = group();
      add(g, cyl(0.0012, 0.012, C.steel, {}, 6), 0, -0.006, 0);
      const hk = add(g, new THREE.Mesh(new THREE.TorusGeometry(0.004, 0.0011, 6, 14), mat(C.steel)), 0, -0.001, 0); hk.rotation.x = Math.PI / 2;
      const body = add(g, cyl(0.016, 1, BRASS, { metalness: 0.7, roughness: 0.3 }), 0, 0, 0);
      const lab = label('100 g', V(0.045, -0.02, 0), { parent: g, minor: true });
      let h = 0.02;
      const api = {
        group: g,
        get h() { return h + 0.012; },
        set(mg) { h = 0.0167 * mg / 100; body.scale.y = h; body.position.y = -0.012 - h / 2; lab.setText(`${mg} g`); lab.position.y = -0.012 - h / 2; return api; },
        hangFrom(p) { g.position.copy(p); return api; },          // hook top at p
        standOn(p) { g.position.set(p.x, p.y + h + 0.012, p.z); return api; }   // bottom on p
      };
      return api.set(100);
    }

    /* ---------- §28 Spring platform (prujinali tayanch): a pan on a vertical spring, with a cm scale and pointer ---------- */
    function springPlatform(x, z, { l0 = 0.12 } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.1, 0.016, 0.08, C.navy, { roughness: 0.5 }), 0, 0.008, 0);
      add(g, box(0.012, l0 + 0.05, 0.012, C.ink700), -0.045, (l0 + 0.05) / 2 + 0.016, -0.025);
      const sc = add(g, new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.016), new THREE.MeshStandardMaterial({ map: k.tickTexture(0.1, { bg: '#FFF8E6' }), roughness: 0.85 })), -0.045, 0.016 + l0 - 0.05, -0.018);
      sc.rotation.z = Math.PI / 2;
      const sm = mat(C.steel, { metalness: 0.7, roughness: 0.3 });
      const sp = add(g, new THREE.Group(), 0, 0.016, 0);
      const setCoil = coil(sp, sm, { r: 0.014, turns: 9, wire: 0.0016 });
      const pan = add(g, new THREE.Group(), 0, 0.016 + l0, 0);
      add(pan, cyl(0.004, 0.012, C.steel), 0, -0.006, 0);
      add(pan, cyl(0.032, 0.006, 0xC9CED9, { metalness: 0.5, roughness: 0.3 }), 0, 0.003, 0);
      add(pan, box(0.04, 0.002, 0.004, C.red), -0.025, 0.0, -0.016);
      label('Prujinali tayanch', V(0.1, 0.0, 0.04), { parent: g, minor: true });
      const api = {
        group: g, l0,
        top: () => V(x, 0.016 + pan.position.y - 0.016 + 0.006, z),
        set(dx) { const len = l0 - dx; setCoil(len - 0.012); pan.position.y = 0.016 + len; return api; }
      };
      return api.set(0);
    }

    /* ---------- §29 Lift shaft model with a glass cabin on a cable (the cable can be cut) ---------- */
    function liftCabin(x, z, { H = 0.98, w = 0.3, d = 0.24, ch = 0.33 } = {}) {
      const g = group(x, 0, z);
      add(g, box(w + 0.1, 0.02, d + 0.1, C.navy, { roughness: 0.5 }), 0, 0.01, 0);
      [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => add(g, box(0.014, H, 0.014, C.steel, { metalness: 0.5, roughness: 0.35 }), sx * (w / 2 + 0.025), H / 2, sz * (d / 2 + 0.025))));
      add(g, box(w + 0.1, 0.03, d + 0.1, C.ink700), 0, H + 0.015, 0);
      const drum = add(g, cyl(0.03, 0.07, C.steel, { metalness: 0.6, roughness: 0.3 }), 0, H - 0.035, 0); drum.rotation.x = Math.PI / 2;
      const cab = add(g, new THREE.Group(), 0, 0.2, 0);
      add(cab, box(w, 0.014, d, C.ink700), 0, 0.007, 0);
      add(cab, box(w, 0.014, d, C.ink700), 0, ch, 0);
      [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => add(cab, box(0.012, ch, 0.012, C.navy), sx * (w / 2 - 0.006), ch / 2, sz * (d / 2 - 0.006))));
      [[w, ch, 0.003, 0, -d / 2], [0.003, ch, d, -w / 2, 0], [0.003, ch, d, w / 2, 0]].forEach(([a, b, c, px, pz]) => { const m = add(cab, new THREE.Mesh(new THREE.BoxGeometry(a, b, c), glass(0.16)), px, ch / 2, pz); m.renderOrder = 2; });
      add(cab, cyl(0.008, 0.016, C.steel), 0, ch + 0.015, 0);
      const cable = add(g, cyl(0.0018, 1, C.ink, {}, 6));
      label('Lift modeli', V(w / 2 + 0.1, H + 0.03, 0), { parent: g, minor: true });
      const api = {
        group: g, cab, ch,
        floor: () => V(x, cab.position.y + 0.014, z),
        set(y, cut = 0) {
          cab.position.y = y;
          const top = H - 0.065, bot = cut ? top - 0.08 : y + ch + 0.023;
          cable.scale.y = top - bot; cable.position.y = (top + bot) / 2; cable.rotation.z = cut ? 0.12 : 0;
          drum.rotation.y = -y * 30;
          return api;
        }
      };
      return api.set(0.2);
    }

    /* ---------- §29 Floor scale that shows newtons (the reading pill is its display) ---------- */
    function floorScale() {
      const g = group();
      add(g, box(0.11, 0.016, 0.085, 0xF2F4F8, { roughness: 0.5 }), 0, 0.008, 0);
      add(g, box(0.1, 0.002, 0.075, 0xDDE6F5, { roughness: 0.15 }), 0, 0.017, 0);
      const sc = screen(0.04, 0.012); sc.mesh.rotation.x = -Math.PI / 2; add(g, sc.mesh, 0, 0.0185, 0.03);
      const read = label('0 N', V(0.24, 0.04, 0.0), { parent: g, border: '#FFB21E' });
      const api = {
        group: g,
        place(p) { g.position.copy(p); return api; },
        set(N) { const t = `Tarozi: ${fmt(N, 1)} N`; sc.show(fmt(N, 0)); read.setText(t); return api; }
      };
      return api.set(0);
    }

    /* ---------- §29 A boy (mannequin), 45 kg — a low-poly figure standing on its feet at the group origin ---------- */
    function liftMannequin() {
      const g = group();
      const body = add(g, new THREE.Group());
      const skin = 0xE6BE98;
      [-1, 1].forEach((s) => { add(body, box(0.026, 0.105, 0.03, 0x3A4166), s * 0.019, 0.0525, 0); add(body, box(0.03, 0.012, 0.042, C.ink), s * 0.019, 0.006, 0.006); });
      add(body, box(0.075, 0.095, 0.042, C.blue, { roughness: 0.6 }), 0, 0.152, 0);
      [-1, 1].forEach((s) => add(body, box(0.017, 0.09, 0.022, skin), s * 0.048, 0.15, 0));
      add(body, sphere(0.024, skin, { roughness: 0.7 }), 0, 0.224, 0);
      add(body, box(0.05, 0.016, 0.05, 0x2B2118, { roughness: 0.8 }), 0, 0.244, -0.004);
      label('Bola, 45 kg', V(-0.09, 0.2, 0), { parent: g, minor: true });
      const api = { group: g, place(p) { g.position.copy(p); return api; }, lift(dy) { body.position.y = dy; return api; } };
      return api;
    }

    /* ---------- §30 Tower model (1 : 100) with a height scale and a launch carriage holding two balls ---------- */
    function towerModel(x, z, { Hmax = 0.86 } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.16, 0.02, 0.14, C.navy, { roughness: 0.5 }), 0, 0.01, 0);
      add(g, box(0.05, Hmax, 0.05, C.ink700), 0, Hmax / 2 + 0.02, 0);
      const tex = faceTexture((ctx, W, H) => {
        ctx.fillStyle = '#FFF8E6'; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#3A4166'; ctx.fillStyle = '#3A4166'; ctx.lineWidth = 3; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.font = `700 ${Math.round(W * 0.26)}px Sora, system-ui, sans-serif`;
        const mTop = Hmax * 100;
        for (let m = 0; m <= mTop; m += 5) {
          const py = H - (m / mTop) * H, big = m % 10 === 0;
          ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W * (big ? 0.34 : 0.2), py); ctx.stroke();
          if (big && m > 0 && m < mTop - 2) ctx.fillText(`${m}`, W * 0.4, py);
        }
      }, 128, 1024);
      add(g, new THREE.Mesh(new THREE.PlaneGeometry(0.044, Hmax), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 })), 0, Hmax / 2 + 0.02, 0.0256);
      const car = add(g, new THREE.Group(), 0, 0.8, 0);
      add(car, box(0.066, 0.026, 0.066, C.navy, { roughness: 0.45 }), 0, -0.013, 0);
      add(car, box(0.09, 0.01, 0.1, C.ink700), 0.065, -0.005, 0);
      const plunger = add(car, box(0.02, 0.012, 0.014, C.red), 0.06, 0.006, 0.03);
      [-1, 1].forEach((sz) => add(car, box(0.03, 0.004, 0.012, C.steel), 0.118, -0.002, sz * 0.03));
      label('Minora modeli (1 : 100), m', V(-0.13, Hmax + 0.03, 0), { parent: g, minor: true });
      const api = {
        group: g,
        set(hM) { car.position.y = hM / 100; return api; },
        // start points of the dropped ball (behind) and the thrown ball (in front), for a ball radius r
        start: (r, front) => V(x + 0.125, car.position.y + r, z + (front ? 0.03 : -0.03)),
        fire(p) { plunger.position.x = 0.06 + 0.035 * p; return api; }
      };
      return api.set(80);
    }

    /* ---------- §30 Stroboscope lamp: flashes once a second ---------- */
    function strobeLamp(x, z, { h = 0.22 } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.07, 0.012, 0.06, C.navy), 0, 0.006, 0);
      add(g, cyl(0.004, h, C.steel, { metalness: 0.55 }), 0, h / 2, 0);
      const head = add(g, new THREE.Group(), 0, h, 0);
      head.rotation.y = -0.6;
      const hb = add(head, cyl(0.026, 0.04, C.ink700, {}, 20)); hb.rotation.x = Math.PI / 2;
      const lm = new THREE.MeshStandardMaterial({ color: 0xFFF6DA, emissive: 0xFFF6DA, emissiveIntensity: 0.1 });
      const lens = add(head, new THREE.Mesh(new THREE.CircleGeometry(0.022, 24), lm), 0, 0, 0.0205);
      const light = add(head, new THREE.PointLight(0xFFF6DA, 0, 1.2, 2), 0, 0, 0.05);
      label('Stroboskop (1 s)', V(0.12, h + 0.01, 0), { parent: g, minor: true });
      return { group: g, flash(b) { lm.emissiveIntensity = 0.1 + 3 * b; light.intensity = 0.6 * b; lens.visible = true; } };
    }

    /* ---------- §31 Earth model (globe on a stand) with a dashed ring at the chosen orbit height ---------- */
    function earthModel(x, y, z, R = 0.2) {
      const g = group(x, 0, z);
      add(g, cyl(0.1, 0.02, C.navy, { roughness: 0.5 }), 0, 0.01, 0);
      add(g, cyl(0.008, y - R - 0.01, C.steel, { metalness: 0.55 }), 0, (y - R - 0.01) / 2 + 0.02, -0.0);
      add(g, cyl(0.03, 0.02, C.ink700), 0, y - R - 0.005, 0);
      const tex = faceTexture((ctx, W, H) => {
        ctx.fillStyle = '#3F78D8'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#5FA36A';
        [[0.12, 0.35, 0.09, 0.12], [0.2, 0.62, 0.05, 0.12], [0.5, 0.3, 0.1, 0.1], [0.52, 0.58, 0.06, 0.14], [0.72, 0.32, 0.13, 0.1], [0.83, 0.68, 0.05, 0.05], [0.33, 0.45, 0.04, 0.06]]
          .forEach(([cx, cy, rx, ry]) => { ctx.beginPath(); ctx.ellipse(cx * W, cy * H, rx * W, ry * H, 0.3, 0, Math.PI * 2); ctx.fill(); });
        ctx.fillStyle = '#F4F7FB'; ctx.fillRect(0, 0, W, H * 0.07); ctx.fillRect(0, H * 0.93, W, H * 0.07);
      }, 1024, 512);
      const globe = add(g, new THREE.Mesh(new THREE.SphereGeometry(R, 48, 32), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 })), 0, y, 0);
      globe.castShadow = true;
      const ringMat = new THREE.LineDashedMaterial({ color: 0x3A4166, dashSize: 0.012, gapSize: 0.01, transparent: true, opacity: 0.6 });
      const pts = []; for (let i = 0; i <= 128; i++) { const a = i / 128 * Math.PI * 2; pts.push(V(Math.cos(a), Math.sin(a), 0)); }
      const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat); ring.position.set(0, y, 0); g.add(ring);
      label('Yer modeli (r = 6400 km)', V(-R * 0.75, y + R + 0.04, 0.06), { parent: g, minor: true });
      const api = {
        group: g, R, center: V(x, y, z),
        setRing(hKm) { const s = R * (6400 + hKm) / 6400; ring.scale.set(s, s, 1); ring.computeLineDistances(); return api; },
        spin(a) { globe.rotation.y = a; return api; }
      };
      return api.setRing(300);
    }

    /* ---------- §31 Satellite model: small body with two solar panels ---------- */
    function satelliteModel() {
      const g = group();
      const b = add(g, new THREE.Group());
      add(b, box(0.016, 0.016, 0.016, 0xD9B45A, { metalness: 0.6, roughness: 0.35 }));
      [-1, 1].forEach((s) => { add(b, box(0.03, 0.002, 0.014, 0x2F4FB8, { metalness: 0.3, roughness: 0.4 }), s * 0.026, 0, 0); add(b, box(0.008, 0.002, 0.002, C.steel), s * 0.01, 0, 0); });
      add(b, cyl(0.001, 0.014, C.steel, {}, 6), 0, 0.014, 0);
      label('Yo‘ldosh', V(0, 0.04, 0), { parent: g, minor: true });
      const api = { group: g, put(p, ang = 0) { g.position.copy(p); b.rotation.z = ang; return api; } };
      return api;
    }

    /* ---------- §32, §34 Long wooden ruler/board lying on the table (rail-like: at(s), quat()) ---------- */
    function woodRuler(x, z, len, { w = 0.07, h = 0.014, name = 'Yog‘och chizg‘ich' } = {}) {
      const g = group(x, 0, z);
      add(g, box(len, h, w, WOOD, { roughness: 0.85 }), len / 2, h / 2, 0);
      const t1 = add(g, new THREE.Mesh(new THREE.PlaneGeometry(len, 0.016), new THREE.MeshStandardMaterial({ map: k.tickTexture(len, { bg: '#E8CFA6' }), roughness: 0.9 })), len / 2, h + 0.0006, w / 2 - 0.009);
      t1.rotation.x = -Math.PI / 2;
      label(name, V(len * 0.82, 0.045, -w / 2), { parent: g, minor: true });
      return { group: g, len, top: h, at: (s, up = 0) => V(x + s, h + up, z), quat: () => new THREE.Quaternion() };
    }

    /* ---------- §33 Electronic dynamometer (horizontal): hook at the group origin, pulls along +x ---------- */
    function digitalDynamometer() {
      const g = group();
      add(g, cyl(0.0018, 0.03, C.steel, { metalness: 0.6 }, 8), 0.015, 0, 0).rotation.z = Math.PI / 2;
      const hk = add(g, new THREE.Mesh(new THREE.TorusGeometry(0.005, 0.0013, 6, 14, Math.PI * 1.4), mat(C.steel, { metalness: 0.6 })), 0.002, 0, 0); hk.rotation.x = Math.PI / 2;
      add(g, box(0.11, 0.034, 0.042, C.navy, { roughness: 0.45 }), 0.085, 0, 0);
      const sc = screen(0.07, 0.022); sc.mesh.rotation.x = -Math.PI / 2 + 0.5; add(g, sc.mesh, 0.085, 0.0175, 0.004);
      add(g, cyl(0.01, 0.05, C.ink, { roughness: 0.5 }, 16), 0.165, 0, 0).rotation.z = Math.PI / 2;
      label('Elektron dinamometr', V(0.25, 0.035, -0.02), { parent: g, minor: true });
      const api = {
        group: g,
        put(p) { g.position.copy(p); return api; },
        set(F) { sc.show(`${fmt(F, 2)} N`); return api; }
      };
      return api.set(0);
    }

    /* ---------- §35 Model car: body, cabin, wheels, brake lights; origin at the ground under its centre ---------- */
    function testCar({ color = C.blue } = {}) {
      const g = group();
      add(g, box(0.09, 0.022, 0.046, color, { roughness: 0.4, metalness: 0.2 }), 0, 0.021, 0);
      add(g, box(0.05, 0.02, 0.042, 0xDDE6F5, { roughness: 0.15, metalness: 0.2 }), -0.006, 0.042, 0);
      const wheels = [];
      [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => { const w = add(g, new THREE.Group(), sx * 0.029, 0.0105, sz * 0.024); const t = add(w, cyl(0.0105, 0.009, C.ink, { roughness: 0.7 }, 18)); t.rotation.x = Math.PI / 2; add(w, box(0.012, 0.003, 0.0095, C.steel), 0, 0, 0); wheels.push(w); }));
      const bm = new THREE.MeshStandardMaterial({ color: 0x7A1A1C, emissive: C.red, emissiveIntensity: 0 });
      [-1, 1].forEach((s) => add(g, new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.006, 0.01), bm), -0.0455, 0.026, s * 0.015));
      [-1, 1].forEach((s) => add(g, box(0.003, 0.006, 0.01, C.amber, { emissive: C.amber, emissiveIntensity: 0.4 }), 0.0455, 0.026, s * 0.015));
      label('Avtomobil modeli', V(0, 0.085, 0), { parent: g, minor: true });
      const api = {
        group: g, len: 0.09,
        put(px, pz, roll = 0) { g.position.set(px, 0, pz); wheels.forEach((w) => { w.rotation.z = -roll / 0.0105; }); return api; },
        brake(on) { bm.emissiveIntensity = on ? 2.2 : 0; return api; }
      };
      return api;
    }

    /* ---------- §35 Test road (1 : 200): approach zone + test zone with a changeable surface and 10 m marks ---------- */
    const SURF = {
      beton: { color: 0xC9CCD3, rough: 0.95 }, asfalt: { color: 0x3E434F, rough: 0.12 },
      qum: { color: 0xD6E8F5, rough: 0.5 }, muz: { color: 0xDDEFFC, rough: 0.05 }
    };
    function roadStrip(x0, z, len = 1.1, { approach = 0.32, scale = 200 } = {}) {
      const g = group(x0, 0, z), W = 0.12;
      add(g, box(approach + 0.02, 0.006, W, 0x4A505C, { roughness: 0.9 }), -approach / 2, 0.003, 0);
      const sm = mat(SURF.beton.color, { roughness: 0.95 });
      add(g, new THREE.Mesh(new THREE.BoxGeometry(len, 0.006, W), sm), len / 2, 0.003, 0).receiveShadow = true;
      add(g, box(0.006, 0.0012, W, 0xFFFFFF), 0, 0.0066, 0);
      for (let i = 0; i < 6; i++) add(g, box(0.03, 0.0012, 0.004, 0xFFFFFF), -approach + 0.03 + i * 0.05, 0.0066, 0);
      const tex = faceTexture((ctx, Wc, Hc) => {
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, Wc, Hc);
        ctx.strokeStyle = '#3A4166'; ctx.fillStyle = '#3A4166'; ctx.lineWidth = 3; ctx.textAlign = 'center';
        ctx.font = `700 ${Math.round(Hc * 0.5)}px Sora, system-ui, sans-serif`;
        const mTot = len * scale;
        for (let m = 0; m <= mTot + 1e-6; m += 10) {
          const px = 4 + (m / mTot) * (Wc - 8), big = m % 50 === 0;
          ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, Hc * (big ? 0.42 : 0.24)); ctx.stroke();
          if (big && m < mTot - 10) ctx.fillText(m ? `${m} m` : '0', Math.max(px, 30), Hc * 0.86);
        }
      }, 2048, 96);
      const strip = add(g, new THREE.Mesh(new THREE.PlaneGeometry(len, 0.04), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })), len / 2, 0.0008, W / 2 + 0.022);
      strip.rotation.x = -Math.PI / 2;
      const sand = add(g, new THREE.Group());
      for (let i = 0; i < 140; i++) add(sand, box(0.004, 0.0015, 0.004, 0xB08A4E), ((i * 0.61803) % 1) * len, 0.0066, (((i * 0.4142) % 1) - 0.5) * (W - 0.01));
      label('Sinov yo‘lagi (1 : 200)', V(len - 0.12, 0.05, -W / 2), { parent: g, minor: true });
      const api = {
        group: g, scale,
        at: (sM) => x0 + sM / scale,
        setSurface(kind) { const s = SURF[kind]; sm.color.setHex(s.color); sm.roughness = s.rough; sm.metalness = kind === 'muz' || kind === 'asfalt' ? 0.25 : 0.02; sand.visible = kind === 'qum'; return api; }
      };
      return api.setSurface('beton');
    }

    /* ---------- §35 Speed radar on a pole: shows the car speed in km/soat ---------- */
    function speedRadar(x, z, { h = 0.16 } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.06, 0.01, 0.05, C.navy), 0, 0.005, 0);
      add(g, cyl(0.004, h, C.steel, { metalness: 0.55 }), 0, h / 2, 0);
      add(g, box(0.11, 0.045, 0.03, C.navy, { roughness: 0.45 }), 0, h + 0.02, 0);
      const sc = screen(0.096, 0.034); add(g, sc.mesh, 0, h + 0.02, 0.0152);
      label('Tezlik o‘lchagich', V(0, h + 0.075, 0), { parent: g, minor: true });
      const api = { group: g, set(kmh) { sc.show(`${Math.round(kmh)} km/soat`); return api; } };
      return api.set(0);
    }

    return Object.assign(k, {
      cavendishBalance, leadBalls, laserScale, forceSensor, releaseMagnet, kettleLoads, gramLoad, springPlatform,
      liftCabin, floorScale, liftMannequin, towerModel, strobeLamp, earthModel, satelliteModel,
      woodRuler, digitalDynamometer, testCar, roadStrip, speedRadar
    });
  };
})();
