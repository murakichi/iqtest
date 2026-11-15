// 逆唱(ワーキングメモリ Gwm)。提示された数字を逆の順番で答える。
// 桁数ごとの困難度は、成人の逆唱スパンが平均5桁前後という標準的な知見から置いた近似値。
const B = { 2: -3.0, 3: -2.2, 4: -1.2, 5: -0.2, 6: 0.7, 7: 1.5, 8: 2.2, 9: 2.8 };
export const spanB = (len) => B[len];
export const spanLevels = Object.keys(B).map(Number);

export function makeSpan(len, rng) {
  const digits = [];
  while (digits.length < len) { const d = rng.int(1, 9); if (d !== digits.at(-1) && d !== digits.at(-2)) digits.push(d); }
  return { domain: 'span', level: len, a: 1.0, b: B[len], c: 0, digits, answer: digits.slice().reverse().join(''), why: `${len}桁の逆唱` };
}
