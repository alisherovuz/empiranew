// Empira — 3D equipment for 7-sinf Fizika, VI–VII boblar (impuls, ish, energiya, quvvat, FIK): labs §36–§46 in labs-7e.js.
// Same style as kit-7.js (metres, table top y = 0, navy instruments, amber = "it works"). Every factory builds its meshes
// in its own top-level group(s), so Build Mode (build/auto.js) hides the tool until the student puts it on the table.
(function () {
  const ICON = {
    puller: '<rect x="12" y="8" width="9" height="10" rx="1"/><circle cx="9" cy="11" r="2.5"/><path d="M2 11h4.5"/><path d="M14 12h5"/>',
    bufferCart: '<rect x="3" y="8" width="12" height="7" rx="1.5"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="12" cy="17.5" r="2"/><path d="M15 11.5l1.5-1.5 1.5 3 1.5-3 1 1.5"/><path d="M21 9v5"/>',
    corkTube: '<path d="M4 17 17 7"/><path d="M6 19 19 9"/><path d="M4 17a1.4 1.4 0 0 0 2 2"/><rect x="17" y="5" width="3" height="4" rx="1" transform="rotate(-38 18.5 7)"/>',
    lamp: '<path d="M7 20h10l-1-7H8z"/><path d="M12 13V9"/><path d="M12 3c2 2 2 4 0 5-2-1-2-3 0-5z"/>',
    pile: '<path d="M6 21V3"/><path d="M18 21V3"/><path d="M6 3h12"/><rect x="8" y="6" width="8" height="5" rx="1"/><path d="M12 15v4"/><path d="M4 21h16"/>',
    clay: '<rect x="5" y="12" width="14" height="8" rx="1"/><path d="M5 14h14"/><path d="M12 4v12"/><path d="M10 4h4"/>',
    tribo: '<rect x="2" y="12" width="20" height="5" rx="1"/><path d="M5 12v2"/><path d="M8 12v3"/><path d="M11 12v2"/><path d="M14 12v3"/><path d="M17 12v2"/>',
    dropStand: '<path d="M5 21h10"/><path d="M8 21V3"/><path d="M8 5h9"/><rect x="15" y="5" width="4" height="3" rx="0.5"/><circle cx="17" cy="11" r="1.5"/><path d="M8 15h9"/>',
    bars: '<rect x="3" y="3" width="18" height="15" rx="1"/><path d="M7 15V9"/><path d="M12 15v-3"/><path d="M17 15V7"/><path d="M8 21l4-3 4 3"/>',
    winch: '<path d="M6 21V4h12"/><circle cx="18" cy="6" r="2"/><path d="M20 6v8"/><rect x="18" y="14" width="4" height="4" rx="0.5"/><rect x="3" y="17" width="7" height="4" rx="1"/>',
    incline: '<path d="M3 19h18"/><path d="M3 19 20 8"/><path d="M20 8v11"/><rect x="9" y="11" width="5" height="3" transform="rotate(-33 11.5 12.5)"/>'
  };
  window.EMPIRA_KIT_TYPES = Object.assign(window.EMPIRA_KIT_TYPES || {}, {
    forcePuller: { name: 'Tortish qurilmasi (dinamometrli)', icon: ICON.puller, domain: 'k' },
    bufferCart: { name: 'Buferli aravacha', icon: ICON.bufferCart, domain: 'k' },
    corkTube: { name: 'Tiqinli probirka', icon: ICON.corkTube, domain: 'k' },
    spiritLamp: { name: 'Spirt lampa', icon: ICON.lamp, domain: 'k' },
    pileDriver: { name: 'Qoziq qoqish qurilmasi', icon: ICON.pile, domain: 'k' },
    plasticineBox: { name: 'Plastilinli quti va mix', icon: ICON.clay, domain: 'k' },
    workTribometer: { name: 'Laboratoriya tribometri', icon: ICON.tribo, domain: 'k' },
    dropStand: { name: 'Shtativ va elektromagnit', icon: ICON.dropStand, domain: 'k' },
    energyBars: { name: 'Energiya ekrani', icon: ICON.bars, domain: 'k' },
    powerWinch: { name: 'Elektr ko‘targich', icon: ICON.winch, domain: 'k' },
    fikIncline: { name: 'Qiya taxta', icon: ICON.incline, domain: 'k' }
  });

  const base = window.EMPIRA_KIT;
  window.EMPIRA_KIT = function (THREE, scene) {
    const k = base(THREE, scene);
    const { C, V, mat, box, cyl, sphere, add, group, label, faceTexture, world } = k;
    const ALU = 0xC9CED9, WOOD = 0xD9B98C, WOOD2 = 0xC9A06A, BRASS = 0xB89A4A, CLAY = 0x7FA36B;
    const fmt = (v, d = 1) => { let x = Number(v); if (Math.abs(x) < 0.5 * 10 ** -d) x = 0; return x.toFixed(d).replace('.', ',').replace('-', '−'); };
    const glass = (o = 0.3) => new THREE.MeshStandardMaterial({ color: 0xE8EEF8, roughness: 0.08, transparent: true, opacity: o, depthWrite: false, side: THREE.DoubleSide });
    const glow = (color, i = 1.4) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: i, transparent: true, opacity: 0.92 });
    // vertical tick strip (cm ticks, labels every 10 sm) whose 0 is at local y = 0
    const vScale = (parent, len, x, y, z, w = 0.028) => {
      const m = add(parent, new THREE.Mesh(new THREE.PlaneGeometry(len, w), new THREE.MeshStandardMaterial({ map: k.tickTexture(len, { bg: '#FFF8E6', h: 96 }), roughness: 0.85 })), x, y + len / 2, z);
      m.rotation.z = Math.PI / 2; return m;
    };

    /* ---------- Force puller (tortish qurilmasi): motor box with a drum and a built-in dynamometer; pulls a thread with F for a set time ---------- */
    // threadY: height of the (horizontal) thread; the drum's top is at that height, on the −x side of the box
    function forcePuller(x, z, { threadY = 0.048 } = {}) {
      const g = group(x, 0, z), r = 0.014, cy = threadY - r;
      add(g, box(0.1, 0.075, 0.09, C.navy, { roughness: 0.45 }), 0.035, 0.0375, 0);
      add(g, box(0.022, cy + 0.006, 0.06, C.ink700), -0.012, (cy + 0.006) / 2, 0);
      const drum = add(g, new THREE.Group(), -0.03, cy, 0);
      const d = add(drum, cyl(r, 0.045, ALU, { metalness: 0.55, roughness: 0.3 }, 24)); d.rotation.x = Math.PI / 2;
      add(drum, box(r * 1.7, 0.003, 0.047, C.steel), 0, 0, 0);
      [-1, 1].forEach((s) => { const f = add(drum, cyl(r + 0.006, 0.003, C.ink700, {}, 24), 0, 0, s * 0.024); f.rotation.x = Math.PI / 2; });
      // dial of the built-in dynamometer on the front face
      const face = faceTexture((ctx, w, h) => {
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#3A4166'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(w / 2, h * 0.8, h * 0.62, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
        for (let i = 0; i <= 4; i++) { const a = Math.PI * (1.15 + 0.175 * i); ctx.beginPath(); ctx.moveTo(w / 2 + Math.cos(a) * h * 0.62, h * 0.8 + Math.sin(a) * h * 0.62); ctx.lineTo(w / 2 + Math.cos(a) * h * 0.5, h * 0.8 + Math.sin(a) * h * 0.5); ctx.stroke(); }
        ctx.fillStyle = '#0B1026'; ctx.font = '700 60px Sora, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('N', w / 2, h * 0.7);
      }, 256, 160);
      add(g, new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.0375), new THREE.MeshStandardMaterial({ map: face, roughness: 0.9 })), 0.035, 0.045, 0.0455);
      const needle = add(g, new THREE.Group(), 0.035, 0.033, 0.047);
      add(needle, box(0.0015, 0.024, 0.001, C.red), 0, 0.012, 0);
      const ledM = mat(0x2E7D5B, { emissive: 0x2E7D5B, emissiveIntensity: 0 });
      add(g, cyl(0.005, 0.006, 0x2E7D5B), 0.068, 0.078, 0.025).material = ledM;
      label('Tortish qurilmasi', V(-0.01, 0.13, 0), { parent: g, minor: true });
      const api = {
        group: g,
        point: V(x - 0.03, threadY, z),                               // where the thread leaves the drum
        set(F, Fmax = 2) { needle.rotation.z = 0.9 - 1.8 * Math.max(0, Math.min(1, F / Fmax)); return api; },
        spin(a) { drum.rotation.z = a; return api; },
        on(v) { ledM.emissiveIntensity = v ? 1.6 : 0; return api; }
      };
      return api;
    }

    /* ---------- Cart with a spring buffer (or plasticine) on its front; facing +1 = buffer at +x ---------- */
    function bufferCart({ name = 'Aravacha', color = C.navy, facing = 1, clay = false } = {}) {
      const c = k.cart({ name, color });
      const L = 0.035, half = c.len / 2;
      const sg = add(c.group, new THREE.Group(), facing * (half + 0.002), 0.03, 0);
      const pts = []; for (let i = 0; i <= 120; i++) { const u = i / 120, a = u * Math.PI * 12; pts.push(V(facing * u * L, Math.cos(a) * 0.008, Math.sin(a) * 0.008)); }
      const spr = add(sg, new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.0011, 6), mat(C.steel, { metalness: 0.7, roughness: 0.3 })));
      const plate = add(sg, cyl(0.013, 0.003, ALU, { metalness: 0.6 }, 20), facing * L, 0, 0); plate.rotation.z = Math.PI / 2;
      const lump = add(c.group, sphere(0.016, CLAY, { roughness: 0.95 }), facing * (half + 0.008), 0.03, 0); lump.scale.set(0.9, 0.85, 1);
      const face = add(c.group, box(0.004, 0.026, 0.04, ALU, { metalness: 0.5 }), facing * (half + 0.002), 0.03, 0);
      let kind = 'prujina';
      const api = Object.assign(c, {
        reach() { return kind === 'prujina' ? half + 0.002 + L : clay ? half + 0.022 : half + 0.004; },   // centre → front tip
        setBuffer(k2) { kind = k2; spr.visible = plate.visible = k2 === 'prujina'; lump.visible = k2 !== 'prujina' && clay; face.visible = k2 !== 'prujina' && !clay; api.squeeze(0); return api; },
        // squeeze by dx metres (spring shortens, plasticine flattens)
        squeeze(dx) {
          const f = Math.max(0, Math.min(0.7, dx / L)); sg.scale.x = 1 - f;
          const q = Math.max(0, Math.min(0.6, dx / 0.02)); lump.scale.set(0.9 * (1 - q * 0.6), 0.85 * (1 + q * 0.3), 1 + q * 0.3); lump.position.x = facing * (half + 0.008 - dx * 0.4);
          return api;
        }
      });
      return api.setBuffer('prujina');
    }

    /* ---------- Test tube with water and a cork, in a small clamp; rides on a cart (carry) ---------- */
    function corkTube({ tilt = 0.26 } = {}) {
      const g = group();
      add(g, box(0.03, 0.006, 0.03, C.ink700), 0, 0.003, -0.03);
      add(g, cyl(0.003, 0.085, C.steel, { metalness: 0.6 }, 8), 0, 0.045, -0.03);
      add(g, box(0.008, 0.008, 0.03, C.steel, { metalness: 0.6 }), 0, 0.075, -0.015);
      const piv = add(g, new THREE.Group(), 0, 0.075, 0); piv.rotation.z = tilt;
      const Lt = 0.15, R = 0.0105, x0 = -0.06;
      add(piv, new THREE.Mesh(new THREE.CylinderGeometry(R, R, Lt, 24, 1, true), glass(0.35)), x0 + Lt / 2, 0, 0).rotation.z = Math.PI / 2;
      add(piv, new THREE.Mesh(new THREE.SphereGeometry(R, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), glass(0.35)), x0, 0, 0).rotation.z = -Math.PI / 2;
      const water = add(piv, new THREE.Mesh(new THREE.CylinderGeometry(R * 0.9, R * 0.9, Lt * 0.5, 20), new THREE.MeshStandardMaterial({ color: 0x9CC7F2, transparent: true, opacity: 0.7, roughness: 0.1 })), x0 + Lt * 0.25, 0, 0);
      water.rotation.z = Math.PI / 2;
      add(piv, new THREE.Mesh(new THREE.TorusGeometry(R + 0.001, 0.0018, 6, 20), mat(C.ink700)), 0.005, 0, 0).rotation.y = Math.PI / 2;
      const bubbles = [0, 1, 2, 3, 4, 5].map((i) => { const b = add(piv, sphere(0.0022, 0xFFFFFF, { transparent: true, opacity: 0.8 }), x0 + 0.01 + i * 0.012, ((i * 7) % 5 - 2) * 0.002, ((i * 3) % 5 - 2) * 0.002); b.visible = false; return b; });
      // the cork is its own group (it flies off); while in the tube it follows the mouth
      const cork = group();
      const cm = add(cork, new THREE.Mesh(new THREE.CylinderGeometry(0.0115, 0.0095, 0.02, 18), mat(0xB07A45, { roughness: 0.9 })));
      cm.rotation.z = -Math.PI / 2; cm.castShadow = true;
      const steam = [0, 1, 2, 3, 4].map(() => { const s = group(); add(s, new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 8), new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.6, depthWrite: false }))); s.visible = false; return s; });
      label('Probirka', V(0.05, 0.16, 0), { parent: g, minor: true });
      const mouthLocal = V(x0 + Lt + 0.002, 0, 0);
      let free = false;
      const api = {
        group: g, cork,
        mouth() { g.updateMatrixWorld(true); return world(piv, mouthLocal); },
        dir() { g.updateMatrixWorld(true); return V(1, 0, 0).applyQuaternion(piv.getWorldQuaternion(new THREE.Quaternion())).normalize(); },
        // keep the cork in the mouth (call after the cart moves); p: a world point → the cork flies free
        corkAt(p, spin = 0) {
          if (!p) { free = false; g.updateMatrixWorld(true); cork.position.copy(world(piv, V(x0 + Lt - 0.004, 0, 0))); cork.quaternion.copy(piv.getWorldQuaternion(new THREE.Quaternion())); cork.visible = true; return api; }
          free = true; cork.position.copy(p); cork.rotation.set(0, 0, spin); return api;
        },
        heat(f) { bubbles.forEach((b, i) => { b.visible = f > 0.15 + i * 0.1; b.position.y = ((i * 7) % 5 - 2) * 0.002 + Math.sin(f * 40 + i) * 0.003; }); return api; },
        steam(f) { const m = api.mouth(), d = api.dir(); steam.forEach((s, i) => { s.visible = f > 0 && f < 1; const q = f * (0.6 + i * 0.12); s.position.copy(m).addScaledVector(d, q * 0.12).add(V(0, q * 0.03 * i, (i - 2) * q * 0.012)); s.scale.setScalar(0.5 + q * 2); s.children[0].material.opacity = 0.6 * (1 - f); }); return api; },
        get free() { return free; }
      };
      return api;
    }

    /* ---------- Spirit lamp (spirt lampa): glass body, wick, flickering flame ---------- */
    function spiritLamp() {
      const g = group();
      add(g, new THREE.Mesh(new THREE.SphereGeometry(0.02, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), glass(0.45)), 0, 0.012, 0).scale.set(1, 0.9, 1);
      add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.01, 20), new THREE.MeshStandardMaterial({ color: 0xCFE3F7, transparent: true, opacity: 0.6 })), 0, 0.006, 0);
      add(g, cyl(0.007, 0.012, C.steel, { metalness: 0.6 }), 0, 0.03, 0);
      add(g, cyl(0.002, 0.006, 0xEDE6D6), 0, 0.039, 0);
      const pivot = add(g, new THREE.Group(), 0, 0.042, 0);
      const fm = glow(C.amber, 1.6);
      const flame = add(pivot, new THREE.Mesh(new THREE.ConeGeometry(0.0065, 0.026, 14), fm), 0, 0.015, 0);
      add(pivot, new THREE.Mesh(new THREE.SphereGeometry(0.0065, 12, 10), fm), 0, 0.003, 0);
      const light = add(pivot, new THREE.PointLight(C.amber, 0, 0.4, 2), 0, 0.015, 0);
      label('Spirt lampa', V(0.07, -0.02, 0.06), { parent: g, minor: true });
      let on = false, t = 0;
      const api = {
        group: g,
        set(v) { on = v; pivot.visible = v; light.intensity = v ? 0.1 : 0; return api; },
        animate(dt) { if (!on) return; t += dt; flame.scale.y = 1 + Math.sin(t * 19) * 0.08; pivot.rotation.z = Math.sin(t * 7) * 0.05; light.intensity = 0.09 + Math.sin(t * 23) * 0.015; }
      };
      return api.set(false);
    }

    /* ---------- Pile driver (qoziq qoqish qurilmasi): two guide posts, a load sliding between them, electromagnet latch, height scale ---------- */
    // zeroY: height where the scale reads 0 (the nail head); H: height of the frame
    function pileDriver(x, z, { zeroY = 0.17, H = 1.1 } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.26, 0.012, 0.16, C.navy, { roughness: 0.5 }), 0, 0.006, 0);
      [-1, 1].forEach((s) => add(g, box(0.014, H, 0.014, C.steel, { metalness: 0.55, roughness: 0.3 }), s * 0.055, H / 2, 0));
      add(g, box(0.13, 0.016, 0.03, C.ink700), 0, H, 0);
      vScale(g, 0.9, -0.077, zeroY, 0.0, 0.026);
      const magnet = add(g, new THREE.Group(), 0, 0.5, 0);
      add(magnet, cyl(0.002, 1, C.steel, { metalness: 0.6 }, 6), 0, 0.5, 0);
      const coilM = mat(0xB87333, { metalness: 0.5, roughness: 0.4, emissive: C.amber, emissiveIntensity: 0 });
      add(magnet, cyl(0.014, 0.018, 0xB87333, { metalness: 0.5 }), 0, 0.012, 0).material = coilM;
      add(magnet, cyl(0.008, 0.006, 0x9AA1BC, { metalness: 0.6 }), 0, 0.001, 0);
      const load = add(g, new THREE.Group(), 0, 0.5, 0);
      const body = add(load, box(0.09, 1, 0.05, BRASS, { metalness: 0.7, roughness: 0.3 }), 0, 0.5, 0);
      [-1, 1].forEach((s) => add(load, box(0.012, 0.02, 0.024, C.ink700), s * 0.047, 0.01, 0));
      label('Qoziq qoqish qurilmasi', V(0, H + 0.05, 0), { parent: g, minor: true });
      let hL = 0.03;
      const api = {
        group: g, zeroY,
        setLoad(h) { hL = h; body.scale.y = h; body.position.y = h / 2; return api; },
        loadAt(yBottom) { load.position.y = yBottom; return api; },
        // the electromagnet sits on top of the load at yTop; on = holding (glows)
        magnetAt(yTop, on) { magnet.position.y = yTop; magnet.children[0].scale.y = Math.max(0.01, H - yTop); magnet.children[0].position.y = (H - yTop) / 2; coilM.emissiveIntensity = on ? 0.5 : 0; return api; },
        get loadH() { return hL; }
      };
      return api.setLoad(0.035);
    }

    /* ---------- Box of plasticine with a nail stuck in it ---------- */
    function plasticineBox(x, z, { top = 0.07, protrude = 0.1 } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.1, top - 0.006, 0.1, WOOD2, { roughness: 0.85 }), 0, (top - 0.006) / 2, 0);
      add(g, box(0.09, 0.008, 0.09, CLAY, { roughness: 0.95 }), 0, top - 0.004, 0);
      const nail = add(g, new THREE.Group(), 0, top + protrude, 0);
      add(nail, cyl(0.0032, 0.14, C.steel, { metalness: 0.75, roughness: 0.3 }, 10), 0, -0.07, 0);
      add(nail, new THREE.Mesh(new THREE.ConeGeometry(0.0032, 0.01, 10), mat(C.steel, { metalness: 0.75 })), 0, -0.145, 0).rotation.x = Math.PI;
      add(nail, cyl(0.009, 0.004, C.steel, { metalness: 0.75, roughness: 0.3 }, 18), 0, 0.002, 0);
      label('Plastilin va mix', V(-0.13, 0.05, 0.06), { parent: g, minor: true });
      const api = { group: g, head0: top + protrude, setDepth(d) { nail.position.y = top + protrude - d; return api; }, headY(d = 0) { return top + protrude + 0.004 - d; } };
      return api;
    }

    /* ---------- Laboratory tribometer: wooden board with a cm scale along its front edge ---------- */
    function workTribometer(x, z, len = 0.7) {
      const g = group(x, 0, z), H = 0.016;
      add(g, box(len, H, 0.1, WOOD, { roughness: 0.85 }), len / 2, H / 2, 0);
      add(g, new THREE.Mesh(new THREE.PlaneGeometry(len, 0.014), new THREE.MeshStandardMaterial({ map: k.tickTexture(len), roughness: 0.9 })), len / 2, H / 2, 0.0505);
      add(g, box(0.012, 0.026, 0.1, WOOD2), -0.006, 0.013, 0);
      label('Tribometr', V(len * 0.5, 0.06, -0.07), { parent: g, minor: true });
      return { group: g, len, top: H, at(s, up = 0) { return V(x + s, H + up, z); } };
    }

    /* ---------- Tall stand with a 1 m scale, an electromagnet ball holder and a clamp arm for a photogate ---------- */
    // the ball falls along x = x + arm, z = z; zeroY: where the scale reads 0
    function dropStand(x, z, { H = 1.0, arm = 0.2, zeroY = 0.03 } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.16, 0.014, 0.14, C.navy, { roughness: 0.5 }), 0.02, 0.007, 0);
      add(g, cyl(0.007, H, C.steel, { metalness: 0.55, roughness: 0.3 }), 0, H / 2, 0);
      vScale(g, 0.9, 0.0, zeroY, 0.011, 0.024);
      const top = add(g, new THREE.Group(), 0, 0.8, 0);
      add(top, box(0.026, 0.024, 0.026, C.ink700));
      add(top, box(arm, 0.01, 0.01, C.steel, { metalness: 0.55 }), arm / 2, 0, 0);
      const coilM = mat(0xB87333, { metalness: 0.5, roughness: 0.4, emissive: C.amber, emissiveIntensity: 0 });
      add(top, cyl(0.012, 0.022, 0xB87333), arm, -0.015, 0).material = coilM;
      add(top, cyl(0.006, 0.006, 0x9AA1BC, { metalness: 0.6 }), arm, -0.029, 0);
      const gate = add(g, new THREE.Group(), 0, 0.4, 0);
      add(gate, box(0.026, 0.024, 0.026, C.ink700));
      add(gate, box(arm - 0.06, 0.008, 0.008, C.steel, { metalness: 0.55 }), (arm - 0.06) / 2, 0, 0);
      label('Elektromagnit', V(arm + 0.075, 0.035, 0), { parent: top, minor: true });
      label('Shtativ', V(-0.06, 0.45, 0), { parent: g, minor: true });
      const api = {
        group: g, dropX: x + arm, dropZ: z,
        // magnet bottom at y
        setRelease(y, on) { top.position.y = y + 0.032; coilM.emissiveIntensity = on ? 0.6 : 0; return api; },
        setGateArm(y) { gate.position.y = y; return api; }
      };
      return api;
    }

    /* ---------- Energy screen: three live bars Eₚ, Eₖ and their sum ---------- */
    function energyBars(x, z, { y = 0.3, w = 0.42, h = 0.4, name = 'Energiya ekrani' } = {}) {
      const g = group(x, 0, z);
      [-1, 1].forEach((s) => add(g, box(0.012, y, 0.012, C.ink700), s * (w / 2 - 0.02), y / 2, -0.01));
      add(g, box(w + 0.02, h + 0.02, 0.012, C.ink700), 0, y + h / 2, -0.012);
      const W = 1024, Hc = Math.round(1024 * h / w);
      const cv = document.createElement('canvas'); cv.width = W; cv.height = Hc;
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      add(g, new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })), 0, y + h / 2, -0.005);
      label(name, V(0, y + h + 0.04, 0), { parent: g, minor: true });
      const api = {
        group: g,
        // Ep, Ek in J; max: top of the scale; ref: the dashed reference line (Eₚ₁); note: a line of text under the title
        set({ Ep = 0, Ek = 0, max = 2, ref = null, note = '' } = {}) {
          const c = cv.getContext('2d');
          c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, W, Hc);
          const L = 110, R = 40, T = 120, B = 120, ph = Hc - T - B, y0 = Hc - B;
          const Y = (e) => y0 - Math.max(0, Math.min(1.05, e / max)) * ph;
          c.fillStyle = '#0B1026'; c.font = '700 44px Sora, system-ui, sans-serif'; c.textAlign = 'left'; c.fillText(note, L, 64);
          c.strokeStyle = '#E3E6EF'; c.lineWidth = 2; c.font = '600 30px Sora, system-ui, sans-serif'; c.fillStyle = '#3A4166'; c.textAlign = 'right';
          const step = max <= 1 ? 0.25 : max <= 2 ? 0.5 : 1;
          for (let e = 0; e <= max + 1e-9; e += step) { c.beginPath(); c.moveTo(L, Y(e)); c.lineTo(W - R, Y(e)); c.stroke(); c.fillText(fmt(e, step < 1 ? 2 : 0), L - 12, Y(e) + 10); }
          c.strokeStyle = '#0B1026'; c.lineWidth = 4; c.beginPath(); c.moveTo(L, T - 10); c.lineTo(L, y0); c.lineTo(W - R, y0); c.stroke();
          c.textAlign = 'left'; c.fillStyle = '#0B1026'; c.font = '700 32px Sora, system-ui, sans-serif'; c.fillText('E, J', 12, T - 20);
          const bars = [['Eₚ', Ep, '#3B4CFF'], ['Eₖ', Ek, '#FFB21E'], ['Eₚ + Eₖ', Ep + Ek, '#1C2347']];
          const bw = (W - L - R) / 3;
          bars.forEach(([n, e, col], i) => {
            const bx = L + bw * i + bw * 0.2, bW = bw * 0.6;
            c.fillStyle = col; c.fillRect(bx, Y(e), bW, y0 - Y(e));
            c.fillStyle = '#0B1026'; c.textAlign = 'center'; c.font = '700 40px Sora, system-ui, sans-serif'; c.fillText(n, bx + bW / 2, y0 + 50);
            c.font = '700 36px Sora, system-ui, sans-serif'; c.fillText(`${fmt(e, 2)} J`, bx + bW / 2, Math.max(T + 10, Y(e) - 14));
          });
          if (ref !== null) { c.strokeStyle = '#E5484D'; c.lineWidth = 4; c.setLineDash([20, 14]); c.beginPath(); c.moveTo(L, Y(ref)); c.lineTo(W - R, Y(ref)); c.stroke(); c.setLineDash([]); }
          tex.needsUpdate = true; return api;
        }
      };
      return api.set({});
    }

    /* ---------- Electric winch (ko‘targich): motor + drum on a base, mast with an arm and a pulley; the rope ends in a hook ---------- */
    function powerWinch(x, z, { H = 1.16, arm = 0.25 } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.2, 0.014, 0.16, C.navy, { roughness: 0.5 }), -0.02, 0.007, 0);
      add(g, box(0.07, 0.06, 0.07, C.navy, { roughness: 0.45 }), -0.07, 0.044, 0.02);
      add(g, box(0.004, 0.03, 0.04, 0x2E7D5B), -0.034, 0.05, 0.02);
      const drum = add(g, new THREE.Group(), 0.0, 0.05, 0.02);
      const dm = add(drum, cyl(0.016, 0.05, ALU, { metalness: 0.55, roughness: 0.3 }, 24)); dm.rotation.x = Math.PI / 2;
      add(drum, box(0.028, 0.003, 0.052, C.steel), 0, 0, 0);
      [-1, 1].forEach((s) => add(g, box(0.01, 0.05, 0.01, C.ink700), 0, 0.03, 0.02 + s * 0.03));
      add(g, box(0.016, H, 0.016, C.steel, { metalness: 0.55, roughness: 0.3 }), 0.04, H / 2, -0.03);
      add(g, box(arm + 0.03, 0.014, 0.016, C.steel, { metalness: 0.55, roughness: 0.3 }), 0.04 + arm / 2, H + 0.02, -0.03);
      add(g, box(0.008, 0.03, 0.03, C.ink700), 0.04 + arm, H, -0.015);
      const pul = add(g, new THREE.Group(), 0.04 + arm, H - 0.004, 0.0);
      const pd = add(pul, cyl(0.016, 0.008, ALU, { metalness: 0.55 }, 24)); pd.rotation.x = Math.PI / 2;
      add(pul, box(0.026, 0.002, 0.009, C.steel), 0, 0, 0);
      const hook = add(g, new THREE.Group(), 0.04 + arm + 0.016, 0.5, 0);
      add(hook, new THREE.Mesh(new THREE.TorusGeometry(0.006, 0.0014, 6, 16, Math.PI * 1.4), mat(C.steel, { metalness: 0.7 })), 0, -0.008, 0).rotation.z = Math.PI * 0.8;
      add(hook, box(0.008, 0.01, 0.008, C.ink700), 0, 0.002, 0);
      label('Elektr ko‘targich', V(-0.07, 0.12, 0.02), { parent: g, minor: true });
      const ropeX = x + 0.04 + arm + 0.016;
      const api = {
        group: g, ropeX, ropeZ: z,
        // world points the rope runs through (drum → mast top → over the pulley → down to the hook at yHook)
        rope(yHook) { return [V(x, 0.066, z + 0.02), V(x + 0.03, H - 0.004, z), V(x + 0.04 + arm - 0.016, H + 0.012, z), V(ropeX, H - 0.004, z), V(ropeX, yHook + 0.008, z)]; },
        hookAt(y) { hook.position.y = y; return api; },
        spin(a) { drum.rotation.z = a; pul.rotation.z = -a; return api; }
      };
      return api.hookAt(0.5);
    }

    /* ---------- Inclined board (qiya taxta) hinged at its low end; optional smooth film on top ---------- */
    function fikIncline(x, z, { len = 0.62, w = 0.1 } = {}) {
      const g = group(x, 0, z), T = 0.014;
      add(g, box(0.03, 0.012, w + 0.02, C.ink700), 0, 0.006, 0);
      const pivot = add(g, new THREE.Group(), 0, 0.012, 0);
      add(pivot, box(len, T, w, WOOD, { roughness: 0.85 }), len / 2, T / 2, 0);
      add(pivot, new THREE.Mesh(new THREE.PlaneGeometry(len, 0.012), new THREE.MeshStandardMaterial({ map: k.tickTexture(len), roughness: 0.9 })), len / 2, T / 2, w / 2 + 0.0008);
      const film = add(pivot, box(len - 0.02, 0.0015, w - 0.006, 0xBFE3FF, { transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.1 }), len / 2, T + 0.0008, 0);
      const filmLab = label('Silliq plyonka', V(len * 0.3, T + 0.05, -0.06), { parent: pivot, minor: true });
      label('Qiya taxta', V(len * 0.62, T + 0.06, -0.07), { parent: pivot, minor: true });
      let ang = 0;
      const api = {
        group: g, len, pivot, top: T,
        // the board rises so that a point at distance l along it is at height h (sin α = h / l)
        setRise(h, l = 0.5) { ang = Math.asin(Math.min(0.9, h / l)); pivot.rotation.z = ang; return api; },
        setFilm(on) { film.visible = on; filmLab.userData.hidden = !on; return api; },
        get angle() { return ang; },
        at(s, up = 0) { return world(pivot, V(s, T + up, 0)); },
        quat() { pivot.updateMatrixWorld(true); return pivot.getWorldQuaternion(new THREE.Quaternion()); },
        dir() { return V(Math.cos(ang), Math.sin(ang), 0); }
      };
      return api.setFilm(false);
    }

    return Object.assign(k, { forcePuller, bufferCart, corkTube, spiritLamp, pileDriver, plasticineBox, workTribometer, dropStand, energyBars, powerWinch, fikIncline });
  };
})();
