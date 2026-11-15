// 画面の描画と操作。状態は S に集約し、view ごとに描き直す。
import { PLAN, TOTAL, newSession, nextItem, record, score } from './engine.js';
import { cellSvg } from './matrix.js';
import { solidSvg } from './rotation.js';
import { CALIBRATION_SD, IQ_CEIL, IQ_FLOOR } from './irt.js';

const app = document.getElementById('app');
const HISTORY_KEY = 'cogniscope.history.v1';

const DOMAIN = {
  matrix: { name: '図形行列', ability: '流動性推論', code: 'Gf', prompt: '「?」に入る図形を選んでください。', intro: '3×3 のマスに図形が規則に従って並んでいます。行(横)と列(縦)の両方から規則を見つけ、右下の「?」に入る図形を6つの候補から選びます。規則は1つとは限りません。' },
  series: { name: '数列', ability: '数量的推論', code: 'Gf・RQ', prompt: '「?」に入る数を入力してください。', intro: '数がある規則で並んでいます。最後の「?」に入る数を半角数字で入力します。電卓やメモは使わず、頭の中だけで考えてください。' },
  verbal: { name: '言語推理', ability: '言語的・演繹的推論', code: 'Gc・Gf', prompt: '最も適切なものを1つ選んでください。', intro: '言葉の関係や論理の問題です。知識の量ではなく、関係の把握と筋道の正しさを見ます。「必ず正しい」とは、どんな場合でも成り立つという意味です。' },
  rotation: { name: '立体回転', ability: '視空間能力', code: 'Gv', prompt: '左の立体を回転させただけのものを選んでください。', intro: '左に見本の立体があります。4つの候補のうち1つだけが、見本を回転させたものです。ほかは形が違うか、鏡に映した形(回転しても重ならない)です。' },
  span: { name: '数字の逆唱', ability: 'ワーキングメモリ', code: 'Gwm', prompt: '', intro: '数字が1つずつ表示されます。すべて消えたあとで、表示されたのと逆の順番で入力します。たとえば 3 → 8 → 1 なら「183」です。書き留めたり声に出したりせずに覚えてください。' },
};

const SOURCES = [
  { t: '何を測るか', d: '公開研究用テスト ICAR の4領域(行列・数列・言語・立体回転)を土台にした。ICAR の16問版は WAIS-IV の全検査IQと高く相関する一方、ワーキングメモリや処理速度とはほとんど相関しないと報告されているため、逆唱を加えた。', l: [['Condon & Revelle 2014', 'https://doi.org/10.1016/j.intell.2014.01.004'], ['Young & Keith 2020', 'https://doi.org/10.1177/0734282920943455'], ['McGrew ほか 2023', 'https://doi.org/10.3390/jintelligence11010019']] },
  { t: '毎回ちがう問題', d: '図形・数列・立体は規則から自動生成する。行列の規則は Carpenter らの分類、誤答の作り方は Open Matrices Item Bank と matRiks にならった。同じ問題を覚えて点が上がる再検査効果を抑えるためで、それでも受け直すと3回目あたりまでは点が上がりやすい。', l: [['Carpenter ほか 1990', 'https://doi.org/10.1037/0033-295X.97.3.404'], ['Koch ほか 2022', 'https://doi.org/10.3390/jintelligence10030041'], ['matRiks 2025', 'https://doi.org/10.3389/fpsyg.2025.1698995'], ['Scharfen ほか 2018', 'https://doi.org/10.1016/j.intell.2018.01.003']] },
  { t: '回答に合わせて難易度が変わる', d: '正解すると難しく、間違えるとやさしくなる適応型。WAIS-IV の行列推理では、適応型にすると精度を保ったまま問題数をおよそ半分にできると示されている。', l: [['Bilder ほか 2024', 'https://escholarship.org/content/qt5569c560/qt5569c560.pdf']] },
  { t: '1つの数字ではなく幅で示す', d: 'このテストには標準化サンプルがない。問題の難易度は規則の数などから理論的に置いた値で、実データで較正していない。そのため推定値に追加の不確かさを上乗せし、95%の幅を主役にしている。ICAR 自身も「規準がないので個人のIQは推論できない」と明記している。', l: [['ICAR プロジェクト', 'https://icar-project.com/']] },
  { t: '受け方の質を記録する', d: '報酬で点が大きく上がるという古いメタ分析は、捏造データの混入が判明して効果が大幅に縮んだ。現在の推定は d≈0.17 と小さいが、自己申告の努力と得点には r≈.28 の関連がある。そこで即答・時間切れ・画面離脱・自己申告の集中度を結果に添える。', l: [['Bates & Gignac 2022', 'https://doi.org/10.1016/j.intell.2022.101652'], ['Duckworth ほか 2011', 'https://doi.org/10.1073/pnas.1018601108']] },
  { t: 'これは測定で、訓練ではない', d: 'ワーキングメモリ訓練は訓練した課題に近い成績を上げるが、流動性知能には転移しないというのが2024年のメタ分析の結論。このテストを繰り返しても賢くはならない。', l: [['Rodas ほか 2024', 'https://doi.org/10.3758/s13423-024-02466-8']] },
  { t: '自己評価との比較', d: '自分の知能の見積もりと実測の相関はメタ分析で r≈.33 にとどまる。受ける前の予想と結果を並べて表示する。', l: [['Freund & Kasten 2012', 'https://doi.org/10.1037/a0026556']] },
];

