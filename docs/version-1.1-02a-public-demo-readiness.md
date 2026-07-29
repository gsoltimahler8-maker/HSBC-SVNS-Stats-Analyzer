# SVNS Stats Analyzer

# v1.1-02A Public Demo Readiness

Version: v1.1  
Step: v1.1-02A  
Status: Implementation package prepared  
Created: 2026-07-29

---

## 1. 目的

World Rugbyへの初回問い合わせ前に、公開デモ上でStats AnalysisとStats Trendsの役割を明確にする。

この工程はv1.1分析機能の完全実装ではない。公式データ仕様・利用条件・内部要件が未確認の段階で過度な作り込みを行わず、現在のデータだけで説明可能な最小構成を実装する。

---

## 2. Stats Analysis

次の3モードへ再構成する。

```text
Overview
Comparison
Relationships
```

### Overview

- 対象試合数
- 勝率
- 平均得失点差
- 平均反則数
- 平均ターンオーバー差
- 平均Metres per Carry
- 平均Tackle Success
- source数・coverage

### Comparison

比較単位：

```text
Tournament
Result
Opponent
```

比較指標：

- Point Differential
- Penalties Conceded
- Turnover Differential
- Metres per Carry
- Defenders Beaten per Carry
- Clean Breaks per 100 Carries
- Tries per 100 Metres
- Points per 100 Metres
- Metres per Try
- Tackle Success
- Ruck Success

### Relationships

初期表示：

```text
X = Penalties Conceded
Y = Point Differential
```

1試合を1点とし、勝利・敗戦を分けて表示する。

これは記述的な関連表示であり、因果関係を示さない。

---

## 3. Stats Trends

次の集約粒度を切り替える。

```text
Match
Tournament
Season
```

- Match：試合ごとの値
- Tournament：大会内の有効試合平均
- Season：シーズン内の有効試合平均

複数シーズンがない場合もSeason表示は残し、将来の拡張点を明示する。

---

## 4. 共通計算基盤

新規追加：

```text
src/utils/analyticsMetrics.js
```

責務：

- raw metric取得
- derived metric計算
- null propagation
- division-by-zero処理
- metric label／formula
- data coverage
- average
- chronological sort
- grouping

欠損値は0として扱わない。

分母が0の場合は`null`とする。

丸めは表示時だけ行う。

---

## 5. UI

新規追加：

```text
src/analytics.css
```

既存`styles.css`を置き換えず、analytics固有classだけを追加する。

PC・tablet・smartphoneに対応する。

---

## 6. 変更ファイル

### Replace

```text
src/components/StatsAnalysis.jsx
src/components/StatsTrends.jsx
```

### Add

```text
src/utils/analyticsMetrics.js
src/analytics.css
docs/version-1.1-02a-public-demo-readiness.md
```

### Delete

```text
None
```

---

## 7. 問い合わせ前の手動確認

```text
[ ] GitHub ActionsがGreen
[ ] Stats Analysisが起動
[ ] Overview／Comparison／Relationshipsを切替可能
[ ] ComparisonのTournament／Result／Opponentを切替可能
[ ] Relationships初期表示がPenalties × Point Differential
[ ] Stats Trendsが起動
[ ] Match／Tournament／Seasonを切替可能
[ ] 日本語／英語切替後も表示崩れなし
[ ] 欠損metricを0として描画していない
[ ] sample dataが含まれる場合はwarning表示
[ ] PC表示
[ ] smartphone縦表示
[ ] Console errorなし
[ ] PWA更新後に新版が表示
```

---

## 8. 問い合わせ文との整合

改修後は次の説明を使用できる。

> The app currently provides match-level analysis, tournament and result comparisons, performance trends across matches and tournaments, match search, and links to publicly available match videos. Its structure is designed to extend to multi-season analysis as more consistent data becomes available.

---

## 9. 完了条件

GitHub Actionsと手動確認が完了した時点でv1.1-02AをCompletedとする。

次工程：

```text
v1.1-02B
World Rugby問い合わせ文と公開デモの最終整合確認
```
