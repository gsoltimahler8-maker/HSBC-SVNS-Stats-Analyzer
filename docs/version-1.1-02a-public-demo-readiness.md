# SVNS Stats Analyzer

# v1.1-02A Public Demo Readiness

Version: v1.1  
Step: v1.1-02A  
Revision: r1  
Status: Implementation package prepared  
Created: 2026-07-29

---

## 1. 目的

World Rugbyへの初回問い合わせ前に、公開デモ上でStats AnalysisとStats Trendsの分析目的を明確にする。

初版のv1.1-02Aは、自由なX軸・Y軸選択による散布図を中心に置きすぎていた。r1では、プロダクトの中核を次の13指標によるチーム・パフォーマンス分析として再定義する。

```text
Points Differential
Win Rate
Points per Match
Tries per Match
Points per 100 Metres
Tries per 100 Metres
Metres per Carry
Clean Breaks per 100 Carries
Defenders Beaten per Carry
Turnover Differential
Penalties per Match
Tackle Success
Ruck Success
```

---

## 2. Stats Analysis

次の3モードを維持する。

```text
Performance Profile
Comparison
Relationships
```

### 2.1 Performance Profile

13指標を次の5カテゴリーに整理して表示する。

```text
Results & Scoring
Scoring Efficiency
Attacking Efficiency
Possession & Discipline
Defence & Retention
```

各指標について次を表示する。

```text
value
formula
coverage
```

### 2.2 Comparison

13指標から一つを選び、次の単位で比較する。

```text
Tournament
Result
Opponent
```

Win RateはResult比較では100%と0%に固定されるため、Result選択時のみ候補から外す。

### 2.3 Relationships

自由なX軸・Y軸選択は廃止する。

競技上の問いが明確で、数式上の自己相関をできるだけ避けたプリセットだけを表示する。

```text
Metres per Carry × Points Differential
Clean Breaks per 100 Carries × Points Differential
Defenders Beaten per Carry × Points Differential
Turnover Differential × Points Differential
Penalties per Match × Points Differential
Tackle Success × Points Against
Ruck Success × Turnovers Conceded
```

散布図は1試合を1点として表示し、勝利・敗戦を区別する。

因果関係や確定的な相関は主張しない。

---

## 3. Stats Trends

13指標すべてを次の粒度で表示する。

```text
Match
Tournament
Season
```

Win RateをMatch表示する場合は、勝利を100%、敗戦を0%として試合結果を可視化する。TournamentとSeasonでは通常の集計勝率を表示する。

---

## 4. 集計方法

単純な試合別比率の平均ではなく、指標の性質に応じて集計する。

### 比率指標

```text
Points per 100 Metres
Tries per 100 Metres
Metres per Carry
Clean Breaks per 100 Carries
Defenders Beaten per Carry
Tackle Success
Ruck Success
```

選択範囲内の有効な分子合計と分母合計から算出する。

例：

```text
Metres per Carry
= total metres ÷ total carries
```

### 1試合当たり指標

```text
Points per Match
Tries per Match
Penalties per Match
Points Differential
Turnover Differential
```

有効な試合値の平均を使用する。

### Win Rate

```text
wins ÷ matches with a known result × 100
```

---

## 5. 欠損値

```text
Missing value = null
Denominator 0 = null
Missing value is not converted to 0
Rounding is applied only for display
```

coverageは指標ごとに表示する。

---

## 6. 変更ファイル

### Replace

```text
src/components/StatsAnalysis.jsx
src/components/StatsTrends.jsx
src/utils/analyticsMetrics.js
src/analytics.css
docs/version-1.1-02a-public-demo-readiness.md
```

### Add

```text
None
```

### Delete

```text
None
```

---

## 7. 問い合わせ前の確認

```text
[ ] GitHub ActionsがGreen
[ ] Performance Profileに13指標が表示される
[ ] 13指標が5カテゴリーに整理される
[ ] ComparisonでTournament / Result / Opponentを切り替えられる
[ ] Result比較ではWin Rateが表示候補から外れる
[ ] Relationshipsに自由なX/Y選択がない
[ ] Relationshipsの7プリセットが切り替わる
[ ] Stats Trendsで13指標を選択できる
[ ] Match / Tournament / Seasonを切り替えられる
[ ] 比率指標が合計分子÷合計分母で集計される
[ ] 欠損値を0として扱っていない
[ ] 日本語・英語切替後も表示崩れがない
[ ] PC表示
[ ] smartphone縦表示
[ ] Console errorなし
```

---

## 8. 問い合わせ文との整合

改修後は次の説明を使用できる。

> The app analyses team performance through 13 indicators covering results, scoring efficiency, attacking efficiency, possession, discipline, defence and ball retention. These indicators can be compared by tournament, result and opponent, and tracked across matches, tournaments and seasons.

---

## 9. 次工程

```text
v1.1-02B
World Rugby問い合わせ文と公開デモの最終整合確認
```
