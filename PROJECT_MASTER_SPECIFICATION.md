# SVNS Stats Analyzer / SVNS Analytics Platform  
# Project Master Specification
---

## 26. Version0.2 実装進捗・重要仕様変更メモ（2026-06-15時点）

### 26.1 Version0.2の現在位置

Version0.2は、現時点で約85％まで進行している。

Version0.2の主目的は、既存のVersion0試作版を壊さずに、今後の本格実装に耐える基礎構造へ整理することである。
具体的には、以下を重視する。

* `main.jsx` への機能集中を解消する。
* サンプルデータ、統計関数、画面コンポーネントを分離する。
* ホーム画面を追加する。
* 日本語 / English 切替を追加する。
* 分析条件・出典・データ粒度を明示する。
* 相関分析を誤読されないよう、n数と少数サンプル警告を表示する。
* Rugby.com.au Match Stats の利用可能範囲を画面上にも明示する。

Version0.2は、まだ実データ接続・Supabase接続・スタッツ推移画面・試合検索画面・動画ライブラリ・管理者画面の完成を目的としない。
これらはVersion0.3以降で段階的に実装する。

### 26.2 Version0.2で完了した主な実装

2026-06-15時点で、以下を実装済み。

* `src/data/sampleMatches.js` を作成し、サンプル試合データを分離。
* `src/utils/statistics.js` を作成し、`pct` / `avg` / `corr` を分離。
* `src/App.jsx` を作成し、アプリ全体の画面遷移を管理。
* `src/main.jsx` を入口専用ファイルに整理。
* `src/components/StatsAnalysis.jsx` を作成し、既存分析画面を分離。
* `src/components/HomeMenu.jsx` を作成し、ホーム画面を追加。
* ホーム画面から以下へ遷移可能にした。

  * スタッツ分析
  * スタッツ推移
  * 試合検索
  * 動画ライブラリ
  * データ管理
* 未実装画面には Coming Soon 画面を表示。
* スタッツ分析画面からホームへ戻るボタンを追加。
* PC用ホーム背景画像 `home-hero.png` を追加。
* スマホ用ホーム背景画像 `home-hero-mobile.png` を追加。
* 画面上のHSBC表記を削除し、非公式アプリであることを明示。
* `src/i18n/ja.js` と `src/i18n/en.js` を作成。
* 日本語 / English 切替ボタンを追加。
* HomeMenu / Coming Soon / StatsAnalysis の主要文言を辞書参照化。
* Rugby.com.au詳細スタッツの標準対象期間を画面上に表示。
* Candidate Drivers に対象試合数 `n` を表示。
* Candidate Drivers に少数サンプル警告を表示。
* `sampleMatches` に `dataCoverageLevel` と `dataCoverageSource` を追加。
* 試合詳細の出典追跡欄にデータ粒度と主スタッツソースを表示。

### 26.3 重要仕様変更：Rugby.com.au詳細スタッツの対象範囲

重大なデータ制約として、Rugby.com.auにあるSVNSの詳細Match Statsは、一貫性・信頼性・粒度が高い一方で、確認できる最古シーズンが2022-23シーズンであると判明した。

そのため、本アプリでは以下の方針を採用する。

* Rugby.com.au Match Statsを高粒度チームスタッツの主ソースとする方針は維持する。
* ただし、詳細チームスタッツ分析の標準対象期間は2022-23シーズン以降とする。
* 2021-22以前のシーズンを扱う場合は、詳細スタッツ分析に無警告で混ぜない。
* 2021-22以前は、データ取得状況に応じて以下のいずれかとして扱う。

  * Limited Data
  * Results Only
  * Source Unknown
  * Unknown
* スタッツ推移画面や過去シーズン比較では、データ粒度の違いを必ず表示する。
* 「過去5年比較」という表現は、詳細スタッツが揃う範囲に限定するか、データ粒度差の警告を伴う表現へ修正する。

画面上では、スタッツ分析画面の分析条件欄に以下の注意を表示する。

日本語:

* データ利用可能範囲
* 詳細チームスタッツ標準対象：2022-23シーズン以降

English:

* Data Availability
* Full team match stats: 2022-23 season onward

### 26.4 データ粒度メタ情報

Version0.2では、サンプル試合データにもデータ粒度を持たせる方針に変更した。

`sampleMatches` の各試合に、以下を追加した。

```javascript
dataCoverageLevel: 'full_match_stats',
dataCoverageSource: 'Sample data / Rugby.com.au Match Stats format',
```

