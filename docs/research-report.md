# IQ・知能研究の近年の知見と、テスト設計への反映

作成日: 2026-11-15

## この文書の位置づけと限界

- 対象は主に 2018〜2026 年の査読論文とメタ分析。古典的な研究は、設計の直接の根拠になるものだけ挙げた。
- **確認の水準**: この調査環境では出版社サイトや PubMed の本文を直接開けなかった。各論文の内容は、検索で得られた抄録・大学のプレスリリース・リポジトリ情報にもとづく。効果量などの数値は、引用前に原典で確認してほしい。確認が特に弱い箇所には「要確認」と付けた。
- 企業のブログや販売サイトしか出典がない主張は採用していない。利益相反のある論文はその旨を書いた。

## 要点

1. **フリン効果(世代ごとのIQ上昇)は、複数の高所得国で止まるか逆転している。** 原因は遺伝ではなく環境側にあり、教育拡大が低下を一時的に隠していた可能性が 2026 年に示された。
2. **オンラインの短い検査でも、作りが良ければ個別式検査とかなり一致する。** ただし規準(ノルム)がなければ個人のIQは言えない。これは公開テスト ICAR の作成者自身が明言している。
3. **「脳トレ」で流動性知能は上がらない。** 2024 年のメタ分析でも結論は変わらなかった。一方、教育年数は IQ を 1 年あたり 1〜5 点押し上げる。
4. **動機づけの影響は、かつて言われたより小さい。** 有名なメタ分析に捏造データが含まれていたことが判明し、推定値は大幅に縮んだ。
5. **g(一般知能)は統計的には頑健だが、その正体は未決着。** 単一の原因とみる立場と、多数の過程の重なりとみる立場が併存している。脳画像研究は「特定の部位」より「全脳ネットワーク」を支持する方向だが、これも反証が出ている。
6. **IQ は多くのことを予測するが、上限がある。** 賃金との関係は高所得層で頭打ちになる。

## 1. 知能の構造をどう考えるか

**CHC 理論が実務の標準。** 知能を、g を頂点に、流動性推論(Gf)・結晶性知能(Gc)・視空間(Gv)・ワーキングメモリ(Gwm)・処理速度(Gs)などの広域能力に分ける。WAIS や WJ などの主要検査はこの枠組みで作られている。

**g の解釈は割れている。**

- 過程重複理論(POT)は、g を「原因」ではなく、多くの課題が同じ実行機能を共有することから生じる指標とみる。高次因子モデルとは両立しない。
- McGrew ら(2023)は WJ-IV の標準化データに心理測定ネットワーク分析を適用し、CHC の広域能力を支持したうえで、**ワーキングメモリと注意制御の複合体がネットワークの中心にある**可能性を示した。
- 反論もある。WAIS-IV データでは高次因子モデルも同じくらいよく当てはまり、ネットワークモデルが POT や相互作用説だけを支持するとは言えない、という指摘がある。

**テスト設計への含意**: 単一の課題(行列だけ)ではなく複数の広域能力を測る。ワーキングメモリは外さない。

## 2. フリン効果とその逆転

- **ノルウェー(Bratsberg & Rogeberg, 2018, PNAS)**: 徴兵検査データで、上昇は 1970 年代半ば生まれを頂点に低下へ転じた。低下は同じ家族の兄弟間でも見られるため、人口構成の変化では説明できず、環境要因による。
- **ノルウェー(2026, PNAS)**: 1967〜1991 年生まれの男性 579,379 人。父親の所得階層別に見ると、得点の世代変化は教育年数の伸びと連動していた。著者らは、**集団全体の低下は従来考えられていたより早く始まっており、低所得層では教育拡大が一時的に打ち消していた**と結論している。教育拡大が止まると全階層で低下し、高所得層で最も急だった。
- **米国(Dworak, Revelle & Condon, 2023, Intelligence)**: オンライン調査 SAPA の成人 394,378 人(2006〜2018 年)。言語推理・行列推理・文字数字系列の得点は低下し、3 次元回転だけは 2011〜2018 年に上昇したと報じられている。著者は能力そのものの低下とは断定していない。(要確認: 抄録の表現と報道の表現に食い違いがある)
- **大学生の IQ(Uttl ら, 2024)**: ウェクスラー式検査を受けた学部生サンプルのメタ分析。平均は 1939 年の約 119 から現在の約 102 まで下がった。進学率の上昇による当然の帰結で、「大学生は平均より 1SD 高い」という古い前提はもう成り立たない。

**含意**: 古い規準で採点すると得点は高めに出る。規準の年代は結果の解釈に直接効く。領域によって傾向が逆(回転は上昇)なので、領域別に見る価値がある。

## 3. 遺伝と環境

