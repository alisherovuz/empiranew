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
  function lamp(x, z, name) {
    const g = group(x, BY, z);
    add(g, box(0.07, 0.012, 0.045, C.ink700), 0, 0.006, 0);
    post(g, -0.026, 0.012, 0); post(g, 0.026, 0.012, 0);
    add(g, cyl(0.012, 0.02, C.steel, { metalness: 0.5, roughness: 0.3 }), 0, 0.022, 0);
    const glass = add(g, new THREE.Mesh(new THREE.SphereGeometry(0.022, 28, 20),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.1 })), 0, 0.05, 0);
    const filMat = mat(C.amber, { emissive: C.amber, emissiveIntensity: 0 });
    add(g, new THREE.Mesh(new THREE.SphereGeometry(0.006, 12, 10), filMat), 0, 0.05, 0);
    const light = add(g, new THREE.PointLight(C.amber, 0, 0.5, 2), 0, 0.05, 0);
    if (name) label(name, V(0, 0.1, 0), { parent: g, minor: true });
    return {
      group: g, get a() { return world(g, V(-0.026, 0.024, 0)); }, get b() { return world(g, V(0.026, 0.024, 0)); },
      set(b) { filMat.emissiveIntensity = b <= 0 ? 0 : 0.3 + 3 * b; light.intensity = 0.3 * b; glass.material.opacity = 0.35 + 0.25 * b; }
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
    if (name) label(name, V(0, 0.075, 0), { parent: g });
    return { group: g, get a() { return world(g, V(-0.04, 0.024, 0)); }, get b() { return world(g, V(0.04, 0.024, 0)); } };
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
    post(g, -0.12, 0.06, 0.012); post(g, 0.12, 0.072, 0.0);
    label('Reostat', V(0, 0.12, 0), { parent: g, minor: true });
    return {
      group: g, get a() { return world(g, V(-0.12, 0.072, 0.012)); }, get b() { return world(g, V(0.12, 0.084, 0)); },
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

  return {
    C, V, THREE, mat, box, cyl, sphere, add, group, label, sizeLabels, table, board, BY,
    wire, clearWires, powerSupply, cells, switchK, lamp, resistor, rheostat, meter, stopwatch,
    coil, compass, barMagnet, stand, dynamometer, electrophore, candle
  };
};