`dataCoverageLevel` は、将来的に以下の値を想定する。

* `full_match_stats`
* `limited_data`
* `results_only`
* `unknown`

このメタ情報は、試合詳細の出典追跡欄に表示する。

日本語表示例:

* データ粒度: 詳細試合スタッツ
* 主スタッツソース: Sample data / Rugby.com.au Match Stats format

English表示例:

* Data coverage: Full match stats
* Primary stats source: Sample data / Rugby.com.au Match Stats format

### 26.5 Candidate Driversの扱い

Candidate Driversは、勝敗要因を断定する機能ではない。
点差との相関係数を表示し、勝敗・点差と統計的関連が見られる候補指標を確認するための機能である。

Version0.2では、誤読防止のため以下を追加した。

* 対象試合数 `n` を表示。
* 各相関カードにも `n` を表示。
* `n < 6` の場合、少数サンプル警告を表示。

日本語警告:

> 対象試合数が少ないため、この相関係数は参考値です。勝敗要因の断定には使わず、次に確認すべき候補指標として扱ってください。

English warning:

> The sample size is small, so these correlations should be treated as reference values. Do not use them as proof of causal win/loss factors; use them as indicators for further review.

この方針により、相関係数を「勝利要因」として断定的に表示することを避ける。

### 26.6 現在の主要ファイル構成

Version0.2時点の主要ファイルは以下。

```text
src/
├── App.jsx
├── main.jsx
├── registerSW.js
├── styles.css
├── components/
│   ├── HomeMenu.jsx
│   └── StatsAnalysis.jsx
├── data/
│   └── sampleMatches.js
├── i18n/
│   ├── ja.js
│   └── en.js
└── utils/
    └── statistics.js
```

ホーム画面用画像:

```text
public/assets/home-hero.png
public/assets/home-hero-mobile.png
```

アプリアイコン候補:

```text
public/assets/app-icon.png
```

ただし、PWAアイコンへの正式反映はまだ未完了。

### 26.7 Version0.2でまだ残っている作業

Version0.2で残っている主な作業は以下。

* `app-icon.png` をPWAアイコンへ正式反映する。
* manifest / apple-touch-icon / icon-192 / icon-512 の整理。
* スマホ表示の最終微調整。
* 画面上に残る細かい英語表記の整理。
* Version0.2完了時点の最終動作確認。
* GitHub Pages上でのキャッシュ / Service Worker挙動確認。
* `PROJECT_MASTER_SPECIFICATION.md` のロードマップ記述と現状の整合性調整。

### 26.8 次に進むべき候補

Version0.2の残作業として、次は以下のいずれかを行う。

優先候補:

1. `app-icon.png` をPWAアイコンに反映する。
2. スマホ表示の最終微調整を行う。
3. Version0.2完了チェックリストを作る。
4. スタッツ推移画面の設計だけ先に作る。

ただし、スタッツ推移・試合検索・動画ライブラリ・データ管理の本格実装はVersion0.3以降に回す。
---

## 27. Version0.2 完了チェックリスト

Version0.2を完了扱いにする前に、以下を確認する。

### 27.1 ビルド・デプロイ確認

* GitHub Actions が緑チェックで完了している。
* GitHub Pages が正常に開く。
* PCブラウザでホーム画面が表示される。
* スマホ表示でもホーム画面が崩れていない。
* Service Worker / PWAキャッシュにより、古い表示が残っていないか確認する。
* 表示が古い場合は、PCでは `Ctrl + F5`、スマホではタブを閉じて再読み込みする。

### 27.2 ホーム画面確認

* ホーム背景画像 `home-hero.png` がPC表示で反映されている。
* スマホ用背景画像 `home-hero-mobile.png` がスマホ幅で反映されている。
* ホーム画面の4ボタンが意図した配置になっている。

  * スタッツ分析
  * スタッツ推移
  * 試合検索
  * 動画ライブラリ
* 中央下にデータ管理ボタンが表示されている。
* データ管理ボタンに「管理者のみ / Admin only」が表示されている。
* 公式アプリと誤認される表現がない。
* HSBCの文字・ロゴが画面上に残っていない。

### 27.3 画面遷移確認

* ホーム画面からスタッツ分析へ遷移できる。
* スタッツ分析画面からホームへ戻れる。
* スタッツ推移は Coming Soon 画面になる。
* 試合検索は Coming Soon 画面になる。
* 動画ライブラリは Coming Soon 画面になる。
* データ管理は Coming Soon 画面になる。
* Coming Soon 画面からホームへ戻れる。

