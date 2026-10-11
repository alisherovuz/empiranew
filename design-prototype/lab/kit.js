// Empira — 3D equipment kit (8-sinf Fizika). Every tool is built once here and reused by the labs in labs-8.js.
// Style: low-poly, light lab table, navy instruments, Empira-blue wires, amber = "it works" (glow, lit lamp).
// Units: metres. Table top is y = 0. Each tool returns { group, terminals…, set…(value) }.

window.EMPIRA_KIT = function (THREE, scene) {
  const C = {
    table: 0xFFFFFF, gridMain: 0xD9DCE8, gridSub: 0xE9EBF2, board: 0xEEF0F5,
    ink: 0x0B1026, navy: 0x1C2347, ink700: 0x3A4166, steel: 0x5A6285, light: 0xDFE2EA,
    blue: 0x3B4CFF, amber: 0xFFB21E, white: 0xFFFFFF, red: 0xE5484D, copper: 0xB87333, beige: 0xE9DCC4
  };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...extra });
  const shade = (m) => { m.castShadow = m.receiveShadow = true; return m; };
  const box = (w, h, d, color, extra) => shade(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, extra)));
  const cyl = (r, h, color, extra, seg = 28) => shade(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat(color, extra)));
  const sphere = (r, color, extra) => shade(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat(color, extra)));
  const add = (parent, obj, x = 0, y = 0, z = 0) => { obj.position.set(x, y, z); parent.add(obj); return obj; };
  const world = (obj, local) => { obj.updateMatrixWorld(true); return obj.localToWorld(local.clone()); };
  const group = (x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); return g; };

  /* ---------- Labels: white pills, bold Lab Ink text, constant on-screen size ---------- */
  const labels = [];
  function drawLabel(sp, text, color, border) {
    const H = 128, font = '700 72px Sora, system-ui, sans-serif';
    const c = document.createElement('canvas'); const g = c.getContext('2d');
    g.font = font; const W = Math.ceil(g.measureText(text).width + 64);
    c.width = W; c.height = H; g.font = font;
    g.fillStyle = '#FFFFFF'; g.strokeStyle = border; g.lineWidth = 6;
    g.beginPath(); g.roundRect(3, 3, W - 6, H - 6, 28); g.fill(); g.stroke();
    g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2, H / 2 + 4);
    if (sp.material.map) sp.material.map.dispose();
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    sp.material.map = tex; sp.material.needsUpdate = true; sp.userData.ratio = W / H;
  }
  function label(text, pos, { color = '#0B1026', border = '#D9DCE8', parent = scene, minor = false } = {}) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false, depthWrite: false }));
    sp.renderOrder = 10; sp.userData.minor = minor;
    drawLabel(sp, text, color, border);
    sp.position.copy(pos); parent.add(sp); labels.push(sp);
    sp.setText = (t) => { if (sp.userData.text !== t) { sp.userData.text = t; drawLabel(sp, t, color, border); } };
    sp.userData.text = text;
    return sp;
  }
  const tmp = V(0, 0, 0);
  function sizeLabels(camera, viewH) {
    const px = Math.min(36, Math.max(24, viewH * 0.045));
    const k = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / viewH;
    labels.forEach((sp) => {
      sp.visible = !(sp.userData.minor && viewH < 420) && !sp.userData.hidden;
      const h = px * camera.position.distanceTo(sp.getWorldPosition(tmp)) * k;
      sp.scale.set(h * sp.userData.ratio, h, 1);
    });
  }

  /* ---------- Canvas faces (meter dials, stopwatch) ---------- */
  function faceTexture(draw, w = 256, h = 256) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }

  /* ---------- Table + board ---------- */
  function table() {
    const t = box(6, 0.06, 4, C.table); t.position.set(0.5, -0.03, 0); scene.add(t);
    const g = new THREE.GridHelper(6, 60, C.gridMain, C.gridSub); g.position.set(0.5, 0.0005, 0); scene.add(g);
  }
  const BY = 0.012; // board top
  function board(w, d, x = 0, z = 0) {
    const b = box(w, BY, d, C.board); b.position.set(x, BY / 2, z); scene.add(b);
    return BY;
  }
  const post = (parent, x, y, z, color = C.ink) => add(parent, cyl(0.0045, 0.012, color, { metalness: 0.4, roughness: 0.35 }, 12), x, y + 0.006, z);

  /* ---------- Wires (Empira Blue tubes between terminals) ---------- */
  const wires = new THREE.Group(); scene.add(wires);
  const wireMat = mat(C.blue, { roughness: 0.45 });
  function wire(a, b, lift = 0.035) {
    const mid = a.clone().lerp(b, 0.5); mid.y = Math.max(a.y, b.y) + lift;
    const curve = new THREE.CatmullRomCurve3([a, a.clone().setY(a.y + lift * 0.55), mid, b.clone().setY(b.y + lift * 0.55), b]);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.0028, 8, false), wireMat);
    m.castShadow = true; wires.add(m); return m;
  }
  function clearWires() { wires.children.slice().forEach((m) => { m.geometry.dispose(); wires.remove(m); }); }

  /* ---------- Power supply (lab bench supply with knob and +/− terminals) ---------- */
  function powerSupply(x, z) {
    const g = group(x, BY, z);
    add(g, box(0.2, 0.085, 0.12, C.light), 0, 0.0425, 0);
    add(g, box(0.2, 0.03, 0.002, C.navy), 0, 0.06, 0.061);
    const knob = add(g, cyl(0.014, 0.012, C.ink, { roughness: 0.4 }), 0.045, 0.091, 0.025);
    add(knob, box(0.003, 0.003, 0.012, C.white), 0, 0.007, 0.006); // knob mark
    const plus = post(g, -0.07, 0.085, 0.035, C.red), minus = post(g, -0.035, 0.085, 0.035, C.ink);
    const lab = label('4 V', V(0, 0.15, 0), { parent: g });
    return {
      group: g,
      get plus() { return world(g, V(-0.07, 0.097, 0.035)); }, get minus() { return world(g, V(-0.035, 0.097, 0.035)); },
      set(U) { lab.setText(`${String(U).replace('.', ',')} V`); knob.rotation.y = -U * 0.35; }
    };
  }

  /* ---------- Galvanic cells (1,5 V) in a holder, side by side ---------- */
  function cells(n, x, z) {
    const g = group(x, BY, z);
    add(g, box(0.06 * n + 0.02, 0.008, 0.07, C.ink700), 0, 0.004, 0);
    const out = [];
    for (let i = 0; i < n; i++) {
      const cx = (i - (n - 1) / 2) * 0.06;
      const body = add(g, cyl(0.014, 0.05, C.navy, { roughness: 0.5 }), cx, 0.022, 0); body.rotation.x = Math.PI / 2;
      const cap = add(g, cyl(0.006, 0.006, C.amber, {}, 12), cx, 0.022, -0.028); cap.rotation.x = Math.PI / 2;
      add(g, box(0.02, 0.002, 0.012, C.white), cx, 0.0365, 0.004);
      out.push({ get plus() { return world(g, V(cx, 0.03, -0.031)); }, get minus() { return world(g, V(cx, 0.03, 0.026)); } });
      label(`${i + 1}`, V(cx, 0.07, 0.0), { parent: g, minor: true });
    }
    return { group: g, cells: out };
  }

  /* ---------- Switch (kalit) ---------- */
  function switchK(x, z) {
    const g = group(x, BY, z);
    add(g, box(0.075, 0.012, 0.035, C.ink700), 0, 0.006, 0);
    post(g, -0.03, 0.012, 0); post(g, 0.03, 0.012, 0);
    const lever = add(g, new THREE.Group(), -0.03, 0.022, 0);
    add(lever, box(0.062, 0.005, 0.01, C.steel, { metalness: 0.5, roughness: 0.3 }), 0.031, 0, 0);
    label('K', V(0, 0.07, 0), { parent: g, minor: true });
    return {
      group: g, get a() { return world(g, V(-0.03, 0.024, 0)); }, get b() { return world(g, V(0.03, 0.024, 0)); },
      set(closed) { lever.rotation.z = closed ? 0 : THREE.MathUtils.degToRad(35); }
    };
  }

  /* ---------- Lamp on a holder (patron), glow ∝ brightness ---------- */
  function lamp(x, z, name, { color = C.amber } = {}) {
    const g = group(x, BY, z);
    add(g, box(0.07, 0.012, 0.045, C.ink700), 0, 0.006, 0);
    post(g, -0.026, 0.012, 0); post(g, 0.026, 0.012, 0);
    add(g, cyl(0.012, 0.02, C.steel, { metalness: 0.5, roughness: 0.3 }), 0, 0.022, 0);
    const bulb = add(g, new THREE.Group(), 0, 0, 0);            // glass + filament: can be unscrewed (setRemoved)
    const glass = add(bulb, new THREE.Mesh(new THREE.SphereGeometry(0.022, 28, 20),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.1 })), 0, 0.05, 0);
    const filMat = mat(color, { emissive: color, emissiveIntensity: 0 });
    add(bulb, new THREE.Mesh(new THREE.SphereGeometry(0.006, 12, 10), filMat), 0, 0.05, 0);
    add(bulb, cyl(0.011, 0.012, C.steel, { metalness: 0.6, roughness: 0.3 }), 0, 0.034, 0);
    const light = add(bulb, new THREE.PointLight(color, 0, 0.5, 2), 0, 0.05, 0);
    const lab = name ? label(name, V(0, 0.1, 0), { parent: g, minor: true }) : null;
    return {
      group: g, lab, get a() { return world(g, V(-0.026, 0.024, 0)); }, get b() { return world(g, V(0.026, 0.024, 0)); },
      set(b) { filMat.emissiveIntensity = b <= 0 ? 0 : 0.3 + 3 * b; light.intensity = 0.3 * b; glass.material.opacity = 0.35 + 0.25 * b; },
      setRemoved(r) { bulb.position.set(r ? 0.05 : 0, r ? 0.02 : 0, r ? 0.035 : 0); bulb.rotation.z = r ? -0.9 : 0; }
    };
  }

  /* ---------- Resistor on a holder ---------- */
  function resistor(x, z, name, len = 0.05) {
    const g = group(x, BY, z);
    add(g, box(0.1, 0.012, 0.03, C.ink700), 0, 0.006, 0);
    post(g, -0.04, 0.012, 0); post(g, 0.04, 0.012, 0);
    const body = add(g, cyl(0.009, len, C.beige, { roughness: 0.6 }, 20), 0, 0.026, 0); body.rotation.z = Math.PI / 2;
    [-0.3, -0.1, 0.1, 0.3].forEach((f, i) => { const b = add(g, cyl(0.0095, 0.004, i === 3 ? C.amber : C.ink, {}, 20), f * len, 0.026, 0); b.rotation.z = Math.PI / 2; });
    [-1, 1].forEach((s) => { const lead = add(g, cyl(0.0012, 0.04 - len / 2, C.steel, { metalness: 0.6 }, 8), s * (len / 2 + (0.04 - len / 2) / 2), 0.026, 0); lead.rotation.z = Math.PI / 2; });
    const lab = name ? label(name, V(0, 0.075, 0), { parent: g }) : null;
    return { group: g, lab, get a() { return world(g, V(-0.04, 0.024, 0)); }, get b() { return world(g, V(0.04, 0.024, 0)); } };
  }

  /* ---------- Rheostat: ceramic tube with winding, rod and slider ---------- */
  function rheostat(x, z) {
    const g = group(x, BY, z);
    [-0.12, 0.12].forEach((s) => add(g, box(0.02, 0.06, 0.04, C.ink700), s, 0.03, 0));
    const tube = add(g, cyl(0.018, 0.22, C.white, { roughness: 0.8 }), 0, 0.035, 0); tube.rotation.z = Math.PI / 2;
    for (let i = 0; i < 26; i++) { const r = add(g, cyl(0.0185, 0.0035, C.copper, { metalness: 0.5, roughness: 0.4 }, 20), -0.1 + i * 0.008, 0.035, 0); r.rotation.z = Math.PI / 2; }
    const rod = add(g, cyl(0.003, 0.24, C.steel, { metalness: 0.6, roughness: 0.3 }, 10), 0, 0.068, 0); rod.rotation.z = Math.PI / 2;
    const slider = add(g, new THREE.Group(), 0, 0, 0);
    add(slider, box(0.016, 0.014, 0.022, C.navy, { roughness: 0.45 }), 0, 0.068, 0);
    add(slider, box(0.004, 0.016, 0.004, C.steel, { metalness: 0.5 }), 0, 0.054, 0);
    post(g, -0.12, 0.06, 0.012); post(g, 0.12, 0.072, 0.0); post(g, 0.12, 0.06, 0.016);
    label('Reostat', V(0, 0.12, 0), { parent: g, minor: true });
    return {
      // a = left coil end, b = slider (via the rod), c = right coil end (for potentiometer wiring)
      group: g, get a() { return world(g, V(-0.12, 0.072, 0.012)); }, get b() { return world(g, V(0.12, 0.084, 0)); },
      get c() { return world(g, V(0.12, 0.072, 0.016)); },
      set(pos) { slider.position.x = -0.1 + 0.2 * pos; }   // pos 0 = most wire in circuit
    };
  }

  /* ---------- Meter (A, mA or V): navy body, dial face, needle ---------- */
  function meter(x, z, kind) {
    const g = group(x, BY, z);
    add(g, box(0.09, 0.045, 0.08, C.navy, { roughness: 0.5 }), 0, 0.0225, 0);
    const face = faceTexture((ctx, w, h) => {
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#3A4166'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(w / 2, h * 0.86, h * 0.62, Math.PI * 1.22, Math.PI * 1.78); ctx.stroke();
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI * (1.22 + 0.056 * i); const r1 = h * 0.62, r2 = h * (i % 5 === 0 ? 0.52 : 0.56);
        ctx.beginPath(); ctx.moveTo(w / 2 + Math.cos(a) * r1, h * 0.86 + Math.sin(a) * r1); ctx.lineTo(w / 2 + Math.cos(a) * r2, h * 0.86 + Math.sin(a) * r2); ctx.stroke();
      }
      ctx.fillStyle = '#0B1026'; ctx.font = '700 72px Sora, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(kind, w / 2, h * 0.72);
    });
    const plane = add(g, new THREE.Mesh(new THREE.PlaneGeometry(0.072, 0.06), new THREE.MeshStandardMaterial({ map: face, roughness: 0.9 })), 0, 0.0455, -0.004);
    plane.rotation.x = -Math.PI / 2;
    const needle = add(g, new THREE.Group(), 0, 0.047, 0.022);
    add(needle, box(0.0016, 0.0016, 0.042, C.red), 0, 0, -0.021);
    post(g, -0.025, 0.045, 0.03, C.red); post(g, 0.025, 0.045, 0.03, C.ink);
    const lab = label(kind, V(0, 0.1, 0), { parent: g });
    return {
      group: g, get a() { return world(g, V(-0.025, 0.057, 0.03)); }, get b() { return world(g, V(0.025, 0.057, 0.03)); },
      set(frac, text) { needle.rotation.y = THREE.MathUtils.degToRad(50 - 100 * Math.max(0, Math.min(1, frac))); if (text !== undefined) lab.setText(text); }
    };
  }

  /* ---------- Stopwatch (sekundomer) ---------- */
  function stopwatch(x, z) {
    const g = group(x, 0, z);
    add(g, cyl(0.032, 0.014, C.navy, { roughness: 0.4 }), 0, 0.007, 0);
    add(g, cyl(0.006, 0.01, C.steel, { metalness: 0.5 }), 0, 0.007, -0.036).rotation.x = Math.PI / 2;
    const face = faceTexture((ctx, w, h) => {
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3A4166'; ctx.lineWidth = 5;
      for (let i = 0; i < 60; i += 5) { const a = i / 60 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(w / 2 + Math.sin(a) * w * 0.44, h / 2 - Math.cos(a) * h * 0.44); ctx.lineTo(w / 2 + Math.sin(a) * w * 0.36, h / 2 - Math.cos(a) * h * 0.36); ctx.stroke(); }
    });
    const disc = add(g, new THREE.Mesh(new THREE.CircleGeometry(0.028, 40), new THREE.MeshStandardMaterial({ map: face, roughness: 0.9 })), 0, 0.0145, 0);
    disc.rotation.x = -Math.PI / 2;
    const hand = add(g, new THREE.Group(), 0, 0.016, 0);
    add(hand, box(0.0015, 0.0015, 0.024, C.red), 0, 0, -0.012);
    const lab = label('0,0 s', V(0, 0.07, 0), { parent: g });
    return { group: g, set(t) { hand.rotation.y = -t / 60 * Math.PI * 2; lab.setText(`${t.toFixed(1).replace('.', ',')} s`); } };
  }

  /* ---------- Coil (g‘altak) along x, removable iron core ---------- */
  function coil(x, z) {
    const g = group(x, BY, z);
    add(g, box(0.15, 0.012, 0.05, C.ink700), 0, 0.006, 0);
    const Y = 0.042;
    [-0.055, 0.055].forEach((s) => { const f = add(g, cyl(0.03, 0.006, C.navy), s, Y, 0); f.rotation.z = Math.PI / 2; });
    const wind = add(g, cyl(0.024, 0.104, C.copper, { metalness: 0.55, roughness: 0.35 }), 0, Y, 0); wind.rotation.z = Math.PI / 2;
    for (let i = 0; i < 14; i++) { const r = add(g, cyl(0.0245, 0.0018, 0x8A5426, {}, 20), -0.048 + i * 0.0074, Y, 0); r.rotation.z = Math.PI / 2; }
    const support = (s) => add(g, box(0.008, Y - 0.012, 0.03, C.ink700), s, (Y + 0.012) / 2, 0);
    support(-0.055); support(0.055);
    post(g, -0.065, 0.012, 0.018); post(g, 0.065, 0.012, 0.018);
    const core = add(g, cyl(0.009, 0.14, 0x9AA1BC, { metalness: 0.6, roughness: 0.35 }), 0, Y, 0); core.rotation.z = Math.PI / 2;
    const coreLabel = label('Temir o‘zak', V(0, 0.1, 0.07), { parent: g, minor: true });
    label('G‘altak', V(0, 0.1, 0), { parent: g });
    return {
      group: g, get a() { return world(g, V(-0.065, 0.024, 0.018)); }, get b() { return world(g, V(0.065, 0.024, 0.018)); },
      get end() { return world(g, V(0.06, Y, 0)); },
      setCore(inside) {
        if (inside) { core.position.set(0, Y, 0); core.rotation.set(0, 0, Math.PI / 2); coreLabel.userData.hidden = true; }
        else { core.position.set(0, 0.021, 0.07); core.rotation.set(0, 0, Math.PI / 2); coreLabel.userData.hidden = false; coreLabel.position.set(0, 0.07, 0.07); }
      }
    };
  }

  /* ---------- Compass (magnit strelkasi) ---------- */
  function compass(x, z) {
    const g = group(x, 0, z);
    add(g, cyl(0.03, 0.012, C.white, { roughness: 0.8 }), 0, 0.006, 0);
    const ring = add(g, new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.003, 8, 40), mat(C.navy)), 0, 0.012, 0); ring.rotation.x = Math.PI / 2;
    const needle = add(g, new THREE.Group(), 0, 0.016, 0);
    const half = (color, s) => { const m = add(needle, new THREE.Mesh(new THREE.ConeGeometry(0.005, 0.024, 4), mat(color)), s * 0.012, 0, 0); m.rotation.z = -s * Math.PI / 2; };
    half(C.red, 1); half(C.blue, -1);
    label('Kompas', V(0, 0.06, 0), { parent: g, minor: true });
    return { group: g, set(deg) { needle.rotation.y = THREE.MathUtils.degToRad(deg); } };
  }

  /* ---------- Bar magnet: N red, S blue ---------- */
  function barMagnet(len = 0.07, w = 0.018) {
    const g = new THREE.Group();
    const n = add(g, box(w, len / 2, w, C.red, { roughness: 0.5 }), 0, len / 4, 0);
    const s = add(g, box(w, len / 2, w, C.blue, { roughness: 0.5 }), 0, -len / 4, 0);
    g.userData.flip = (northUp) => { n.position.y = northUp ? len / 4 : -len / 4; s.position.y = northUp ? -len / 4 : len / 4; };
    return g;
  }

  /* ---------- Stand (shtativ) with arm ---------- */
  function stand(x, z, h = 0.42, armLen = 0.12) {
    const g = group(x, 0, z);
    add(g, box(0.16, 0.014, 0.12, C.navy, { roughness: 0.5 }), 0, 0.007, 0);
    add(g, cyl(0.006, h, C.steel, { metalness: 0.55, roughness: 0.3 }), -0.05, h / 2, 0);
    add(g, box(armLen, 0.01, 0.01, C.steel, { metalness: 0.55, roughness: 0.3 }), -0.05 + armLen / 2, h - 0.01, 0);
    add(g, box(0.022, 0.02, 0.02, C.ink700), -0.05, h - 0.01, 0);
    return { group: g, tip: V(x - 0.05 + armLen - 0.01, h - 0.015, z) };
  }

  /* ---------- Dynamometer: white tube with scale; hook moves down with force ---------- */
  function dynamometer(top) {
    const g = group(top.x, top.y, top.z);
    const face = faceTexture((ctx, w, h) => {
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#3A4166'; ctx.lineWidth = 3;
      for (let i = 0; i <= 20; i++) { const y = 20 + i * (h - 40) / 20; ctx.beginPath(); ctx.moveTo(i % 5 ? w * 0.55 : w * 0.3, y); ctx.lineTo(w * 0.85, y); ctx.stroke(); }
    }, 64, 256);
    const body = add(g, new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.14, 0.01), [mat(C.white), mat(C.white), mat(C.white), mat(C.white), new THREE.MeshStandardMaterial({ map: face }), mat(C.white)]), 0, -0.08, 0);
    body.castShadow = true;
    add(g, cyl(0.002, 0.012, C.steel), 0, -0.004, 0);
    const pointer = add(g, box(0.024, 0.003, 0.012, C.red), 0, -0.03, 0.002);
    const hook = add(g, new THREE.Group(), 0, -0.155, 0);
    add(hook, cyl(0.0015, 0.03, C.steel, { metalness: 0.5 }, 8), 0, -0.015, 0);
    const stem = add(g, cyl(0.0015, 1, C.steel, { metalness: 0.5 }, 8), 0, -0.15, 0);   // rod from the body to the hook
    return {
      group: g, hook,
      set(F) { const d = Math.min(0.1, F * 0.06); pointer.position.y = -0.03 - d; hook.position.y = -0.155 - d; stem.scale.y = d + 0.006; stem.position.y = -0.15 - (d + 0.006) / 2; }
    };
  }

  /* ---------- Electrophore machine: two discs, crank, metal ball conductor ---------- */
  function electrophore(x, z) {
    const g = group(x, 0, z);
    add(g, box(0.24, 0.03, 0.14, C.navy, { roughness: 0.5 }), 0, 0.015, 0);
    [-0.07, 0.07].forEach((s) => add(g, box(0.012, 0.13, 0.012, C.ink700), s, 0.095, -0.04));
    const discs = add(g, new THREE.Group(), 0, 0.15, -0.04);
    [-0.012, 0.012].forEach((dz) => {
      const d = add(discs, new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.004, 48),
        new THREE.MeshStandardMaterial({ color: 0xE8ECF5, roughness: 0.25, transparent: true, opacity: 0.85 })), 0, 0, dz);
      d.rotation.x = Math.PI / 2;
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; add(discs, box(0.012, 0.03, 0.001, 0xC9CED9, { metalness: 0.6 }), Math.cos(a) * 0.075, Math.sin(a) * 0.075, dz + Math.sign(dz) * 0.0025).rotation.z = a + Math.PI / 2; }
    });
    add(g, cyl(0.004, 0.03, C.steel), 0, 0.15, -0.012).rotation.x = Math.PI / 2;
    const crank = add(g, box(0.006, 0.05, 0.006, C.steel, { metalness: 0.5 }), 0, 0.13, 0.0);
    [-0.06, 0.06].forEach((s) => {
      add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 12), new THREE.MeshStandardMaterial({ color: 0xF2F4F8, transparent: true, opacity: 0.6 })), s, 0.09, 0.045);
      add(g, sphere(0.018, 0xC9CED9, { metalness: 0.8, roughness: 0.25 }), s, 0.155, 0.045);
    });
    label('Elektrofor mashina', V(0, 0.27, -0.04), { parent: g, minor: true });
    return { group: g, get ball() { return world(g, V(0.06, 0.155, 0.045)); }, set(angle) { discs.rotation.z = angle; crank.rotation.z = angle * 0.5; } };
  }

  /* ---------- Candle with a flame that leans (amber glow) ---------- */
  function candle(x, z) {
    const g = group(x, 0, z);
    add(g, cyl(0.025, 0.006, C.ink700), 0, 0.003, 0);
    add(g, cyl(0.012, 0.08, 0xF7F3EA, { roughness: 0.9 }), 0, 0.046, 0);
    add(g, cyl(0.0012, 0.01, C.ink), 0, 0.09, 0);
    const pivot = add(g, new THREE.Group(), 0, 0.093, 0);
    const flameMat = new THREE.MeshStandardMaterial({ color: C.amber, emissive: C.amber, emissiveIntensity: 1.6, transparent: true, opacity: 0.92 });
    const flame = add(pivot, new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.035, 16), flameMat), 0, 0.02, 0);
    add(pivot, new THREE.Mesh(new THREE.SphereGeometry(0.008, 16, 12), flameMat), 0, 0.004, 0);
    const light = add(pivot, new THREE.PointLight(C.amber, 0.35, 0.5, 2), 0, 0.02, 0);
    label('Sham', V(0, 0.18, 0), { parent: g, minor: true });
    let base = 0, t = 0;
    return {
      group: g, tip: V(x, 0.11, z),
      set(deg) { base = THREE.MathUtils.degToRad(deg); pivot.rotation.z = -base; },
      animate(dt) { t += dt; flame.scale.y = 1 + Math.sin(t * 17) * 0.06; light.intensity = 0.33 + Math.sin(t * 23) * 0.04; pivot.rotation.z = -base - Math.sin(t * 9) * 0.03; }
    };
  }

  /* ================= Chapter II–III tools ================= */
  const glassMat = () => new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, roughness: 0.08, depthWrite: false });

  /* ---------- Neon lamp: small glass tube, orange glow ---------- */
  function neonLamp(x, z, h = 0) {
    const g = group(x, BY + h, z);
    add(g, box(0.05, 0.01, 0.03, C.ink700), 0, 0.005, 0);
    const tube = add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.05, 20), glassMat()), 0, 0.012, 0); tube.rotation.z = Math.PI / 2;
    const glowMat = new THREE.MeshStandardMaterial({ color: 0xFF7A3D, emissive: 0xFF7A3D, emissiveIntensity: 0, transparent: true, opacity: 0.5 });
    const glow = add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.032, 16), glowMat), 0, 0.012, 0); glow.rotation.z = Math.PI / 2;
    [-0.022, 0.022].forEach((s) => add(g, cyl(0.002, 0.012, C.steel, { metalness: 0.6 }, 8), s, 0.012, 0).rotation.z = Math.PI / 2);
    const light = add(g, new THREE.PointLight(0xFF7A3D, 0, 0.3, 2), 0, 0.02, 0);
    label('Neon lampa', V(0, 0.06, 0), { parent: g, minor: true });
    return {
      group: g, get a() { return world(g, V(-0.028, 0.012, 0)); }, get b() { return world(g, V(0.028, 0.012, 0)); },
      set(b) { glowMat.emissiveIntensity = 2.5 * b; glowMat.opacity = 0.5 + 0.4 * b; light.intensity = 0.25 * b; }
    };
  }

  /* ---------- Volta cell: beaker, electrolyte, two metal plates ---------- */
  const METAL = { zn: 0xB9BEC8, cu: C.copper };
  function voltaCell(x, z) {
    const g = group(x, BY, z);
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.046, 0.11, 32, 1, true), glassMat()), 0, 0.055, 0);
    add(g, cyl(0.046, 0.003, 0xE8ECF5, { transparent: true, opacity: 0.6 }), 0, 0.0015, 0);
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.045, 0.075, 32), new THREE.MeshStandardMaterial({ color: 0xBFD4F2, transparent: true, opacity: 0.45, roughness: 0.1, depthWrite: false })), 0, 0.04, 0);
    const pm = [mat(METAL.zn, { metalness: 0.7, roughness: 0.35 }), mat(METAL.cu, { metalness: 0.7, roughness: 0.35 })];
    const plates = [-0.022, 0.022].map((s, i) => add(g, new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.12, 0.05), pm[i]), s, 0.075, 0));
    plates.forEach((p) => { p.castShadow = true; });
    const labs = [label('Zn', V(-0.022, 0.16, 0), { parent: g, minor: true }), label('Cu', V(0.022, 0.16, 0), { parent: g, minor: true })];
    label('Sulfat kislota eritmasi', V(0, 0.02, 0.075), { parent: g, minor: true });
    return {
      group: g, get a() { return world(g, V(-0.022, 0.136, 0)); }, get b() { return world(g, V(0.022, 0.136, 0)); },
      setMetals(left, right) { [left, right].forEach((m, i) => { pm[i].color.setHex(METAL[m]); labs[i].setText(m === 'zn' ? 'Zn' : 'Cu'); }); }
    };
  }

  /* ---------- Wire board (qisqichli taxta): one wire, clip sets the length ---------- */
  const WIRE_COLOR = { mis: C.copper, nikelin: 0xA9AFBF, nixrom: 0x6B7186 };
  function wireBoard(x, z, span = 0.42) {
    const g = group(x, BY, z);
    add(g, box(span + 0.06, 0.016, 0.07, 0xD8CBB0, { roughness: 0.85 }), 0, 0.008, 0);
    for (let i = 0; i <= 3; i++) { add(g, box(0.003, 0.002, 0.03, C.ink700), -span / 2 + i * span / 3, 0.017, 0.022); }
    post(g, -span / 2, 0.016, 0); post(g, span / 2, 0.016, 0);
    const wMat = mat(WIRE_COLOR.nixrom, { metalness: 0.7, roughness: 0.35 });
    const wireMesh = add(g, new THREE.Mesh(new THREE.CylinderGeometry(1, 1, span, 12), wMat), 0, 0.03, 0); wireMesh.rotation.z = Math.PI / 2;
    const clip = add(g, new THREE.Group(), 0, 0, 0);
    add(clip, box(0.012, 0.016, 0.014, C.red, { roughness: 0.5 }), 0, 0.03, 0);
    let clipX = span / 2;
    ['0', '0,5 m', '1 m', '1,5 m'].forEach((t, i) => label(t, V(-span / 2 + i * span / 3, 0.05, 0.04), { parent: g, minor: true }));
    return {
      group: g, get a() { return world(g, V(-span / 2, 0.028, 0)); }, get b() { return world(g, V(clipX, 0.04, 0)); },
      setWire(material, S) { wMat.color.setHex(WIRE_COLOR[material]); const r = S >= 1 ? 0.0028 : 0.0018; wireMesh.scale.set(r, 1, r); },
      setLength(frac) { clipX = -span / 2 + span * frac; clip.position.x = clipX; }
    };
  }

  /* ---------- Flat capacitor: two plates on insulating stands ---------- */
  function capacitor(x, z) {
    const g = group(x, BY, z);
    const plateMat = mat(0xC9CED9, { metalness: 0.8, roughness: 0.25 });
    const mk = () => { const p = add(g, new THREE.Group(), 0, 0, 0); add(p, cyl(0.004, 0.06, 0xF2F4F8, { transparent: true, opacity: 0.7 }, 12), 0, 0.03, 0); add(p, box(0.03, 0.006, 0.03, C.ink700), 0, 0.003, 0); const pl = add(p, new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.1, 0.1), plateMat), 0, 0.11, 0); pl.castShadow = true; return p; };
    const left = mk(), right = mk();
    const diel = add(g, box(0.003, 0.11, 0.11, 0xBFD4F2, { transparent: true, opacity: 0.55, roughness: 0.1 }), 0, 0.11, 0);
    const dielLabel = label('Shisha', V(0, 0.185, 0.03), { parent: g, minor: true });
    label('Kondensator', V(0.06, 0.05, 0.07), { parent: g, minor: true });
    return {
      group: g, get a() { return world(left, V(0, 0.07, 0)); }, get b() { return world(right, V(0, 0.07, 0)); },
      set(dmm, areaFrac, glass) {
        const half = 0.002 + dmm * 0.004;                       // visual gap ∝ d
        left.position.x = -half; right.position.x = half;
        right.position.y = (1 - areaFrac) * 0.07;                // less overlap = smaller area
        diel.visible = glass; dielLabel.userData.hidden = !glass; diel.scale.x = Math.max(1, (2 * half - 0.004) / 0.003);
      }
    };
  }

  /* ---------- Calorimeter: beaker of water, heating spiral, thermometer ---------- */
  function calorimeter(x, z) {
    const g = group(x, BY, z);
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.12, 32, 1, true), glassMat()), 0, 0.06, 0);
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.049, 0.09, 32), new THREE.MeshStandardMaterial({ color: 0xBFD4F2, transparent: true, opacity: 0.4, depthWrite: false })), 0, 0.045, 0);
    add(g, cyl(0.058, 0.008, C.ink700), 0, 0.124, 0);
    const pts = []; for (let i = 0; i <= 200; i++) { const t = i / 200, a = t * Math.PI * 14; pts.push(V(Math.cos(a) * 0.014 - 0.015, 0.03 + t * 0.05, Math.sin(a) * 0.014)); }
    const spiralMat = mat(0x6B7186, { emissive: 0xFF6A3D, emissiveIntensity: 0, metalness: 0.5 });
    add(g, new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 300, 0.0018, 6, false), spiralMat));
    [-0.03, 0.0].forEach((s) => add(g, cyl(0.0015, 0.06, C.steel, { metalness: 0.6 }, 8), s, 0.1, 0));
    post(g, -0.03, 0.128, 0); post(g, 0.0, 0.128, 0);
    // thermometer
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.2, 12), glassMat()), 0.028, 0.13, 0);
    add(g, sphere(0.006, 0xE5484D), 0.028, 0.035, 0);
    const col = add(g, cyl(0.0018, 1, 0xE5484D, {}, 8), 0.028, 0.04, 0);
    const tLab = label('20,0 °C', V(0.07, 0.2, 0), { parent: g });
    return {
      group: g, get a() { return world(g, V(-0.03, 0.14, 0)); }, get b() { return world(g, V(0, 0.14, 0)); },
      setTemp(T) { const h = 0.04 + (T - 15) * 0.0035; col.scale.y = h; col.position.y = 0.035 + h / 2; tLab.setText(`${T.toFixed(1).replace('.', ',')} °C`); },
      setHeat(b) { spiralMat.emissiveIntensity = 0.6 * b; }
    };
  }

  /* ---------- Wall socket + screwdriver-type voltage tester ---------- */
  function socketTester(x, z) {
    const g = group(x, 0, z);
    add(g, box(0.3, 0.26, 0.02, 0xF2F4F8, { roughness: 0.9 }), 0, 0.13, -0.05);
    add(g, box(0.09, 0.09, 0.012, C.white, { roughness: 0.6 }), 0, 0.14, -0.034);
    const holes = [-0.02, 0.02].map((s) => add(g, cyl(0.005, 0.004, C.ink, {}, 16), s, 0.14, -0.027));
    holes.forEach((h) => { h.rotation.x = Math.PI / 2; });
    label('Rozetka (220 V)', V(0, 0.22, -0.03), { parent: g, minor: true });
    const tool = add(g, new THREE.Group(), 0, 0, 0);
    const tip = add(tool, cyl(0.0018, 0.035, C.steel, { metalness: 0.7 }, 8), 0, 0, 0.018); tip.rotation.x = Math.PI / 2;
    const handle = add(tool, new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 16), new THREE.MeshStandardMaterial({ color: 0xFFD27A, transparent: true, opacity: 0.55, roughness: 0.2 })), 0, 0, 0.08); handle.rotation.x = Math.PI / 2;
    const neonMat = new THREE.MeshStandardMaterial({ color: 0xFF7A3D, emissive: 0xFF7A3D, emissiveIntensity: 0 });
    add(tool, new THREE.Mesh(new THREE.SphereGeometry(0.004, 12, 8), neonMat), 0, 0, 0.065);
    const light = add(tool, new THREE.PointLight(0xFF7A3D, 0, 0.06, 2), 0, 0, 0.065);
    const tLab = label('Indikator', V(0, 0.035, 0.1), { parent: tool, minor: true });
    return {
      group: g,
      setTool(holeX, inFrac) { tool.position.set(holeX, 0.14, -0.027 + 0.03 + (1 - inFrac) * 0.06); },
      setGlow(b) { neonMat.emissiveIntensity = 3 * b; light.intensity = 0.03 * b; }
    };
  }

  /* ================= Chapter V tools (magnetism) ================= */

  /* ---------- Small compass needle (for arrays / field maps) ---------- */
  function needle(x, z, y = 0.004, size = 1) {
    const g = group(x, y, z);
    add(g, cyl(0.012 * size, 0.003, C.white, { roughness: 0.8 }, 20), 0, 0.0015, 0);
    const n = add(g, new THREE.Group(), 0, 0.006, 0);
    const half = (color, sgn) => { const m = add(n, new THREE.Mesh(new THREE.ConeGeometry(0.0035 * size, 0.011 * size, 4), mat(color)), sgn * 0.0055 * size, 0, 0); m.rotation.z = -sgn * Math.PI / 2; };
    half(C.red, 1); half(C.blue, -1);
    return { group: g, set(rad) { n.rotation.y = rad; } };   // rad: angle of the N end in the x–z plane (0 = +x)
  }

  /* ---------- Bar magnet lying on the table (N red at +x) ---------- */
  function flatMagnet(x, z, len = 0.12) {
    const g = group(x, 0, z);
    const nM = add(g, box(len / 2, 0.016, 0.026, C.red, { roughness: 0.5 }), len / 4, 0.008, 0);
    const sM = add(g, box(len / 2, 0.016, 0.026, C.blue, { roughness: 0.5 }), -len / 4, 0.008, 0);
    const lN = label('N', V(len / 4, 0.035, 0), { parent: g }), lS = label('S', V(-len / 4, 0.035, 0), { parent: g });
    return { group: g, setFlip(f) { nM.position.x = f ? -len / 4 : len / 4; sM.position.x = f ? len / 4 : -len / 4; lN.position.x = nM.position.x; lS.position.x = sM.position.x; } };
  }

  /* ---------- Field lines of a dipole drawn on a card (iron filings look) ---------- */
  function fieldLines(x, z, len = 0.12) {
    const g = group(x, 0.0015, z);
    const m = new THREE.LineBasicMaterial({ color: 0x5A6285, transparent: true, opacity: 0.75 });
    const B = (px, pz) => {           // 2-D field of two opposite poles at ±len/2
      const f = (cx, sgn) => { const dx = px - cx, dz = pz, r3 = Math.pow(dx * dx + dz * dz, 1.5) + 1e-9; return [sgn * dx / r3, sgn * dz / r3]; };
      const a = f(len / 2, 1), b = f(-len / 2, -1); return [a[0] + b[0], a[1] + b[1]];
    };
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      let px = len / 2 + Math.cos(ang) * 0.008, pz = Math.sin(ang) * 0.008; const pts = [V(px, 0, pz)];
      for (let s = 0; s < 220; s++) {
        const [bx, bz] = B(px, pz); const n = Math.hypot(bx, bz); if (!n) break;
        px += (bx / n) * 0.003; pz += (bz / n) * 0.003; pts.push(V(px, 0, pz));
        if (Math.hypot(px + len / 2, pz) < 0.008 || Math.abs(px) > 0.3 || Math.abs(pz) > 0.2) break;
      }
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), m));
    }
    g.visible = false;
    return { group: g, field: B, show(v) { g.visible = v; } };
  }

  /* ---------- Horseshoe magnet (U-shape, N red / S blue arms) ---------- */
  function horseshoe(x, z, gap = 0.08, h = 0.1) {
    const g = group(x, 0, z);
    add(g, box(0.03, 0.02, gap + 0.06, C.ink700), 0, 0.01, 0);
    const armN = add(g, box(0.03, h, 0.03, C.red, { roughness: 0.5 }), 0, 0.02 + h / 2, gap / 2 + 0.015);
    const armS = add(g, box(0.03, h, 0.03, C.blue, { roughness: 0.5 }), 0, 0.02 + h / 2, -gap / 2 - 0.015);
    label('N', V(0, h + 0.05, gap / 2 + 0.015), { parent: g }); label('S', V(0, h + 0.05, -gap / 2 - 0.015), { parent: g });
    return { group: g, armN, armS, top: 0.02 + h };
  }

  /* ---------- Swinging conductor hung on two wires (Ampère) ---------- */
  function swing(x, z, y0, len = 0.1, drop = 0.09) {
    const pivot = group(x, y0, z);
    const arm = add(pivot, new THREE.Group(), 0, 0, 0);
    [-len / 2, len / 2].forEach((s) => add(arm, cyl(0.0012, drop, C.steel, { metalness: 0.6 }, 6), s, -drop / 2, 0));
    const rod = add(arm, cyl(0.004, len + 0.01, C.copper, { metalness: 0.6, roughness: 0.3 }, 12), 0, -drop, 0); rod.rotation.z = Math.PI / 2;
    add(pivot, cyl(0.003, len + 0.08, C.steel, { metalness: 0.6 }, 8), 0, 0, 0).rotation.z = Math.PI / 2;
    return { group: pivot, get a() { return world(pivot, V(-len / 2 - 0.04, 0, 0)); }, get b() { return world(pivot, V(len / 2 + 0.04, 0, 0)); }, set(rad) { arm.rotation.x = rad; } };
  }

  /* ---------- Frame (ramka) on an axle with spring + pointer, between magnet poles ---------- */
  function frameMeter(x, z) {
    const g = group(x, BY, z);
    const poleN = add(g, box(0.035, 0.08, 0.05, C.red, { roughness: 0.5 }), -0.07, 0.06, 0);
    const poleS = add(g, box(0.035, 0.08, 0.05, C.blue, { roughness: 0.5 }), 0.07, 0.06, 0);
    label('N', V(-0.07, 0.12, 0), { parent: g }); label('S', V(0.07, 0.12, 0), { parent: g });
    const rot = add(g, new THREE.Group(), 0, 0.06, 0);
    const fm = mat(C.copper, { metalness: 0.6, roughness: 0.3 });
    [[0, 0.035, 0.06, 0.004], [0, -0.035, 0.06, 0.004]].forEach(([bx, by, w, t]) => add(rot, new THREE.Mesh(new THREE.BoxGeometry(t, t, w), fm), bx, by, 0));
    [-0.03, 0.03].forEach((zz) => add(rot, new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.07, 0.004), fm), 0, 0, zz));
    add(g, cyl(0.002, 0.12, C.steel, { metalness: 0.6 }, 8), 0, 0.06, 0);
    const ptr = add(rot, box(0.002, 0.002, 0.07, C.ink), 0, 0.06, 0.035);
    // scale arc
    const arc = add(g, new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.0015, 6, 40, Math.PI * 0.8), mat(C.ink700)), 0, 0.12, 0);
    arc.rotation.x = -Math.PI / 2; arc.rotation.z = Math.PI * 0.1;
    add(g, box(0.05, 0.004, 0.012, C.white), 0, 0.122, 0.075);
    label('0', V(0, 0.14, 0.085), { parent: g, minor: true });
    post(g, -0.03, 0, 0.07); post(g, 0.03, 0, 0.07);
    return { group: g, get a() { return world(g, V(-0.03, 0.012, 0.07)); }, get b() { return world(g, V(0.03, 0.012, 0.07)); }, set(rad) { rot.rotation.y = rad; } };
  }

  /* ---------- Electromagnet (vertical coil with core) + paper clips ---------- */
  function liftMagnet(x, z, h = 0.3) {
    const st = stand(x, z, h, 0.19);
    const g = group(st.tip.x, st.tip.y - 0.01, st.tip.z);
    add(g, cyl(0.014, 0.08, 0x9AA1BC, { metalness: 0.6, roughness: 0.35 }), 0, -0.05, 0);
    const wind = add(g, cyl(0.022, 0.06, C.copper, { metalness: 0.55, roughness: 0.35 }), 0, -0.05, 0);
    label('Elektromagnit', V(0.07, -0.02, 0), { parent: g, minor: true });
    const clips = [];
    const clipMat = mat(0xC9CED9, { metalness: 0.8, roughness: 0.3 });
    for (let i = 0; i < 24; i++) {
      const c = new THREE.Mesh(new THREE.TorusGeometry(0.006, 0.0012, 6, 16), clipMat); c.castShadow = true;
      c.scale.set(1, 1.8, 1); scene.add(c); clips.push(c);
    }
    const tray = add(group(st.tip.x, 0, st.tip.z), box(0.1, 0.006, 0.08, C.ink700), 0.01, 0.003, 0);
    const pile = (c, i) => { c.position.set(st.tip.x - 0.035 + (i % 8) * 0.013, 0.008, st.tip.z - 0.025 + Math.floor(i / 8) * 0.025); c.rotation.set(Math.PI / 2, 0, (i * 0.7) % 3); };
    const lifted = (c, i) => { c.position.set(st.tip.x + ((i % 5) - 2) * 0.008, st.tip.y - 0.105 - Math.floor(i / 5) * 0.016, st.tip.z + (((i * 7) % 3) - 1) * 0.006); c.rotation.set(0, (i * 1.3) % 3, 0); };
    return { group: g, wind, set(n, p = 1) { clips.forEach((c, i) => (i < n && p >= 1 ? lifted(c, i) : pile(c, i))); }, setTurns(f) { wind.scale.set(1, f, 1); } };
  }

  /* ---------- DC motor model: stator magnets, rotor coil, commutator, brushes ---------- */
  function motor(x, z) {
    const g = group(x, BY, z);
    add(g, box(0.2, 0.012, 0.12, C.ink700), 0, 0.006, 0);
    const pN = add(g, box(0.03, 0.09, 0.07, C.red, { roughness: 0.5 }), -0.07, 0.057, 0);
    const pS = add(g, box(0.03, 0.09, 0.07, C.blue, { roughness: 0.5 }), 0.07, 0.057, 0);
    const lN = label('N', V(-0.07, 0.12, 0), { parent: g }), lS = label('S', V(0.07, 0.12, 0), { parent: g });
    const rot = add(g, new THREE.Group(), 0, 0.06, 0);
    const fm = mat(C.copper, { metalness: 0.6, roughness: 0.3 });
    [0.035, -0.035].forEach((yy) => add(rot, new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.006, 0.08), fm), 0, yy, 0));
    [0.04, -0.04].forEach((zz) => add(rot, new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.076, 0.006), fm), 0, 0, zz));
    add(rot, cyl(0.0025, 0.15, C.steel, { metalness: 0.6 }, 8), 0, 0, 0).rotation.x = Math.PI / 2;
    const comm = add(rot, cyl(0.008, 0.016, 0xB87333, { metalness: 0.7 }, 16), 0, 0, 0.062); comm.rotation.x = Math.PI / 2;
    [-1, 1].forEach((s) => add(g, box(0.006, 0.02, 0.006, C.ink), s * 0.011, 0.06, 0.062));
    post(g, -0.03, 0.012, 0.05); post(g, 0.03, 0.012, 0.05);
    label('Rotor', V(0, 0.15, -0.03), { parent: g, minor: true });
    return {
      group: g, get a() { return world(g, V(-0.03, 0.024, 0.05)); }, get b() { return world(g, V(0.03, 0.024, 0.05)); },
      spin(d) { rot.rotation.z += d; }
    };
  }

  /* ================= Chapter I tools (electrostatics) ================= */

  /* ---------- Rubbing rod: glass (+) or ebonite (−), with a charge-sign pill ---------- */
  const rodMats = {
    shisha: () => new THREE.MeshStandardMaterial({ color: 0xDCE6F5, roughness: 0.1, metalness: 0.05, transparent: true, opacity: 0.7 }),
    ebonit: () => mat(0x23262F, { roughness: 0.4 })
  };
  function chargeRod(len = 0.2) {
    const g = new THREE.Group(); scene.add(g);
    const body = add(g, shade(new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, len, 20), rodMats.shisha())), 0, 0, 0);
    body.rotation.z = Math.PI / 2;
    const plus = label('+ + +', V(len / 2 - 0.03, 0.025, 0), { parent: g, color: '#E5484D' });
    const minus = label('− − −', V(len / 2 - 0.03, 0.025, 0), { parent: g, color: '#3B4CFF' });
    let k = 'shisha', shown = true;
    const sync = () => { plus.userData.hidden = !shown || k !== 'shisha'; minus.userData.hidden = !shown || k === 'shisha'; };
    sync();
    return {
      group: g, len,
      setKind(kind) { k = kind; body.material = rodMats[kind](); sync(); },
      showSign(v) { shown = v; sync(); }
    };
  }

  /* ---------- Rod hung by its middle on a thread from a stand; turns about the thread ---------- */
  function hangingRod(x, z, h = 0.34) {
    const st = stand(x, z, h, 0.16);
    const drop = 0.1;
    add(group(st.tip.x, st.tip.y - drop / 2, st.tip.z), cyl(0.0008, drop, C.ink700, {}, 6));
    const r = chargeRod(0.2);
    r.group.position.set(st.tip.x, st.tip.y - drop, st.tip.z);
    return { group: r.group, tip: V(st.tip.x, st.tip.y - drop, st.tip.z), setKind: r.setKind, set(rad) { r.group.rotation.y = rad; } };
  }

  /* ---------- Electroscope: glass jar, metal rod with ball, two foil leaves ---------- */
  function electroscope(x, z) {
    const g = group(x, 0, z);
    add(g, box(0.12, 0.012, 0.12, C.navy, { roughness: 0.5 }), 0, 0.006, 0);
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.13, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0xE8EEF8, roughness: 0.1, transparent: true, opacity: 0.35, side: THREE.DoubleSide })), 0, 0.077, 0);
    add(g, cyl(0.022, 0.016, C.ink700), 0, 0.15, 0);
    add(g, cyl(0.0025, 0.12, 0x9AA1BC, { metalness: 0.7, roughness: 0.3 }, 10), 0, 0.15, 0);
    add(g, sphere(0.014, 0xC9CED9, { metalness: 0.8, roughness: 0.25 }), 0, 0.215, 0);
    const foil = new THREE.MeshStandardMaterial({ color: 0xE8C76A, metalness: 0.7, roughness: 0.35, side: THREE.DoubleSide });
    const leaves = [-1, 1].map((s) => { const p = add(g, new THREE.Group(), 0, 0.09, 0); add(p, new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.05), foil), 0, -0.025, 0.002 * s); return { p, s }; });
    label('Elektroskop', V(0, 0.27, 0), { parent: g, minor: true });
    return { group: g, get ball() { return world(g, V(0, 0.215, 0)); }, set(deg) { leaves.forEach(({ p, s }) => { p.rotation.z = s * THREE.MathUtils.degToRad(deg / 2); }); } };
  }

  /* ---------- Coulomb torsion balance: glass case, thread, beam with ball, fixed ball ---------- */
  function torsionBalance(x, z) {
    const g = group(x, 0, z), R = 0.075, Y = 0.1;
    add(g, cyl(0.12, 0.012, C.navy, { roughness: 0.5 }), 0, 0.006, 0);
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.17, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0xE8EEF8, roughness: 0.1, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false })), 0, 0.097, 0);
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.112, 0.112, 0.006, 48), new THREE.MeshStandardMaterial({ color: 0xE8EEF8, roughness: 0.1, transparent: true, opacity: 0.3, depthWrite: false })), 0, 0.186, 0);
    const rim = add(g, new THREE.Mesh(new THREE.TorusGeometry(0.112, 0.003, 6, 64), mat(C.ink700)), 0, 0.186, 0); rim.rotation.x = Math.PI / 2;
    add(g, cyl(0.016, 0.01, C.ink700), 0, 0.19, 0);
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0xE8EEF8, roughness: 0.1, transparent: true, opacity: 0.35, side: THREE.DoubleSide })), 0, 0.27, 0);
    const head = add(g, new THREE.Group(), 0, 0.355, 0);
    add(head, cyl(0.024, 0.014, C.ink700), 0, 0, 0); add(head, box(0.006, 0.006, 0.03, C.red), 0, 0.009, 0.012);
    add(g, cyl(0.0006, 0.26, C.ink700, {}, 6), 0, Y + 0.13, 0);
    const beam = add(g, new THREE.Group(), 0, Y, 0);
    add(beam, box(R + 0.04, 0.003, 0.003, 0xF2F4F8), 0, 0, 0).position.x = 0.0;
    add(beam, sphere(0.009, 0xC9CED9, { metalness: 0.8, roughness: 0.25 }), R, 0, 0);
    add(beam, cyl(0.016, 0.004, C.ink700), -0.055, 0, 0).rotation.z = Math.PI / 2;
    add(g, cyl(0.002, 0.09, 0xF2F4F8, {}, 8), R, Y + 0.045, 0);
    add(g, sphere(0.009, 0xC9CED9, { metalness: 0.8, roughness: 0.25 }), R, Y, 0);
    // degree scale ring on the glass
    const ring = add(g, new THREE.Mesh(new THREE.TorusGeometry(0.111, 0.0012, 6, 72), mat(C.ink700)), 0, Y, 0); ring.rotation.x = Math.PI / 2;
    for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; add(g, box(0.001, i % 3 ? 0.006 : 0.012, 0.001, C.ink700), Math.cos(a) * 0.111, Y, Math.sin(a) * 0.111); }
    return {
      group: g,
      set(rM, headDeg = 0) { const phi = 2 * Math.asin(Math.min(0.95, rM / (2 * R))); beam.rotation.y = phi; head.rotation.y = THREE.MathUtils.degToRad(headDeg); }
    };
  }

  /* ---------- Field-line fibres in an oil dish around electrodes ---------- */
  function fieldFibres(x, z) {
    const g = group(x, 0, z), Rd = 0.13;
    add(g, cyl(Rd + 0.01, 0.01, C.light, { roughness: 0.4 }), 0, 0.005, 0);
    add(g, new THREE.Mesh(new THREE.CylinderGeometry(Rd, Rd, 0.002, 64), new THREE.MeshStandardMaterial({ color: 0xF5E9C8, roughness: 0.15, transparent: true, opacity: 0.85 })), 0, 0.011, 0);
    const cfgs = {
      bir: { q: [[0, 0, 1]] },
      qarama: { q: [[-0.05, 0, 1], [0.05, 0, -1]] },
      birxil: { q: [[-0.05, 0, 1], [0.05, 0, 1]] },
      plast: { q: [...Array(13)].flatMap((_, i) => [[-0.05, -0.06 + i * 0.01, 1], [0.05, -0.06 + i * 0.01, -1]]), plates: true }
    };
    const els = {};
    Object.entries(cfgs).forEach(([k, c]) => {
      const eg = add(g, new THREE.Group(), 0, 0, 0); els[k] = eg;
      if (c.plates) { add(eg, box(0.006, 0.03, 0.13, C.red, { metalness: 0.4 }), -0.05, 0.026, 0); add(eg, box(0.006, 0.03, 0.13, C.blue, { metalness: 0.4 }), 0.05, 0.026, 0); }
      else c.q.forEach(([qx, qz, s]) => add(eg, sphere(0.009, s > 0 ? C.red : C.blue, { metalness: 0.3, roughness: 0.4 }), qx, 0.02, qz));
    });
    const fm = mat(0x3A2E1C, { roughness: 0.8 });
    const fibres = [];
    for (let ix = -12; ix <= 12; ix++) for (let iz = -12; iz <= 12; iz++) {
      const px = ix * 0.0098 + (iz % 2) * 0.004, pz = iz * 0.0098;
      if (Math.hypot(px, pz) > Rd - 0.008) continue;
      const m = add(g, new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.0012, 0.0012), fm), px, 0.013, pz);
      fibres.push({ m, px, pz, a0: ((ix * 7 + iz * 13) % 10) / 10 * Math.PI, a1: 0, show: true });
    }
    let cur = 'bir';
    return {
      group: g,
      set(cfg) {
        cur = cfg; Object.entries(els).forEach(([k, eg]) => { eg.visible = k === cfg; });
        const c = cfgs[cfg];
        fibres.forEach((f) => {
          let ex = 0, ez = 0, near = false;
          c.q.forEach(([qx, qz, s]) => { const dx = f.px - qx, dz = f.pz - qz, r2 = dx * dx + dz * dz; if (r2 < 0.012 * 0.012) near = true; ex += s * dx / r2; ez += s * dz / r2; });
          if (c.plates && Math.abs(Math.abs(f.px) - 0.05) < 0.007 && Math.abs(f.pz) < 0.07) near = true;
          f.m.visible = !near; f.a1 = Math.atan2(-ez, ex);
          let d = f.a1 - f.a0; d = ((d + Math.PI / 2) % Math.PI + Math.PI) % Math.PI - Math.PI / 2; f.a1 = f.a0 + d;
          f.m.rotation.y = f.a0;
        });
      },
      align(p) { fibres.forEach((f) => { f.m.rotation.y = f.a0 + (f.a1 - f.a0) * p; }); }
    };
  }

  return {
    C, V, THREE, mat, box, cyl, sphere, add, group, label, sizeLabels, table, board, BY,
    wire, clearWires, powerSupply, cells, switchK, lamp, resistor, rheostat, meter, stopwatch,
    coil, compass, barMagnet, stand, dynamometer, electrophore, candle,
    neonLamp, voltaCell, wireBoard, capacitor, calorimeter, socketTester, glassMat, world, post,
    needle, flatMagnet, fieldLines, horseshoe, swing, frameMeter, liftMagnet, motor,
    chargeRod, hangingRod, electroscope, torsionBalance, fieldFibres, faceTexture
  };
};
