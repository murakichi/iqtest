// 図形行列推理(流動性推論 Gf)。ルールベースの自動項目生成。
// ルール分類は Carpenter, Just & Shell (1990) に基づく:
//   row  = 行内で一定 / prog = 量的な段階変化 / d3 = 3値の分配(ラテン方格)
//   or・xor・and = 図形の加算・減算(1列目と2列目の線分を論理演算して3列目を作る)
// 誤答選択肢は「ルールを1つだけ破った図」を優先して作る(matRiks / Open Matrices Item Bank と同じ考え方)。
import { levelToB } from './irt.js';

const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'cross', 'star'];
const RULES = {
  1: ['row'], 2: ['prog'], 3: ['d3'], 4: ['row', 'prog'], 5: ['d3', 'prog'], 6: ['d3', 'd3'],
  7: ['or', 'd3'], 8: ['d3', 'd3', 'prog'], 9: ['logic', 'd3', 'prog'], 10: ['logic', 'd3', 'd3', 'prog'],
};
const RULE_LABEL = { row: '行ごとに一定', prog: '段階的に変化', d3: '3種類が各行・各列に1つずつ', or: '線の重ね合わせ(1列目+2列目)', xor: '線の排他的重ね合わせ(共通する線は消える)', and: '共通する線だけが残る' };
const ATTR_LABEL = { shape: '形', size: '大きさ', fill: '塗り', count: '個数', marker: '点の位置', lines: '枠線' };
export const matrixLevels = Object.keys(RULES).map(Number);

const bits = (m) => { let n = 0; for (let i = 0; i < 8; i++) if (m & (1 << i)) n++; return n; };

function lineRow(rng) {
  for (;;) {
    const a = rng.int(1, 254), b = rng.int(1, 254);
    if (bits(a) < 2 || bits(a) > 5 || bits(b) < 2 || bits(b) > 5) continue;
    if ((a & b) && (a & ~b) && (b & ~a)) return [a, b];
  }
}
const applyOp = (op, a, b) => (op === 'or' ? a | b : op === 'xor' ? a ^ b : a & b);

export function makeMatrix(level, rng) {
  let rules = RULES[level].slice();
  const attrs = rng.shuffle(['shape', 'size', 'fill', 'count', 'marker']);
  const plan = {}; // attr -> rule
  let lineOp = null;
  const progOk = ['size', 'fill', 'count', 'marker'];
  for (const rule of rules) {
    if (rule === 'or' || rule === 'logic') { lineOp = rule === 'or' ? 'or' : rng.pick(['xor', 'and']); continue; }
    const idx = attrs.findIndex((a) => !plan[a] && (rule !== 'prog' || progOk.includes(a)));
    plan[attrs[idx]] = rule;
  }
  const shapes3 = rng.shuffle(SHAPES).slice(0, 3);
  const spec = {};
  for (const a of ['shape', 'size', 'fill', 'count', 'marker']) {
    const rule = plan[a];
    const perm = rng.shuffle([0, 1, 2]);
    const k = rng.pick([1, 2]);
    const dir = rng.pick([1, -1]);
    const start = rng.int(0, 3);
    const corners = rng.shuffle([0, 1, 2, 3]).slice(0, 3);
    const fixed = a === 'marker' ? null : a === 'count' ? 0 : a === 'size' ? rng.pick([1, 2]) : rng.int(0, 2);
    spec[a] = (r, c) => {
      if (!rule) return fixed;
      if (a === 'marker') {
        if (rule === 'prog') return (((start + r + dir * c) % 4) + 4) % 4;
        return corners[rule === 'row' ? perm[r] : perm[(c + k * r) % 3]];
      }
      if (rule === 'row') return perm[r];
      if (rule === 'prog') return dir === 1 ? c : 2 - c;
      return perm[(c + k * r) % 3];
    };
  }
  const lineRows = lineOp ? [lineRow(rng), lineRow(rng), lineRow(rng)] : null;
  const cellAt = (r, c) => ({
    shape: shapes3[spec.shape(r, c)], size: spec.size(r, c), fill: spec.fill(r, c),
    count: spec.count(r, c), marker: spec.marker(r, c),
    lines: lineOp ? (c < 2 ? lineRows[r][c] : applyOp(lineOp, ...lineRows[r])) : null,
  });
  const cells = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cells.push(cellAt(r, c));
  const answer = cells[8];

  // 誤答選択肢
  const key = (x) => JSON.stringify(x);
  const seen = new Set([key(answer)]);
  const out = [];
  const push = (x) => { const k = key(x); if (!seen.has(k) && out.length < 5) { seen.add(k); out.push(x); } };
  const alts = (a) => {
    if (a === 'shape') return shapes3.filter((s) => s !== answer.shape);
    if (a === 'marker') return [0, 1, 2, 3].filter((v) => v !== answer.marker);
    return [0, 1, 2].filter((v) => v !== answer[a]);
  };
  const ruled = Object.keys(plan);
  const single = [];
  for (const a of ruled) for (const v of alts(a)) single.push({ ...answer, [a]: v });
  if (lineOp) {
    const [a, b] = lineRows[2];
    for (const m of [a | b, a ^ b, a & b, a, b]) if (m && m !== answer.lines) single.push({ ...answer, lines: m });
    single.push({ ...answer, lines: answer.lines ^ (1 << rng.int(0, 7)) || answer.lines });
  }
  rng.shuffle(single).forEach(push);
  const dbl = [];
  for (const x of single) for (const a of ruled) for (const v of alts(a)) dbl.push({ ...x, [a]: v });
  rng.shuffle(dbl).forEach(push);
  const free = ['shape', 'fill', 'size'].filter((a) => !plan[a]);
  let guard = 0;
  while (out.length < 5 && guard++ < 200) {
    const a = rng.pick(free.length ? free : ['fill']);
    const base = out.length && rng.chance(0.5) ? rng.pick(out) : answer;
    const v = a === 'shape' ? rng.pick(SHAPES) : rng.int(0, 2);
    push({ ...base, [a]: v });
  }
  const options = rng.shuffle([answer, ...out]);
  const why = [...ruled.map((a) => `${ATTR_LABEL[a]}:${RULE_LABEL[plan[a]]}`), ...(lineOp ? [`${ATTR_LABEL.lines}:${RULE_LABEL[lineOp]}`] : [])].join(' / ');
  return {
    domain: 'matrix', level, a: 1.3, b: levelToB(level), c: 1 / 6,
    cells: cells.slice(0, 8), options, answer: options.indexOf(answer), why,
    nRules: ruled.length + (lineOp ? 1 : 0),
  };
}

