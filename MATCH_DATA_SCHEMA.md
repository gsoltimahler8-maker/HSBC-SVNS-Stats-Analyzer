# Match Data Schema

## 目的

この文書は、SVNS Stats Analyzer / SVNS Analytics Platform で扱う1試合分の正式データ形式を定義する。

Version 0.4 では、サンプルデータから実データ投入へ移行するため、試合データの項目・必須/任意・出典管理・派生指標の扱いを整理する。

このスキーマは、将来的に Rugby.com.au Match Stats 形式の実データ、手動入力JSON、データ管理画面、Supabase等に接続する際の基準とする。

---

## 基本方針

* 1レコード = 1チーム視点の1試合データとする。
* 例：Japan vs New Zealand の試合で Japan 側データを扱う場合、`team` は `Japan`、`opponent` は `New Zealand` とする。
* 同一試合の相手側データを扱う場合は、別レコードとして持つことも可能。
* 速報性よりも、出典追跡・再現性・分析条件の明示を優先する。
* Rugby.com.au Match Stats を主ソースとする。
* RugbyPass 等は補助ソースとして扱い、主スタッツに無警告で混ぜない。
* 不明値は無理に `0` にせず、必要に応じて `null` を許容する。
* 派生指標は原則として保存せず、アプリ側で計算する。
* 取得日時は `fetchedAt` に一本化する。
* legacy field である `lastFetched` は使用しない。

---

## 必須項目

### 試合識別

```js
id: string
```

アプリ内で使う一意の試合ID。

例：

```js
'M-202526-W-DUB-001'
```

命名規則の目安：

```text
M-{season}-{gender}-{tournamentCode}-{sequence}
```

---

### 外部ID

```js
external: {
  rugbyComAu?: string | null,
  svns?: string | null,
  rugbyPass?: string | null
}
```

外部サイト上の試合IDを保持する。

* `rugbyComAu`：Rugby.com.au側の試合ID
* `svns`：SVNS公式側の試合ID
* `rugbyPass`：RugbyPass側の試合ID

存在しない場合は `null` を許容する。

外部IDは出典追跡・将来のデータ照合・重複確認のために保持する。

---

### 基本情報

```js
season: string
tournament: string
date: string
gender: 'Women' | 'Men'
stage: string
team: string
opponent: string
result: 'W' | 'L' | 'D' | 'NC'
```

説明：

* `season`：例 `2025-26`
* `tournament`：例 `Dubai SVNS`
* `date`：ISO形式 `YYYY-MM-DD`
* `gender`：`Women` または `Men`
* `stage`：例 `Pool`, `Quarter Final`, `Semi Final`, `Bronze Final`, `Final`
* `team`：分析対象チーム
* `opponent`：対戦相手
* `result`：

  * `W`：勝利
  * `L`：敗戦
  * `D`：引き分け
  * `NC`：未分類・中止・結果未確定など

---

### 得点

```js
pointsFor: number
pointsAgainst: number
```

説明：

* `pointsFor`：対象チームの得点
* `pointsAgainst`：相手チームの得点

---

## 主要スタッツ項目

以下は Rugby.com.au Match Stats 形式を想定した主要項目である。

実データに存在しない項目は `null` を許容する。

`0` は「そのスタッツが実際に0だった」と確認できる場合にのみ使う。  
不明値・未取得値・ソース上で確認できない値には `null` を使う。

### Attack

```js
tries: number | null
carries: number | null
passes: number | null
offloads: number | null
cleanBreaks: number | null
defendersBeaten: number | null
```

---

### Defence

```js
tackles: number | null
missedTackles: number | null
```

`tackleSuccess` は保存せず、以下の式でアプリ側で算出する。

```text
tackles / (tackles + missedTackles) × 100
```

---

### Turnovers / Breakdown

```js
turnoversWon: number | null
turnoversConceded: number | null
rucksWon: number | null
rucksLost: number | null
```

---

### Possession / Territory

```js
possession: number | null
territory: number | null
```

説明：

* `possession`：ポゼッション率。0〜100の数値。
* `territory`：テリトリー率。0〜100の数値。

保存値は割合ではなく、パーセントポイントとする。

正しい例：

```text
55
```

誤った例：

```text
0.55
```

---

### Discipline

```js
penaltiesConceded: number | null
yellowCards: number | null
redCards: number | null
```

---

## 出典管理項目

### 主ソース

```js
sourceProvider: string
sourceUrl: string
fetchedAt: string
```

説明：

* `sourceProvider`：例 `Rugby.com.au`, `Sample data`, `Manual entry`
* `sourceUrl`：参照元URL
* `fetchedAt`：取得日時。ISO datetime形式。

例：

```js
fetchedAt: '2026-06-01T00:00:00Z'
```

