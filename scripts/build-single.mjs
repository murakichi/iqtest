// index.html と js/ を1つの HTML にまとめる(依存なし)。
// 使い方: node scripts/build-single.mjs [出力先] [--fragment]
//   --fragment: <html>/<head>/<body> を付けない断片として出力する(ページ埋め込み用)
// 各モジュールの import 行と export キーワードを取り除いて依存順に連結するだけの単純な方式。
// そのためトップレベルの名前がモジュール間で重複すると壊れる。重複は下で検査する。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const fragment = args.includes('--fragment');
const out = resolve(args.find((a) => !a.startsWith('--')) || `${root}/dist/cogniscope.html`);
const ORDER = ['rng', 'irt', 'series', 'matrix', 'rotation', 'verbal', 'span', 'engine', 'app'];

const seen = new Map();
let js = '';
for (const name of ORDER) {
  let src = readFileSync(`${root}/js/${name}.js`, 'utf8');
  src = src.replace(/^import .*;\n/gm, '').replace(/^export (?=const|function|let)/gm, '');
  if (/^\s*(import|export)\b/m.test(src)) throw new Error(`${name}.js: 対応していない import/export の書き方があります`);
  for (const m of src.matchAll(/^(?:const|let|function)\s+([A-Za-z_$][\w$]*)/gm)) {
    if (seen.has(m[1])) throw new Error(`名前の重複: ${m[1]} (${seen.get(m[1])}.js と ${name}.js)`);
    seen.set(m[1], name);
  }
  js += `// ---- ${name}.js ----\n${src}\n`;
}

const html = readFileSync(`${root}/index.html`, 'utf8');
const head = html.split('<!--ARTIFACT-HEAD-->')[1].split('</head>')[0].trim();
const body = html.split('<body>')[1].split('<script')[0].trim();
const script = `<script>\n(() => {\n${js.replace(/<\/script/g, '<\\/script')}})();\n</script>`;
const page = fragment
  ? `${head}\n${body}\n${script}\n`
  : `<!doctype html>\n<html lang="ja">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${body}\n${script}\n</body>\n</html>\n`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, page);
console.log(`wrote ${out} (${(page.length / 1024).toFixed(0)} KB)`);
