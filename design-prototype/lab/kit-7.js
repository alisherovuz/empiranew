// Empira — 3D equipment for 7-sinf Fizika (mechanics). Adds to the shared kit in kit.js (same style and units:
// metres, table top y = 0, low-poly, navy instruments, amber = "it works"). Each tool is a top-level group, so Build Mode
// (build/auto.js) can hide it until the student puts it on the table. EMPIRA_KIT_TYPES names the tools for Build Mode.
(function () {
  const ICON = {
    track: '<path d="M2 15h20"/><path d="M2 18h20"/><path d="M5 15v3"/><path d="M9 15v3"/><path d="M13 15v3"/><path d="M17 15v3"/>',
    cart: '<rect x="4" y="8" width="16" height="7" rx="1.5"/><circle cx="8" cy="17.5" r="2"/><circle cx="16" cy="17.5" r="2"/>',
    dropper: '<path d="M10 3h4v6l2 3H8l2-3z"/><path d="M12 15c1.5 2 1.5 3.5 0 4.5-1.5-1-1.5-2.5 0-4.5z"/>',
    pulley: '<circle cx="12" cy="9" r="5"/><circle cx="12" cy="9" r="1"/><path d="M17 9v12"/><path d="M4 4h4"/><path d="M6 4v5"/>',
    pan: '<path d="M12 3v8"/><path d="M6 13h12"/><rect x="8" y="14" width="8" height="2.5" rx="1"/><rect x="8" y="17.5" width="8" height="2.5" rx="1"/>',
    weights: '<rect x="7" y="13" width="10" height="7" rx="1"/><path d="M12 13V9"/><circle cx="12" cy="7" r="2"/>',
    block: '<rect x="4" y="9" width="16" height="9" rx="1"/><path d="M20 13h2"/><circle cx="22" cy="13" r="0.5"/>',
    ball: '<circle cx="12" cy="12" r="6"/><path d="M9.5 9.5a3 3 0 0 1 2.5-1"/>',
    chute: '<path d="M3 6l18 12"/><path d="M3 9l18 12"/><path d="M3 6v3"/>',
    gate: '<path d="M6 20V6h12v14"/><path d="M6 10h12" stroke-dasharray="2 2"/><circle cx="6" cy="10" r="1"/>',
    timer: '<rect x="3" y="7" width="18" height="11" rx="2"/><path d="M7 12.5h3"/><path d="M12 11v3"/><path d="M14.5 11v3"/><path d="M10 4h4"/>',
    ruler: '<rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8v3"/><path d="M10 8v4"/><path d="M14 8v3"/><path d="M18 8v4"/>',
    spring: '<path d="M12 2v3"/><path d="M8 6l8 2-8 2 8 2-8 2 8 2"/><path d="M12 18v4"/>',
    tube: '<rect x="9" y="2" width="6" height="20" rx="3"/><circle cx="12" cy="8" r="1.4"/>',
    pump: '<rect x="4" y="12" width="12" height="8" rx="1"/><path d="M10 12V6h6"/><circle cx="18" cy="6" r="2.5"/>',
    launcher: '<rect x="9" y="10" width="6" height="11" rx="1"/><path d="M10 13l4 1-4 1 4 1"/><circle cx="12" cy="6" r="2.5"/>',
    metronome: '<path d="M8 21h8l-2-17h-4z"/><path d="M12 18 15 7"/>',
    sensor: '<rect x="4" y="8" width="9" height="8" rx="1"/><circle cx="8.5" cy="12" r="2"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19 7a8 8 0 0 1 0 10"/>',
    board: '<rect x="3" y="4" width="18" height="13" rx="1"/><path d="M6 14l4-4 3 2 5-6"/><path d="M8 21l4-4 4 4"/>',
    scale: '<rect x="3" y="14" width="18" height="6" rx="1"/><path d="M6 14v-2h12v2"/><path d="M9 17h6"/>'
  };
  window.EMPIRA_KIT_TYPES = Object.assign(window.EMPIRA_KIT_TYPES || {}, {
    track: { name: 'Yo‘naltiruvchi yo‘lka', icon: ICON.track, domain: 'k' },
    cart: { name: 'Aravacha', icon: ICON.cart, domain: 'k' },
    dropper: { name: 'Tomizg‘ich', icon: ICON.dropper, domain: 'k' },
    pulley: { name: 'Blok (g‘altakcha)', icon: ICON.pulley, domain: 'k' },
    pan: { name: 'Pallacha va yukchalar', icon: ICON.pan, domain: 'k' },
    weights: { name: 'Yuklar to‘plami', icon: ICON.weights, domain: 'k' },
    block: { name: 'Yog‘och brusok', icon: ICON.block, domain: 'k' },
    ball: { name: 'Po‘lat sharcha', icon: ICON.ball, domain: 'k' },
    chute: { name: 'Metall nov', icon: ICON.chute, domain: 'k' },
    stopCylinder: { name: 'Metall silindr', icon: ICON.weights, domain: 'k' },
    holder: { name: 'Shtativ', icon: '<path d="M6 21h10"/><path d="M9 21V3"/><path d="M9 8h9"/><path d="M18 8v3"/>', domain: 'k' },
    photogate: { name: 'Fotodatchik', icon: ICON.gate, domain: 'k' },
    timer: { name: 'Elektron sekundomer', icon: ICON.timer, domain: 'k' },
    ruler: { name: 'O‘lchov chizg‘ichi', icon: ICON.ruler, domain: 'k' },
    spring: { name: 'Prujina', icon: ICON.spring, domain: 'k' },
    bubbleTube: { name: 'Suvli shisha nay', icon: ICON.tube, domain: 'k' },
    newtonTube: { name: 'Nyuton nayi', icon: ICON.tube, domain: 'k' },
    vacuumPump: { name: 'Havo so‘ruvchi nasos', icon: ICON.pump, domain: 'k' },
    launcher: { name: 'Prujinali otish qurilmasi', icon: ICON.launcher, domain: 'k' },
    metronome: { name: 'Metronom', icon: ICON.metronome, domain: 'k' },
    motionSensor: { name: 'Harakat datchigi', icon: ICON.sensor, domain: 'k' },
    chartBoard: { name: 'Grafik ekrani', icon: ICON.board, domain: 'k' },
    scaleBal: { name: 'Tarozi', icon: ICON.scale, domain: 'k' }
  });
  window.EMPIRA_KIT7_ICON = ICON;

  const base = window.EMPIRA_KIT;
  window.EMPIRA_KIT = function (THREE, scene) {
    const k = base(THREE, scene);
    const { C, V, mat, box, cyl, sphere, add, group, label, faceTexture, world } = k;
    const ALU = 0xC9CED9, WOOD = 0xD9B98C, WOOD2 = 0xC9A06A, WATER = 0x9CC7F2;
    const glass = (o = 0.22) => new THREE.MeshStandardMaterial({ color: 0xE8EEF8, roughness: 0.08, transparent: true, opacity: o, depthWrite: false, side: THREE.DoubleSide });
    const UP = V(0, 1, 0);
    const fmt = (v, d = 1) => Number(v).toFixed(d).replace('.', ',').replace('-', '−');

    /* ---------- A cm/dm tick strip (texture) for rulers and track sides ---------- */
    function tickTexture(lenM, { major = 10, labels = true, bg = '#FFFFFF', h = 64, unit = '' } = {}) {
      const cm = Math.round(lenM * 100), W = Math.min(4096, Math.max(512, cm * 16));
      return faceTexture((ctx, w, hh) => {
        ctx.fillStyle = bg; ctx.fillRect(0, 0, w, hh);
        ctx.strokeStyle = '#3A4166'; ctx.fillStyle = '#3A4166'; ctx.lineWidth = 2;
        ctx.font = `700 ${Math.round(hh * 0.42)}px Sora, system-ui, sans-serif`; ctx.textAlign = 'center';
        for (let i = 0; i <= cm; i++) {
          const x = (i / cm) * (w - 4) + 2, big = i % major === 0, mid = i % 5 === 0;
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, big ? hh * 0.45 : mid ? hh * 0.32 : hh * 0.2); ctx.stroke();
          if (labels && big && i > 0 && i < cm) ctx.fillText(`${i}${unit}`, x, hh * 0.92);
        }
      }, W, h);
    }

    /* ---------- Thread (ip): thin dark line through points; never a tool ---------- */
    // owner: a tool ({ group }) the thread belongs to: it is hidden with that tool in Build Mode (points stay in world space)
    function thread(color = 0x3A4166, { owner = null } = {}) {
      const g = owner ? owner.group : group(); const m = mat(color, { roughness: 0.6 }); const segs = [];
      const tmpA = V(0, 0, 0), tmpB = V(0, 0, 0);
      return {
        group: g,
        set(...pts) {
          const P = pts.flat();
          g.updateMatrixWorld(true);
          while (segs.length < P.length - 1) segs.push(add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.0009, 0.0009, 1, 6), m)));
          segs.forEach((s, i) => {
            if (i >= P.length - 1) { s.visible = false; return; }
            const a = g.worldToLocal(tmpA.copy(P[i])), b = g.worldToLocal(tmpB.copy(P[i + 1])), d = a.distanceTo(b);
            s.visible = d > 1e-5; s.position.copy(a).lerp(b, 0.5); s.scale.set(1, Math.max(d, 1e-5), 1);
            s.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
          });
        },
        hide() { segs.forEach((s) => { s.visible = false; }); }
      };
    }

    /* ---------- Arrow (force/velocity vector): label optional; never a tool ---------- */
    function arrow(color = C.blue) {
      const g = group(); const m = mat(color, { roughness: 0.4, emissive: color, emissiveIntensity: 0.15 });
      const shaft = add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 1, 10), m));
      const head = add(g, new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.022, 14), m));
      let lab = null;
      return {
        group: g,
        set(from, vec, text) {
          const L = vec.length(); g.visible = L > 1e-4; if (!g.visible) { if (lab) lab.userData.hidden = true; return; }
          const dir = vec.clone().normalize(), q = new THREE.Quaternion().setFromUnitVectors(UP, dir);
          const sl = Math.max(0.001, L - 0.02);
          shaft.scale.set(1, sl, 1); shaft.position.copy(from).addScaledVector(dir, sl / 2); shaft.quaternion.copy(q);
          head.position.copy(from).addScaledVector(dir, L - 0.011); head.quaternion.copy(q);
          if (text !== undefined) {
            if (!lab) lab = label(text, from.clone(), { minor: false, color: '#' + new THREE.Color(color).getHexString() });
            lab.setText(text); lab.userData.hidden = false; lab.position.copy(from).addScaledVector(dir, L + 0.03);
          }
        },
        hide() { g.visible = false; if (lab) lab.userData.hidden = true; }
      };
    }

    /* ---------- Rail builder: straight track (flat top) or chute (V groove), tilts about its low end ---------- */
    function rail(x, z, len, { legs = 0, y = 0, kind = 'track', name, flip = false, ticks = true } = {}) {
      const g = group(x, y, z); if (flip) { g.rotation.y = Math.PI; }
      const inner = add(g, new THREE.Group(), 0, legs, 0);
      const W = kind === 'chute' ? 0.03 : 0.07, H = kind === 'chute' ? 0.02 : 0.014;
      if (kind === 'chute') {
        [-1, 1].forEach((s) => { const p = add(inner, box(len, 0.003, 0.02, ALU, { metalness: 0.6, roughness: 0.3 }), len / 2, H * 0.55, s * 0.007); p.rotation.x = s * 0.75; });
        add(inner, box(len, 0.004, 0.004, ALU, { metalness: 0.6, roughness: 0.3 }), len / 2, 0.002, 0);
      } else {
        add(inner, box(len, H, W, ALU, { metalness: 0.45, roughness: 0.35 }), len / 2, H / 2, 0);
        [-1, 1].forEach((s) => add(inner, box(len, 0.004, 0.006, 0x9AA1BC, { metalness: 0.6, roughness: 0.3 }), len / 2, H + 0.002, s * 0.022));
        [0, len].forEach((e) => add(inner, box(0.008, 0.02, W, C.ink700), e, H + 0.006, 0));
      }
      if (ticks) {
        const strip = add(inner, new THREE.Mesh(new THREE.PlaneGeometry(len, 0.016), new THREE.MeshStandardMaterial({ map: tickTexture(len), roughness: 0.9 })), len / 2, kind === 'chute' ? 0.005 : H * 0.5, W / 2 + 0.0015);
        strip.receiveShadow = true;
      }
      // supports: legs at both ends; a block under the raised start end
      const legM = [];
      if (legs > 0) [0.03, len - 0.03].forEach((e) => { legM.push(add(g, box(0.02, legs, 0.04, C.ink700), e, legs / 2, 0)); });
      const prop = add(g, box(0.05, 1, 0.05, WOOD2), 0.03, 0.5, 0); prop.visible = false;
      if (name) label(name, V(len * 0.5, 0.06, -0.06), { parent: inner, minor: true });
      const TOP = kind === 'chute' ? 0.009 : H + 0.004;
      let h = 0;
      const api = {
        group: g, inner, len, legs, top: TOP,
        // world point at distance s along the top (s from the start end), lifted by up
        at(s, up = 0) { return world(inner, V(s, TOP + up, 0)); },
        local(s, up = 0) { return V(s, TOP + up, 0); },
        dir() { inner.updateMatrixWorld(true); return V(1, 0, 0).applyQuaternion(inner.getWorldQuaternion(new THREE.Quaternion())).normalize(); },
        quat() { inner.updateMatrixWorld(true); return inner.getWorldQuaternion(new THREE.Quaternion()); },
        // raise the start end by hh metres (the far end stays on its legs)
        setTilt(hh) {
          h = hh; inner.position.y = legs + hh; inner.rotation.z = -Math.asin(Math.min(0.95, hh / len));
          prop.visible = hh > 0.002; prop.scale.y = legs + hh - 0.004; prop.position.y = (legs + hh - 0.004) / 2;
          return api;
        },
        get tilt() { return h; }
      };
      return api;
    }
    const track = (x, z, len, o = {}) => rail(x, z, len, { ...o, kind: 'track' });
    const chute = (x, z, len, o = {}) => rail(x, z, len, { ...o, kind: 'chute' });

    /* ---------- Cart (aravacha): body, 4 wheels, hooks; loads; followers ride along ---------- */
    function cart({ color = C.navy, name = 'Aravacha', len = 0.1, motor = false } = {}) {
      const g = group();
      const body = add(g, box(len, 0.03, 0.055, color, { roughness: 0.45 }), 0, 0.029, 0);
      add(g, box(len * 0.9, 0.004, 0.05, 0xF2F4F8), 0, 0.046, 0);
      const wheels = [];
      [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
        const w = add(g, new THREE.Group(), sx * len * 0.32, 0.012, sz * 0.03);
        const t = add(w, cyl(0.012, 0.008, C.ink, { roughness: 0.6 }, 20)); t.rotation.x = Math.PI / 2;
        add(w, box(0.016, 0.003, 0.0085, C.steel), 0, 0, 0);
        wheels.push(w);
      }));
      [-1, 1].forEach((s) => add(g, cyl(0.002, 0.012, C.steel, { metalness: 0.6 }, 8), s * (len / 2 + 0.006), 0.03, 0).rotation.z = Math.PI / 2);
      if (motor) { add(g, box(len * 0.5, 0.022, 0.035, 0x2E7D5B, { roughness: 0.5 }), 0, 0.059, 0); add(g, box(0.012, 0.008, 0.012, C.red), len * 0.18, 0.074, 0); }
      const loads = [];
      const lab = name ? label(name, V(0, 0.11, 0), { parent: g, minor: true }) : null;
      const followers = [];
      let s0 = 0;
      const api = {
        group: g, len, body, label: lab,
        put(rl, s) {
          g.position.copy(rl.at(s)); g.quaternion.copy(rl.quat());
          wheels.forEach((w) => { w.rotation.z = -(s - s0) / 0.012; });
          g.updateMatrixWorld(true);
          followers.forEach(([o, off]) => { o.position.copy(g.localToWorld(off.clone())); o.quaternion.copy(g.quaternion); });
          return api;
        },
        place(x, y, z) { g.position.set(x, y, z); g.updateMatrixWorld(true); followers.forEach(([o, off]) => { o.position.copy(g.localToWorld(off.clone())); o.quaternion.copy(g.quaternion); }); return api; },
        carry(obj, off) { followers.push([obj.group || obj, off]); return api; },
        setLoad(n, color = C.ink700) {
          while (loads.length < n) loads.push(add(g, box(len * 0.7, 0.016, 0.04, color, { metalness: 0.4, roughness: 0.4 }), 0, 0.057 + loads.length * 0.0175, 0));
          loads.forEach((l, i) => { l.visible = i < n; });
          if (lab) lab.position.y = 0.11 + n * 0.0175;
          return api;
        },
        front() { return world(g, V(len / 2 + 0.012, 0.03, 0)); },
        back() { return world(g, V(-len / 2 - 0.012, 0.03, 0)); },
        top(dx = 0) { return world(g, V(dx, 0.048, 0)); }
      };
      return api;
    }

    /* ---------- Dropper (tomizg‘ich) riding on a cart; drops stay on the track as blue spots ---------- */
    function dropper() {
      const g = group();
      add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.045, 20, 1, true), glass(0.35)), 0, 0.022, 0);
      const water = add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.0115, 0.0115, 0.03, 20), new THREE.MeshStandardMaterial({ color: WATER, transparent: true, opacity: 0.75 })), 0, 0.016, 0);
      add(g, new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.012, 20), glass(0.4)), 0, -0.006, 0).rotation.x = Math.PI;
      add(g, cyl(0.0125, 0.004, C.ink700), 0, 0.046, 0);
      const drop = add(g, sphere(0.003, WATER, { transparent: true, opacity: 0.9 }), 0, -0.014, 0); drop.visible = false;
      return { group: g, water, drip(t) { drop.visible = t > 0 && t < 1; drop.position.y = -0.014 - t * 0.03; } };
    }
    // Spots left on a rail (children of the rail, so they tilt and hide with it)
    function spots(rl, color = 0x2F6FE0) {
      const list = []; const m = new THREE.MeshStandardMaterial({ color, roughness: 0.3, transparent: true, opacity: 0.85 });
      return {
        clear() { list.forEach((s) => rl.inner.remove(s)); list.length = 0; },
        add(s) { const d = add(rl.inner, new THREE.Mesh(new THREE.CircleGeometry(0.0075, 18), m), s, rl.top + 0.0006, 0.012); d.rotation.x = -Math.PI / 2; list.push(d); return d; },
        get count() { return list.length; }
      };
    }

    /* ---------- Pulley (blok) on a clamp; thread runs over its top ---------- */
    function pulley(p, { r = 0.022 } = {}) {
      const g = group(p.x, p.y, p.z);
      const wheel = add(g, new THREE.Group());
      const disc = add(wheel, cyl(r, 0.008, ALU, { metalness: 0.55, roughness: 0.3 }, 32)); disc.rotation.x = Math.PI / 2;
      add(wheel, box(r * 1.6, 0.002, 0.0085, C.steel), 0, 0, 0);
      add(g, box(0.008, r + 0.03, 0.022, C.ink700), -r * 0.4, -(r + 0.03) / 2, 0);
      add(g, box(0.05, 0.012, 0.03, C.ink700), -r * 0.6, -r - 0.03, 0);
      return {
        group: g, r,
        get inTop() { return V(p.x, p.y + r, p.z); },
        get outSide() { return V(p.x + r, p.y, p.z); },
        spin(a) { wheel.rotation.z = -a; }
      };
    }

    /* ---------- Hanging pan with slotted weights (pallacha) ---------- */
    function pan({ name = 'Pallacha' } = {}) {
      const g = group();
      add(g, cyl(0.0012, 0.03, C.steel, {}, 6), 0, -0.015, 0);
      add(g, cyl(0.016, 0.003, C.steel, { metalness: 0.5 }), 0, -0.031, 0);
      const discs = [];
      const lab = label(name, V(0.05, -0.03, 0), { parent: g, minor: true });
      const api = {
        group: g, label: lab,
        set(n) {
          while (discs.length < n) discs.push(add(g, cyl(0.014, 0.006, C.ink700, { metalness: 0.4, roughness: 0.4 }), 0, -0.026 + discs.length * 0.0065, 0));
          discs.forEach((d, i) => { d.visible = i < n; });
          return api;
        },
        hangFrom(p) { g.position.copy(p); return api; }
      };
      return api;
    }

    /* ---------- Weight set: hooked brass weights lying by the setup (shown count n) ---------- */
    function weights(x, z, n = 3, { name = 'Yuklar', mass = '100 g' } = {}) {
      const g = group(x, 0, z); const items = [];
      for (let i = 0; i < 4; i++) {
        const w = add(g, new THREE.Group(), (i - 1.5) * 0.03, 0, 0);
        add(w, cyl(0.011, 0.03, 0xB89A4A, { metalness: 0.7, roughness: 0.3 }), 0, 0.015, 0);
        const hk = add(w, new THREE.Mesh(new THREE.TorusGeometry(0.004, 0.001, 6, 14), mat(C.steel)), 0, 0.034, 0);
        hk.rotation.x = Math.PI / 2; items.push(w);
      }
      label(`${name} (${mass})`, V(0, 0.07, 0), { parent: g, minor: true });
      const api = { group: g, items, set(m) { items.forEach((w, i) => { w.visible = i < m; }); return api; } };
      return api.set(n);
    }
    // One hooked weight (moves with a hook): not a tool on its own
    function hookWeight(color = 0xB89A4A, h = 0.03, r = 0.011) {
      const g = group(); add(g, cyl(r, h, color, { metalness: 0.7, roughness: 0.3 }), 0, -h / 2 - 0.006, 0);
      add(g, cyl(0.001, 0.006, C.steel, {}, 6), 0, -0.003, 0); return g;
    }

    /* ---------- Wooden block (brusok) with hook ---------- */
    function block({ w = 0.09, h = 0.035, d = 0.05, color = WOOD, name = 'Brusok' } = {}) {
      const g = group();
      add(g, box(w, h, d, color, { roughness: 0.85 }), 0, h / 2, 0);
      const hk = add(g, new THREE.Mesh(new THREE.TorusGeometry(0.005, 0.0012, 6, 16), mat(C.steel, { metalness: 0.6 })), w / 2 + 0.005, h * 0.5, 0); hk.rotation.y = Math.PI / 2;
      const loads = [];
      const lab = name ? label(name, V(0, h + 0.05, 0), { parent: g, minor: true }) : null;
      const api = {
        group: g, w, h, label: lab,
        hook() { return world(g, V(w / 2 + 0.01, h * 0.5, 0)); },
        put(rl, s) { g.position.copy(rl.at(s)); g.quaternion.copy(rl.quat()); g.updateMatrixWorld(true); return api; },
        setLoad(n) {
          while (loads.length < n) loads.push(add(g, cyl(0.013, 0.025, 0xB89A4A, { metalness: 0.7, roughness: 0.3 }), (loads.length - 0.5) * 0.03, h + 0.0125, 0));
          loads.forEach((l, i) => { l.visible = i < n; }); return api;
        }
      };
      return api;
    }

    /* ---------- Steel ball ---------- */
    function ball(r = 0.012, { color = 0xC9CED9, name } = {}) {
      const g = group();
      const m = add(g, sphere(r, color, { metalness: 0.85, roughness: 0.2 }), 0, r, 0);
      if (name) label(name, V(0, r * 2 + 0.03, 0), { parent: g, minor: true });
      return {
        group: g, r, mesh: m,
        put(p) { g.position.copy(p); return this; },
        onRail(rl, s) { g.position.copy(rl.at(s)); g.quaternion.copy(rl.quat()); m.rotation.z = -s / r; return this; }
      };
    }

    /* ---------- Metal cylinder stop at the end of a chute ---------- */
    function stopCylinder() {
      const g = group(); const c = add(g, cyl(0.016, 0.035, C.steel, { metalness: 0.7, roughness: 0.3 }), 0, 0.016, 0); c.rotation.x = Math.PI / 2;
      label('Silindr', V(0, 0.06, 0), { parent: g, minor: true });
      return { group: g, put(rl, s) { g.position.copy(rl.at(s, 0.0)); g.quaternion.copy(rl.quat()); return this; } };
    }

    /* ---------- Photogate (fotodatchik): U-frame across a rail, red beam flashes when cut ---------- */
    function photogate({ name = 'Fotodatchik' } = {}) {
      const g = group();
      [-1, 1].forEach((s) => add(g, box(0.012, 0.09, 0.012, C.navy, { roughness: 0.45 }), 0, 0.045, s * 0.055));
      add(g, box(0.012, 0.012, 0.122, C.navy), 0, 0.09, 0);
      const beamM = new THREE.MeshStandardMaterial({ color: C.red, emissive: C.red, emissiveIntensity: 0.4, transparent: true, opacity: 0.5 });
      const beam = add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, 0.1, 6), beamM), 0, 0.055, 0); beam.rotation.x = Math.PI / 2;
      [-1, 1].forEach((s) => add(g, cyl(0.004, 0.006, C.red, { emissive: C.red, emissiveIntensity: 0.6 }), 0, 0.055, s * 0.049).rotation.x = Math.PI / 2);
      const lab = label(name, V(0, 0.13, 0), { parent: g, minor: true });
      return {
        group: g, label: lab,
        put(rl, s) { g.position.copy(rl.at(s, -rl.top)); g.quaternion.copy(rl.quat()); return this; },
        cut(on) { beamM.emissiveIntensity = on ? 2.2 : 0.4; beamM.opacity = on ? 0.95 : 0.5; }
      };
    }

    /* ---------- Electronic stopwatch / timer with a digital screen ---------- */
    function timer(x, z, { name = 'Sekundomer', digits = 2 } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.12, 0.012, 0.06, C.ink700), 0, 0.006, 0);
      const dev = add(g, new THREE.Group(), 0, 0.012, 0); dev.rotation.x = -0.32;
      add(dev, box(0.11, 0.065, 0.03, C.navy, { roughness: 0.45 }), 0, 0.0325, 0);
      const cv = document.createElement('canvas'); cv.width = 320; cv.height = 128;
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
      add(dev, new THREE.Mesh(new THREE.PlaneGeometry(0.096, 0.038), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55 })), 0, 0.036, 0.0152);
      [-0.03, 0.03].forEach((bx) => add(dev, cyl(0.005, 0.006, bx < 0 ? 0x2E7D5B : C.red), bx, 0.068, 0));
      label(name, V(0, 0.12, 0), { parent: g, minor: true });
      let last = null;
      const api = {
        group: g,
        set(t, unit = 's') {
          const txt = `${fmt(t, digits)} ${unit}`; if (txt === last) return api; last = txt;
          const c = cv.getContext('2d'); c.fillStyle = '#0B1026'; c.fillRect(0, 0, 320, 128);
          let px = 76; c.font = `700 ${px}px ui-monospace, Menlo, monospace`;
          while (px > 30 && c.measureText(txt).width > 296) { px -= 4; c.font = `700 ${px}px ui-monospace, Menlo, monospace`; }
          c.fillStyle = '#7CF0B4'; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText(txt, 160, 68); tex.needsUpdate = true; return api;
        }
      };
      return api.set(0);
    }

    /* ---------- Holder stand (shtativ) with a clamp that follows a rail's raised end ---------- */
    function holder(x, z, { h = 0.34 } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.12, 0.014, 0.1, C.navy, { roughness: 0.5 }), 0, 0.007, -0.02);
      add(g, cyl(0.006, h, C.steel, { metalness: 0.55, roughness: 0.3 }), 0, h / 2, -0.04);
      const clamp = add(g, new THREE.Group(), 0, 0.1, -0.04);
      add(clamp, box(0.022, 0.02, 0.022, C.ink700));
      const arm = add(clamp, box(0.008, 0.008, 1, C.steel, { metalness: 0.55 }), 0, 0, 0.02);
      add(clamp, box(0.03, 0.012, 0.012, C.ink700), 0, 0, 0.04);
      return {
        group: g,
        // clamp the rail's raised start end (world point p)
        hold(p) { clamp.position.y = p.y - 0.004; const dz = p.z - (z - 0.04); arm.scale.z = Math.max(0.01, dz); arm.position.z = dz / 2; clamp.children[2].position.z = dz; return this; }
      };
    }

    /* ---------- Ruler / measuring tape (horizontal on the table or vertical on a stand) ---------- */
    function ruler(len = 0.5, { vertical = false, name = 'Chizg‘ich', width = 0.03 } = {}) {
      const g = group();
      const face = new THREE.MeshStandardMaterial({ map: tickTexture(len, { bg: '#FFF8E6', h: 96 }), roughness: 0.85 });
      const plain = mat(0xF2E3BF, { roughness: 0.85 });
      const m = add(g, new THREE.Mesh(new THREE.BoxGeometry(len, width, 0.003), [plain, plain, plain, plain, face, plain]), len / 2, width / 2, 0);
      m.castShadow = true;
      if (!vertical) { m.rotation.x = -Math.PI / 2; m.position.set(len / 2, 0.0016, -width / 2); }
      else { m.rotation.z = Math.PI / 2; m.position.set(0, len / 2, 0); }
      if (name) label(name, vertical ? V(0.04, len + 0.03, 0) : V(len / 2, 0.03, -0.05), { parent: g, minor: true });
      return { group: g, len, place(x, y, z, ry = 0) { g.position.set(x, y, z); g.rotation.y = ry; return this; } };
    }

    /* ---------- Coil spring with hook and pointer (vertical, hangs from a point) ---------- */
    function spring(top, { l0 = 0.1, turns = 14, r = 0.009, name = 'Prujina' } = {}) {
      const g = group(top.x, top.y, top.z);
      const m = mat(C.steel, { metalness: 0.7, roughness: 0.3 });
      let coil = null;
      const hook = add(g, new THREE.Group());
      add(hook, cyl(0.0012, 0.012, C.steel, {}, 6), 0, -0.006, 0);
      const ptr = add(hook, box(0.03, 0.002, 0.004, C.red), 0.02, 0, 0);
      const lab = name ? label(name, V(-0.05, -0.02, 0), { parent: g, minor: true }) : null;
      let L = -1;
      const api = {
        group: g, l0, pointer: ptr, label: lab,
        set(len) {
          if (Math.abs(len - L) < 1e-5) return api; L = len;
          if (coil) { g.remove(coil); coil.geometry.dispose(); }
          const pts = []; const N = turns * 24;
          for (let i = 0; i <= N; i++) { const u = i / N, a = u * turns * Math.PI * 2; pts.push(V(Math.cos(a) * r, -0.006 - u * (len - 0.012), Math.sin(a) * r)); }
          pts.unshift(V(0, 0, 0)); pts.push(V(0, -len, 0));
          coil = add(g, new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, 0.0011, 6, false), m)); coil.castShadow = true;
          hook.position.y = -len; return api;
        },
        end() { return world(g, V(0, -L - 0.012, 0)); }
      };
      return api.set(l0);
    }

    /* ---------- Water-filled glass tube with an air bubble, tilted on a stand ---------- */
    function bubbleTube(x, z, len = 1) {
      const g = group(x, 0, z);
      const pivot = add(g, new THREE.Group(), 0, 0.03, 0);
      const t = add(pivot, new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, len, 24, 1, true), glass(0.3)), len / 2, 0, 0); t.rotation.z = Math.PI / 2;
      const w = add(pivot, new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0125, len - 0.01, 24), new THREE.MeshStandardMaterial({ color: WATER, transparent: true, opacity: 0.45, roughness: 0.1, depthWrite: false })), len / 2, 0, 0); w.rotation.z = Math.PI / 2;
      [0, len].forEach((e) => { const c = add(pivot, cyl(0.016, 0.012, C.ink700), e, 0, 0); c.rotation.z = Math.PI / 2; });
      for (let i = 1; i < len * 10; i++) { const r = add(pivot, new THREE.Mesh(new THREE.TorusGeometry(0.0145, 0.0009, 4, 24), mat(C.red)), i * 0.1, 0, 0); r.rotation.y = Math.PI / 2; }
      const bub = add(pivot, new THREE.Mesh(new THREE.SphereGeometry(0.0105, 16, 12), new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 0.35, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.95 })), 0.05, 0.004, 0);
      bub.scale.set(1.6, 0.8, 1);
      add(g, box(0.05, 0.03, 0.06, C.ink700), 0, 0.015, 0);
      const arm = add(g, box(0.012, 1, 0.012, C.steel, { metalness: 0.5 }), len * 0.85, 0.5, -0.022);
      const armBase = add(g, box(0.08, 0.012, 0.07, C.navy), len * 0.85, 0.006, -0.022);
      const armClamp = add(g, box(0.02, 0.016, 0.03, C.ink700), len * 0.85, 0.3, -0.008);
      label('Suvli nay', V(len * 0.5, 0.09, 0), { parent: pivot, minor: true });
      return {
        group: g, pivot, len,
        setAngle(deg) { const a = THREE.MathUtils.degToRad(deg), ax = Math.cos(a) * len * 0.85, hEnd = 0.03 + Math.sin(a) * len * 0.85; arm.scale.y = hEnd; arm.position.set(ax, hEnd / 2, -0.022); armBase.position.x = ax; armClamp.position.set(ax, hEnd, -0.01); },
        setBubble(s) { bub.position.x = 0.03 + s; },
        at(s) { return world(pivot, V(0.03 + s, 0.02, 0)); }
      };
    }

    /* ---------- Newton's tube: tall glass tube with a steel ball and a feather; pump hose at the top ---------- */
    function newtonTube(x, z, len = 1) {
      const g = group(x, 0, z);
      add(g, box(0.14, 0.014, 0.1, C.navy, { roughness: 0.5 }), 0, 0.007, 0);
      add(g, cyl(0.006, len + 0.06, C.steel, { metalness: 0.55, roughness: 0.3 }), -0.05, (len + 0.06) / 2, 0);
      const pivot = add(g, new THREE.Group(), 0, 0.03 + len / 2, 0);
      add(pivot, new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, len, 28, 1, true), glass(0.26)));
      [-1, 1].forEach((s) => add(pivot, cyl(0.025, 0.02, C.ink700), 0, s * (len / 2 + 0.008), 0));
      [-1, 1].forEach((s) => add(g, box(0.05, 0.008, 0.008, C.steel), -0.03, 0.03 + len / 2 + s * len * 0.38, 0));
      const air = add(pivot, new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, len - 0.01, 24), new THREE.MeshStandardMaterial({ color: 0xBFD9F2, transparent: true, opacity: 0.18, depthWrite: false })));
      const b = add(pivot, sphere(0.011, 0xC9CED9, { metalness: 0.85, roughness: 0.2 }), -0.008, 0, 0);
      const f = add(pivot, new THREE.Group(), 0.009, 0, 0);
      const vane = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 8), new THREE.MeshStandardMaterial({ color: 0xF4E9D2, roughness: 0.9, side: THREE.DoubleSide }));
      vane.scale.set(0.5, 2.0, 0.1); add(f, vane, 0, 0.01, 0); add(f, cyl(0.0009, 0.05, 0xB8A27A, {}, 5), 0, 0.008, 0);
      label('Nyuton nayi', V(0.08, len * 0.85, 0), { parent: g, minor: true });
      const hosePt = V(x, 0.03 + len + 0.02, z);
      return {
        group: g, pivot, len, hosePt,
        setAir(level) { air.material.opacity = 0.04 + 0.16 * level; },
        // y0/y1: positions measured from the bottom cap, 0..len (ball, feather)
        set(yb, yf, flip = 0) { pivot.rotation.z = Math.PI * flip; b.position.y = -len / 2 + 0.01 + yb; f.position.y = -len / 2 + 0.014 + yf; f.rotation.z = Math.sin(yf * 40) * 0.5 * (1 - Math.min(1, yf)); }
      };
    }

    /* ---------- Vacuum pump with a pressure gauge and hose ---------- */
    function vacuumPump(x, z, hoseTo) {
      const g = group(x, 0, z);
      add(g, box(0.12, 0.07, 0.08, C.navy, { roughness: 0.5 }), 0, 0.035, 0);
      add(g, cyl(0.008, 0.05, C.steel, { metalness: 0.6 }), 0.03, 0.095, 0);
      const gauge = add(g, new THREE.Group(), -0.025, 0.09, 0.0);
      const face = add(gauge, cyl(0.022, 0.008, C.white, { roughness: 0.8 }), 0, 0, 0); face.rotation.x = Math.PI / 2;
      const nd = add(gauge, new THREE.Group(), 0, 0, 0.005); add(nd, box(0.0015, 0.018, 0.001, C.red), 0, 0.008, 0);
      const pts = [V(0.03, 0.12, 0), V(0.03, 0.2, 0)];
      if (hoseTo) pts.push(hoseTo.clone().sub(g.position).add(V(0, 0.08, 0)), hoseTo.clone().sub(g.position));
      add(g, new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.004, 8), mat(C.ink700, { roughness: 0.6 })));
      label('Nasos', V(0, 0.16, 0.05), { parent: g, minor: true });
      return { group: g, set(level) { nd.rotation.z = (0.5 - level) * 2.2; } };
    }

    /* ---------- Vertical spring launcher (prujinali to‘pponcha) ---------- */
    function launcher(x, z) {
      const g = group(x, 0, z);
      add(g, box(0.1, 0.014, 0.08, C.navy, { roughness: 0.5 }), 0, 0.007, 0);
      add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.09, 24, 1, true), mat(C.ink700, { side: THREE.DoubleSide })), 0, 0.059, 0);
      const plunger = add(g, cyl(0.014, 0.008, C.red), 0, 0.09, 0);
      add(g, box(0.008, 0.02, 0.008, C.amber), 0.03, 0.03, 0.03);
      label('Otish qurilmasi', V(0.08, 0.05, 0), { parent: g, minor: true });
      return { group: g, mouth: V(x, 0.104, z), set(c) { plunger.position.y = 0.09 - c * 0.05; } };
    }

    /* ---------- Metronome (beats the time) ---------- */
    function metronome(x, z) {
      const g = group(x, 0, z);
      add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.035, 0.11, 4), mat(0x6B4A2E, { roughness: 0.6 })), 0, 0.055, 0).rotation.y = Math.PI / 4;
      const arm = add(g, new THREE.Group(), 0, 0.02, 0.026);
      add(arm, box(0.003, 0.11, 0.002, C.steel, { metalness: 0.6 }), 0, 0.055, 0);
      add(arm, box(0.012, 0.01, 0.006, C.amber), 0, 0.08, 0);
      label('Metronom', V(0, 0.15, 0), { parent: g, minor: true });
      return { group: g, set(t, T = 1) { arm.rotation.z = Math.sin((t / T) * Math.PI) * 0.4; } };
    }

    /* ---------- Motion sensor (ultrasonic) at the end of a track ---------- */
    function motionSensor() {
      const g = group();
      add(g, box(0.05, 0.05, 0.06, C.navy, { roughness: 0.45 }), 0, 0.025, 0);
      const f = add(g, cyl(0.018, 0.004, 0xE8ECF5, { metalness: 0.3 }), 0.026, 0.025, 0); f.rotation.z = Math.PI / 2;
      label('Harakat datchigi', V(0, 0.09, 0), { parent: g, minor: true });
      return { group: g, put(rl, s) { g.position.copy(rl.at(s, -rl.top)); g.quaternion.copy(rl.quat()); return this; } };
    }

    /* ---------- Graph screen: a board with a live chart (series of points) ---------- */
    function chartBoard(x, y, z, { w = 0.5, h = 0.32, xMax = 1, yMax = 1, yMin = 0, xLabel = 't, s', yLabel = 's, m', xStep, yStep, name = 'Grafik' } = {}) {
      const g = group(x, 0, z);
      [-1, 1].forEach((s) => add(g, box(0.012, y, 0.012, C.ink700), s * (w / 2 - 0.02), y / 2, -0.01));
      add(g, box(w + 0.02, h + 0.02, 0.012, C.ink700), 0, y + h / 2, -0.012);
      const W = 1024, H = Math.round(1024 * h / w);
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      add(g, new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })), 0, y + h / 2, -0.005);
      if (name) label(name, V(0, y + h + 0.04, 0), { parent: g, minor: true });
      const ax = { xMax, yMax, yMin, xStep: xStep || xMax / 5, yStep: yStep || (yMax - yMin) / 4, xLabel, yLabel };
      const L = 120, R = 40, T = 40, B = 100;
      const px = (vx) => L + (vx / ax.xMax) * (W - L - R);
      const py = (vy) => H - B - ((vy - ax.yMin) / (ax.yMax - ax.yMin)) * (H - T - B);
      const dec = (st) => (st >= 1 ? 0 : st >= 0.1 ? 1 : 2);
      let series = [];
      function draw() {
        const c = cv.getContext('2d');
        c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, W, H);
        c.strokeStyle = '#E3E6EF'; c.lineWidth = 2; c.font = '600 30px Sora, system-ui, sans-serif'; c.fillStyle = '#3A4166';
        const y0 = py(Math.max(ax.yMin, Math.min(0, ax.yMax)));
        for (let v = 0; v <= ax.xMax + 1e-9; v += ax.xStep) { c.beginPath(); c.moveTo(px(v), py(ax.yMin)); c.lineTo(px(v), py(ax.yMax)); c.stroke(); c.textAlign = 'center'; c.fillText(fmt(v, dec(ax.xStep)), px(v), H - B + 40); }
        for (let v = ax.yMin; v <= ax.yMax + 1e-9; v += ax.yStep) { c.beginPath(); c.moveTo(px(0), py(v)); c.lineTo(px(ax.xMax), py(v)); c.stroke(); c.textAlign = 'right'; c.fillText(fmt(Math.abs(v) < 1e-9 ? 0 : v, dec(ax.yStep)), L - 14, py(v) + 10); }
        c.strokeStyle = '#0B1026'; c.lineWidth = 4; c.beginPath(); c.moveTo(px(0), py(ax.yMax)); c.lineTo(px(0), py(ax.yMin)); c.moveTo(px(0), y0); c.lineTo(px(ax.xMax), y0); c.stroke();
        c.fillStyle = '#0B1026'; c.font = '700 34px Sora, system-ui, sans-serif'; c.textAlign = 'right'; c.fillText(ax.xLabel, W - R, H - 18);
        c.textAlign = 'left'; c.fillText(ax.yLabel, 16, T + 4);
        series.forEach((s) => {
          if (!s.pts || !s.pts.length) return;
          const clampY = (b) => Math.max(ax.yMin, Math.min(b, ax.yMax));
          c.strokeStyle = s.color; c.lineWidth = 7; c.lineJoin = 'round'; c.setLineDash(s.dash ? [18, 14] : []); c.beginPath();
          s.pts.forEach(([a, b], i) => { const X = px(Math.min(a, ax.xMax)), Y = py(clampY(b)); if (i) c.lineTo(X, Y); else c.moveTo(X, Y); });
          c.stroke(); c.setLineDash([]);
          (s.dots || []).forEach(([a, b]) => { c.fillStyle = s.color; c.beginPath(); c.arc(px(a), py(clampY(b)), 11, 0, Math.PI * 2); c.fill(); });
          if (s.name) { const [a, b] = s.pts[s.pts.length - 1]; c.fillStyle = s.color; c.font = '700 32px Sora, system-ui, sans-serif'; c.textAlign = 'left'; c.fillText(s.name, Math.min(px(a) + 14, W - 140), py(clampY(b)) - 14); }
        });
        tex.needsUpdate = true;
      }
      draw();
      return {
        group: g,
        axes(o) { Object.assign(ax, o); if (o.xMax && !o.xStep) ax.xStep = ax.xMax / 5; if ((o.yMax !== undefined || o.yMin !== undefined) && !o.yStep) ax.yStep = (ax.yMax - ax.yMin) / 4; draw(); },
        set(list) { series = list; draw(); },
        clear() { series = []; draw(); }
      };
    }

    /* ---------- Balance (shayinli tarozi) or electronic scale ---------- */
    function scaleBal(x, z, { name = 'Tarozi' } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.16, 0.03, 0.12, C.navy, { roughness: 0.45 }), 0, 0.015, 0);
      add(g, cyl(0.055, 0.006, ALU, { metalness: 0.5 }), 0, 0.033, 0);
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 80;
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
      add(g, new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.022), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.5 })), 0, 0.016, 0.0605);
      label(name, V(0, 0.08, 0), { parent: g, minor: true });
      let last = null;
      const api = {
        group: g, top: V(x, 0.036, z),
        set(txt) { if (txt === last) return api; last = txt; const c = cv.getContext('2d'); c.fillStyle = '#0B1026'; c.fillRect(0, 0, 256, 80); c.fillStyle = '#7CF0B4'; let px = 52; c.font = `700 ${px}px ui-monospace, Menlo, monospace`; while (px > 24 && c.measureText(txt).width > 240) { px -= 4; c.font = `700 ${px}px ui-monospace, Menlo, monospace`; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 128, 44); tex.needsUpdate = true; return api; }
      };
      return api.set('0,00 kg');
    }

    /* ---------- Lab bench (stol): the floor is the big table; weights can hang over the bench edge ---------- */
    function bench(x0, x1, z = 0, H = 0.75, d = 0.42) {
      const g = group((x0 + x1) / 2, 0, z), w = x1 - x0;
      add(g, box(w, 0.03, d, 0xF4F5F9, { roughness: 0.8 }), 0, H - 0.015, 0);
      add(g, box(w, 0.012, d + 0.004, C.ink700), 0, H - 0.036, 0);
      [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => add(g, box(0.035, H - 0.04, 0.035, C.ink700), sx * (w / 2 - 0.03), (H - 0.04) / 2, sz * (d / 2 - 0.03))));
      return { group: g, top: H };
    }

    return Object.assign(k, {
      ALU, WOOD, WOOD2, WATER, glass2: glass, tickTexture, bench,
      thread, arrow, rail, track, chute, cart, dropper, spots, pulley, pan, weights, hookWeight, block, ball, stopCylinder,
      photogate, timer, holder, ruler, spring, bubbleTube, newtonTube, vacuumPump, launcher, metronome, motionSensor, chartBoard, scaleBal
    });
  };
})();