const S = { view: 'intro', sess: null, item: null, sel: null, timer: null, token: 0, selfEst: null, effort: null, result: null };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = (q) => app.querySelector(q);

function loadHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } }
function saveHistory(h) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-12))); } catch { /* 保存できなくても結果は表示する */ } }

function go(view) { S.view = view; S.token++; clearInterval(S.timer); render(); window.scrollTo(0, 0); }

function render() {
  app.innerHTML = ({ intro, prep, block, item: itemView, effort, result })[S.view]();
  const f = app.querySelector('[data-autofocus]'); if (f) f.focus({ preventScroll: true });
}

// ---------- 開始前 ----------
function intro() {
  const hist = loadHistory();
  return `
  <section class="hero">
    <p class="eyebrow">適応型 認知能力テスト</p>
    <h1>5つの領域から、推論する力の現在地を幅で見積もる。</h1>
    <p class="lead">図形・数列・言語・立体・記憶の ${TOTAL} 問。回答に合わせて難易度が変わり、およそ15〜20分で終わります。結果は推定IQの「95%の幅」と領域別のプロフィールで返します。</p>
    <div class="actions"><button class="btn primary" data-act="prep" data-autofocus>テストの準備へ</button></div>
  </section>
  <section class="panel">
    <h2>測る領域</h2>
    <ul class="domains">${PLAN.map((p) => `<li><span class="code">${DOMAIN[p.domain].code}</span><b>${DOMAIN[p.domain].name}</b><span class="muted">${DOMAIN[p.domain].ability}・${p.n}問</span></li>`).join('')}</ul>
  </section>
  <section class="panel notice">
    <h2>先に知っておいてほしいこと</h2>
    <ul class="plain">
      <li>これは<strong>標準化された検査ではありません</strong>。数千人規模の規準集団で較正していないため、結果は参考値です。診断・選抜・進路の判断には使えません。</li>
      <li>正式な測定が必要なときは、公認心理師などが対面で実施する WAIS などの個別式検査を受けてください。</li>
      <li>測定できる範囲は IQ ${IQ_FLOOR}〜${IQ_CEIL} 相当です。これより上や下は区別できません。</li>
    </ul>
  </section>
  ${hist.length ? `<section class="panel"><h2>これまでの記録</h2>${historyTable(hist)}</section>` : ''}
  ${evidence()}`;
}

