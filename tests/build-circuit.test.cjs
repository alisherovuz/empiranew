// node --test tests/*.cjs  — Build Mode circuit checker (Om qonuni)
const test = require('node:test');
const assert = require('node:assert');
require('../design-prototype/lab/build/circuit.js');
const C = globalThis.EMPIRA_CIRCUIT;
const spec = { source: { id: 'ps' }, series: [{ id: 'K' }, { id: 'mA', polar: true }, { id: 'R' }], across: [{ id: 'V', polar: true, over: 'R' }] };
const names = { ps: 'Tok manbai', K: 'Kalit', mA: 'Milliampermetr', R: 'Rezistor', V: 'Voltmetr' };
const c = C.create(spec, names);
// Exhaustive: every single wire between the 10 terminals, from an empty board, gets a clear verdict and an Uzbek message
test('every possible first wire gets a verdict', () => {
  const T = c.terminals;
  for (const a of T) for (const b of T) {
    if (a >= b) continue;
    const r = c.check([], [a, b]);
    assert.ok(['ok', 'error'].includes(r.status), a + b);
    if (r.status === 'error') assert.ok(r.message && r.message.length > 20, a + b);
  }
});

function build(wires) {
  const ok = []; let last;
  for (const w of wires) { last = c.check(ok, w); if (last.status !== 'ok') return { last, ok }; ok.push(w); }
  return { last, ok };
}

test('6 wires needed, 24 correct circuits exist', () => {
  assert.strictEqual(c.required, 6);
  assert.strictEqual(c.validCount, 24);
});
test('textbook circuit completes', () => {
  const { last } = build([['ps.+', 'K.a'], ['K.b', 'mA.+'], ['mA.-', 'R.b'], ['R.a', 'ps.-'], ['V.+', 'R.b'], ['V.-', 'R.a']]);
  assert.strictEqual(last.status, 'ok'); assert.strictEqual(last.complete, true);
});
test('other order, reversed wires, voltmeter first: still correct', () => {
  const { last } = build([['V.-', 'R.b'], ['R.a', 'V.+'], ['ps.-', 'K.b'], ['mA.-', 'R.a'], ['K.a', 'R.b'], ['mA.+', 'ps.+']]);
  assert.strictEqual(last.status, 'ok'); assert.strictEqual(last.complete, true);
});
test('voltmeter wired to the ammeter end that shares the resistor net is fine', () => {
  const { last } = build([['ps.+', 'K.a'], ['K.b', 'mA.+'], ['mA.-', 'R.a'], ['R.b', 'ps.-'], ['V.+', 'mA.-'], ['V.-', 'ps.-']]);
  assert.strictEqual(last.status, 'ok'); assert.strictEqual(last.complete, true);
});
test('half-built circuit is quiet (ok, not complete)', () => {
  const r = c.check([], ['ps.+', 'K.a']);
  assert.strictEqual(r.status, 'ok'); assert.strictEqual(r.complete, false); assert.strictEqual(r.progress, 1);
});
const err = (wires, code) => () => { const { last } = build(wires); assert.strictEqual(last.status, 'error'); assert.strictEqual(last.code, code, last.message); };
test('source short', err([['ps.+', 'ps.-']], 'short'));
test('source short through wires', err([['ps.+', 'K.a'], ['K.a', 'ps.-']], 'short'));
test('resistor bypassed', err([['R.a', 'R.b']], 'self'));
test('ammeter reversed', err([['ps.+', 'mA.-']], 'polarity'));
test('voltmeter reversed', err([['ps.+', 'K.a'], ['K.b', 'mA.+'], ['mA.-', 'R.b'], ['V.-', 'R.b']], 'polarity'));
test('voltmeter in series', err([['ps.+', 'K.a'], ['K.b', 'V.+'], ['V.-', 'mA.+'], ['mA.-', 'R.a']], 'acrossInSeries'));
test('loop closed without the ammeter', err([['ps.+', 'K.a'], ['K.b', 'R.a'], ['R.b', 'ps.-']], 'skipped'));
test('ammeter across resistor', err([['ps.+', 'K.a'], ['K.b', 'R.a'], ['mA.+', 'R.a']], 'seriesAcross'));
test('duplicate wire', () => { const r = c.check([['ps.+', 'K.a']], ['K.a', 'ps.+']); assert.strictEqual(r.status, 'duplicate'); });
test('three loop terminals in one net is rejected', () => { const { last } = build([['ps.+', 'K.a'], ['K.a', 'mA.+']]); assert.strictEqual(last.status, 'error'); });
test('messages are Uzbek sentences', () => {
  const { last } = build([['ps.+', 'K.a'], ['K.b', 'V.+'], ['V.-', 'mA.+'], ['mA.-', 'R.a']]);
  assert.match(last.message, /^Voltmetr zanjirga ketma-ket ulanmaydi\. U rezistorning ikki uchiga parallel ulanadi\.$/);
  const k = build([['ps.+', 'K.a'], ['K.b', 'R.a'], ['R.b', 'ps.-']]).last;
  assert.strictEqual(k.message, 'Zanjir milliampermetrsiz yopilib qoldi. Milliampermetr ham zanjirga ketma-ket ulanishi kerak.');
});