`fetchedAt` は、データがいつ取得・確認されたかを示す正式フィールドである。

`lastFetched` は過去の互換用フィールドであり、現在のスキーマでは使用しない。

---

### legacy timestamp policy

Version 0.4 では、取得日時フィールドを `fetchedAt` に統一した。

現在の運用方針：

```text
Use fetchedAt.
Do not use lastFetched.
Do not add lastFetched to new match records.
Do not rely on lastFetched in UI components.
```

旧データを取り込む場合は、active dataset に入れる前に `lastFetched` を `fetchedAt` へ移行する。

---

### データ粒度

```js
dataCoverageLevel: 'full_match_stats' | 'limited_data' | 'results_only' | 'unknown'
dataCoverageSource: string
```

説明：

* `full_match_stats`：詳細試合スタッツあり
* `limited_data`：一部スタッツのみ
* `results_only`：スコア・結果のみ
* `unknown`：粒度未確認

データ粒度は、比較分析の信頼性に関わるため必ず保持する。

異なる `dataCoverageLevel` の試合を同じ分析対象に含める場合、UI側で注意表示する。

---

### スタッツ定義バージョン

```js
statDefinitionVersion: string
```

例：

```js
'v1-rugby-com-au-match-stats'
```

この値は、スタッツ項目の定義や取得元仕様が変わった場合に変更する。

例：

* Rugby.com.au Match Stats の項目定義が変わった場合
* 新しい実データ取り込み形式を追加した場合
* RugbyPass 等の補助ソースを別定義で扱う場合

---

## 派生指標

以下は保存せず、アプリ側で計算する。

```text
pointDifferential = pointsFor - pointsAgainst
tackleSuccess = tackles / (tackles + missedTackles) × 100
```

将来的に追加候補となる派生指標：

```text
attackEfficiency
defensiveEfficiency
breakdownEfficiency
disciplinePressure
```

ただし、Version 0.4 では派生指標の本格実装は行わない。

派生指標を保存しない理由：

* 元データ修正時に派生値が古くなるのを避けるため
* 計算式の変更に対応しやすくするため
* source data と derived data を明確に分けるため

---

## Version 0.4 時点の推奨1試合データ例

```js
{
  id: 'M-202526-W-DUB-001',
  external: {
    rugbyComAu: '950101',
    svns: 'dubai-w-001',
    rugbyPass: null
  },
  season: '2025-26',
  tournament: 'Dubai SVNS',
  date: '2025-11-29',
  gender: 'Women',
  stage: 'Pool',
  team: 'Japan',
  opponent: 'New Zealand',
  result: 'L',

  pointsFor: 5,
  pointsAgainst: 31,

  tries: 1,
  carries: null,
  passes: null,
  offloads: null,
  cleanBreaks: 1,
  defendersBeaten: 5,

  tackles: 42,
  missedTackles: 12,

  turnoversWon: 2,
  turnoversConceded: 6,
  rucksWon: null,
  rucksLost: null,

  possession: 41,
  territory: null,

  penaltiesConceded: null,
  yellowCards: null,
  redCards: null,

  sourceProvider: 'Sample data',
  sourceUrl: 'https://example.com/rugby-match-950101',
  fetchedAt: '2026-06-01T00:00:00Z',
  dataCoverageLevel: 'full_match_stats',
  dataCoverageSource: 'Sample data / Rugby.com.au Match Stats format',
  statDefinitionVersion: 'v1-rugby-com-au-match-stats'
}
```

---

## Version 0.4 のスコープ

Version 0.4 では、以下を目標とする。

* 正式データスキーマの確定
* `sampleMatches.js` の項目整理
* 取得日時フィールドの `fetchedAt` への統一
* legacy field `lastFetched` の削除
* `sourceProvider` の追加
* `sourceUrl` の明示
* `dataCoverageLevel` / `dataCoverageSource` の明示
* `statDefinitionVersion` の追加
* 欠損値を `null` として扱える構造への整理
* `validate:data` によるデータ検証
* build時のデータ検証自動実行
* 将来的な JSON 化に備えたデータ構造の安定化

---

## Version 0.4 ではまだ行わないこと

* Rugby.com.au からの自動取得
* スクレイピング
* Supabase 接続
* データ管理画面の本実装
* 管理者認証
* RugbyPass との自動照合
* 全試合データの大量投入

---

## 関連ファイル

Version 0.4 時点で、データスキーマと検証に関係する主なファイルは以下。

```text
src/data/sampleMatches.js
src/utils/validateMatches.js
scripts/validateSampleMatches.mjs
docs/DATA_VALIDATION_RULES.md
MATCH_DATA_SCHEMA.md
```

`MATCH_DATA_SCHEMA.md` はデータ形式の定義、`docs/DATA_VALIDATION_RULES.md` は検証ルールと運用方針を扱う。