function evidence() {
  return `<section class="panel"><h2>設計の根拠</h2><p class="muted">テストの各部分が、どの研究知見に基づいているかをまとめました。</p>
  <div class="evidence">${SOURCES.map((s) => `<details><summary>${s.t}</summary><p>${s.d}</p><p class="refs">${s.l.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join('')}</p></details>`).join('')}</div></section>`;
}

function historyTable(h) {
  return `<div class="table-wrap"><table><thead><tr><th>日時</th><th>推定の中心</th><th>95%の幅</th></tr></thead><tbody>${h.slice().reverse().map((r) => `<tr><td>${new Date(r.t).toLocaleString('ja-JP', { dateStyle: 'medium', timeStyle: 'short' })}</td><td class="num">${r.iq}</td><td class="num">${r.lo}–${r.hi}</td></tr>`).join('')}</tbody></table></div>`;
}

function prep() {
  const v = S.selfEst ?? 100;
  return `
  <section class="panel">
    <p class="eyebrow">準備</p>
    <h2>受ける前に</h2>
    <ul class="plain checks">
      <li>中断されない静かな場所で、15〜20分を確保する</li>
      <li>紙・電卓・検索・他人の助けを使わない(使うと結果が意味を持たなくなります)</li>
      <li>図形が小さく感じる場合は、スマートフォンを横向きにするか大きな画面を使う</li>
      <li>各問題には制限時間があります。時間切れは不正解として扱われます</li>
      <li>途中で正誤は表示されません。わからない問題も最善の推測で答えてください</li>
    </ul>
  </section>
  <section class="panel">
    <h2>受ける前の予想</h2>
    <p>自分のIQはどのくらいだと思いますか。平均は100、およそ3人に2人が85〜115に入ります。結果と比べるためだけに使います。</p>
    <div class="slider">
      <input type="range" id="self-est" min="70" max="140" step="1" value="${v}" aria-label="自分のIQの予想">
      <output id="self-out" class="big-num">${v}</output>
    </div>
    <div class="actions">
      <button class="btn primary" data-act="start" data-autofocus>この予想で始める</button>
      <button class="btn ghost" data-act="start-skip">予想せずに始める</button>
    </div>
  </section>`;
}

function block() {
  const p = PLAN[S.sess.block], d = DOMAIN[p.domain];
  return `
  <section class="panel block-intro">
    <p class="eyebrow">パート ${S.sess.block + 1} / ${PLAN.length}<span class="code">${d.code}</span></p>
    <h2>${d.name}</h2>
    <p>${d.intro}</p>
    <dl class="facts"><div><dt>問題数</dt><dd>${p.n}問</dd></div><div><dt>制限時間</dt><dd>${p.limit ? `1問 ${p.limit}秒` : 'なし'}</dd></div><div><dt>測る力</dt><dd>${d.ability}</dd></div></dl>
    <div class="actions"><button class="btn primary" data-act="begin-block" data-autofocus>このパートを始める</button></div>
  </section>`;
}

// ---------- 出題 ----------
function startItem() {
  S.item = nextItem(S.sess); S.sel = null; S.phase = S.item.domain === 'span' ? 'show' : 'answer';
  go('item');
  S.t0 = performance.now();
  if (S.item.domain === 'span') return playDigits();
  if (S.item.limit) {
    const limit = S.item.limit * 1000, token = S.token;
    S.timer = setInterval(() => {
      if (token !== S.token) return clearInterval(S.timer);
      const left = Math.max(0, 1 - (performance.now() - S.t0) / limit);
      const bar = $('.timer i'); if (bar) { bar.style.transform = `scaleX(${left})`; bar.classList.toggle('low', left < 0.2); }
      if (left <= 0) submit(true);
    }, 200);
  }
}

function playDigits() {
  const token = S.token, ds = S.item.digits; let i = 0;
  const el = $('.digit');
  const step = () => {
    if (token !== S.token) return;
    if (i >= ds.length) { S.phase = 'answer'; S.token++; render(); S.t0 = performance.now(); return; }
    el.textContent = ds[i++]; el.classList.remove('off');
    setTimeout(() => { if (token === S.token) { el.classList.add('off'); setTimeout(step, 250); } }, 800);
  };
  setTimeout(step, 700);
}

