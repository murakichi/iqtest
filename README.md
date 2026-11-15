# コグニスコープ

研究知見にもとづいて設計した、適応型の認知能力テスト(Web アプリ)。5 領域 34 問、所要 15〜20 分。結果は推定 IQ の 95% の幅と領域別プロフィールで返す。

**標準化された心理検査ではない。** 項目の難易度は理論値で、実データで較正していない。診断や選抜には使えない。

- 調査レポート: [docs/research-report.md](docs/research-report.md)
- 設計と知見の対応: レポートの 10 章

## 動かす

ビルド不要。ES モジュールを使うので、ファイルを直接開くのではなく HTTP で配信する。

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開く。

1 ファイルにまとめたい場合(`file://` でも開ける):

```bash
node scripts/build-single.mjs
```

`dist/cogniscope.html` ができる。

## テスト

```bash
node tests/selftest.mjs
```

生成した全問題について正解が一意であることを確かめ、能力値が既知の模擬受検者 1,000 人で推定が真値を追うことを確認する。

## 構成

| ファイル | 役割 |
|---|---|
| `js/matrix.js` | 図形行列の生成と描画(流動性推論) |
| `js/series.js` | 数列の生成(数量的推論) |
| `js/verbal.js` | 言語推理の項目プールと順序推理の生成 |
| `js/rotation.js` | 立方体連結図形の生成と等角投影(視空間) |
| `js/span.js` | 数字の逆唱(ワーキングメモリ) |
| `js/irt.js` | 3PL モデルによる能力推定(EAP) |
| `js/engine.js` | 適応型の項目選択と採点 |
| `js/app.js` | 画面 |

回答と履歴はブラウザの localStorage にだけ保存し、外部には送信しない。
