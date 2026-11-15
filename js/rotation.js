// 3次元の心的回転(視空間能力 Gv)。Shepard & Metzler 型の立方体連結図形を生成する。
// 難しい水準では鏡像を誤答に使う(鏡像は回転では重ならない)。
import { levelToB } from './irt.js';

const AX = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const ROTS = (() => {
  const out = [];
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  const parity = [1, -1, -1, 1, 1, -1];
  perms.forEach((p, pi) => {
    for (let s = 0; s < 8; s++) {
      const sg = [s & 1 ? -1 : 1, s & 2 ? -1 : 1, s & 4 ? -1 : 1];
      if (parity[pi] * sg[0] * sg[1] * sg[2] === 1) out.push({ p, sg });
    }
  });
  return out; // 24個の回転
})();

const rot = (cells, R) => cells.map((c) => [c[R.p[0]] * R.sg[0], c[R.p[1]] * R.sg[1], c[R.p[2]] * R.sg[2]]);
const norm = (cells) => {
  const m = [0, 1, 2].map((i) => Math.min(...cells.map((c) => c[i])));
  return cells.map((c) => [c[0] - m[0], c[1] - m[1], c[2] - m[2]]).sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
};
const keyOf = (cells) => norm(cells).map((c) => c.join(',')).join('|');
const canon = (cells) => ROTS.map((R) => keyOf(rot(cells, R))).sort()[0];
const mirror = (cells) => cells.map((c) => [-c[0], c[1], c[2]]);

function chain(lengths, rng) {
  for (;;) {
    const cells = [[0, 0, 0]]; const used = new Set(['0,0,0']);
    let pos = [0, 0, 0], prev = -1, ok = true;
    for (const len of lengths) {
      let ax; do { ax = rng.int(0, 2); } while (ax === prev);
      const sign = rng.pick([1, -1]); prev = ax;
      for (let i = 0; i < len && ok; i++) {
        pos = pos.map((v, j) => v + AX[ax][j] * sign);
        const k = pos.join(','); if (used.has(k)) ok = false; used.add(k); cells.push(pos);
      }
    }
    if (ok) return cells;
  }
}

// 等角投影で完全に隠れる立方体がない向きだけを使う
function visible(cells) {
  const set = new Set(cells.map((c) => c.join(',')));
  const has = (x, y, z) => set.has(`${x},${y},${z}`);
  return cells.every(([x, y, z]) => {
    for (let k = 1; k < 6; k++) if (has(x + k, y + k, z + k)) return false;
    return !(has(x + 1, y, z) && has(x, y + 1, z) && has(x, y, z + 1));
  });
}

function view(cells, rng, avoid) {
  for (const R of rng.shuffle(ROTS)) {
    const v = norm(rot(cells, R));
    if (visible(v) && !avoid.has(keyOf(v))) { avoid.add(keyOf(v)); return v; }
  }
  return null;
}

const SPEC = {
  2: { lens: [[2, 1], [3, 1], [2, 2], [3, 2]], mirrors: 0 },
  4: { lens: [[2, 1, 2], [2, 2, 1], [1, 2, 2], [3, 1, 1]], mirrors: 0 },
  6: { lens: [[2, 2, 1, 2], [3, 1, 2, 1], [2, 1, 2, 2]], mirrors: 1, chiral: true },
  8: { lens: [[2, 2, 1, 2], [3, 2, 2, 1], [2, 1, 3, 2]], mirrors: 2, chiral: true },
  10: { lens: [[2, 1, 2, 1, 2], [2, 2, 1, 2, 2], [3, 1, 2, 2, 1]], mirrors: 3, chiral: true },
};
export const rotationLevels = Object.keys(SPEC).map(Number);

export function makeRotation(level, rng) {
  const sp = SPEC[level];
  for (;;) {
    const lens = rng.pick(sp.lens);
    const shape = chain(lens, rng);
    const cn = canon(shape);
    if (sp.chiral && cn === canon(mirror(shape))) continue;
    const avoid = new Set();
    const target = view(shape, rng, avoid);
    const correct = view(shape, rng, avoid);
    if (!target || !correct) continue;
    const wrong = [];
    for (let i = 0; i < sp.mirrors; i++) { const v = view(mirror(shape), rng, avoid); if (v) wrong.push(v); }
    const canons = new Set([cn]);
    let guard = 0;
    while (wrong.length < 3 && guard++ < 300) {
      // 立方体の数は同じで、曲がり方だけが違う図形
      const alt = chain(level <= 2 ? rng.pick(sp.lens.filter((l) => l !== lens)) : rng.shuffle(lens), rng);
      const ac = canon(alt);
      if (canons.has(ac)) continue;
      if (sp.chiral && ac === canon(mirror(shape))) continue;
      const v = view(alt, rng, avoid); if (!v) continue;
      canons.add(ac); wrong.push(v);
    }
    if (wrong.length < 3) continue;
    const options = rng.shuffle([correct, ...wrong]);
    return {
      domain: 'rotation', level, a: 0.9, b: levelToB(level), c: 0.25,
      target, options, answer: options.indexOf(correct),
      why: sp.mirrors ? `正解以外に鏡像が${sp.mirrors}個含まれる(鏡像は回転しても一致しない)` : '誤答はすべて曲がり方が異なる別の立体',
    };
  }
}

export function solidSvg(cells) {
  const C = 0.866, S = 0.5;
  const P = (x, y, z) => [(x - y) * C, (x + y) * S - z];
  const sorted = cells.slice().sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9; let body = '';
  const face = (pts, cls) => {
    for (const [x, y] of pts) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    body += `<polygon class="${cls}" points="${pts.map((p) => p.map((v) => v.toFixed(3)).join(',')).join(' ')}"/>`;
  };
  for (const [x, y, z] of sorted) {
    face([P(x, y, z + 1), P(x + 1, y, z + 1), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], 'cu cu-t');
    face([P(x + 1, y, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x + 1, y, z + 1)], 'cu cu-r');
    face([P(x, y + 1, z), P(x + 1, y + 1, z), P(x + 1, y + 1, z + 1), P(x, y + 1, z + 1)], 'cu cu-l');
  }
  const span = Math.max(maxX - minX, maxY - minY, 5.2) + 0.5;
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  return `<svg viewBox="${(cx - span / 2).toFixed(3)} ${(cy - span / 2).toFixed(3)} ${span.toFixed(3)} ${span.toFixed(3)}" aria-hidden="true">${body}</svg>`;
}

export const _test = { canon, mirror, keyOf, visible };