function itemView() {
  const it = S.item, d = DOMAIN[it.domain], p = PLAN[S.sess.block];
  const head = `<div class="item-top"><div class="item-head"><span class="eyebrow">${d.name}<span class="code">${S.sess.inBlock + 1} / ${p.n}</span></span><span class="count">全体 ${S.sess.responses.length + 1} / ${TOTAL}</span></div>
  <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${TOTAL}" aria-valuenow="${S.sess.responses.length}"><i style="width:${(S.sess.responses.length / TOTAL) * 100}%"></i></div>
  ${it.limit ? '<div class="timer" aria-hidden="true"><i></i></div>' : ''}</div>`;
  let body = '';
  const letters = 'ABCDEF';
  const opt = (inner, i, cls = '') => `<button class="opt ${cls}" data-opt="${i}" aria-pressed="${S.sel === i}"><span class="opt-key">${letters[i]}</span>${inner}</button>`;
  if (it.domain === 'matrix') {
    body = `<p class="prompt">${d.prompt}</p>
    <div class="mx-grid">${it.cells.map((c) => `<div class="mx-cell">${cellSvg(c)}</div>`).join('')}<div class="mx-cell q">?</div></div>
    <div class="opt-grid six">${it.options.map((o, i) => opt(cellSvg(o), i, 'fig')).join('')}</div>`;
  } else if (it.domain === 'rotation') {
    body = `<p class="prompt">${d.prompt}</p>
    <div class="rot"><div class="rot-target"><span class="tag">見本</span>${solidSvg(it.target)}</div>
    <div class="opt-grid four">${it.options.map((o, i) => opt(solidSvg(o), i, 'fig')).join('')}</div></div>`;
  } else if (it.domain === 'verbal') {
    body = `<p class="prompt q-text">${esc(it.q)}</p><div class="opt-list">${it.options.map((o, i) => opt(`<span>${esc(o)}</span>`, i)).join('')}</div>`;
  } else if (it.domain === 'series') {
    body = `<p class="prompt">${d.prompt}</p><div class="series">${it.terms.map((t) => `<span>${t}</span>`).join('')}<span class="q">?</span></div>
    <label class="field"><span>答え</span><input id="answer" type="text" inputmode="numeric" pattern="-?[0-9]*" autocomplete="off" maxlength="7" data-autofocus></label>`;
  } else if (S.phase === 'show') {
    return `${head}<section class="stage"><p class="prompt">数字を覚えてください(${it.digits.length}桁)</p><div class="digit off" aria-live="off"></div></section>`;
  } else {
    body = `<p class="prompt">逆の順番で入力してください(${it.digits.length}桁)</p>
    <label class="field"><span>答え</span><input id="answer" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="${it.digits.length}" data-autofocus></label>`;
  }
  const needsSel = ['matrix', 'rotation', 'verbal'].includes(it.domain);
  return `${head}<section class="stage">${body}<div class="actions"><button class="btn primary" id="submit" data-act="submit" ${needsSel && S.sel == null ? 'disabled' : ''}>決定して次へ</button></div></section>`;
}

function submit(timeout = false) {
  const it = S.item; let correct = false;
  if (!timeout) {
    if (['series', 'span'].includes(it.domain)) {
      const raw = ($('#answer')?.value || '').trim().replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[−ー‐]/g, '-');
      if (!raw) return;
      correct = it.domain === 'span' ? raw === it.answer : Number(raw) === it.answer;
    } else {
      if (S.sel == null) return;
      correct = S.sel === it.answer;
    }
  }
  const step = record(S.sess, it, correct, { rt: Math.round(performance.now() - S.t0), timeout });
  if (step === 'item') startItem(); else go(step === 'block' ? 'block' : 'effort');
}

