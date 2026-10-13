// node --test tests/*.cjs  — wiring checker for automatic Build Mode (netcheck.js)
const test = require('node:test');
const assert = require('node:assert');
require('../design-prototype/lab/build/netcheck.js');
const N = globalThis.EMPIRA_NETCHECK;
// Textbook figure of "Ketma-ket lampalar": source → switch → ammeter → lamp1 → lamp2 → source, voltmeter across lamp1
const wires = [['ps1.plus', 'sw1.a'], ['sw1.b', 'mA1.a'], ['mA1.b', 'lamp1.a'], ['lamp1.b', 'lamp2.a'], ['lamp2.b', 'ps1.minus'], ['V1.a', 'lamp1.a'], ['V1.b', 'lamp1.b']];
const instances = [
  { id: 'ps1', type: 'powerSupply', keys: ['plus', 'minus'], polar: ['plus', 'minus'], source: true },
  { id: 'sw1', type: 'switchK', keys: ['a', 'b'] }, { id: 'mA1', type: 'meter:mA', keys: ['a', 'b'], polar: ['a', 'b'] },
  { id: 'lamp1', type: 'lamp', keys: ['a', 'b'] }, { id: 'lamp2', type: 'lamp', keys: ['a', 'b'] },
  { id: 'V1', type: 'meter:V', keys: ['a', 'b'], polar: ['a', 'b'] }
];
const c = N.create({ wires, instances, name: (t) => t, instName: (id) => id });
const run = (ws) => { const ok = []; let r; for (const w of ws) { r = c.check(ok, w); if (r.status !== 'ok') return r; ok.push(w); } return r; };

test('textbook wiring completes', () => { const r = run(wires); assert.strictEqual(r.status, 'ok'); assert.strictEqual(r.complete, true); });
test('lamp ends swapped and the two lamps swapped still pass', () => {
  const r = run([['ps1.plus', 'sw1.b'], ['sw1.a', 'mA1.a'], ['mA1.b', 'lamp2.b'], ['lamp2.a', 'lamp1.b'], ['lamp1.a', 'ps1.minus'], ['V1.a', 'lamp2.b'], ['V1.b', 'lamp2.a']]);
  assert.strictEqual(r.status, 'ok'); assert.strictEqual(r.complete, true);
});
test('short circuit', () => assert.strictEqual(run([['ps1.plus', 'ps1.minus']]).code, 'short'));
test('lamp bypassed', () => assert.strictEqual(run([['lamp1.a', 'lamp1.b']]).code, 'self'));
test('ammeter reversed → polarity', () => assert.strictEqual(run([['ps1.plus', 'sw1.a'], ['sw1.b', 'mA1.b']]).code, 'polarity'));
test('source connected the wrong way round', () => {
  const r = run([['ps1.plus', 'lamp2.b']]);
  assert.strictEqual(r.code, 'polarity'); assert.match(r.message, /almashib qoldi/);
});
test('wrong wire names where it should go', () => {
  const r = run([['sw1.a', 'lamp2.a']]);
  assert.strictEqual(r.code, 'wrong'); assert.match(r.message, /sw1\.a .* bilan ulanadi/);
});
test('hint always leads to completion', () => {
  const ok = []; let h, n = 0;
  while ((h = c.hint(ok)) && n++ < 20) { const r = c.check(ok, h); assert.strictEqual(r.status, 'ok'); ok.push(h); }
  assert.strictEqual(c.progress(ok), c.required);
});
test('required = 7 connections', () => assert.strictEqual(c.required, 7));