### 27.4 多言語表示確認

* 日本語 / English 切替ボタンが表示されている。
* ホーム画面が日本語表示になる。
* ホーム画面がEnglish表示になる。
* スタッツ分析画面の主要見出しが日本語表示になる。
* スタッツ分析画面の主要見出しがEnglish表示になる。
* Coming Soon画面が日本語 / Englishで切り替わる。
* Genderの表示が日本語では「女子 / 男子」、Englishでは「Women / Men」になる。
* Tournamentの `All` が日本語では「すべて」、Englishでは「All」になる。
* Win / Loss が日本語では「勝利 / 敗戦」、Englishでは「Win / Loss」になる。

### 27.5 スタッツ分析画面確認

* Sample Data / Demo Mode 警告が表示されている。
* 分析条件欄が表示されている。
* 試合一覧が表示されている。
* 試合詳細が表示されている。
* 勝敗比較グラフが表示されている。
* Candidate Drivers が表示されている。
* Clean Breaks vs Point Difference の散布図が表示されている。
* Next Implementation が表示されている。
* スタッツ分析ページ上部に、古いホーム画像や不要な小アイコンが残っていない。

### 27.6 データ利用可能範囲の確認

* スタッツ分析画面の分析条件欄に「データ利用可能範囲」が表示されている。
* 日本語で「詳細チームスタッツ標準対象：2022-23シーズン以降」と表示される。
* Englishで「Full team match stats: 2022-23 season onward」と表示される。
* Rugby.com.au Match Statsの詳細スタッツ対象期間が2022-23以降であることが画面上で確認できる。
* 2021-22以前を詳細スタッツ比較に無警告で混ぜない方針が仕様書に記載されている。

### 27.7 Candidate Drivers確認

* Candidate Driversに対象試合数 `n` が表示されている。
* 各相関カードにも対象試合数 `n` が表示されている。
* 対象試合数が少ない場合、少数サンプル警告が表示されている。
* 日本語では「参考値」として扱う警告文が表示される。
* Englishでは small sample warning が表示される。
* Candidate Drivers が勝敗要因を断定する表現になっていない。

### 27.8 データ粒度確認

* `sampleMatches` の各試合に `dataCoverageLevel` が入っている。
* `sampleMatches` の各試合に `dataCoverageSource` が入っている。
* 試合詳細の出典追跡欄にデータ粒度が表示される。
* 日本語では「データ粒度: 詳細試合スタッツ」と表示される。
* Englishでは「Data coverage: Full match stats」と表示される。
* 主スタッツソースとして `Sample data / Rugby.com.au Match Stats format` が表示される。

### 27.9 ファイル構成確認

Version0.2時点で、主要ファイルが以下の構成になっていることを確認する。

```text
src/
├── App.jsx
├── main.jsx
├── registerSW.js
├── styles.css
├── components/
│   ├── HomeMenu.jsx
│   └── StatsAnalysis.jsx
├── data/
│   └── sampleMatches.js
├── i18n/
│   ├── ja.js
│   └── en.js
└── utils/
    └── statistics.js
```

### 27.10 Version0.2では完了扱いにしない項目

以下はVersion0.2では完了扱いにしない。Version0.3以降で実装する。

* Supabase接続。
* 実データ取込。
* Rugby.com.auからの自動取得。
* SVNS公式データとの自動照合。
* スタッツ推移画面の本実装。
* 試合検索画面の本実装。
* 動画ライブラリの本実装。
* データ管理画面の本実装。
* 管理者パスワード機能。
* PWAアイコンの最終反映。
* オフライン対応の完成。
* 本番用データベース設計の確定。

### 27.11 Version0.2完了判定

Version0.2は、以下を満たした時点で完了扱いとする。

* 画面遷移が壊れていない。
* 日本語 / English切替が主要画面で機能している。
* サンプルデータ表示が安定している。
* データ利用可能範囲が明示されている。
* データ粒度が試合詳細に表示されている。
* Candidate Driversにn数と少数サンプル警告が表示されている。
* HSBC表記が画面上に残っていない。
* GitHub Actionsが緑チェックで完了している。
* PROJECT_MASTER_SPECIFICATION.mdにVersion0.2の進捗・制約・完了条件が記録されている。
---