// ---------- 終了後 ----------
function effort() {
  const labels = ['ほとんど集中できなかった', 'あまり集中できなかった', 'ふつう', 'おおむね集中できた', '最後まで全力で取り組めた'];
  return `<section class="panel"><p class="eyebrow">最後に1つだけ</p><h2>どのくらい集中して取り組めましたか</h2>
  <p class="muted">結果の信頼度を判断するために使います。点数には影響しません。</p>
  <div class="opt-list">${labels.map((l, i) => `<button class="opt" data-effort="${i + 1}"><span class="opt-key">${i + 1}</span><span>${l}</span></button>`).join('')}</div></section>`;
}

function finish() {
  const r = score(S.sess);
  S.result = r;
  const h = loadHistory();
  S.prev = h.at(-1) || null;
  h.push({ t: Date.now(), iq: r.overall.iq, lo: r.overall.lo, hi: r.overall.hi, seed: S.sess.seed });
  saveHistory(h);
  go('result');
}

const X0 = 55, X1 = 145;
function bell(o) {
  const W = 640, H = 210, pad = 24, base = 160;
  const x = (iq) => pad + ((iq - X0) / (X1 - X0)) * (W - 2 * pad);
  const y = (iq) => base - 128 * Math.exp(-(((iq - 100) / 15) ** 2) / 2);
  const pts = []; for (let q = X0; q <= X1; q += 1) pts.push(`${x(q).toFixed(1)},${y(q).toFixed(1)}`);
  const band = []; for (let q = o.lo; q <= o.hi; q += 1) band.push(`${x(q).toFixed(1)},${y(q).toFixed(1)}`);
  const ticks = [70, 85, 100, 115, 130];
  const self = S.selfEst != null ? `<g class="self"><line x1="${x(S.selfEst)}" y1="${base}" x2="${x(S.selfEst)}" y2="${base + 12}"/><text x="${x(S.selfEst)}" y="${base + 40}" text-anchor="middle">予想 ${S.selfEst}</text></g>` : '';
  return `<div class="chart-wrap"><svg class="bell" viewBox="0 0 ${W} ${H}" role="img" aria-label="正規分布上の推定位置。中心 ${o.iq}、95%の幅 ${o.lo} から ${o.hi}">
    <polygon class="band" points="${x(o.lo).toFixed(1)},${base} ${band.join(' ')} ${x(o.hi).toFixed(1)},${base}"/>
    <polyline class="curve" points="${pts.join(' ')}"/>
    <line class="axis" x1="${pad}" y1="${base}" x2="${W - pad}" y2="${base}"/>
    ${ticks.map((t) => `<line class="tick" x1="${x(t)}" y1="${base}" x2="${x(t)}" y2="${base + 5}"/><text class="tick-l" x="${x(t)}" y="${base + 22}" text-anchor="middle">${t}</text>`).join('')}
    <line class="mark" x1="${x(o.iq)}" y1="${y(o.iq) - 6}" x2="${x(o.iq)}" y2="${base}"/>
    <circle class="mark-dot" cx="${x(o.iq)}" cy="${y(o.iq) - 6}" r="5"/>
    ${self}
  </svg></div>`;
}

function profileRow(dom, s) {
  const pos = (iq) => ((Math.max(X0, Math.min(X1, iq)) - X0) / (X1 - X0)) * 100;
  return `<div class="prow"><div class="plabel"><b>${DOMAIN[dom].name}</b><span class="muted">${DOMAIN[dom].ability}・${s.correct}/${s.n}問正解</span></div>
  <div class="ptrack" aria-hidden="true"><i class="mid"></i><i class="pband" style="left:${pos(s.lo)}%;width:${pos(s.hi) - pos(s.lo)}%"></i><i class="pdot" style="left:${pos(s.iq)}%"></i></div>
  <div class="pval num">${s.iq}<span class="muted"> (${s.lo}–${s.hi})</span></div></div>`;
}

