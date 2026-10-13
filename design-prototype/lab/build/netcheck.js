// Empira — wiring checker for labs read automatically from the ready lab (see auto.js). No DOM, no three.js.
// The target is the ready lab's own wiring (the textbook figure). A wire is correct when it fits that circuit,
// allowing what does not change the physics: the two ends of a lamp, resistor, switch… swapped, and identical
// pieces (two lamps, two resistors) swapped with each other. Polar pieces (meters, sources) keep their «+».
// Same answer shape as circuit.js: { status: 'ok' | 'error' | 'duplicate' | 'ignore', … }.
(function (root) {
  const M = {
    short: 'Qisqa tutashuv! Manbaning «+» va «−» qisqichlari bir-biriga ulanib qoldi.',
    self: (n) => `${n}ning ikki qisqichi bir-biriga ulanib qoldi: tok undan o‘tmay, chetlab ketadi.`,
    polarity: (n) => `${n} qutblari teskari: «+» qisqich manbaning «+» tomoniga qarab ulanadi.`,
    polaritySource: (n) => `${n}ning «+» va «−» qisqichlari almashib qoldi: tok «+» qisqichdan chiqadi.`,
    unused: (t) => `${t} bu tajribada ulanmaydi.`,
    wrong: (t, p) => p ? `Bu ulanish sxemaga mos emas. ${t} ${p} bilan ulanadi.` : 'Bu ulanish sxemaga mos emas.',
    duplicate: 'Bu qisqichlar allaqachon ulangan.'
  };

  function groups(wires) {
    const p = {}; const f = (x) => (p[x] === undefined || p[x] === x ? (p[x] = x) : (p[x] = f(p[x])));
    wires.forEach(([x, y]) => { p[f(x)] = f(y); });
    return f;
  }

  // spec = { wires: [[tid, tid]], instances: [{ id, type, keys: [...], polar: [plusKey, minusKey] | null, source }],
  //          name(tid), instName(id) }
  function create(spec) {
    const inst = Object.fromEntries(spec.instances.map((i) => [i.id, i]));
    const tool = (t) => t.split('.')[0], key = (t) => t.slice(t.indexOf('.') + 1);
    const terminals = [...new Set(spec.wires.flat())];
    const inTarget = new Set(terminals);
    const f0 = groups(spec.wires);
    const base = {}; terminals.forEach((t) => { base[t] = f0(t); });
    const required = terminals.length - new Set(Object.values(base)).size;

    // Variants: swap the ends of two-ended non-polar pieces; swap identical pieces with each other
    const flips = spec.instances.filter((i) => !i.polar && i.keys.filter((k) => inTarget.has(`${i.id}.${k}`)).length === 2);
    const sameType = {};
    spec.instances.forEach((i) => { if (i.keys.some((k) => inTarget.has(`${i.id}.${k}`))) (sameType[i.type] = sameType[i.type] || []).push(i.id); });
    const perms = (a) => (a.length <= 1 ? [a.slice()] : a.flatMap((x, i) => perms(a.filter((_, j) => j !== i)).map((p) => [x, ...p])));
    let maps = [{}];   // tid → tid
    Object.values(sameType).filter((ids) => ids.length > 1 && ids.length <= 4).forEach((ids) => {
      maps = maps.flatMap((m) => perms(ids).map((pm) => { const n = { ...m }; ids.forEach((id, i) => { inst[id].keys.forEach((k) => { n[`${id}.${k}`] = `${pm[i]}.${k}`; }); }); return n; }));
    });
    const apply = (m, t) => (m[t] === undefined ? t : m[t]);
    // a flip turns a piece round wherever the swap above put it (applied to the image, so swap + flip combine)
    flips.slice(0, 8).forEach((i) => {
      const [k1, k2] = i.keys.filter((k) => inTarget.has(`${i.id}.${k}`));
      const turn = { [`${i.id}.${k1}`]: `${i.id}.${k2}`, [`${i.id}.${k2}`]: `${i.id}.${k1}` };
      maps = maps.flatMap((m) => {
        const n = {}; terminals.forEach((t) => { const im = apply(m, t); n[t] = turn[im] || im; });
        return [m, n];
      });
    });
    const variants = maps.slice(0, 4096).map((m) => {
      const v = {}; terminals.forEach((t) => { v[apply(m, t)] = base[t]; }); return v;
    });
    const fits = (v, wires) => wires.every(([x, y]) => v[x] !== undefined && v[x] === v[y]);
    // Diagnosis only: the same circuit with one polar piece turned round
    const polarFamilies = spec.instances.filter((i) => i.polar).map((i) => {
      const [p, m] = i.polar.map((k) => `${i.id}.${k}`);
      return { id: i.id, variants: variants.map((v) => { const n = { ...v }; [n[p], n[m]] = [v[m], v[p]]; return n; }) };
    });

    const progress = (wires) => { const f = groups(wires); return terminals.length - new Set(terminals.map(f)).size; };

    function check(wires, wire) {
      const [x, y] = wire;
      if (x === y) return { status: 'ignore' };
      if (groups(wires)(x) === groups(wires)(y)) return { status: 'duplicate', message: M.duplicate };
      const next = [...wires, wire];
      const f = groups(next);
      for (const i of spec.instances) {
        if (i.source && i.polar) {
          const [p, m] = i.polar.map((k) => `${i.id}.${k}`);
          if (f(p) === f(m)) return { status: 'error', code: 'short', message: M.short };
        }
        const ends = i.keys.map((k) => `${i.id}.${k}`).filter((t) => inTarget.has(t));
        if (ends.length === 2 && f(ends[0]) === f(ends[1]) && base[ends[0]] !== base[ends[1]]) {
          return { status: 'error', code: 'self', id: i.id, message: M.self(spec.instName(i.id)) };
        }
      }
      const bad = [x, y].find((t) => !inTarget.has(t));
      if (bad) return { status: 'error', code: 'unused', message: M.unused(spec.name(bad)) };
      if (variants.some((v) => fits(v, next))) {
        const p = progress(next);
        return { status: 'ok', progress: p, required, complete: p === required };
      }
      for (const fam of polarFamilies) {
        if ([tool(x), tool(y)].includes(fam.id) && fam.variants.some((v) => fits(v, next))) {
          const src = inst[fam.id].source;
          return { status: 'error', code: 'polarity', id: fam.id, message: (src ? M.polaritySource : M.polarity)(spec.instName(fam.id)) };
        }
      }
      // Say where the first terminal should go instead (from a circuit that still fits the wires so far)
      const v = variants.find((vv) => fits(vv, wires));
      let partner = null;
      if (v) {
        const g = groups(wires);
        const others = terminals.filter((t) => t !== x && v[t] === v[x] && g(t) !== g(x));
        if (others.length) partner = spec.name(others[0]);
      }
      return { status: 'error', code: 'wrong', message: M.wrong(spec.name(x), partner) };
    }

    // Next connection to make (for the "Maslahat" button)
    function hint(wires) {
      const v = variants.find((vv) => fits(vv, wires)) || variants[0];
      const g = groups(wires);
      for (const a of terminals) {
        const b = terminals.find((t) => t !== a && v[t] === v[a] && g(t) !== g(a));
        if (b) return [a, b];
      }
      return null;
    }

    return { check, progress, required, terminals, hint, variantCount: variants.length };
  }

  root.EMPIRA_NETCHECK = { create };
})(typeof window !== 'undefined' ? window : globalThis);