## 28. Version0.2 完了メモ（2026-06-15）

Version0.2は、2026-06-15時点で完了扱いとする。

### 28.1 完了判定

以下を確認済み。

* GitHub Actions が緑チェックで完了している。
* GitHub Pages が正常に開く。
* ホーム画面が表示される。
* PC表示・スマホ幅表示でホーム画面が大きく崩れていない。
* ホーム画面からスタッツ分析へ遷移できる。
* スタッツ分析画面からホームへ戻れる。
* スタッツ推移 / 試合検索 / 動画ライブラリ / データ管理は Coming Soon 画面として表示される。
* 日本語 / English 切替が機能している。
* スタッツ分析画面の主要文言が日本語 / Englishで切り替わる。
* Sample Data / Demo Mode 警告が表示される。
* Rugby.com.au Match Stats の詳細スタッツ標準対象が2022-23シーズン以降であることを画面上に表示している。
* Candidate Drivers に対象試合数 `n` と少数サンプル警告を表示している。
* Candidate Drivers は勝敗要因を断定する表現になっていない。
* `sampleMatches` に `dataCoverageLevel` と `dataCoverageSource` を持たせている。
* 試合詳細の出典追跡欄に、データ粒度と主スタッツソースを表示している。
* 勝敗比較グラフはスマホ幅でも読みやすいように横棒グラフ化した。
* 勝敗比較グラフの軸ラベルは短縮名、Tooltipは正式名・日本語名を表示する。
* 散布図は Clean Breaks vs Point Difference として表示される。
* グラフTooltipは暗色背景にし、視認性を改善した。
* 画面上のHSBC表記・ロゴは削除済み。
* PROJECT_MASTER_SPECIFICATION.md にVersion0.2の進捗、制約、完了条件を記録済み。

### 28.2 Version0.2で達成したこと

Version0.2では、Version0試作版を今後の本格実装に耐える基礎構造へ整理した。

主な達成内容は以下。

* `main.jsx` への機能集中を解消。
* `App.jsx` を追加し、画面遷移を管理。
* `StatsAnalysis.jsx` を追加し、スタッツ分析画面を分離。
* `HomeMenu.jsx` を追加し、ホーム画面を実装。
* `sampleMatches.js` を追加し、サンプルデータを分離。
* `statistics.js` を追加し、統計関数を分離。
* `ja.js` / `en.js` による多言語辞書を導入。
* 日本語 / English 切替を実装。
* Rugby.com.au詳細スタッツの対象範囲制約をUIに反映。
* データ粒度メタ情報をサンプルデータに追加。
* Candidate Driversの誤読防止として、n数と少数サンプル警告を追加。
* グラフ視認性をスマホ幅向けに改善。
* 非公式アプリであることを明示。

### 28.3 Version0.2では未完了とする項目

以下はVersion0.2では完了扱いにしない。Version0.3以降で実装する。

* Supabase接続。
* 実データ取込。
* Rugby.com.au / SVNS公式データの自動取得。
* RugbyPassとの照合ロジック。
* スタッツ推移画面の本実装。
* 試合検索画面の本実装。
* 動画ライブラリの本実装。
* データ管理画面の本実装。
* 管理者パスワード機能。
* PWAアイコンの正式反映。
* オフライン対応の完成。
* 本番用データベース設計の確定。

### 28.4 次フェーズ方針

次フェーズは Version0.3 とする。

Version0.3では、以下のいずれかから着手する。

1. PWAアイコンとmanifestの整理。
2. スタッツ推移画面の設計・仮実装。
3. 試合検索画面の設計・仮実装。
4. Supabase導入前のデータスキーマ設計。
5. Rugby.com.au Match Stats の取得・保存フロー設計。

ただし、実データ取得に入る前に、データソース・対象シーズン・データ粒度・出典追跡の方針を再確認する。
---

## 29. Version0.3 開始メモ

Version0.3では、Version0.2で整備した基礎構造を前提に、スタッツ推移画面の設計・仮実装へ進む。

### 29.1 Version0.3の主目的

Version0.3の主目的は、スタッツ推移画面の土台を作ることである。

Version0.2では、ホーム画面、スタッツ分析画面、多言語対応、データ利用可能範囲、データ粒度、Candidate Driversの誤読防止などを整備した。
Version0.3では、これを踏まえて、ユーザーがシーズン内・大会別・対戦国別のスタッツ変化を確認できる画面を作る。

### 29.2 Version0.3で優先する機能

