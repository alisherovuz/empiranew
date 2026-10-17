// Empira — Build Mode for every lab, read from the ready lab itself.
// The ready lab's build() is run once with a recording kit: every equipment piece it creates (power supply, lamp,
// meter, magnet…) becomes a tool the student has to pick, and every wire it draws between two terminals becomes a
// connection the student has to make. Nothing is written by hand per lab, and the ready labs are not changed.
// Pieces the lab draws itself (stands, blocks, field pictures) stay on the table from the start.
(function (root) {
  // Equipment names (as in the textbook) and schematic icons for the tool library
  const IC = {
    source: '<path d="M10 6v12"/><path d="M14 9v6"/><path d="M3 12h7"/><path d="M14 12h7"/><path d="M5 7h3"/><path d="M6.5 5.5v3"/><path d="M16 7h3"/>',
    switch: '<circle cx="5" cy="15" r="1.5"/><circle cx="19" cy="15" r="1.5"/><path d="M2 15h1.5"/><path d="M20.5 15H22"/><path d="M6.3 14.2 17 8"/>',
    ammeter: '<circle cx="12" cy="12" r="7"/><path d="M9.5 15 12 8.5l2.5 6.5"/><path d="M10.3 13h3.4"/><path d="M2 12h3"/><path d="M19 12h3"/>',
    voltmeter: '<circle cx="12" cy="12" r="7"/><path d="m9.5 8.5 2.5 7 2.5-7"/><path d="M2 12h3"/><path d="M19 12h3"/>',
    resistor: '<rect x="6" y="9" width="12" height="6" rx="1"/><path d="M2 12h4"/><path d="M18 12h4"/>',
    lamp: '<circle cx="12" cy="12" r="6"/><path d="m7.8 7.8 8.4 8.4"/><path d="m16.2 7.8-8.4 8.4"/><path d="M2 12h4"/><path d="M18 12h4"/>',
    rheostat: '<rect x="5" y="10" width="14" height="5" rx="1"/><path d="M2 12.5h3"/><path d="M19 12.5h3"/><path d="M7 19 17 5"/><path d="m14 5h3v3"/>',
    compass: '<circle cx="12" cy="12" r="8"/><path d="m14.5 9.5-1.6 3.4-3.4 1.6 1.6-3.4z"/>',
    stopwatch: '<circle cx="12" cy="14" r="7"/><path d="M12 14V10.5"/><path d="M10 3h4"/><path d="M12 3v4"/>',
    magnet: '<path d="M6 4v8a6 6 0 0 0 12 0V4"/><path d="M6 4h3v8a3 3 0 0 0 6 0V4h3"/><path d="M6 8h3"/><path d="M15 8h3"/>',
    bar: '<rect x="3" y="9" width="18" height="6" rx="1"/><path d="M12 9v6"/>',
    coil: '<path d="M3 12h2"/><path d="M5 12c0-4 3-4 3 0s3 4 3 0 3-4 3 0 3 4 3 0"/><path d="M17 12h4"/>',
    cells: '<path d="M6 7v10"/><path d="M9 9.5v5"/><path d="M14 7v10"/><path d="M17 9.5v5"/><path d="M2 12h4"/><path d="M17 12h5"/>',
    beaker: '<path d="M7 3h10"/><path d="M8 3v6L4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2L16 9V3"/><path d="M6 15h12"/>',
    tube: '<rect x="3" y="8" width="18" height="8" rx="4"/><path d="M7 12h2"/><path d="M15 12h2"/>',
    spark: '<circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="12" r="2.5"/><path d="m9 12 2-3 2 6 2-3"/>',
    candle: '<rect x="9" y="11" width="6" height="10" rx="1"/><path d="M12 11V8"/><path d="M12 3c2 2 2 4 0 5-2-1-2-3 0-5z"/>',
    rod: '<path d="M4 20 20 4"/><path d="M16 4h4v4"/>',
    scope: '<path d="M8 21h8"/><path d="M12 21V9"/><circle cx="12" cy="6" r="3"/><path d="m12 14-3 4"/><path d="m12 14 3 4"/>',
    machine: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/><path d="M12 3v3"/>',
    stand: '<path d="M6 21h10"/><path d="M9 21V3"/><path d="M9 5h9"/><path d="M18 5v5"/>',
    meterSpring: '<rect x="9" y="3" width="6" height="18" rx="2"/><path d="M12 7v6"/><path d="M10 15h4"/>',
    board: '<rect x="3" y="8" width="18" height="8" rx="1"/><path d="M6 12h12"/><circle cx="14" cy="12" r="1.5"/>',
    cap: '<path d="M10 5v14"/><path d="M14 5v14"/><path d="M3 12h7"/><path d="M14 12h7"/>',
    socket: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>',
    motor: '<circle cx="12" cy="12" r="7"/><path d="M9.5 15V9l2.5 4 2.5-4v6"/>',
    frame: '<rect x="7" y="6" width="10" height="12" rx="1"/><path d="M3 12h4"/><path d="M17 12h4"/>',
    dish: '<ellipse cx="12" cy="14" rx="9" ry="4"/><path d="M8 10v4"/><path d="M16 10v4"/>',
    view: '<circle cx="12" cy="12" r="8"/><circle cx="9" cy="10" r="1"/><circle cx="14" cy="14" r="1"/><circle cx="15" cy="9" r="1"/>'
  };
  // type → name, icon, polar terminals (current enters the first), source (its + and − must never be joined)
  const TYPES = {
    powerSupply: { name: 'Tok manbai', icon: IC.source, polar: ['plus', 'minus'], source: true, domain: 'e' },
    cells: { name: 'Galvanik element', icon: IC.cells, polar: ['plus', 'minus'], source: true, domain: 'e' },
    voltaCell: { name: 'Volta elementi', icon: IC.beaker, domain: 'e' },
    switchK: { name: 'Kalit', icon: IC.switch, domain: 'e' },
    lamp: { name: 'Lampochka', icon: IC.lamp, domain: 'e' },
    neonLamp: { name: 'Neon lampa', icon: IC.lamp, domain: 'e' },
    resistor: { name: 'Rezistor', icon: IC.resistor, domain: 'e' },
    rheostat: { name: 'Reostat', icon: IC.rheostat, domain: 'e' },
    'meter:A': { name: 'Ampermetr', icon: IC.ammeter, polar: ['a', 'b'], domain: 'e' },
    'meter:mA': { name: 'Milliampermetr', icon: IC.ammeter, polar: ['a', 'b'], domain: 'e' },
    'meter:V': { name: 'Voltmetr', icon: IC.voltmeter, polar: ['a', 'b'], domain: 'e' },
    stopwatch: { name: 'Sekundomer', icon: IC.stopwatch, domain: 'x' },
    wireBoard: { name: 'Qisqichli taxta', icon: IC.board, domain: 'e' },
    capacitor: { name: 'Kondensator', icon: IC.cap, domain: 'e' },
    calorimeter: { name: 'Kalorimetr', icon: IC.beaker, domain: 'e' },
    socketTester: { name: 'Rozetka va indikator', icon: IC.socket, domain: 'e' },
    coil: { name: 'G‘altak', icon: IC.coil, domain: 'm' },
    compass: { name: 'Kompas', icon: IC.compass, domain: 'm' },
    needle: { name: 'Magnit strelkasi', icon: IC.compass, domain: 'm' },
    barMagnet: { name: 'Doimiy magnit', icon: IC.bar, domain: 'm' },
    flatMagnet: { name: 'Doimiy magnit', icon: IC.bar, domain: 'm' },
    horseshoe: { name: 'Taqasimon magnit', icon: IC.magnet, domain: 'm' },
    swing: { name: 'Osilgan o‘tkazgich', icon: IC.frame, domain: 'm' },
    frameMeter: { name: 'Tokli ramka', icon: IC.frame, domain: 'm' },
    liftMagnet: { name: 'Elektromagnit', icon: IC.coil, domain: 'm' },
    motor: { name: 'Elektr dvigatel modeli', icon: IC.motor, domain: 'm' },
    stand: { name: 'Shtativ', icon: IC.stand, domain: 'x' },
    dynamometer: { name: 'Dinamometr', icon: IC.meterSpring, domain: 'x' },
    electrophore: { name: 'Elektrofor mashinasi', icon: IC.machine, domain: 's' },
    candle: { name: 'Sham', icon: IC.candle, domain: 's' },
    chargeRod: { name: 'Tayoqcha', icon: IC.rod, domain: 's' },
    hangingRod: { name: 'Osilgan tayoqcha', icon: IC.rod, domain: 's' },
    electroscope: { name: 'Elektroskop', icon: IC.scope, domain: 's' },
    torsionBalance: { name: 'Buralma tarozi', icon: IC.scope, domain: 's' },
    bath: { name: 'Elektrolitik vanna', icon: IC.beaker, domain: 'c' },
    vacuumTube: { name: 'Vakuum diod', icon: IC.tube, domain: 'c' },
    dischargeTube: { name: 'Gaz razryad trubkasi', icon: IC.tube, domain: 'c' },
    sparkGap: { name: 'Uchqun oralig‘i', icon: IC.spark, domain: 'c' },
    arcLamp: { name: 'Elektr yoyi', icon: IC.spark, domain: 'c' },
    fieldFibres: { name: 'Elektrodli moy idishi', icon: IC.dish, domain: 's' }
  };
  // More equipment registered by other kit files (kit-7.js: mechanics for 7-sinf)
  Object.assign(TYPES, root.EMPIRA_KIT_TYPES || {});
  // Pictures the lab draws to explain (not equipment to pick): always on the table
  const SCENERY = new Set(['fieldLines', 'conductorView']);
  const factories = () => { Object.assign(TYPES, root.EMPIRA_KIT_TYPES || {}); return Object.keys(TYPES).map((t) => t.split(':')[0]).concat([...SCENERY]); };

  const typeOf = (fn, args) => (fn === 'meter' ? `meter:${args[2]}` : fn);

  // Every terminal of a kit object: getters that return a point (cells: one pair per cell)
  function terminalsOf(obj, THREE) {
    const out = {};
    const scan = (o, prefix) => {
      Object.entries(Object.getOwnPropertyDescriptors(o)).forEach(([k, d]) => {
        if (d.get) { try { const v = o[k]; if (v instanceof THREE.Vector3) out[prefix + k] = () => o[k]; } catch (e) { /* not a point */ } }
      });
    };
    scan(obj, '');
    if (Array.isArray(obj.cells)) obj.cells.forEach((c, i) => scan(c, `${i + 1}`));
    return out;
  }

  // Run the ready lab's build() + first update() with a recording kit
  function analyze(L, kit, THREE, scene, values, computed) {
    const instances = [];          // { id, type, obj, groups, terms: {key: getter} }
    let depth = 0;
    const rec = Object.create(kit);
    factories().forEach((fn) => {
      if (typeof kit[fn] !== 'function') return;
      rec[fn] = (...args) => {
        if (depth > 0) return kit[fn](...args);
        depth++;
        const before = new Set(scene.children);
        const obj = kit[fn](...args);
        depth--;
        const groups = scene.children.filter((c) => !before.has(c));
        if (SCENERY.has(fn)) return obj;
        const type = typeOf(fn, args);
        const n = instances.filter((x) => x.type === type).length + 1;           // "Lampochka 2" (per kind)
        const k = instances.filter((x) => x.id.startsWith(fn)).length + 1;       // unique id (an ammeter and a voltmeter are both meters)
        instances.push({ id: `${fn}${k}`, type, n, obj, groups, terms: obj && typeof obj === 'object' ? terminalsOf(obj, THREE) : {} });
        return obj;
      };
    });
    // Wires: matched to the terminals they join at the moment they are drawn
    let wires = [];
    const where = (p) => {
      let best = null, bd = 1e-4;
      instances.forEach((ins) => Object.entries(ins.terms).forEach(([k, get]) => {
        const d = get().distanceTo(p); if (d < bd) { bd = d; best = `${ins.id}.${k}`; }
      }));
      return best;
    };
    // (kept recording later too: during measuring the ready lab may redraw its wires, e.g. a meter moved)
    rec.wire = (a, b, lift) => {
      const mesh = kit.wire(a, b, lift);
      wires.push({ a: where(a), b: where(b), pa: a.clone(), pb: b.clone(), lift: lift === undefined ? 0.035 : lift, mesh });
      return mesh;
    };
    rec.clearWires = () => { wires = []; return kit.clearWires(); };

    const api = L.build(rec, THREE);
    api.update?.(values, computed);
    const first = wires.slice();
    // current(): the lab's wires still on the table (a lab may remove some of its own wires itself)
    return { api, instances, wires: first, current: () => wires.filter((w) => w.mesh && w.mesh.parent), unmatched: first.filter((w) => !w.a || !w.b || w.a === w.b).length };
  }

  // Kinds that do the same job: never offered as a "wrong" tool next to each other (an ammeter vs a milliammeter)
  const SAME = { 'meter:A': ['meter:mA'], 'meter:mA': ['meter:A'], compass: ['needle'], needle: ['compass'], barMagnet: ['flatMagnet'], flatMagnet: ['barMagnet'] };
  // 7-sinf: families of equipment that do the same job (a lab with one of them never offers another as "wrong")
  [['stopwatch', 'timer'], ['weights', 'pan', 'gramLoad', 'kettleLoads'], ['track', 'chute'], ['ruler', 'millimetreRuler', 'woodRuler'],
    ['dynamometer', 'digitalDynamometer', 'paperDynamometer', 'forcePuller', 'forceSensor'], ['cart', 'bufferCart', 'magnetCart', 'ironCart'],
    ['stand', 'holder', 'dropStand'], ['scaleBal', 'floorScale']].forEach((fam) => fam.forEach((t) => { SAME[t] = (SAME[t] || []).concat(fam.filter((x) => x !== t)); }));
  root.EMPIRA_BUILD_AUTO = { TYPES, SAME, analyze, terminalsOf };
})(typeof window !== 'undefined' ? window : globalThis);