function result() {
  const r = S.result, o = r.overall;
  const top = 100 - o.percentile;
  const pct = top < 50 ? `上位 約${Math.max(1, Math.round(top))}%` : `下から 約${Math.max(1, Math.round(o.percentile))}%`;
  const issues = [];
  if (r.rapid >= 2) issues.push(`2.5秒未満の即答が ${r.rapid} 回ありました。当て推量だった場合、結果は実力より低く出ます。`);
  if (r.timeouts >= 3) issues.push(`時間切れが ${r.timeouts} 回ありました。`);
  if (r.hidden > 0) issues.push(`出題中に画面を ${r.hidden} 回離れました。`);
  if (S.effort != null && S.effort <= 2) issues.push('集中できなかったと回答されています。結果は実力より低く出ている可能性があります。');
  const ds = Object.entries(r.by);
  const hiD = ds.reduce((a, b) => (b[1].theta > a[1].theta ? b : a)), loD = ds.reduce((a, b) => (b[1].theta < a[1].theta ? b : a));
  const spread = hiD[1].theta - loD[1].theta;
  const selfTxt = S.selfEst == null ? '' : (() => {
    const inside = S.selfEst >= o.lo && S.selfEst <= o.hi, diff = S.selfEst - o.iq;
    return `<section class="panel"><h2>受ける前の予想との比較</h2><p>予想は <b class="num">${S.selfEst}</b>、推定の中心は <b class="num">${o.iq}</b> でした。${inside ? '予想は95%の幅に入っており、このテストの精度では区別できない差です。' : `予想は95%の幅より${diff > 0 ? '上' : '下'}にあります。`}自己評価と実測の相関は研究でも r≈.33 程度にとどまり、ずれるのはごく普通のことです。</p></section>`;
  })();
  const retest = S.prev ? `<li>前回の中心は ${S.prev.iq} でした。受け直すと問題形式への慣れだけで点が上がることが知られており(再検査効果)、上昇分を能力の向上と読むことはできません。</li>` : '';
  const mark = (x) => (x.correct ? '<span class="ok">正</span>' : x.timeout ? '<span class="ng">時間切れ</span>' : '<span class="ng">誤</span>');
  return `
  <section class="hero result-hero">
    <p class="eyebrow">結果<span class="code">フォーム ${S.sess.seed.toString(36).toUpperCase()}</span></p>
    <h1><span class="range num">${o.lo}<i>–</i>${o.hi}</span></h1>
    <p class="lead">推定IQの95%の幅です。中心は <b class="num">${o.iq}</b>(${pct})。${o.atCeiling ? `測定上限の ${IQ_CEIL} に達しており、これより上は区別できません。` : ''}${o.atFloor ? `測定下限の ${IQ_FLOOR} に達しており、これより下は区別できません。` : ''}</p>
    ${bell(o)}
    <p class="caption">曲線は平均100・標準偏差15の正規分布。塗った範囲が95%の幅、縦線が推定の中心${S.selfEst != null ? '、下の目盛りが受ける前の予想' : ''}。</p>
  </section>
  <section class="panel ${issues.length ? 'warn' : ''}">
    <h2>受け方の質 <span class="pill ${issues.length ? 'bad' : 'good'}">${issues.length ? '注意あり' : '問題なし'}</span></h2>
    ${issues.length ? `<ul class="plain">${issues.map((i) => `<li>${i}</li>`).join('')}</ul>` : '<p>即答・時間切れ・画面離脱はほとんどなく、結果を歪める兆候は見つかりませんでした。</p>'}
  </section>
  <section class="panel">
    <h2>領域別プロフィール</h2>
    <p class="muted">各領域は6〜8問だけで推定しているため幅が広く、平均の100に引き寄せられます。幅が重なっている領域どうしの差は、得意・不得意とは言えません。</p>
    <div class="profile"><div class="pscale" aria-hidden="true"><span>70</span><span>85</span><span>100</span><span>115</span><span>130</span></div>${ds.map(([k, v]) => profileRow(k, v)).join('')}</div>
    <p>${spread * 15 >= 20 && hiD[1].lo > loD[1].hi ? `「${DOMAIN[hiD[0]].name}」が相対的に高く、「${DOMAIN[loD[0]].name}」が相対的に低い結果でした。` : '領域間に、誤差を超えるはっきりした差は見られませんでした。'}</p>
  </section>
  ${selfTxt}
  <section class="panel">
    <h2>この結果の読み方</h2>
    <ul class="plain">
      <li><b>幅が広いのは仕様です。</b>統計的な推定誤差(θで±${o.sd.toFixed(2)})に、問題の難易度を実データで較正していないことによる不確かさ(θで${CALIBRATION_SD})を上乗せしています。</li>
      <li><b>IQは固定された値ではありません。</b>成人では順位の安定性が高い(20歳・5年間隔で ρ≈.76)一方、体調・睡眠・慣れで1回ごとの点は動きます。</li>
      ${retest}
      <li><b>高い点は成功の保証ではありません。</b>スウェーデンの登録データでは、認知能力と賃金の関係は年収約6万ユーロを超えると頭打ちになり、上位1%の能力はその直下の層よりわずかに低いと報告されています。</li>
      <li><b>このテストで鍛えることはできません。</b>こうした課題の反復で流動性知能が上がるという証拠は、質の高いメタ分析では支持されていません。読み書きや数的な技能は、日常的に使い続けている人では40代以降も低下しにくいと報告されています。</li>
    </ul>
  </section>
  <section class="panel">
    <h2>回答の内訳</h2>
    <details><summary>全 ${TOTAL} 問の正誤と、各問題の規則を見る</summary>
    <div class="table-wrap"><table class="review"><thead><tr><th>#</th><th>領域</th><th>難度</th><th>結果</th><th>規則・正解</th></tr></thead><tbody>
    ${S.sess.responses.map((x, i) => `<tr><td class="num">${i + 1}</td><td>${DOMAIN[x.domain].name}</td><td class="num">${x.domain === 'span' ? `${x.level}桁` : `L${x.level}`}</td><td>${mark(x)}</td><td>${esc(x.why)}</td></tr>`).join('')}
    </tbody></table></div></details>
  </section>
  <section class="panel"><h2>これまでの記録</h2>${historyTable(loadHistory())}<p class="muted">記録はこのブラウザの中だけに保存され、外部には送信されません。</p></section>
  ${evidence()}
  <div class="actions end"><button class="btn primary" data-act="prep">新しい問題でもう一度受ける</button><button class="btn ghost" data-act="home">最初の画面へ</button></div>`;
}

