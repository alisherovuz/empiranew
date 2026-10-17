// Empira — 3D equipment for 7-sinf Fizika, IV bob «Harakat qonunlari» (§18–§25). Adds to kit.js + kit-7.js
// (same units and style: metres, table top y = 0, navy instruments, amber = "it works"). Every factory below is one
// piece of equipment for Build Mode: its meshes live in its own top-level group(s), its name label is a child of them.
(function () {
  const ICON = {
    sand: '<path d="M2 17h20"/><path d="M3 17c2-3 4-3 6 0"/><path d="M9 17c2-4 5-4 7 0"/><path d="M16 17c1-2 3-2 5 0"/><path d="M6 20h.5"/><path d="M12 20h.5"/><path d="M17 20h.5"/>',
    plate: '<rect x="3" y="15" width="12" height="5" rx="1"/><path d="M13 15c0-5 3-8 8-10"/><path d="M5 12l8-7" stroke-dasharray="2 2"/>',
    magnetCart: '<rect x="3" y="11" width="15" height="5" rx="1"/><circle cx="7" cy="18.5" r="1.5"/><circle cx="14" cy="18.5" r="1.5"/><path d="M13 11V6h8v5"/><path d="M17 6v5"/>',
    ironCart: '<rect x="6" y="11" width="15" height="5" rx="1"/><circle cx="10" cy="18.5" r="1.5"/><circle cx="17" cy="18.5" r="1.5"/><rect x="3" y="6" width="7" height="5" rx="0.5"/>',
    spin: '<path d="M12 21v-9"/><path d="M3 12h18"/><circle cx="18" cy="12" r="2"/><rect x="8" y="18" width="8" height="3" rx="1"/><path d="M6 7.5a8 3.5 0 0 1 12 0"/><path d="M16.5 5.5l1.5 2-2.3.6"/>',
    mmRuler: '<rect x="8" y="2" width="8" height="20" rx="1"/><path d="M8 5h3"/><path d="M8 8h3"/><path d="M8 11h5"/><path d="M8 14h3"/><path d="M8 17h3"/><path d="M8 20h5"/>',
    paperDyn: '<rect x="7" y="2" width="10" height="17" rx="1"/><path d="M12 4 10 5.5l4 1.5-4 1.5 4 1.5-2 1.5"/><path d="M9.5 13.5h5"/><path d="M12 19v3"/>'
  };
  window.EMPIRA_KIT_TYPES = Object.assign(window.EMPIRA_KIT_TYPES || {}, {
    sandStrip: { name: 'Qum qatlami', icon: ICON.sand, domain: 'k' },
    elasticPlate: { name: 'Elastik plastinka', icon: ICON.plate, domain: 'k' },
    magnetCart: { name: 'Magnitli aravacha', icon: ICON.magnetCart, domain: 'k' },
    ironCart: { name: 'Temirli aravacha', icon: ICON.ironCart, domain: 'k' },
    spinMachine: { name: 'Markazdan qochma mashina', icon: ICON.spin, domain: 'k' },
    millimetreRuler: { name: 'Millimetrli chizg‘ich', icon: ICON.mmRuler, domain: 'k' },
    paperDynamometer: { name: 'Eng oddiy dinamometr', icon: ICON.paperDyn, domain: 'k' }
  });

  const base = window.EMPIRA_KIT;
  window.EMPIRA_KIT = function (THREE, scene) {
    const k = base(THREE, scene);
    const { C, V, mat, box, cyl, sphere, add, group, label, world, faceTexture } = k;
    const SAND = 0xE2C68C, SAND2 = 0xC9A86A, IRON = 0x7D8496;

    /* ---------- Sand on a straight track (61-rasm): thick / thin layer, or none ---------- */
    // rl: the rail, s0: where the layer starts along it, len: its length. set(mode): 'qalin' | 'yupqa' | 'silliq' | 'yoq'
    function sandStrip(rl, s0, len) {
      const g = group(); g.position.copy(rl.at(s0, -rl.top)); g.quaternion.copy(rl.quat());
      const Y = rl.top;
      const bumpy = (h, seed) => {
        const geo = new THREE.PlaneGeometry(len, 0.066, Math.round(len * 120), 6); geo.rotateX(-Math.PI / 2);
        const p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), z = p.getZ(i), edge = Math.min(1, (0.033 - Math.abs(z)) / 0.012);
          const n = Math.sin(x * 97 + seed) * 0.5 + Math.sin(x * 233 + z * 61 + seed * 2) * 0.35 + Math.sin(z * 140 + x * 31) * 0.15;
          p.setY(i, Math.max(0.0004, h * edge + n * h * 0.25 * edge));
        }
        geo.computeVertexNormals();
        const m = new THREE.Mesh(geo, mat(SAND, { roughness: 1 })); m.receiveShadow = true; return m;
      };
      const thick = add(g, bumpy(0.011, 1.3), len / 2, Y, 0);
      const thin = add(g, bumpy(0.0035, 4.1), len / 2, Y, 0);
      // a few darker grains so the layer reads as sand
      const grainM = mat(SAND2, { roughness: 1 });
      const grains = add(g, new THREE.Group(), 0, Y, 0);
      for (let i = 0; i < 70; i++) add(grains, new THREE.Mesh(new THREE.SphereGeometry(0.0018, 5, 4), grainM), ((i * 37) % 100) / 100 * len, 0.003, (((i * 53) % 60) - 30) / 1000);
      const lab = label('Qalin qum', V(len * 0.62, 0.06, -0.05), { parent: g, minor: true });
      const NAMES = { qalin: 'Qalin qum qatlami', yupqa: 'Yupqa qum qatlami', silliq: 'Qumsiz silliq yo‘lak', yoq: 'Ishqalanishsiz yo‘lak (xayoliy)' };
      return {
        group: g,
        set(mode) {
          thick.visible = mode === 'qalin'; thin.visible = mode === 'yupqa';
          grains.visible = mode === 'qalin' || mode === 'yupqa'; grains.position.y = Y + (mode === 'qalin' ? 0.008 : 0.001);
          lab.setText(NAMES[mode]); return this;
        }
      };
    }

    /* ---------- Bent elastic steel plate on a cart, tied by a thread (66–67-rasm) ---------- */
    // The group is carried by cart I (its origin = the cart's front top edge); peg = where the thread is tied on the cart.
    function elasticPlate({ cartLen = 0.1 } = {}) {
      const g = group();
      add(g, box(0.012, 0.014, 0.05, C.ink700), -0.006, 0.007, 0);
      const N = 12, H = 0.075, seg = H / N, m = mat(0xB9C0CF, { metalness: 0.75, roughness: 0.28 });
      const parts = [...Array(N)].map(() => add(g, new THREE.Mesh(new THREE.BoxGeometry(0.0024, seg * 1.04, 0.044), m)));
      parts.forEach((p) => { p.castShadow = true; });
      const peg = add(g, cyl(0.0025, 0.03, C.steel, { metalness: 0.6 }, 8), -cartLen + 0.012, 0.015, 0);
      label('Elastik plastinka', V(-0.03, 0.115, 0), { parent: g, minor: true });
      let tipL = V(0, H, 0);
      const api = {
        group: g,
        // bend 0 = straight up, 1 = bent back over the cart
        set(bend) {
          let x = 0.006, y = -0.03, a = 0;
          parts.forEach((p) => {
            const da = bend * 1.5 / N; a += da;
            const cx = x - Math.sin(a) * seg / 2, cy = y + Math.cos(a) * seg / 2;
            p.position.set(cx, cy, 0); p.rotation.z = a;
            x -= Math.sin(a) * seg; y += Math.cos(a) * seg;
          });
          tipL = V(x, y, 0); return api;
        },
        tip() { return world(g, tipL); },
        peg() { return world(g, V(peg.position.x, 0.028, 0)); }
      };
      return api.set(1);
    }

    /* ---------- Cart with a magnet core (I) / with an iron piece (II), 75-rasm ---------- */
    function magnetCart({ name = 'I aravacha (magnit)', color = C.navy } = {}) {
      const c = k.cart({ name, color });
      const n = add(c.group, box(0.026, 0.02, 0.03, C.red, { roughness: 0.45 }), 0.047, 0.059, 0);
      add(c.group, box(0.03, 0.02, 0.03, C.blue, { roughness: 0.45 }), 0.019, 0.059, 0);
      add(c.group, box(0.05, 0.004, 0.036, C.ink700), 0.03, 0.0475, 0);
      label('N', V(0.047, 0.09, 0), { parent: c.group, minor: true });
      c.label.position.set(-0.05, 0.12, 0);
      return Object.assign(c, { face() { return world(c.group, V(0.06, 0.059, 0)); }, faceX: 0.06, north: n });
    }
    function ironCart({ name = 'II aravacha (temir)', color = 0x2B3A78 } = {}) {
      const c = k.cart({ name, color });
      add(c.group, box(0.03, 0.02, 0.03, IRON, { metalness: 0.65, roughness: 0.4 }), -0.045, 0.059, 0);
      add(c.group, box(0.04, 0.004, 0.036, C.ink700), -0.03, 0.0475, 0);
      c.label.position.set(0.05, 0.12, 0);
      return Object.assign(c, { face() { return world(c.group, V(-0.06, 0.059, 0)); }, faceX: -0.06 });
    }

    /* ---------- Centrifugal machine: motor base, vertical axle, rotating guide rod (sharcha rod bo‘ylab sirpanadi) ---------- */
    function spinMachine(x, z, { rod = 0.6 } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.2, 0.04, 0.16, C.navy, { roughness: 0.45 }), 0, 0.02, 0);
      add(g, cyl(0.04, 0.05, C.ink700, { roughness: 0.5 }), 0, 0.065, 0);
      const knob = add(g, new THREE.Group(), 0.065, 0.04, 0.06);
      add(knob, cyl(0.012, 0.012, C.ink, { roughness: 0.4 }), 0, 0.006, 0);
      add(knob, box(0.003, 0.003, 0.012, C.amber), 0, 0.013, 0.005);
      add(g, box(0.024, 0.008, 0.002, 0x2E7D5B, { emissive: 0x2E7D5B, emissiveIntensity: 0.6 }), -0.06, 0.03, 0.0805);
      const Y = 0.17;
      add(g, cyl(0.006, Y - 0.08, C.steel, { metalness: 0.65, roughness: 0.3 }), 0, 0.08 + (Y - 0.08) / 2, 0);
      const rotor = add(g, new THREE.Group(), 0, Y, 0);
      add(rotor, cyl(0.016, 0.022, C.ink700), 0, 0, 0);
      const r1 = add(rotor, cyl(0.0035, rod, C.steel, { metalness: 0.7, roughness: 0.25 }, 10), rod / 2, 0, 0); r1.rotation.z = Math.PI / 2;
      add(rotor, box(0.008, 0.016, 0.016, C.ink700), rod, 0, 0);
      const r2 = add(rotor, cyl(0.0035, 0.12, C.steel, { metalness: 0.7, roughness: 0.25 }, 10), -0.06, 0, 0); r2.rotation.z = Math.PI / 2;
      const cw = add(rotor, cyl(0.016, 0.03, C.ink700, { metalness: 0.4 }), -0.11, 0, 0); cw.rotation.z = Math.PI / 2;
      add(rotor, sphere(0.004, C.amber), 0, 0.012, 0);
      label('Markazdan qochma mashina', V(-0.02, 0.13, 0.12), { parent: g, minor: true });
      return {
        group: g, rotor, Y, rod,
        set(angle) { rotor.rotation.y = angle; },
        setKnob(n) { knob.rotation.y = -n * 1.2; }
      };
    }

    /* ---------- Millimetre ruler (vertical): 0 at the top, mm ticks, cm numbers ---------- */
    const MARGIN = 20 / 12 / 1000;                                               // 20 px at 12 px per mm
    function mmTexture(cm, { bg = '#FFFDF5', paper = false, width = 0.03 } = {}) {
      const W = Math.round(width * 12000), H = cm * 10 * 12 + 40;               // 12 px per mm both ways
      return faceTexture((c, w, h) => {
        c.fillStyle = bg; c.fillRect(0, 0, w, h);
        const y0 = 20, mm = (h - 40) / (cm * 10);
        if (paper) {                                                             // millimetre paper: a grid
          for (let i = 0; i * mm <= w; i++) { c.strokeStyle = i % 10 === 0 ? '#E58A8A' : i % 5 === 0 ? '#F0B7B7' : '#F7DADA'; c.lineWidth = i % 10 === 0 ? 2.2 : 1; c.beginPath(); c.moveTo(i * mm, 0); c.lineTo(i * mm, h); c.stroke(); }
          for (let i = 0; i <= cm * 10; i++) { const y = y0 + i * mm; c.strokeStyle = i % 10 === 0 ? '#E58A8A' : i % 5 === 0 ? '#F0B7B7' : '#F7DADA'; c.lineWidth = i % 10 === 0 ? 2.2 : 1; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
        }
        c.strokeStyle = '#3A4166'; c.fillStyle = '#3A4166';
        for (let i = 0; i <= cm * 10; i++) {
          const y = y0 + i * mm, big = i % 10 === 0, mid = i % 5 === 0;
          c.lineWidth = big ? 3 : 1.6; c.beginPath(); c.moveTo(0, y); c.lineTo(big ? w * 0.42 : mid ? w * 0.3 : w * 0.18, y); c.stroke();
          if (big && !paper) { c.font = '700 84px Sora, system-ui, sans-serif'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText(String(i / 10), w - 10, y + (i ? 0 : 30)); }
          if (big && paper && i > 0) { c.font = '700 64px Sora, system-ui, sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(String(i / 10), w * 0.5, y); }
        }
      }, W, H);
    }
    function millimetreRuler(cm = 20, { name = 'Millimetrli chizg‘ich', width = 0.032 } = {}) {
      const g = group();
      const len = cm / 100 + MARGIN * 2;                                         // the texture's size: cm + 20 px at both ends
      const face = new THREE.MeshStandardMaterial({ map: mmTexture(cm, { width }), roughness: 0.85 });
      const plain = mat(0xF2E3BF, { roughness: 0.85 });
      const m = add(g, new THREE.Mesh(new THREE.BoxGeometry(width, len, 0.003), [plain, plain, plain, plain, face, plain]), 0, MARGIN - len / 2, 0);
      m.castShadow = true;
      if (name) label(name, V(0.055, 0.03, 0), { parent: g, minor: true });
      return {
        group: g, cm,
        // place the 0 mark at (x, yTop, z)
        place(x, yTop, z) { g.position.set(x, yTop, z); return this; },
        y(cmv) { return g.position.y - cmv / 100; }
      };
    }

    /* ---------- The simplest dynamometer (87-rasm): board with millimetre paper, spring, pointer, hook ---------- */
    // top: world point it hangs from (the stand's tip). set(len): spring length; mark(i, len): pencil mark at that length.
    function paperDynamometer(top, { l0 = 0.06, cm = 14, name = 'Eng oddiy dinamometr' } = {}) {
      const g = group(top.x, top.y, top.z);
      const H = cm / 100 + l0 + 0.03;
      add(g, cyl(0.0012, 0.012, C.steel, {}, 6), 0, -0.006, -0.012);
      const ring = add(g, new THREE.Mesh(new THREE.TorusGeometry(0.005, 0.0012, 6, 14), mat(C.steel, { metalness: 0.6 })), 0, -0.003, -0.012); ring.rotation.y = Math.PI / 2;
      add(g, box(0.07, H, 0.006, 0xF4F5F9, { roughness: 0.8 }), 0.012, -0.012 - H / 2, -0.016);
      const paperM = new THREE.MeshStandardMaterial({ map: mmTexture(cm, { bg: '#FFFFFF', paper: true, width: 0.056 }), roughness: 0.9 });
      const PH = cm / 100 + MARGIN * 2;                                          // paper: its 0 line at the pointer's start
      add(g, new THREE.Mesh(new THREE.PlaneGeometry(0.056, PH), paperM), 0.016, -0.02 - l0 + MARGIN - PH / 2, -0.0125);
      add(g, box(0.012, 0.008, 0.012, C.ink700), 0, -0.016, -0.008);
      const sp = k.spring(V(top.x, top.y - 0.02, top.z), { l0, name: '', r: 0.007, turns: 16 });
      g.add(sp.group); sp.group.position.set(0, -0.02, 0);
      sp.pointer.scale.set(1.25, 1, 1); sp.pointer.position.x = 0.022;
      const mm = mat(C.ink, { roughness: 0.6 }), am = mat(C.amber, { roughness: 0.5 });
      const marks = [0, 1, 2, 3].map((i) => { const b = add(g, box(0.026, 0.0012, 0.001, 0x0B1026), 0.03, 0, -0.0118); b.material = i ? am : mm; b.visible = false; return b; });
      label(name, V(0.1, -0.02, 0), { parent: g, minor: true });
      const yOf = (len) => -0.02 - len - 0.0;                                      // pointer height for a spring length
      return {
        group: g, l0, spring: sp,
        set(len) { sp.set(len); return this; },
        // y of the scale's 0 (start mark) and how far a length reads below it
        zeroY() { return top.y + yOf(l0); },
        mark(i, len) { if (len === null) { marks[i].visible = false; return this; } marks[i].visible = true; marks[i].position.y = yOf(len); return this; },
        end() { return sp.end(); }
      };
    }

    return Object.assign(k, { sandStrip, elasticPlate, magnetCart, ironCart, spinMachine, millimetreRuler, paperDynamometer });
  };
})();
