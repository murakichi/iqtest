// 項目反応理論(3PL)による能力推定。
// 注意: 項目パラメータは実データで較正したものではなく、ルール数などから理論的に割り当てた値。

export const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 難易度レベル(1〜10)を θ 尺度(平均0, SD1)上の困難度 b に対応づける
export const levelToB = (level) => -2.6 + (level - 1) * 0.55;

export function prob(theta, item) {
  return item.c + (1 - item.c) / (1 + Math.exp(-item.a * (theta - item.b)));
}

// 事前分布 N(0,1) のもとでの事後平均(EAP)と事後SD
export function eap(responses) {
  let den = 0, m1 = 0, m2 = 0;
  for (let t = -4; t <= 4.0001; t += 0.05) {
    let w = Math.exp(-(t * t) / 2);
    for (const r of responses) {
      const p = prob(t, r);
      w *= r.correct ? p : 1 - p;
    }
    den += w; m1 += t * w; m2 += t * t * w;
  }
  const theta = m1 / den;
  return { theta, sd: Math.sqrt(Math.max(m2 / den - theta * theta, 1e-6)) };
}

export function normalCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-(z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

// 較正されていないことによる不確かさ(θで0.4 = IQ約6点)を事後SDに上乗せする
export const CALIBRATION_SD = 0.4;
export const IQ_FLOOR = 65, IQ_CEIL = 135;

export function toIq(theta) { return 100 + 15 * theta; }

export function summarize(responses) {
  const { theta, sd } = eap(responses);
  const total = Math.sqrt(sd * sd + CALIBRATION_SD * CALIBRATION_SD);
  const clamp = (v) => Math.max(IQ_FLOOR, Math.min(IQ_CEIL, v));
  return {
    theta, sd, totalSd: total,
    iq: Math.round(clamp(toIq(theta))),
    lo: Math.round(clamp(toIq(theta - 1.96 * total))),
    hi: Math.round(clamp(toIq(theta + 1.96 * total))),
    percentile: normalCdf(theta) * 100,
    atCeiling: toIq(theta) >= IQ_CEIL, atFloor: toIq(theta) <= IQ_FLOOR,
  };
}
