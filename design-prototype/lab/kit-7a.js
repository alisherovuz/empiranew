// Empira — 3D equipment for the 7-sinf labs of chapters I and III (§1, §3, §4, §15–§17; labs-7a.js).
// Same style and units as kit.js / kit-7.js (metres, table top y = 0, navy instruments, amber = "it works").
// Every tool is one top-level group, so Build Mode can hide it until the student puts it on the table.
(function () {
  const ICON = {
    walkerToy: '<circle cx="12" cy="4.5" r="2"/><path d="M12 7v7"/><path d="M8 10.5h8"/><path d="M12 14l-3 6"/><path d="M12 14l3 6"/>',
    gridMat: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M9 4v16"/><path d="M15 4v16"/><path d="M3 10h18"/><path d="M3 15h18"/>',
    toyCar: '<path d="M3 16h18v-3l-3-4H8l-3 4H3z"/><circle cx="7.5" cy="17" r="1.8"/><circle cx="16.5" cy="17" r="1.8"/><path d="M12 9V3"/>',
    waterChannel: '<path d="M3 5v14h18V5"/><path d="M5 10c2-1.5 3 1.5 5 0s3 1.5 5 0 3 1.5 4 0"/><path d="M5 14.5c2-1.5 3 1.5 5 0s3 1.5 5 0 3 1.5 4 0"/>',
    toyBoat: '<path d="M3 14h18l-3 5H6z"/><path d="M8 14V9h6v5"/><path d="M11 9V5"/>',
    rotatingDisk: '<ellipse cx="12" cy="10" rx="9" ry="4"/><path d="M12 10h7"/><path d="M12 14v5"/><path d="M8 20h8"/>',
    bigProtractor: '<path d="M3 17a9 9 0 0 1 18 0z"/><path d="M12 17 7 10"/><path d="M12 8v2"/><path d="M5.6 10.6l1.4 1.4"/><path d="M18.4 10.6 17 12"/>',
    spinAxle: '<path d="M12 4v14"/><path d="M12 5h7"/><circle cx="19.5" cy="5" r="1.5"/><rect x="7" y="18" width="10" height="3" rx="1"/><path d="M4 9a8 3 0 0 0 16 0"/>',
    catchWall: '<rect x="13" y="3" width="5" height="18" rx="1"/><path d="M3 12h7"/><path d="m8 9.5 2.5 2.5L8 14.5"/>'
  };
  window.EMPIRA_KIT_TYPES = Object.assign(window.EMPIRA_KIT_TYPES || {}, {
    walkerToy: { name: 'Yuruvchi o‘yinchoq', icon: ICON.walkerToy, domain: 'k' },
    gridMat: { name: 'Katakli vatman', icon: ICON.gridMat, domain: 'k' },
    toyCar: { name: 'Flomasterli o‘yinchoq mashina', icon: ICON.toyCar, domain: 'k' },
    waterChannel: { name: 'Oqimli suv novi', icon: ICON.waterChannel, domain: 'k' },
    toyBoat: { name: 'O‘yinchoq qayiq', icon: ICON.toyBoat, domain: 'k' },
    rotatingDisk: { name: 'Aylanuvchi disk', icon: ICON.rotatingDisk, domain: 'k' },
    bigProtractor: { name: 'Katta transportir', icon: ICON.bigProtractor, domain: 'k' },
    spinAxle: { name: 'Elektr yuritmali aylantirgich', icon: ICON.spinAxle, domain: 'k' },
    catchWall: { name: 'Himoya devori', icon: ICON.catchWall, domain: 'k' }
  });

  const base = window.EMPIRA_KIT;
  window.EMPIRA_KIT = function (THREE, scene) {
    const k = base(THREE, scene);
    const { C, V, mat, box, cyl, sphere, add, group, label } = k;
    const WOOD = 0xD9B98C, WATER = 0x9CC7F2;
    const flat = (m) => { m.rotation.x = -Math.PI / 2; return m; };
    const canvasTex = (w, h) => {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 2;
      return { cv, ctx: cv.getContext('2d'), tex };
    };
    const FONT = 'Sora, system-ui, sans-serif';

    /* ---------- Wind-up walking toy (odamcha): legs and arms swing while it walks; faces +x (dir 1) or −x (dir −1) ---------- */
    function walkerToy({ name = 'O‘yinchoq', color = C.red } = {}) {
      const g = group();
      const body = add(g, new THREE.Group());
      const legs = [-1, 1].map((s) => {
        const p = add(body, new THREE.Group(), 0, 0.03, s * 0.0065);
        add(p, box(0.0065, 0.026, 0.0065, C.navy), 0, -0.013, 0);
        add(p, box(0.013, 0.004, 0.0085, C.ink), 0.003, -0.028, 0);
        return p;
      });
      add(body, box(0.015, 0.026, 0.021, color, { roughness: 0.5 }), 0, 0.044, 0);
      const arms = [-1, 1].map((s) => { const p = add(body, new THREE.Group(), 0, 0.054, s * 0.0135); add(p, box(0.005, 0.02, 0.005, color), 0, -0.01, 0); return p; });
      add(body, sphere(0.0085, 0xF2D3B1, { roughness: 0.6 }), 0, 0.066, 0);
      add(body, cyl(0.009, 0.004, C.navy), 0, 0.074, 0);
      const key = add(body, new THREE.Group(), -0.011, 0.046, 0);
      add(key, box(0.006, 0.002, 0.002, C.steel), -0.003, 0, 0);
      add(key, box(0.002, 0.012, 0.004, C.amber), -0.006, 0, 0);
      const lab = label(name, V(0, 0.12, 0), { parent: g, minor: true });
      const api = {
        group: g, label: lab,
        place(p, dir = 1) { g.position.copy(p); body.rotation.y = dir > 0 ? 0 : Math.PI; return api; },
        walk(ph) { const a = Math.sin(ph) * 0.55; legs[0].rotation.z = a; legs[1].rotation.z = -a; arms[0].rotation.z = -a * 0.8; arms[1].rotation.z = a * 0.8; key.rotation.x = ph * 0.5; return api; }
      };
      return api.walk(0);
    }

    /* ---------- Squared paper (katakli vatman) on the table: 10 sm cells; a lake, letters, marker traces drawn on it ----------
       Local coordinates are metres from the mat centre (x to the right, z towards the viewer). */
    function gridMat(x, z, w, d, { name = 'Katakli vatman', cell = 0.1, lake = null, points = [], px = 1400, labelAt } = {}) {
      const g = group(x, 0, z);
      const W = px, H = Math.round(px * d / w), s = W / w;
      const { cv, ctx, tex } = canvasTex(W, H);
      const P = (lx, lz) => [(lx + w / 2) * s, (lz + d / 2) * s];
            const plane = add(g, flat(new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92 }))), 0, 0.0022, 0);
      plane.receiveShadow = true;
      function base() {
        ctx.setLineDash([]);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#C9CED9'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, W - 6, H - 6);
        const fine = cell / 2;
        ctx.strokeStyle = '#E4E9F6'; ctx.lineWidth = 2;
        for (let gx = 0; gx <= w + 1e-6; gx += fine) { ctx.beginPath(); ctx.moveTo(gx * s, 0); ctx.lineTo(gx * s, H); ctx.stroke(); }
        for (let gz = 0; gz <= d + 1e-6; gz += fine) { ctx.beginPath(); ctx.moveTo(0, gz * s); ctx.lineTo(W, gz * s); ctx.stroke(); }
        ctx.strokeStyle = '#A9B8E8'; ctx.lineWidth = 3;
        for (let gx = 0; gx <= w + 1e-6; gx += cell) { ctx.beginPath(); ctx.moveTo(gx * s, 0); ctx.lineTo(gx * s, H); ctx.stroke(); }
        for (let gz = 0; gz <= d + 1e-6; gz += cell) { ctx.beginPath(); ctx.moveTo(0, gz * s); ctx.lineTo(W, gz * s); ctx.stroke(); }
        if (lake) {
          const [cx, cz] = P(lake.x, lake.z), r = lake.r * s;
          ctx.fillStyle = '#BFDDF7'; ctx.strokeStyle = '#6FA3DA'; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(cx - r, cz);
          for (let i = 0; i <= 48; i++) { const a = Math.PI - (i / 48) * Math.PI, rr = r * (1 + 0.035 * Math.sin(i * 0.5) + 0.02 * Math.sin(i * 1.3)); ctx.lineTo(cx + rr * Math.cos(a), cz - rr * Math.sin(a) * 0.92); }
          ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#3F78B8'; ctx.font = `700 ${Math.round(0.03 * s)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(lake.text || 'Ko‘l', cx, cz - r * 0.45);
        }
        ctx.fillStyle = '#5A6285'; ctx.font = `600 ${Math.round(0.022 * s)}px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('1 katak = 10 sm', 0.012 * s, 0.01 * s);
        points.forEach(([t, px0, pz0]) => {
          const [X, Y] = P(px0, pz0);
          ctx.fillStyle = '#0B1026'; ctx.beginPath(); ctx.arc(X, Y, 0.007 * s, 0, Math.PI * 2); ctx.fill();
          ctx.font = `800 ${Math.round(0.038 * s)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(t, X - 0.03 * s, Y + 0.028 * s);
        });
        tex.needsUpdate = true;
      }
      base();
      label(name, labelAt || V(-w / 2 + 0.1, 0.03, -d / 2 - 0.03), { parent: g, minor: true });
      const api = {
        group: g, w, d,
        clear() { base(); return api; },
        // polyline in local metres [[x, z], …]
        line(pts, { color = '#E5484D', width = 0.005, dash = null } = {}) {
          if (pts.length < 2) return api;
          ctx.strokeStyle = color; ctx.lineWidth = width * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash(dash ? dash.map((q) => q * s) : []);
          ctx.beginPath(); pts.forEach(([a, b], i) => { const [X, Y] = P(a, b); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }); ctx.stroke();
          ctx.setLineDash([]); tex.needsUpdate = true; return api;
        },
        circle(cx, cz, r, opts = {}) { const pts = []; for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2; pts.push([cx + r * Math.cos(a), cz - r * Math.sin(a)]); } return api.line(pts, opts); },
        dot(px0, pz0, { color = '#FFB21E', r = 0.008 } = {}) { const [X, Y] = P(px0, pz0); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X, Y, r * s, 0, Math.PI * 2); ctx.fill(); tex.needsUpdate = true; return api; },
        world(lx, lz, y = 0.003) { return V(x + lx, y, z + lz); }
      };
      return api;
    }

    /* ---------- Toy car with a felt-tip marker through its centre (it leaves a trace on the paper) ---------- */
    function toyCar({ name = 'Mashina', color = C.red } = {}) {
      const g = group();
      const body = add(g, new THREE.Group());
      add(body, box(0.076, 0.016, 0.038, color, { roughness: 0.45 }), 0, 0.018, 0);
      add(body, box(0.036, 0.015, 0.032, 0xDCE6F7, { roughness: 0.15, metalness: 0.1 }), -0.008, 0.033, 0);
      add(body, box(0.006, 0.006, 0.03, 0xFFE9A8, { emissive: 0xFFE9A8, emissiveIntensity: 0.3 }), 0.037, 0.02, 0);
      const wheels = [];
      [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => { const w = add(body, cyl(0.009, 0.006, C.ink, { roughness: 0.6 }, 16), sx * 0.024, 0.009, sz * 0.021); w.rotation.x = Math.PI / 2; wheels.push(w); }));
      add(body, cyl(0.0032, 0.058, 0x2B3A78, { roughness: 0.4 }, 12), 0, 0.03, 0);
      add(body, cyl(0.0034, 0.008, C.red, {}, 12), 0, 0.062, 0);
      add(body, new THREE.Mesh(new THREE.ConeGeometry(0.0032, 0.004, 10), mat(C.red)), 0, 0.0015, 0).rotation.x = Math.PI;
      label(name, V(0, 0.1, 0), { parent: g, minor: true });
      let travelled = 0;
      const api = {
        group: g,
        // (x, z) world point under the marker; heading: angle of travel (0 = +x, π/2 = away from the viewer)
        place(px0, pz0, heading = 0, dist) { g.position.set(px0, 0.0024, pz0); body.rotation.y = heading; if (dist !== undefined) { travelled = dist; wheels.forEach((w) => { w.rotation.y = -travelled / 0.009; }); } return api; }
      };
      return api;
    }

    /* ---------- Transparent water channel (oqimli nov): flow along +x, banks along x, 10 sm grid on the bottom; pump at the left end ---------- */
    function waterChannel(x, z, { len = 1.0, width = 0.48, depth = 0.045, name = 'Oqimli suv novi' } = {}) {
      const g = group(x, 0, z);
      const B = 0.008, Hw = 0.07, T = 0.006, surf = B + depth;
      add(g, box(len + 2 * T, B, width + 2 * T, 0xF4F5F9, { roughness: 0.85 }), 0, B / 2, 0);
      const { cv, ctx, tex } = canvasTex(1600, Math.round(1600 * width / len));
      const s = cv.width / len;
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.strokeStyle = '#E0E6F4'; ctx.lineWidth = 2;
      for (let q = 0; q <= len + 1e-6; q += 0.05) { ctx.beginPath(); ctx.moveTo(q * s, 0); ctx.lineTo(q * s, cv.height); ctx.stroke(); }
      for (let q = 0; q <= width + 1e-6; q += 0.05) { const Y = cv.height - q * s; ctx.beginPath(); ctx.moveTo(0, Y); ctx.lineTo(cv.width, Y); ctx.stroke(); }
      ctx.strokeStyle = '#9FB0E3'; ctx.lineWidth = 4;
      for (let q = 0; q <= len + 1e-6; q += 0.1) { ctx.beginPath(); ctx.moveTo(q * s, 0); ctx.lineTo(q * s, cv.height); ctx.stroke(); }
      for (let q = 0.04; q <= width + 1e-6; q += 0.1) { const Y = cv.height - q * s; ctx.beginPath(); ctx.moveTo(0, Y); ctx.lineTo(cv.width, Y); ctx.stroke(); }
      tex.needsUpdate = true;
      add(g, flat(new THREE.Mesh(new THREE.PlaneGeometry(len, width), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }))), 0, B + 0.0006, 0).receiveShadow = true;
      const glass = new THREE.MeshStandardMaterial({ color: 0xE8EEF8, roughness: 0.08, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide });
      [-1, 1].forEach((sg) => {
        add(g, new THREE.Mesh(new THREE.BoxGeometry(len + 2 * T, Hw, T), glass), 0, Hw / 2, sg * (width / 2 + T / 2));
        add(g, box(len + 2 * T, 0.005, T + 0.002, C.navy), 0, Hw, sg * (width / 2 + T / 2));
        add(g, box(T, Hw, width + 2 * T, C.ink700, { roughness: 0.5 }), sg * (len / 2 + T / 2), Hw / 2, 0);
      });
      const water = add(g, new THREE.Mesh(new THREE.BoxGeometry(len, depth, width), new THREE.MeshStandardMaterial({ color: WATER, transparent: true, opacity: 0.38, roughness: 0.1, depthWrite: false })), 0, B + depth / 2, 0);
      water.renderOrder = 1;
      // pump (nasos) that drives the current, at the left end
      const pump = add(g, new THREE.Group(), -len / 2 - 0.06, 0, -width / 2 + 0.06);
      add(pump, box(0.07, 0.055, 0.08, C.navy, { roughness: 0.45 }), 0, 0.0275, 0);
      add(pump, cyl(0.007, 0.05, C.ink700, {}, 10), 0.035, 0.04, 0).rotation.z = Math.PI / 2;
      add(pump, box(0.014, 0.008, 0.014, 0x2E7D5B), -0.012, 0.059, 0.02);
      // floating bits that show the current
      const bits = []; const bm = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 });
      for (let i = 0; i < 34; i++) {
        const h1 = (Math.sin(i * 12.9898 + 1.7) * 43758.5453) % 1, h2 = (Math.sin(i * 78.233 + 4.1) * 24634.6345) % 1;
        const m = add(g, flat(new THREE.Mesh(new THREE.CircleGeometry(0.0045 + (i % 3) * 0.0015, 10), bm)), -len / 2 + Math.abs(h1) * len, surf + 0.0008, (Math.abs(h2) - 0.5) * (width - 0.05));
        bits.push(m);
      }
      label(name, V(len / 2 - 0.14, Hw + 0.03, width / 2 + 0.03), { parent: g, minor: true });
      let u = 0;
      return {
        group: g, len, width, surf, bottom: B + 0.001,
        setFlow(v) { u = v; },
        animate(dt) { if (!u) return; bits.forEach((m) => { m.position.x += u * dt; if (m.position.x > len / 2 - 0.01) m.position.x -= len - 0.02; }); }
      };
    }

    /* ---------- Toy motor boat: bow towards −z (across the channel); propeller turns ---------- */
    function toyBoat({ name = 'Qayiq', color = C.amber } = {}) {
      const g = group();
      add(g, box(0.04, 0.018, 0.064, color, { roughness: 0.45 }), 0, 0.004, 0.004);
      const bow = add(g, box(0.0283, 0.018, 0.0283, color, { roughness: 0.45 }), 0, 0.004, -0.028); bow.rotation.y = Math.PI / 4;
      add(g, box(0.042, 0.003, 0.068, 0xFFFFFF), 0, 0.0135, 0.003);
      add(g, box(0.026, 0.016, 0.024, 0xF2F4F8, { roughness: 0.3 }), 0, 0.023, 0.01);
      add(g, box(0.027, 0.006, 0.006, 0x9CC7F2, { roughness: 0.1 }), 0, 0.026, -0.002);
      add(g, cyl(0.0025, 0.016, C.ink700, {}, 8), 0, 0.037, 0.016);
      const prop = add(g, new THREE.Group(), 0, -0.002, 0.04);
      [0, Math.PI / 2].forEach((a) => { const b = add(prop, box(0.018, 0.0025, 0.002, C.ink700)); b.rotation.z = a; });
      label(name, V(0, 0.075, 0), { parent: g, minor: true });
      return { group: g, place(p) { g.position.copy(p); return this; }, spin(a) { prop.rotation.z = a; return this; } };
    }

    /* ---------- Motor-driven disk (diameter 40 sm) with marks 5, 10, 15 sm from the axle along one radius.
       φ is counted anticlockwise seen from above, from the +x direction (as the protractor). The arcs and the angle wedge
       are drawn on a fixed (non-rotating) layer: they show the path of each mark. ---------- */
    function rotatingDisk(x, z, { r = 0.2, marks = [0.05, 0.1, 0.15], colors = ['#E5484D', '#3B4CFF', '#2E7D5B'], name = 'Aylanuvchi disk' } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.2, 0.012, 0.16, C.navy, { roughness: 0.5 }), 0, 0.006, 0);
      add(g, cyl(0.06, 0.03, C.ink700, { roughness: 0.5 }), 0, 0.027, 0);
      add(g, cyl(0.006, 0.012, C.steel, { metalness: 0.6 }), 0, 0.047, 0);
      const knob = add(g, cyl(0.009, 0.008, C.amber), 0.075, 0.016, 0.055);
      const Y = 0.05, TH = 0.008;
      const spin = add(g, new THREE.Group(), 0, Y, 0);
      add(spin, cyl(r, TH, 0xF4F5F9, { roughness: 0.6 }, 64), 0, TH / 2, 0);
      const { cv, ctx, tex } = canvasTex(1024, 1024);
      const S = 512 / r;
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(512, 512, 512, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#D9DCE8'; ctx.lineWidth = 3;
      marks.forEach((m) => { ctx.beginPath(); ctx.arc(512, 512, m * S, 0, Math.PI * 2); ctx.stroke(); });
      ctx.strokeStyle = '#1C2347'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(512, 512); ctx.lineTo(1018, 512); ctx.stroke();
      ctx.fillStyle = '#3A4166'; ctx.font = `700 34px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      marks.forEach((m) => ctx.fillText(`${Math.round(m * 100)} sm`, 512 + m * S, 538));
      tex.needsUpdate = true;
      add(spin, flat(new THREE.Mesh(new THREE.CircleGeometry(r * 0.998, 64), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }))), 0, TH + 0.0004, 0);
      const dots = marks.map((m, i) => add(spin, cyl(0.007, 0.004, new THREE.Color(colors[i]).getHex(), { roughness: 0.4 }, 16), m, TH + 0.002, 0));
      add(spin, cyl(0.012, 0.01, C.ink700), 0, TH + 0.003, 0);
      // fixed layer: swept angle (wedge) and the arcs traced by each mark
      const over = add(g, new THREE.Group(), 0, Y + TH + 0.0035, 0);
      const wedgeM = new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
      const wedge = add(over, flat(new THREE.Mesh(new THREE.CircleGeometry(r * 0.99, 4, 0, 0.01), wedgeM)));
      const arcs = marks.map((m, i) => add(over, flat(new THREE.Mesh(new THREE.RingGeometry(m - 0.003, m + 0.003, 4, 1, 0, 0.01), new THREE.MeshBasicMaterial({ color: colors[i], side: THREE.DoubleSide }))), 0, 0.0004 * (i + 1), 0));
      label(name, V(0.25, 0.03, 0.25), { parent: g, minor: true });
      let sel = -1, last = -1;
      const api = {
        group: g, r, top: Y + TH, marks,
        set(phi) { spin.rotation.y = phi; knob.rotation.y = phi * 2; return api; },
        // show the swept angle phi (rad); the arc of mark `R` (metres) is drawn thicker
        sweep(phi, R) {
          const p = Math.max(0, phi);
          const show = p > 1e-3;
          wedge.visible = show; arcs.forEach((a) => { a.visible = show; });
          sel = marks.findIndex((m) => Math.abs(m - R) < 1e-6);
          dots.forEach((d, i) => d.scale.set(i === sel ? 1.5 : 1, 1, i === sel ? 1.5 : 1));
          if (!show || Math.abs(p - last) < 1e-4) return api;
          last = p;
          const seg = Math.max(4, Math.round(p * 24));
          wedge.geometry.dispose(); wedge.geometry = new THREE.CircleGeometry(r * 0.99, seg, 0, p);
          arcs.forEach((a, i) => { const m = marks[i], w = i === sel ? 0.0045 : 0.0022; a.geometry.dispose(); a.geometry = new THREE.RingGeometry(m - w, m + w, seg, 1, 0, p); });
          return api;
        }
      };
      return api.set(0).sweep(0, -1);
    }

    /* ---------- Big flat protractor ring around a disk (0°…360°, anticlockwise from +x), on three small legs ---------- */
    function bigProtractor(x, z, { r0 = 0.205, r1 = 0.265, y = 0.055, name = 'Transportir' } = {}) {
      const g = group(x, 0, z);
      const { cv, ctx, tex } = canvasTex(1024, 1024);
      const c = 512, S = 512 / r1;
      ctx.clearRect(0, 0, 1024, 1024);
      ctx.fillStyle = 'rgba(255,248,230,0.96)'; ctx.beginPath(); ctx.arc(c, c, 512, 0, Math.PI * 2); ctx.arc(c, c, r0 * S, 0, Math.PI * 2, true); ctx.fill();
      ctx.strokeStyle = '#3A4166'; ctx.fillStyle = '#3A4166';
      for (let a = 0; a < 360; a += 5) {
        const t = a * Math.PI / 180, big = a % 30 === 0, mid = a % 10 === 0;
        const ra = r0 * S + 2, rb = ra + (big ? 0.022 : mid ? 0.014 : 0.008) * S;
        ctx.lineWidth = big ? 5 : 3;
        ctx.beginPath(); ctx.moveTo(c + ra * Math.cos(t), c - ra * Math.sin(t)); ctx.lineTo(c + rb * Math.cos(t), c - rb * Math.sin(t)); ctx.stroke();
        if (big) {
          const rt = (r0 + 0.039) * S;
          ctx.save(); ctx.translate(c + rt * Math.cos(t), c - rt * Math.sin(t));
          ctx.font = `700 34px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`${a}°`, 0, 0); ctx.restore();
        }
      }
      tex.needsUpdate = true;
      const ring = add(g, flat(new THREE.Mesh(new THREE.RingGeometry(r0, r1, 96, 1), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.8, side: THREE.DoubleSide }))), 0, y, 0);
      ring.receiveShadow = true;
      [Math.PI / 2, Math.PI * 7 / 6, Math.PI * 11 / 6].forEach((a) => add(g, cyl(0.005, y, C.ink700, {}, 8), Math.cos(a) * (r0 + r1) / 2, y / 2, -Math.sin(a) * (r0 + r1) / 2));
      label(name, V(-0.22, y + 0.03, -0.24), { parent: g, minor: true });
      return { group: g, y };
    }

    /* ---------- Motor-driven vertical axle on a stand (aylantirgich): a string is tied to an eyelet on its top hub;
       a counter on the motor box shows the number of turns. φ: anticlockwise seen from above, 0 = +x. ---------- */
    function spinAxle(x, z, { h = 0.56, eye = 0.03, name = 'Aylantirgich' } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.22, 0.014, 0.18, C.navy, { roughness: 0.5 }), 0, 0.007, -0.02);
      add(g, box(0.13, 0.06, 0.06, C.ink700, { roughness: 0.5 }), 0, 0.044, -0.075);
      add(g, box(0.02, 0.014, 0.06, C.steel, { metalness: 0.5 }), 0, 0.03, -0.035);
      add(g, cyl(0.014, 0.03, C.ink700), 0, 0.029, 0);
      add(g, cyl(0.006, h - 0.03, C.steel, { metalness: 0.6, roughness: 0.3 }), 0, 0.03 + (h - 0.03) / 2, 0);
      const hub = add(g, new THREE.Group(), 0, h, 0);
      add(hub, cyl(0.013, 0.014, C.ink700), 0, 0, 0);
      add(hub, box(eye, 0.004, 0.005, C.steel, { metalness: 0.6 }), eye / 2, 0, 0);
      add(hub, new THREE.Mesh(new THREE.TorusGeometry(0.004, 0.0012, 6, 14), mat(C.steel, { metalness: 0.6 })), eye, 0, 0).rotation.x = Math.PI / 2;
      add(hub, box(0.006, 0.006, 0.006, C.amber), -0.01, 0.008, 0);
      const { cv, ctx, tex } = canvasTex(320, 128);
      add(g, new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.024), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55 })), 0.035, 0.048, -0.0445);
      add(g, cyl(0.006, 0.008, 0x2E7D5B), -0.05, 0.078, -0.075);
      label(name, V(-0.1, 0.12, -0.08), { parent: g, minor: true });
      let lastN = null;
      const api = {
        group: g, h, eye,
        axis: V(x, h, z),
        // the string's knot on the eyelet (world), for hub angle phi
        knot(phi) { return V(x + eye * Math.cos(phi), h, z - eye * Math.sin(phi)); },
        spin(phi) { hub.rotation.y = phi; return api; },
        count(n) {
          const t = `n = ${n}`; if (t === lastN) return api; lastN = t;
          ctx.fillStyle = '#0B1026'; ctx.fillRect(0, 0, 320, 128); ctx.fillStyle = '#FFC94D'; ctx.font = '700 84px ui-monospace, Menlo, monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, 160, 68); tex.needsUpdate = true; return api;
        }
      };
      return api.spin(0).count(0);
    }

    /* ---------- Soft catching wall (himoya devori): a wooden board with a felt pad, stands on the table along z ---------- */
    function catchWall(x, z, { len = 0.8, h = 0.3, name = 'Himoya devori' } = {}) {
      const g = group(x, 0, z);
      add(g, box(0.018, h, len, WOOD, { roughness: 0.8 }), 0, h / 2, 0);
      add(g, box(0.006, h - 0.04, len - 0.04, 0x7A3E3E, { roughness: 0.95 }), -0.012, h / 2, 0);
      [-1, 1].forEach((sz) => add(g, box(0.08, 0.016, 0.03, C.ink700), 0.02, 0.008, sz * (len / 2 - 0.05)));
      label(name, V(0.03, h + 0.04, -len / 2 + 0.14), { parent: g, minor: true });
      return { group: g, face: x - 0.015 };
    }

    return Object.assign(k, { walkerToy, gridMat, toyCar, waterChannel, toyBoat, rotatingDisk, bigProtractor, spinAxle, catchWall });
  };
})();