Version0.3では、以下を優先する。

1. スタッツ推移画面のUI骨格を作る。
2. サンプルデータを使って、シーズン内推移を表示する。
3. 指標を選択して推移を見られるようにする。
4. 対戦相手別・大会別の比較に拡張できる構造にする。
5. Rugby.com.au Match Statsの詳細スタッツ対象期間が2022-23以降であることを、推移画面でも明示する。
6. データ粒度が異なるシーズンを無警告で混ぜない設計にする。

### 29.3 Version0.3で最初に作る画面

最初に作るのは、Coming Soon状態だった「スタッツ推移」画面である。

初期実装では、以下を表示する。

* ページタイトル
* 分析条件

  * Season
  * Gender
  * Team
  * Metric
* データ利用可能範囲の注意
* 選択指標のシーズン内推移グラフ
* 大会別の平均値カード
* 今後追加予定の説明

### 29.4 初期対象指標

Version0.3の初期対象指標は、Version0.2のMVP指標に合わせる。

* Points For
* Points Against
* Clean Breaks
* Defenders Beaten
* Turnovers Won
* Turnovers Conceded
* Possession
* Tackle Success

ただし、スタッツ名はRugby.com.au Match Statsとの照合を重視し、内部キーは英語名を維持する。
日本語表示時は、Tooltipや画面ラベルで日本語名を表示できるようにする。

### 29.5 Version0.3ではまだ行わないこと

以下はVersion0.3の初期段階では行わない。

* Supabase接続。
* 実データ自動取得。
* Rugby.com.auからのスクレイピングまたはAPI取得。
* RugbyPassとの自動照合。
* 動画ライブラリの本実装。
* 試合検索画面の本実装。
* データ管理画面の本実装。
* 管理者パスワード機能。

Version0.3では、まずサンプルデータを使ってスタッツ推移画面の構造を固める。

### 29.6 Version0.3の完了目安

Version0.3は、以下を満たした時点で完了扱いとする。

* ホーム画面からスタッツ推移画面へ遷移できる。
* スタッツ推移画面からホームへ戻れる。
* 日本語 / English切替が機能する。
* Season / Gender / Team / Metric を選択できる。
* 選択した指標の推移グラフが表示される。
* 大会別の平均値が表示される。
* データ利用可能範囲が明示される。
* データ粒度の違いを将来的に扱える構造になっている。
* GitHub Actionsが緑チェックで完了する。
---

## Version 0.3 進捗メモ：スタッツ推移画面の土台構築

### Version 0.3 の目的

Version 0.3 では、**スタッツ推移画面**の土台を構築する。

この画面は、選択したシーズン・チーム・大会・対戦相手・指標に基づき、試合ごとのスタッツ変化を確認するための分析画面である。

速報表示や最終的な勝敗要因の断定を目的とするものではなく、将来的に実データと接続するための再利用可能な分析UIとして位置付ける。

---

### Version 0.3 で実装済みの内容

Version 0.3 では、以下を実装した。

* `StatsTrends.jsx` を追加し、従来の Coming Soon 表示から実画面へ変更。
* 指標別の試合ごとの推移を折れ線グラフで表示。
* 大会別平均値カードを追加。
* 対戦相手別平均値カードを追加。
* 大会フィルターを追加。
* 対戦相手フィルターを追加。
* Season / Gender / Team / Tournament の変更時に、対戦相手フィルターが `All` に戻る処理を追加。
* 現在の表示条件サマリーを追加。
* 表示条件サマリーでは、以下を表示する。

  * Season
  * Gender
  * Team
  * Tournament
  * Opponent
  * Metric
  * Match Count
* `dataCoverageLevel` に基づくデータ粒度表示を追加。
* 表示中の試合に、異なるデータ粒度・限定データ・結果のみ・未確認データが含まれる場合に注意表示を出す構造を追加。
* 該当試合がない場合の空データ表示を改善。
* `Next implementation / 今後の追加予定` 欄を更新し、すでに実装済みの項目を削除。

---

### 現在のスタッツ推移画面のフィルター

現在のスタッツ推移画面では、以下の条件で絞り込みができる。

* Season
* Gender
* Team
* Tournament
* Opponent
* Metric

絞り込み順は以下の通り。

```text
Season / Gender / Team
↓
Tournament
↓
Opponent
↓
Metric
```

この順序は意図的なものである。