// ---------- 描画(SVG文字列) ----------
const POS = { 0: [[50, 50]], 1: [[29, 50], [71, 50]], 2: [[50, 31], [28, 68], [72, 68]] };
const RAD = [8, 12.5, 17];
const SEG = [[5, 5, 50, 5], [50, 5, 95, 5], [95, 5, 95, 50], [95, 50, 95, 95], [95, 95, 50, 95], [50, 95, 5, 95], [5, 95, 5, 50], [5, 50, 5, 5]];
const CORNER = [[15, 15], [85, 15], [85, 85], [15, 85]];

function poly(pts, cls) { return `<polygon class="${cls}" points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')}"/>`; }

function shapeEl(shape, cx, cy, r, cls) {
  switch (shape) {
    case 'circle': return `<circle class="${cls}" cx="${cx}" cy="${cy}" r="${r}"/>`;
    case 'square': return `<rect class="${cls}" x="${cx - r * 0.85}" y="${cy - r * 0.85}" width="${r * 1.7}" height="${r * 1.7}"/>`;
    case 'triangle': return poly([[cx, cy - r], [cx + r * 0.95, cy + r * 0.75], [cx - r * 0.95, cy + r * 0.75]], cls);
    case 'diamond': return poly([[cx, cy - r * 1.1], [cx + r * 0.75, cy], [cx, cy + r * 1.1], [cx - r * 0.75, cy]], cls);
    case 'cross': { const w = r * 0.36; return poly([[cx - w, cy - r], [cx + w, cy - r], [cx + w, cy - w], [cx + r, cy - w], [cx + r, cy + w], [cx + w, cy + w], [cx + w, cy + r], [cx - w, cy + r], [cx - w, cy + w], [cx - r, cy + w], [cx - r, cy - w], [cx - w, cy - w]], cls); }
    default: { const pts = []; for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r * 1.1; const an = -Math.PI / 2 + (i * Math.PI) / 5; pts.push([cx + rr * Math.cos(an), cy + rr * Math.sin(an)]); } return poly(pts, cls); }
  }
}

export function cellSvg(cell) {
  let s = '';
  if (cell.lines != null) SEG.forEach((g, i) => { if (cell.lines & (1 << i)) s += `<line class="mx-line" x1="${g[0]}" y1="${g[1]}" x2="${g[2]}" y2="${g[3]}"/>`; });
  const r = RAD[cell.size];
  for (const [cx, cy] of POS[cell.count]) s += shapeEl(cell.shape, cx, cy, r, `mx-shape mx-f${cell.fill}`);
  if (cell.marker != null) { const [x, y] = CORNER[cell.marker]; s += `<circle class="mx-dot" cx="${x}" cy="${y}" r="4.5"/>`; }
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${s}</svg>`;
}
