// Empira — circuit checker for "Zanjirni o‘zingiz yig‘ing" (Build Mode). No DOM, no three.js: works in the browser and in Node tests.
//
// A circuit spec describes WHAT must be connected, not where things stand on the table:
//   source:  { id: 'ps' }                           terminals '+' and '-'
//   series:  [{ id: 'K' }, { id: 'mA', polar: true }, { id: 'R' }]   any order is accepted
//   across:  [{ id: 'V', polar: true, over: 'R' }]   a meter connected in parallel to one series element
// Polar elements have terminals '+' / '-' (current enters '+'); the others 'a' / 'b' (either way round).
//
// check(wires, wire) judges ONE new wire against the wires already accepted:
//   { status: 'ok', progress, required, complete }   the wire fits at least one correct circuit
//   { status: 'error', code, message }               no correct circuit contains it (the wire is not kept)
//   { status: 'duplicate' | 'ignore', message }      nothing to judge
// "Incomplete" is never an error: a half-built circuit that can still become correct is 'ok'.
(function (root) {
  const DEFAULT_MESSAGES = {
    short: 'Qisqa tutashuv! Manbaning «+» va «−» qisqichlari sim bilan to‘g‘ridan-to‘g‘ri ulanib qoldi.',
    self: (name) => `${name}ning ikki qisqichi bir-biriga ulanib qoldi: tok undan o‘tmay, chetlab ketadi.`,
    polarity: (name) => `${name} qutblari teskari: «+» qisqich manbaning «+» tomoniga qarab ulanadi.`,
    acrossInSeries: (name, over) => `${name} zanjirga ketma-ket ulanmaydi. U ${over.toLowerCase()}ning ikki uchiga parallel ulanadi.`,
    skipped: (name) => `Zanjir ${name.toLowerCase()}siz yopilib qoldi. ${name} ham zanjirga ketma-ket ulanishi kerak.`,
    seriesAcross: (name, over) => `${name} ${over.toLowerCase()}ga parallel ulanmaydi. U zanjirga ketma-ket ulanadi.`,
    across: (name, over) => `${name} ${over.toLowerCase()}ning ikki uchiga ulanadi (parallel).`,
    series: (name) => `${name} zanjirga ketma-ket ulanadi: tok manbaning «+»idan asboblar orqali «−»iga boradi.`,
    generic: 'Bu ulanish zanjirga mos emas. Tok manbaning «+»idan kalit, ampermetr va rezistor orqali «−»iga ketma-ket o‘tishi kerak.',
    duplicate: 'Bu qisqichlar allaqachon ulangan.'
  };

  const perms = (arr) => arr.length <= 1 ? [arr.slice()] :
    arr.flatMap((x, i) => perms(arr.filter((_, j) => j !== i)).map((p) => [x, ...p]));
  const ends = (el, reversed) => el.polar
    ? (reversed ? [`${el.id}.-`, `${el.id}.+`] : [`${el.id}.+`, `${el.id}.-`])
    : (reversed ? [`${el.id}.b`, `${el.id}.a`] : [`${el.id}.a`, `${el.id}.b`]);

  // All net lists for a loop made of `series` (orientation rules per element) plus parallel meters.
  // orient(el) returns the allowed orientations: [false] = correct, [true] = reversed, [false, true] = either.
  function loops(spec, series, across, orient) {
    const out = [];
    perms(series).forEach((order) => {
      const choices = order.map((el) => orient(el));
      const combos = choices.reduce((acc, ch) => acc.flatMap((c) => ch.map((o) => [...c, o])), [[]]);
      combos.forEach((combo) => {
        const nets = []; let prev = `${spec.source.id}.+`;
        const inOut = {};
        order.forEach((el, i) => {
          const [a, b] = ends(el, combo[i]);
          nets.push([prev, a]); prev = b; inOut[el.id] = [a, b];
        });
        nets.push([prev, `${spec.source.id}.-`]);
        // parallel meters: '+' joins the net on the source-'+' side of the element it sits across
        const variants = across.reduce((acc, m) => acc.flatMap((ns) => orient(m).map((rev) => {
          const [i, o] = inOut[m.over]; const [mp, mn] = ends(m, rev);
          return ns.map((n) => n.includes(i) ? [...n, mp] : n.includes(o) ? [...n, mn] : n);
        })), [nets]);
        variants.forEach((v) => out.push(v));
      });
    });
    return out;
  }

  function create(spec, names, messages) {
    const M = { ...DEFAULT_MESSAGES, ...(messages || {}) };
    const name = (id) => names[id] || id;
    const all = [...spec.series, ...spec.across];
    const free = (el) => (el.polar ? [false] : [false, true]);
    const any = () => [false, true];

    const valid = loops(spec, spec.series, spec.across, free);
    const terminals = [...new Set(valid[0].flat())];
    const required = terminals.length - valid[0].length;   // wires needed in the shortest correct build

    // Look-alike circuits, only used to explain WHY a wire is wrong
    const families = [];
    all.filter((el) => el.polar).forEach((el) => families.push({
      code: 'polarity', id: el.id,
      nets: loops(spec, spec.series, spec.across, (x) => (x.id === el.id ? [true] : free(x)))
    }));
    spec.series.forEach((el) => families.push({
      code: 'skipped', id: el.id,
      nets: loops(spec, spec.series.filter((x) => x.id !== el.id), spec.across.filter((a) => a.over !== el.id), free)
    }));
    spec.across.forEach((m) => families.push({
      code: 'acrossInSeries', id: m.id,
      nets: loops(spec, [...spec.series, { ...m }], spec.across.filter((x) => x.id !== m.id), any)
    }));
    spec.series.filter((el) => el.polar).forEach((el) => {
      const over = spec.across[0] ? spec.across[0].over : null;
      if (!over || over === el.id) return;
      families.push({
        code: 'seriesAcross', id: el.id,
        nets: loops(spec, spec.series.filter((x) => x.id !== el.id), [...spec.across, { ...el, over }], any)
      });
    });

    const fits = (nets, wires) => {
      const at = {}; nets.forEach((n, i) => n.forEach((t) => { at[t] = i; }));
      return wires.every(([x, y]) => at[x] !== undefined && at[x] === at[y]);
    };
    function groups(wires) {
      const p = {}; const f = (x) => (p[x] === undefined || p[x] === x ? (p[x] = x) : (p[x] = f(p[x])));
      wires.forEach(([x, y]) => { p[f(x)] = f(y); });
      return f;
    }
    const tool = (t) => t.split('.')[0];

    function progress(wires) {
      const f = groups(wires);
      return terminals.length - new Set(terminals.map(f)).size;
    }

    function check(wires, wire) {
      const [x, y] = wire;
      if (x === y) return { status: 'ignore' };
      const before = groups(wires);
      if (before(x) === before(y)) return { status: 'duplicate', message: M.duplicate };
      const next = [...wires, wire];

      // 1. The same tool's two ends joined (directly or through other wires)
      const f = groups(next);
      if (f(`${spec.source.id}.+`) === f(`${spec.source.id}.-`)) return { status: 'error', code: 'short', message: M.short };
      for (const el of all) {
        const [a, b] = ends(el, false);
        if (f(a) === f(b)) return { status: 'error', code: 'self', id: el.id, message: M.self(name(el.id)) };
      }

      // 2. Fits a correct circuit → fine (complete when every needed connection exists)
      if (valid.some((nets) => fits(nets, next))) {
        const p = progress(next);
        return { status: 'ok', progress: p, required, complete: p === required };
      }

      // 3. Explain the mistake: polarity, meter in the wrong place, then a plain rule about the touched tool
      // The first look-alike that matches ALL wires so far names the student's actual mistake
      const touched = [tool(x), tool(y)];
      for (const fam of families) {
        if (fam.nets.some((nets) => fits(nets, next))) {
          const el = all.find((e) => e.id === fam.id);
          const over = name(el.over || (spec.across[0] && spec.across[0].over));
          return { status: 'error', code: fam.code, id: fam.id, message: M[fam.code](name(fam.id), over) };
        }
      }
      const m = spec.across.find((a) => touched.includes(a.id));
      if (m) return { status: 'error', code: 'across', id: m.id, message: M.across(name(m.id), name(m.over)) };
      const s = spec.series.find((e) => e.polar && touched.includes(e.id));
      if (s) return { status: 'error', code: 'series', id: s.id, message: M.series(name(s.id)) };
      return { status: 'error', code: 'generic', message: M.generic };
    }

    return { check, progress, required, terminals, validCount: valid.length };
  }

  root.EMPIRA_CIRCUIT = { create };
})(typeof window !== 'undefined' ? window : globalThis);