- 双生児研究では、認知能力の遺伝率はおおむね 50〜80%で、年齢とともに上がる(ウィルソン効果)。
- ポリジェニックスコアの予測力は、家族内(きょうだい間)で比べると下がる。学歴では 2019 年時点で約 55% の減衰が報告されており、集団レベルの予測には家庭環境などの間接効果が混ざっている。
- 2026 年に、家族内でも予測力がほとんど落ちない(約 0.88 倍)という論文が出た(Wolfram ら, Intelligence & Cognitive Abilities)。ただし著者は胚スクリーニングを販売する企業の所属で、利益相反がある。同じ論文内で、別データではより大きな減衰が出たことにも触れられており、結論は確定していない。
- **教育の効果(Ritchie & Tucker-Drob, 2018)**: 準実験研究 42 データセット・約 61.6 万人のメタ分析で、教育 1 年あたり IQ がおよそ 1〜5 点上がる。効果は生涯にわたって残る。

## 4. 生涯にわたる変化

- **安定性(Breit ら, 2024, Psychological Bulletin)**: 縦断研究 205 件・87,408 人。順位の安定性は幼児期には低く、児童期に急上昇し、青年期後期以降は高いまま保たれる。20 歳・5 年間隔で ρ = .76。
- **「使わなければ衰える」(Hanushek ら, 2025, Science Advances)**: ドイツの PIAAC 縦断データ。読解と数的技能の平均は 40 代まで伸び、その後低下するが、**低下が見られるのは技能の使用頻度が平均以下の人だけ**だった。

## 5. 知能は鍛えられるか

- **ワーキングメモリ訓練(Rodas ら, 2024, Psychonomic Bulletin & Review)**: 訓練で流動性知能は向上せず、ワーキングメモリの伸びと流動性知能の伸びも連動しなかった。訓練課題に似た課題の成績は上がる(近転移)。
- 高齢者対象のメタ分析でも、近転移は小さく(g ≈ 0.27)、遠転移はほぼゼロ(g ≈ 0.12)。
- 対照的に、教育(3 章)と日常的な技能の使用(4 章)には効果の証拠がある。

**含意**: テストは測定の道具であって訓練の道具ではない。その旨を結果画面に明記する。

## 6. 脳と知能

- **5 理論の直接比較(Anderson & Barbey, 2023, Human Brain Mapping)**: 安静時 fMRI から知能を予測する手法で、前頭前野説・頭頂前頭統合理論(P-FIT)・多重要求系・過程重複理論・ネットワーク神経科学理論を比べた。全脳を使うネットワーク神経科学理論の予測がわずかに、しかし一貫して良かった。
- **Wilcox ら(2026, Nature Communications)**: 831 人で同理論を検証し、単一の領域や「知能ネットワーク」では個人差を説明できず、全体の協調が効いていると報告。
- **反証**: 同じ 2026 年に、全脳のグラフ理論指標は一般知能と意味のある関係を示さなかったという大規模研究も報じられている。(要確認: 二次報道のみ)
- **Thiele ら(2024)**: 予測精度は一般知能 > 結晶性 > 流動性の順。著者らは、精度の最大化より説明を重視すべきだと主張している。

いずれも相関研究で、脳画像から個人の IQ を実用的な精度で当てられる段階にはない。

## 7. 測定の方法論

### 7.1 オンライン・短縮検査

- **ICAR(Condon & Revelle, 2014)**: 研究用に公開された認知能力テスト。行列推理・文字数字系列・言語推理・3 次元回転の 4 種 60 問と、16 問の短縮版がある。96,958 人(14〜90 歳)で検証された。
- **妥当性(Young & Keith, 2020)**: 16 問版と WAIS-IV の全検査 IQ の相関は、補正後 r = .81(学生 97 人)。一方、**処理速度やワーキングメモリの指標とは r = .07〜.32 と低い**。
- **限界**: ICAR の FAQ は、規準がないので個人の得点から IQ は推論できないと明記している。
- 無監督のオンライン受検には、外部の助けの利用と、受検者の自己選択という固有の問題がある。

### 7.2 自動項目生成

- **規則の分類(Carpenter, Just & Shell, 1990)**: レーヴン行列の規則を、行内一定・量的な段階変化・図形の加算減算・3 値の分配などに分類。規則の数と種類が難易度を決める。
- **Open Matrices Item Bank(Koch ら, 2022)**: 構成規則から作った 220 問を医学部志願者 2,572 人で検証し、GPLv3 で公開。
- **matRiks(2025)**: 規則の組み合わせで行列問題を生成する R パッケージ。誤答選択肢を、実際によくある誤りの型から作る。
- 数列では、規則の数・規則の複雑さ・周期性・1 つの関係に必要な演算数が難易度要因になる(Holzman らの枠組み)。
- ただし、規則から難易度を完全には予測できない。実データでの較正は省略できない。

