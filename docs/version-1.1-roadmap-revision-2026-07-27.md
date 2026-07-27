# Version1.1 Roadmap Revision Note — 2026-07-27

## 更新内容

最新の協議を反映し、v1.1ロードマップを次の点で更新した。

### 1. 引継ぎ先の明確化

World Rugbyだけでなく、次の主体が評価・移植・再実装しやすいことを要件化した。

- RugbyPass
- World Rugbyが指定するdata provider
- World RugbyまたはRugbyPassのdigital / operations担当
- 開発・運用委託先

RugbyPassの実際の担当範囲は未確認であるため、移管先と断定せず、候補となるデータ・デジタル・実装側として扱う。

### 2. 分析ロジックの独立

次をpresentation componentから分離する方針を追加した。

- Derived Metrics
- Aggregation
- Comparison
- Relationship dataset
- Trend dataset
- Coverage
- Provenance

### 3. Stats Analysisの確定構成

```text
Overview
Comparison
  ├─ Tournament
  ├─ Result
  └─ Opponent
Relationships
```

既定範囲は最新または選択した1シーズン。

### 4. Stats Trendsの確定構成

```text
Match
Tournament
Season
```

複数シーズンが少ない間はMatch表示を既定とし、データ蓄積後にSeason表示を長期分析の中心にする。

### 5. 現行データで算出する派生指標

- Points Differential
- Metres per Carry
- Defenders Beaten per Carry
- Clean Breaks per 100 Carries
- Tries per 100 Metres
- Points per 100 Metres
- Metres per Try
- Tackle Success
- Ruck Success
- Turnover Differential
- Penalties per Match

### 6. ペナルティ分析

最初の中心表示を次とする。

```text
Penalties Conceded × Points Differential
```

勝敗別平均は補助表示とし、因果関係は断定しない。

### 7. 現段階で行わないconversion分析

次はイベント連鎖がないため、本来のconversion rateとは扱わない。

- Tries / Turnovers Won
- Tries Conceded / Penalties Conceded

公式データ仕様またはポゼッション単位データが得られた後に再検討する。
