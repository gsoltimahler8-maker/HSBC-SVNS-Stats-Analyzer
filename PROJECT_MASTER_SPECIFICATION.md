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