### 7.3 適応型テスト

- WAIS-IV 行列推理に 2PL モデルを当てはめた研究(Bilder ら, 2024、対象 2,197 人)では、適応型にすると問題数を半分以下にできる。先行研究(Reise ら, 2021)では最大 10 問で、能力 −1〜+2SD の範囲で信頼性 .80 超。両端では精度が落ちる。

### 7.4 再検査効果

- Scharfen ら(2018)のメタ分析(122 研究・153,185 人): 受け直すと得点は上がり、**3 回目以降は伸びが止まる**。同一問題の再使用、短い間隔で効果が大きい。

### 7.5 動機づけと努力

- Duckworth ら(2011)は、報酬で IQ が平均 0.64SD 上がるとした。しかしデータの約 4 分の 1 を占めていた研究に捏造が判明し、著者ら自身が懸念を表明。除外後の推定は g ≈ 0.16(IQ 約 2.4 点)とされる。(要確認: Bates の 2025 年論文経由の情報)
- Bates & Gignac(2022)の無作為化実験でも、報酬の効果は合算で d ≈ 0.17。自己申告の努力と得点の相関は r ≈ .28。

### 7.6 自己評価

- 自分の知能の見積もりと実測の相関は、メタ分析で r ≈ .33(Freund & Kasten, 2012)。

## 8. 知能と人生の結果

- **賃金の頭打ち(Keuschnigg ら, 2023, European Sociological Review)**: スウェーデンの男性 59,000 人。認知能力と賃金は広い範囲で比例するが、年収約 6 万ユーロを超えると能力は +1SD 付近で頭打ちになり、上位 1% はその直下の層よりわずかに低い。男性・スウェーデンのみのデータである点に注意。

## 9. AI と IQ テスト

- 大規模言語モデルはテキスト化したレーヴン型課題では高得点を出すが、画像のまま与えると成績が落ち、複雑になるほど崩れる。
- 既存の検査問題は学習データに含まれている可能性が高く、得点が何を測っているのかは不明確。人間用の検査をそのまま AI に当てはめることへの批判は強い。
- 人間向けテストにとっての含意は別にある。**固定の問題は検索や AI で解けてしまう**ため、無監督のオンライン検査では毎回生成する方式の価値が上がっている。

## 10. このアプリの設計に反映したこと

| 知見 | 設計上の判断 |
|---|---|
| ICAR の 4 領域は WAIS と高く相関するが、ワーキングメモリを拾えない(7.1) | 行列・数列・言語・立体回転に、数字の逆唱を加えた 5 領域 34 問 |
| 規則の数と種類が難易度を決める(7.2) | 行列・数列・立体回転は規則から自動生成。難易度 10 段階 |
| 誤答は典型的な誤りから作る(7.2) | 行列の誤答は「規則を 1 つだけ破った図」を優先。回転の難問は鏡像を誤答にする |
| 適応型で問題数を半減できる(7.3) | 3PL モデルで回答ごとに能力を推定し、最も近い難易度を次に出題 |
| 規準がなければ個人の IQ は言えない(7.1) | 点ではなく 95% の幅を主表示。較正していないことによる不確かさを上乗せ。測定範囲は 65〜135 に制限 |
| 再検査で点が上がる(7.4) | 毎回新しい問題を生成。履歴を残し、上昇を能力向上と読まないよう注意書き |
| 努力と得点に関連がある(7.5) | 即答・時間切れ・画面離脱・自己申告の集中度を記録して結果に添える |
| 自己評価は実測とあまり一致しない(7.6) | 受検前に予想を入力し、結果と並べて表示 |
| 訓練しても流動性知能は上がらない(5 章) | 測定であって訓練ではないと結果画面に明記 |
| 領域ごとに傾向が違う(2 章) | 領域別プロフィールを幅つきで表示 |

### このアプリにできないこと

- **項目パラメータは理論値で、実データで較正していない。** 模擬受検では推定が真値を追うことを確認したが、これはモデルが正しいという仮定の下での話にすぎない。
- 言語項目は日本語の手作りで、数が少ない(22 問 + 生成)。受け直すと既出問題に当たる。
- 処理速度(Gs)は測っていない。端末や入力方法の差が大きく、無監督では公平に測れないため。
- 逆唱は視覚提示で、標準的な聴覚提示とは難易度が異なる。

妥当な IQ 推定に近づけるには、数百人以上の回答データで項目パラメータを較正し、既存検査との相関を確かめる必要がある。

## 出典