大会フィルターと対戦相手フィルターは、選択中の Season / Gender / Team に基づいて候補を作る。
また、対戦相手の候補は、選択中の大会に応じて変化する。

---

### 現在選択できる指標

スタッツ推移画面では、現在以下の指標を選択できる。

* 得点 / Points For
* 失点 / Points Against
* クリーンブレイク / Clean Breaks
* ディフェンダー突破 / Defenders Beaten
* ターンオーバー獲得 / Turnovers Won
* ターンオーバー喪失 / Turnovers Conceded
* ポゼッション / Possession
* タックル成功率 / Tackle Success

`Tackle Success` は、以下の式で算出する。

```text
tackles / (tackles + missedTackles) × 100
```

`Possession` と `Tackle Success` はパーセント表示とする。

---

### データ粒度の扱い

スタッツ推移画面では、各試合データの `dataCoverageLevel` を参照し、表示中の試合データの粒度を示す。

現在想定しているデータ粒度は以下の通り。

* `full_match_stats`：詳細試合スタッツ
* `limited_data`：限定データ
* `results_only`：結果のみ
* `unknown`：未確認

表示中の試合がすべて `full_match_stats` の場合は、詳細試合スタッツのみで構成されている旨を表示する。

表示中の試合に、限定データ・結果のみ・未確認データ、または複数のデータ粒度が混在する場合は、比較結果の解釈に注意が必要であることを表示する。

該当試合が存在しない場合は、データ粒度を判定せず、「表示対象の試合がないため、データ粒度は判定できない」旨を表示する。

---

### 空データ時の表示

選択条件に一致する試合がない場合、単に短いメッセージを出すのではなく、構造化された空データ表示を行う。

空データ表示は、以下の箇所に適用する。

* 折れ線グラフ欄
* 大会別平均値欄
* 対戦相手別平均値欄
* データ粒度表示欄

現時点のサンプルデータには男子データが含まれていない可能性があるため、`Men / 男子` を選択した場合にも自然な案内が表示されるようにしている。

---

### Version 0.3 の対象外

Version 0.3 では、以下は実装対象外とする。

* Supabase接続
* 実データの自動取得
* Rugby.com.au からのスクレイピングまたは自動取り込み
* RugbyPass との照合ロジック
* データ管理画面の本実装
* 管理者パスワード保護
* 試合検索画面の本実装
* 動画ライブラリの本実装

Version 0.3 は、あくまで **スタッツ推移画面の分析UIを完成させる段階** とし、実データ接続や管理機能は Version 0.4 以降に回す。

---

### Version 0.3 以降の追加候補

Version 0.4 以降の追加候補は以下の通り。

* 複数指標を同時に比較できる表示。
* Rugby.com.au Match Stats 形式の実データ取り込み。
* データ管理画面との接続。
* 管理者が試合データを追加・更新できる構造。
* 試合検索画面との連動。
* 動画ライブラリとの連動。
* 推移グラフ上の試合から、該当試合の詳細・動画リンクへ移動できる導線。

---

### Version 0.3 の現在地

このメモ作成時点で、Version 0.3 は約88％完了。

残作業は以下の通り。

* スタッツ推移画面の最終確認。
* 日本語 / English 表示の確認。
* PC表示・スマホ縦表示・スマホ横表示の確認。
* 実装済み項目が `Next implementation / 今後の追加予定` に残っていないかの確認。
* 問題がなければ Version 0.3 完了扱いにする。
---

## Version 0.3 完了メモ

Version 0.3 は完了扱いとする。

Version 0.3 では、スタッツ推移画面の分析UI土台を構築した。

主な完了内容は以下の通り。

- スタッツ推移画面を Coming Soon から実画面へ変更。
- 指標別の折れ線グラフを追加。
- 大会別平均値カードを追加。
- 対戦相手別平均値カードを追加。
- 大会フィルターを追加。
- 対戦相手フィルターを追加。
- 現在の表示条件サマリーを追加。
- `dataCoverageLevel` に基づくデータ粒度表示を追加。
- 空データ時の表示を改善。
- `Next implementation / 今後の追加予定` を整理。
- Version 0.3 の実装内容を `PROJECT_MASTER_SPECIFICATION.md` に追記。

Version 0.3 では、実データ接続・データ管理画面・試合検索・動画ライブラリ本実装は行わない。

次の Version 0.4 以降では、実データ取り込み、複数指標比較、データ管理画面との接続、試合検索・動画ライブラリ連動を検討する。