// ---------- 操作 ----------
app.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.opt != null) {
    S.sel = Number(b.dataset.opt);
    app.querySelectorAll('[data-opt]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    const sb = $('#submit'); if (sb) sb.disabled = false;
    return;
  }
  if (b.dataset.effort) { S.effort = Number(b.dataset.effort); return finish(); }
  const act = b.dataset.act;
  if (act === 'prep') go('prep');
  else if (act === 'home') go('intro');
  else if (act === 'start' || act === 'start-skip') {
    S.selfEst = act === 'start' ? Number($('#self-est').value) : null; S.effort = null;
    S.sess = newSession((Date.now() ^ Math.floor(Math.random() * 2 ** 32)) >>> 0);
    go('block');
  } else if (act === 'begin-block') startItem();
  else if (act === 'submit') submit();
});

app.addEventListener('input', (e) => {
  if (e.target.id === 'self-est') { $('#self-out').textContent = e.target.value; S.selfEst = Number(e.target.value); }
});

document.addEventListener('keydown', (e) => {
  if (S.view !== 'item') return;
  if (e.key === 'Enter') { e.preventDefault(); submit(); return; }
  if (e.target.tagName === 'INPUT') return;
  const n = 'abcdef'.indexOf(e.key.toLowerCase()), m = n >= 0 ? n : Number(e.key) - 1;
  const btn = app.querySelector(`[data-opt="${m}"]`); if (btn) btn.click();
});

document.addEventListener('visibilitychange', () => { if (document.hidden && S.view === 'item' && S.sess) S.sess.hidden++; });

render();