- Anderson, E. D., & Barbey, A. K. (2023). Investigating cognitive neuroscience theories of human intelligence: A connectome-based predictive modeling approach. *Human Brain Mapping*. https://doi.org/10.1002/hbm.26164
- Bates, T. C., & Gignac, G. E. (2022). Effort impacts IQ test scores in a minor way. *Intelligence*. https://doi.org/10.1016/j.intell.2022.101652
- Bilder, R. M., et al. (2024). Computerized adaptive test strategies for the Matrix Reasoning subtest of the WAIS-IV. https://escholarship.org/content/qt5569c560/qt5569c560.pdf
- Bratsberg, B., & Rogeberg, O. (2018). Flynn effect and its reversal are both environmentally caused. *PNAS*. https://doi.org/10.1073/pnas.1718793115
- Breit, M., et al. (2024). The stability of cognitive abilities: A meta-analytic review of longitudinal studies. *Psychological Bulletin*. https://gwern.net/doc/iq/2024-breit.pdf
- Carpenter, P. A., Just, M. A., & Shell, P. (1990). What one intelligence test measures. *Psychological Review*. https://doi.org/10.1037/0033-295X.97.3.404
- Condon, D. M., & Revelle, W. (2014). The International Cognitive Ability Resource. *Intelligence*. https://doi.org/10.1016/j.intell.2014.01.004
- Duckworth, A. L., et al. (2011). Role of test motivation in intelligence testing. *PNAS*. https://doi.org/10.1073/pnas.1018601108
- Dworak, E. M., Revelle, W., & Condon, D. M. (2023). Looking for Flynn effects in a recent online U.S. adult sample. *Intelligence*, 98, 101734. https://doi.org/10.1016/j.intell.2023.101734
- Educational expansion and the hidden reversal of the Flynn effect: Differential trends across socioeconomic strata. (2026). *PNAS*, 123, e2536089123. https://pubmed.ncbi.nlm.nih.gov/42406966/
- Freund, P. A., & Kasten, N. (2012). How smart do you think you are? *Psychological Bulletin*. https://doi.org/10.1037/a0026556
- Hanushek, E. A., Kinne, L., Witthöft, F., & Woessmann, L. (2025). Age and cognitive skills: Use it or lose it. *Science Advances*. https://doi.org/10.1126/sciadv.ads1560
- Keuschnigg, M., van de Rijt, A., & Bol, T. (2023). The plateauing of cognitive ability among top earners. *European Sociological Review*. https://cadmus.eui.eu/handle/1814/75318
- Koch, M., Spinath, F. M., Greiff, S., & Becker, N. (2022). Development and validation of the Open Matrices Item Bank. *Journal of Intelligence*. https://doi.org/10.3390/jintelligence10030041
- matRiks: An R package for the automatic generation of Raven-like matrices. (2025). *Frontiers in Psychology*. https://doi.org/10.3389/fpsyg.2025.1698995
- McGrew, K. S., Schneider, W. J., Decker, S. L., & Bulut, O. (2023). A psychometric network analysis of CHC intelligence measures. *Journal of Intelligence*. https://doi.org/10.3390/jintelligence11010019
- Ritchie, S. J., & Tucker-Drob, E. M. (2018). How much does education improve intelligence? A meta-analysis. *Psychological Science*. https://doi.org/10.1177/0956797618774253
- Rodas, J. A., Asimakopoulou, A. A., & Greene, C. M. (2024). Can we enhance working memory? Bias and effectiveness in cognitive training studies. *Psychonomic Bulletin & Review*. https://doi.org/10.3758/s13423-024-02466-8
- Scharfen, J., Peters, J. M., & Holling, H. (2018). Retest effects in cognitive ability tests: A meta-analysis. *Intelligence*, 67, 44–66. https://doi.org/10.1016/j.intell.2018.01.003
- Uttl, B., Violo, V., & Gibson, L. (2024). Meta-analysis: On average, undergraduate students' intelligence is merely average. https://www.scienceopen.com/document_file/7eb5d3d2-5f05-434f-a98f-4f44adaf1a63/ScienceOpen/sor20240002.pdf
- Wilcox, R., Hemmatian, B., Varshney, L., & Barbey, A. K. (2026). The network architecture of general intelligence in the human connectome. *Nature Communications*. https://researchconnect.stonybrook.edu/en/publications/the-network-architecture-of-general-intelligence-in-the-human-con/
- Wolfram, T., et al. (2026). Interpreting polygenic prediction of cognitive ability. *Intelligence & Cognitive Abilities*. https://icajournal.scholasticahq.com/article/158459-interpreting-polygenic-prediction-of-cognitive-ability-evidence-for-direct-reliable-and-portable-genetic-effects
- Young, S. R., & Keith, T. Z. (2020). An examination of the convergent validity of the ICAR16 and WAIS-IV. *Journal of Psychoeducational Assessment*. https://doi.org/10.1177/0734282920943455
