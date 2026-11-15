// テストの進行と適応型の項目選択。
// 直前までの全回答から能力 θ を推定し、その θ に困難度がいちばん近い水準の項目を次に出す。
import { eap, levelToB, summarize } from './irt.js';
import { makeRng } from './rng.js';
import { makeMatrix, matrixLevels } from './matrix.js';
import { makeSeries, seriesLevels } from './series.js';
import { makeVerbal, verbalLevels } from './verbal.js';
import { makeRotation, rotationLevels } from './rotation.js';
import { makeSpan, spanLevels, spanB } from './span.js';

export const PLAN = [
  { domain: 'matrix', n: 8, limit: 90 },
  { domain: 'series', n: 7, limit: 75 },
  { domain: 'verbal', n: 7, limit: 75 },
  { domain: 'rotation', n: 6, limit: 75 },
  { domain: 'span', n: 6, limit: 0 },
];
export const TOTAL = PLAN.reduce((s, b) => s + b.n, 0);

const DOM = {
  matrix: { levels: matrixLevels, b: levelToB, make: makeMatrix },
  series: { levels: seriesLevels, b: levelToB, make: makeSeries },
  verbal: { levels: verbalLevels, b: levelToB, make: makeVerbal },
  rotation: { levels: rotationLevels, b: levelToB, make: makeRotation },
  span: { levels: spanLevels, b: spanB, make: makeSpan },
};

export function newSession(seed) {
  return { seed, rng: makeRng(seed), responses: [], block: 0, inBlock: 0, usage: {}, usedVerbal: new Set(), hidden: 0 };
}

export function nextItem(s) {
  const blk = PLAN[s.block];
  const d = DOM[blk.domain];
  const target = eap(s.responses).theta - (s.inBlock === 0 ? 0.8 : 0); // 各パートの1問目はやさしめ
  const usage = (s.usage[blk.domain] ||= {});
  const order = d.levels.slice().sort((x, y) => Math.abs(d.b(x) - target) - Math.abs(d.b(y) - target));
  for (const L of order) {
    if ((usage[L] || 0) >= 2) continue;
    const it = d.make(L, s.rng, s.usedVerbal);
    if (!it) { usage[L] = 9; continue; }
    usage[L] = (usage[L] || 0) + 1;
    return { ...it, limit: blk.limit };
  }
  throw new Error('項目が不足しています');
}

// 回答を記録し、次に進む先を返す: 'item' | 'block' | 'done'
export function record(s, item, correct, meta) {
  s.responses.push({ domain: item.domain, level: item.level, a: item.a, b: item.b, c: item.c, correct, why: item.why, ...meta });
  s.inBlock++;
  if (s.inBlock < PLAN[s.block].n) return 'item';
  s.block++; s.inBlock = 0;
  return s.block < PLAN.length ? 'block' : 'done';
}

export function score(s) {
  const by = {};
  for (const p of PLAN) {
    const rs = s.responses.filter((r) => r.domain === p.domain);
    by[p.domain] = { ...summarize(rs), n: rs.length, correct: rs.filter((r) => r.correct).length };
  }
  const mc = s.responses.filter((r) => ['matrix', 'verbal', 'rotation'].includes(r.domain));
  return {
    overall: summarize(s.responses), by,
    rapid: mc.filter((r) => !r.timeout && r.rt < 2500).length,
    timeouts: s.responses.filter((r) => r.timeout).length,
    hidden: s.hidden,
  };
}
