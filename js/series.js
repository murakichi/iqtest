// 数列完成(流動性推論・数量的推論)。規則の種類と階数で難易度を統制する。
// 難易度要因は Holzman らの枠組み(規則の数・複雑さ・周期性)に対応。
import { levelToB } from './irt.js';

const gens = {
  1: (r) => { const d = r.int(2, 9), s = r.int(1, 20); return { t: seq(7, (i) => s + d * i), why: `毎回 +${d}` }; },
  2: (r) => {
    if (r.chance(0.5)) { const d = r.int(3, 9), s = r.int(70, 99); return { t: seq(7, (i) => s - d * i), why: `毎回 −${d}` }; }
    const k = r.pick([2, 3]), s = r.int(1, 5); return { t: seq(k === 2 ? 7 : 6, (i) => s * k ** i), why: `毎回 ×${k}` };
  },
  3: (r) => { const m = r.pick([1, 2, 3]), s = r.int(1, 15); return { t: acc(7, s, (i) => m * (i + 1)), why: `増分が +${m}, +${2 * m}, +${3 * m}… と増える` }; },
  4: (r) => {
    const a = r.int(5, 9), b = r.int(1, 4), s = r.int(3, 20);
    return r.chance(0.5)
      ? { t: acc(8, s, (i) => (i % 2 ? -b : a)), why: `+${a} と −${b} を交互に` }
      : { t: acc(8, s, (i) => (i % 2 ? b : a)), why: `+${a} と +${b} を交互に` };
  },
  5: (r) => {
    const d1 = r.int(2, 6), d2 = r.int(2, 6), s1 = r.int(1, 12), s2 = r.int(40, 70);
    return { t: seq(9, (i) => (i % 2 ? s2 - d2 * ((i - 1) / 2) : s1 + d1 * (i / 2))), why: `2つの数列が交互に並ぶ(+${d1} の列と −${d2} の列)` };
  },
  6: (r) => { const st = r.int(2, 4), f = r.int(1, 6), s = r.int(1, 12); return { t: acc(7, s, (i) => f + st * i), why: `増分が ${st} ずつ大きくなる(階差が等差)` }; },
  7: (r) => { let a = r.int(1, 8), b = r.int(1, 9); if (a === b) b++; return { t: rec2(8, a, b, (x, y) => x + y), why: '前の2つの数の和' }; },
  8: (r) => { const k = r.pick([2, 3]), c = r.pick([-3, -2, -1, 1, 2, 3, 4, 5]), s = r.int(2, 5); return { t: rec1(k === 2 ? 7 : 6, s, (x) => k * x + c), why: `前の数を ×${k} して ${c > 0 ? '+' : '−'}${Math.abs(c)}` }; },
  9: (r) => {
    if (r.chance(0.5)) { const k = r.pick([2, 3]), f = r.int(1, 4), s = r.int(1, 20); return { t: acc(k === 2 ? 7 : 6, s, (i) => f * k ** i), why: `増分が ×${k} で大きくなる(階差が等比)` }; }
    const d = r.int(3, 7), s1 = r.int(1, 3), s2 = r.int(5, 30); return { t: seq(9, (i) => (i % 2 ? s2 + d * ((i - 1) / 2) : s1 * 2 ** (i / 2))), why: `×2 の列と +${d} の列が交互に並ぶ` };
  },
  10: (r) => {
    if (r.chance(0.5)) { const c = r.int(1, 4), a = r.int(1, 5), b = r.int(2, 6); return { t: rec2(8, a, b, (x, y) => x + y + c), why: `前の2つの数の和に +${c}` }; }
    const a = r.int(1, 3), b = r.int(1, 4), c = r.int(2, 5); const t = [a, b, c]; while (t.length < 8) t.push(t.at(-1) + t.at(-2) + t.at(-3)); return { t, why: '前の3つの数の和' };
  },
};

function seq(n, f) { return Array.from({ length: n }, (_, i) => f(i)); }
function acc(n, s, d) { const t = [s]; for (let i = 0; i < n - 1; i++) t.push(t[i] + d(i)); return t; }
function rec1(n, s, f) { const t = [s]; while (t.length < n) t.push(f(t.at(-1))); return t; }
function rec2(n, a, b, f) { const t = [a, b]; while (t.length < n) t.push(f(t.at(-2), t.at(-1))); return t; }

export const seriesLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function makeSeries(level, rng) {
  const g = gens[level](rng);
  return {
    domain: 'series', level, a: 1.2, b: levelToB(level), c: 0,
    terms: g.t.slice(0, -1), answer: g.t.at(-1), why: g.why,
  };
}
