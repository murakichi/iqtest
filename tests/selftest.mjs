// 生成器と採点の自己検査: node tests/selftest.mjs
import assert from 'node:assert/strict';
import { makeRng } from '../js/rng.js';
import { makeMatrix, matrixLevels, cellSvg } from '../js/matrix.js';
import { makeSeries, seriesLevels } from '../js/series.js';
import { makeVerbal, verbalLevels, _pool } from '../js/verbal.js';
import { makeRotation, rotationLevels, solidSvg, _test } from '../js/rotation.js';
import { makeSpan } from '../js/span.js';
import { newSession, nextItem, record, score, PLAN, TOTAL } from '../js/engine.js';
import { prob } from '../js/irt.js';

const rng = makeRng(12345);
for (let i = 0; i < 300; i++) for (const L of matrixLevels) {
  const it = makeMatrix(L, rng);
  assert.equal(it.options.length, 6, `matrix L${L} options`);
  assert.equal(new Set(it.options.map((o) => JSON.stringify(o))).size, 6, `matrix L${L} unique options`);
  assert.ok(it.answer >= 0 && it.answer < 6);
  assert.equal(it.cells.length, 8);
  it.options.forEach((o) => assert.ok(cellSvg(o).includes('<svg')));
  if (it.options[it.answer].lines != null) assert.ok(it.options.every((o) => o.lines > 0), 'no empty line cells');
}
for (let i = 0; i < 500; i++) for (const L of seriesLevels) {
  const it = makeSeries(L, rng);
  assert.ok(Number.isInteger(it.answer) && it.terms.every(Number.isInteger));
  assert.ok(Math.abs(it.answer) < 100000, `series L${L} too large: ${it.answer}`);
  assert.ok(it.terms.length >= 5);
}
for (const it of _pool) assert.equal(new Set(it.o).size, it.o.length, `verbal dup options: ${it.q}`);
for (let i = 0; i < 200; i++) for (const L of [3, 5, 7]) {
  const it = makeVerbal(L, rng, new Set(_pool.keys()));
  assert.ok(it && it.answer >= 0 && new Set(it.options).size === it.options.length);
}
for (let i = 0; i < 150; i++) for (const L of rotationLevels) {
  const it = makeRotation(L, rng);
  const { canon, keyOf, visible } = _test;
  const t = canon(it.target);
  it.options.forEach((o, k) => {
    assert.equal(canon(o) === t, k === it.answer, `rotation L${L}: only the answer matches the target`);
    assert.ok(visible(o)); assert.ok(solidSvg(o).includes('polygon'));
  });
  assert.equal(new Set([it.target, ...it.options].map(keyOf)).size, 5, 'distinct views');
}
for (let n = 2; n <= 9; n++) { const it = makeSpan(n, rng); assert.equal(it.answer.length, n); }

// 模擬受検: 真の θ を持つ受検者を多数シミュレートし、推定が真値を追えるか確認する
function simulate(theta, seed) {
  const s = newSession(seed); const r = makeRng(seed ^ 0x9e3779b9);
  for (;;) {
    const it = nextItem(s);
    const step = record(s, it, r.next() < prob(theta, it), { rt: 9000, timeout: false });
    if (step === 'done') break;
  }
  assert.equal(s.responses.length, TOTAL);
  return score(s);
}
const rows = [];
for (const th of [-2, -1, 0, 1, 2]) {
  let sum = 0, cover = 0, sd = 0; const N = 200;
  for (let i = 0; i < N; i++) {
    const o = simulate(th, 1000 * (th + 3) + i).overall;
    sum += o.theta; sd += o.sd; if (Math.abs(o.theta - th) <= 1.96 * o.totalSd) cover++;
  }
  rows.push({ trueTheta: th, meanEstimate: +(sum / N).toFixed(2), meanPosteriorSd: +(sd / N).toFixed(2), coverage95: +(cover / N).toFixed(2) });
}
console.table(rows);
for (const r of rows) assert.ok(Math.abs(r.meanEstimate - r.trueTheta) < 0.6, 'estimate tracks truth (EAP shrinks toward 0)');
console.log(`OK  items per session: ${TOTAL}, blocks: ${PLAN.map((p) => p.domain + '×' + p.n).join(', ')}`);
