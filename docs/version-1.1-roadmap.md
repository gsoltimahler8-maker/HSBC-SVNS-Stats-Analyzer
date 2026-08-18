# SVNS Stats Analyzer
# Version 1.1–2.0 Roadmap

**Updated:** 2026-08-18  
**Current release:** v1.0 completed  
**Current development line:** v1.1  
**Current active step:** v1.1-03 World Rugby enquiry / response tracking  
**Long-term product direction:** Stats Database → **Fan-facing Sevens Analysis Workspace**

---

## 1. Roadmap purpose

SVNS Stats Analyzerは、単なる公開スタッツ閲覧アプリではなく、最終的に以下を自然に行き来できるファン向け分析環境へ発展させる。

```text
Official / public match data
↓
Derived Metrics
↓
Match / Tournament / Season comparison
↓
Official / public video
↓
Video-tagged Event Data
↓
Cross-match Event Search
↓
Team / Player / Opponent Profiles
↓
Tactical Interpretation
```

競争軸は「World Rugby内部の分析より高度であること」ではない。

中心価値は以下とする。

- 一般ファン向けであること
- SVNSに特化すること
- 男女SVNSを同じ思想で扱えること
- 大会・試合・チーム・選手を横断できること
- 分析根拠を元スタッツや映像まで遡れること
- 映像と数値を往復できること
- 裏側が高度化しても操作を複雑にしないこと

---

# 2. 現在地

## v1.0 — COMPLETED

2026-07-26完了。

主要機能：

- Home
- Stats Analysis
- Stats Trends
- Match Search
- Video
- About / Data and Video Sources
- 日本語 / 英語
- PWA
- GitHub Pages公開
- 非公式・非提携表示
- 出典追跡
- 小規模proof of conceptデータ
- 公式公開YouTube動画へのリンク / 標準埋め込み

CSV / Excel / PDF公開出力は削除済み。

---

## v1.1-01 — COMPLETED

### Baseline / Issue Register

- v1.0 baseline固定
- 公開アプリ / リポジトリ記録
- v1.1 issue register整備

---

## v1.1-02A — COMPLETED

### Public Demo Readiness / Analysis Model Revision

13のコア指標を中心にStats Analysis / Stats Trendsを整理。

### Results & Scoring

1. Points Differential
2. Win Rate
3. Points per Match
4. Tries per Match

### Scoring Efficiency

5. Points per 100 Metres
6. Tries per 100 Metres

### Attacking Efficiency

7. Metres per Carry
8. Clean Breaks per 100 Carries
9. Defenders Beaten per Carry

### Possession & Discipline

10. Turnover Differential
11. Penalties per Match

### Defence & Retention

12. Tackle Success
13. Ruck Success

Comparison：

- Tournament
- Result
- Opponent

Relationships：自由X/Yではなくpreset方式。

Trends：

- Match
- Tournament
- Season

スマホでは必要に応じて対戦国を3文字略称表示。

---

## v1.1-02B — COMPLETED

### World Rugby enquiry preparation

- 初回問い合わせ文面
- 公開 / 私用連絡先分離
- 公式問い合わせフォーム送信準備
- データ・動画利用方針整理

---

## v1.1-03 — ACTIVE

### World Rugby enquiry / response tracking

```text
Initial submission: 2026-07-29
Route: World Rugby official Contact Us form
Category: Research
Language: English
Response: Pending
```

現在の運用：

```text
Public prototype: 維持
Public data expansion: 凍結
Large feature expansion: 保留
Architecture / documentation work: 継続可
```

### Follow-up方針

初回問い合わせから約3週間後も返信がない場合、一度だけ簡潔なfollow-upを行う。

第2回問い合わせでは：

- 7月29日の問い合わせへのfollow-up
- 到達確認
- 適切なdata / digital / competition担当へのrouting依頼
- 現在のプロジェクトを短く再説明
- 将来のVideo + Stats / Analysis Workspace構想を1〜2文だけ提示
- 公式データ経路 / API / Data Feed / Data Dictionary / 利用条件を再確認

を行う。

AI / MLや詳細なevent-tagging構想は、相手から説明を求められた段階で提示する。

前回問い合わせ後に動画機能を追加したとは書かない。動画機能は初回問い合わせ前から存在していた。

---

# 3. World Rugby回答待ち期間の開発原則

## 継続してよい作業

- bug fix
- Architecture / Handover
- Data Provider分離
- Schema / Data Dictionary
- Derived Metrics整理
- tests
- reproducible build
- accessibility
- responsive UI refinement
- localisation architecture
- local / private prototype

## 凍結または保留

- Rugby Australia由来データの大規模追加
- 対象大会・チームの大量拡張
- scraping
- public export
- public API提供
- 大規模宣伝
- 公式サービスと誤認される表示
- 権利範囲を広げる公開機能

---

# 4. v1.1 — Architecture / Handover / Maintainability

v1.1は「機能を増やす版」よりも、「現在のアプリを交換可能・理解可能・保守可能にする版」と位置づける。

---

## v1.1-04 — Current Architecture & Handover Inventory

現行アプリを文書化する。

記録対象：

- screen構成
- navigation
- data flow
- main components
- data loading
- analytics calculation path
- chart rendering
- video components
- localisation
- PWA / build / deployment
- current source assumptions
- known limitations
- technical debt

想定成果物：

```text
docs/current-architecture-and-handover.md
```

最低限、次の流れを第三者が把握できる状態にする。

```text
matches.json
→ normalization / loading
→ derived metrics
→ aggregation
→ filter / comparison
→ visualisation
```

---

## v1.1-05 — Secure Development / Repository Hygiene

確認：

- public / private情報分離
- 個人情報
- secrets
- GitHub Actions permission
- dependencies
- deployment workflow
- public source files

この工程だけのために認証機能を作らない。

---

## v1.1-06 — Data Provider / Adapter Separation

目標構造：

```text
Provider
↓
Provider Adapter
↓
Canonical Data Model
↓
Derived Metrics
↓
Analysis / Trends / Search
```

UIや分析ロジックをRugby Australia固有形式へ直接依存させない。

将来候補：

- World Rugby公式データ
- RugbyPass
- designated data provider
- manual import
- event-level provider

特定providerの実在・採用を前提にしない。

---

## v1.1-07 — Canonical Schema / Data Dictionary

定義対象：

- season
- tournament
- match
- team
- opponent
- player
- team match stats
- source
- video source
- data coverage
- missing-value semantics

各field / metricについて：

- name
- type
- unit
- nullable
- raw / calculated
- source
- formula
- denominator rule
- coverage
- definition version

### 必須原則

- missing = `null`
- missingを`0`にしない
- denominator 0 = `null`
- aggregate ratioは必要に応じて分子・分母をpoolして再計算
- roundingは表示時のみ

---

## v1.1-08 — Derived Metrics Engine Separation

以下を明確に分離する。

```text
Canonical Data Model
Derived Metrics Engine
Aggregation
Filter / Comparison
Visualisation Configuration
Presentation
```

13コア指標のformulaを複数componentへ重複実装しない。

---

## v1.1-09 — Tests / Reproducible Build

test対象：

- normalization
- derived metrics
- missing values
- zero denominator
- pooled aggregation
- match / tournament / season grouping
- comparison filters
- relationship presets
- mobile opponent labels

併せて：

- install
- local run
- build
- test
- deploy
- rollback

を文書化。

---

## v1.1-10 — Localisation Architecture

現在の日本語 / 英語を維持しつつ、拡張可能なi18n構造にする。

次候補：

- French
- Spanish

将来候補：

- Portuguese (Brazil)
- Italian
- Simplified Chinese
- Traditional Chinese / Hong Kong
- Arabic（RTL対応後）
- Georgian

metric logicに言語文字列を混在させない。

---

## v1.1-11 — Information Architecture Design

トップレベル機能タブを増殖させない。

現在型：

```text
Home / Stats / Trends / Search / Video / Analysis / AI ...
```

から、将来はentity-centredへ。

```text
Home
Matches
Teams
Players
Analysis
```

例：

### Match
- Overview
- Video
- Stats
- Players
- Analysis

### Team
- Overview
- Results
- Stats
- Trends
- Players

### Player
- Overview
- Match Log
- Stats
- Trends
- Comparison

この工程では大規模UI実装ではなく、情報設計を固める。

---

## v1.1-12 — v1.1 Validation / Completion

確認：

- Architecture documentation
- Provider abstraction
- Schema / Data Dictionary
- Shared Derived Metrics Engine
- Tests
- Reproducible build
- Current public UI
- Source traceability
- World Rugby response status
- unresolved data / rights issues

完了時：

```text
Version 1.1: COMPLETED
```

---

# 5. v1.2 — Match Analysis Workspace

v1.2以降は「Stats Database」から「Sevens Analysis Workspace」への移行を始める。

中心ユーザー行動：

```text
映像を見る
↓
気になる
↓
その場でスタッツを見る
↓
過去平均と比較
↓
Trendsを見る
↓
他試合を探す
↓
映像へ戻る
```

---

## v1.2-01 — Workspace Shell

PC：

```text
┌──────────────────────┬──────────────────────┐
│ Official YouTube     │ Analysis Panel       │
│ Video                │ Stats / Team /       │
│                      │ Player / Analysis    │
└──────────────────────┴──────────────────────┘
```

スマホ：

```text
Video
↓
Analysis Cards
↓
Stats / Players / Analysis
```

---

## v1.2-02 — Match vs Baseline Comparison

動画を見ながら：

- current match
- season average
- tournament average
- opponent-specific average（十分なsampleがある場合）

を比較。

例：

```text
Turnovers Conceded
Current match: 5
Season average: 3.2
Difference: +56%
```

統計的有意性を検定していない場合、有意差とは表現しない。

---

## v1.2-03 — Video Dock / Persistent Player

候補：

- Small
- Medium
- Analysis Split

画面遷移中も必要な範囲で動画文脈を維持する。

YouTube player上に独自UIを重ねることは原則避ける。

---

## v1.2-04 — Data → Video Navigation

```text
Trendsで異常発見
↓
大会
↓
試合
↓
Video + relevant stats
```

を実現。

---

# 6. v1.3 — YouTube Time Integration / Manual Event Tagging

新しいデータ層：

> **Video-tagged Event Data**

映像本体は公式公開YouTube側に保持する。

Analyzer側は：

- video ID
- timestamp
- event metadata

を保持する。

動画ファイルを自前でdownload / host / redistributeしない。

---

## v1.3-01 — Playback Time Read / Seek

Stage 1：

- 現在再生時刻取得
- 保存時刻へのジャンプ
- `youtube_video_id`管理
- 動画利用不能時のgraceful fallback

---

## v1.3-02 — Event Schema

基本案：

```text
event_id
match_id
youtube_video_id
timestamp
event_type
event_subtype
team_id
player_id
opponent_id
sequence_id
memo
tagging_date
source_channel
video_duration
```

将来候補：

```text
field_zone
attack_direction
preceding_event_id
following_event_id
result
confidence
review_status
```

映像ソースと分析データを別管理する。

---

## v1.3-03 — Manual Event Tagging MVP

最初はタグを絞る。

初期候補：

- Line Break
- Offload
- Turnover Won
- Turnover Conceded
- Penalty
- Try
- Restart

実利用で価値を確認してから追加する。

---

## v1.3-04 — Match Event Timeline

例：

```text
03:24  JPN  Line Break       ▶
03:31  JPN  Offload          ▶
03:36  JPN  Try              ▶
05:12  AUS  Turnover Won     ▶
```

▶で該当時刻へjump。

---

## v1.3-05 — Cross-match Event Search

例：

```text
Team: Japan Women
Event: Line Break
Season: 2026
```

```text
Dubai       vs AUS   03:24 ▶
Dubai       vs FRA   05:18 ▶
Cape Town   vs NZL   01:42 ▶
Singapore   vs CAN   04:51 ▶
```

「日本女子の今季すべてのLine Breakを映像で確認する」のような横断探索を可能にする。

---

# 7. v1.4 — Sevens Event Analysis

## v1.4-01 — Sevens-specific Tactical Taxonomy

15人制体系をそのまま移植しない。

### Attack Creation候補

- 2v1 creation
- 3v2 creation
- Individual beat
- Change of angle
- Switch
- Scissors
- Loop / Wrap
- Overs line
- Unders line
- Miss pass
- Decoy
- Width creation
- Defensive manipulation

### Break / Continuity候補

- Line Break
- Clean Break
- Support Available
- Support Unavailable
- Successful Offload
- Failed Offload
- Recycle
- Breakdown Retention
- Continuity Maintained
- Continuity Lost

### Defence候補

- Missed Tackle
- Dominant Tackle
- Defensive Turnover
- Line Integrity Maintained
- Defensive Disconnect
- Over-chase
- Defender Bite
- Sweeper Involvement
- Cover Defence
- Breakdown Commitment

### Possession / Restart候補

- Turnover Won
- Turnover Conceded
- Penalty Won
- Penalty Conceded
- Kick-off / Restart
- Restart Won
- Restart Lost
- Scrum
- Lineout

UIへ最初から全タグを出さない。

---

## v1.4-02 — Event-derived Metrics

候補：

- Line Break → Try Conversion Rate
- Line Break → Support Success Rate
- Offload Success Rate
- Break後のPossession Retention
- Break後の平均得点
- Turnover → Try Conversion
- Restart Win Rate
- Continuity Loss after Break

全指標を元イベントまで遡れるようにする。

---

## v1.4-03 — Event Sequence Model

例：

```text
Line Break
↓
Support Available
↓
Successful Offload
↓
Continuity
↓
Try
```

sequence_idで一連の攻撃を管理する。

---

## v1.4-04 — Event Trends Integration

既存Trendsへevent-derived dataを接続。

例：

```text
Dubai
Switch usage       8
Loop / Wrap        6
Individual beat   11

Cape Town
Switch usage       5
Loop / Wrap        3
Individual beat   14
```

「戦術選択がどう変化したか」を追跡する。

因果断定ではなく、映像再確認の候補を提示する。

---

# 8. v1.5 — Team / Player / Opponent Profiles

## v1.5-01 — Team Style Fingerprint

候補dimension：

- Tempo
- Width
- Pass dependence
- Carry dependence
- Offload tendency
- Break creation
- Break conversion
- Turnover attack
- Defensive pressure
- Restart effectiveness

必ず定義と根拠を明示する。

---

## v1.5-02 — Player Role Profile

候補：

- Break Creator
- Finisher
- Distributor
- Connector
- Direct Carrier
- Support Runner
- Defensive Stopper
- Turnover Specialist

役割名を先に作って当てはめるのではなく、特徴量を先に計算する。

---

## v1.5-03 — Player Similarity

- similarity feature space明示
- sample size / coverage警告
- similar players
- role-cluster neighbours
- style differences

を表示。

---

## v1.5-04 — Opponent Matchup Analysis

Team × Opponentで通常時との差を見る。

例：

```text
Japan vs France
Turnover Conceded ↑
Width Creation ↓
Break Conversion ↓
```

相手による変化と因果を混同しない。

---

## v1.5-05 — Match Anomaly Detection

「そのチームの通常状態からどれだけ外れた試合か」を検出。

候補：

- pass rate
- carry rate
- line breaks
- turnovers conceded
- defence
- restart
- event-derived tactical metrics

Anomaly = unusualであり、badとは限らない。

---

## v1.5-06 — Emerging Player Detector

十分なplayer-level dataが得られた後に検討。

補正候補：

- playing time
- opponent
- team context
- tournament
- recent trend

単純ランキングにはしない。

---

# 9. v1.6 — Tactical Interpretation / Analysis Engine

最終的な分析階層：

```text
Raw Match Stats
↓
Derived Metrics
↓
Video-tagged Events
↓
Event Sequences
↓
Team / Player / Opponent Profiles
↓
Tactical Interpretation
```

解釈結果は元データへ遡れる必要がある。

例：

```text
Japan created more line breaks than Australia.

However, Japan converted fewer breaks into tries
and lost continuity more often after the break.

Review tagged events:
03:24
05:18
06:02
```

まずevidenceを示し、その後interpretationを示す。

---

# 10. AI / ML Policy

AI搭載自体を目的にしない。

優先順位：

1. Team Style Fingerprint
2. Player Similarity
3. Match Anomaly Detection
4. Emerging Player Detector
5. Matchup Model
6. Win / Result Prediction

勝敗予測は優先度を低くする。

理由：

- 試合時間が短い
- 選手入れ替え影響が大きい
- Card影響が大きい
- sampleが限られる
- 偶然性が比較的大きい

予測を出す場合はuncertaintyを明示する。

### Human-first tagging

```text
Human tagging
↓
Structured data
↓
Calculation
↓
Rule-based analysis
↓
Optional AI explanation
```

十分なreviewed training dataが蓄積した場合のみ、AIによる：

- tag candidate
- event candidate detection
- classification assistance

を検討。

---

# 11. v2.0 — Data Platform / Controlled Automation

v2.0は規模が必要になった時点で開始。

候補：

- database
- canonical team / player / match IDs
- controlled authentication
- admin / review workflow
- audit log
- event review status
- semi-automated import
- official API integration（利用可能な場合）
- provenance preservation（許可範囲内）
- background processing
- data-quality monitoring

要件がない段階では：

- SSO
- enterprise admin
- complex cloud architecture
- multi-user permission system

を先に作らない。

---

# 12. World Rugby回答による分岐

## Branch A — Official data route / permission available

優先：

1. 利用条件確認
2. official provider adapter
3. official IDs → canonical IDs mapping
4. Data Dictionary取込
5. historical coverage確認
6. permitted backfill
7. event-level data access確認
8. manual tagging範囲再評価

公式event dataが得られる場合、manual taggingは公式データにないtactical conceptへ集中する。

---

## Branch B — Public use permitted with conditions

対応：

- attribution
- source links
- coverage limits
- update rules
- branding restrictions
- disclaimer

を実装してcontrolled data expansionを再開。

---

## Branch C — Current public use incompatible

必要に応じて：

- public prototype修正
- affected data削除
- source strategy変更
- public prototype停止

Private利用が自動的に許可されるとは仮定せず、問題のscopeを確認する。

---

## Branch D — No response

継続：

- Architecture
- Tests
- Provider abstraction
- Schema
- local / private prototypes

Public data expansionは慎重に維持。

未回答点を記録したうえで、必要なら後に別の適切なorganisation / rights holderへ問い合わせる。

---

# 13. Product Principles

## Fan-facing first

プロ分析ツールそのものを複製するのではなく、一般SVNSファンが使える形にする。

## Evidence before interpretation

全分析結果をraw stats / formula / source / video tagへ遡れるようにする。

## Video and analysis are separate layers

公式公開YouTube映像を標準埋め込みで利用し、動画ファイル自体は自前保持しない。

## Keep UI simple

ユーザーが意識する基本操作は：

```text
Watch
Compare
Explore
Search
Review
```

## Entity-centred navigation

機能名をトップタブとして増やさない。

## Sevens-specific design

優先概念：

- space
- numerical advantage
- break creation
- support
- continuity
- restart
- defensive spacing
- transition

---

# 14. Priority Summary

## Now — v1.1

```text
v1.1-03 World Rugby follow-up / response tracking
v1.1-04 Architecture & Handover Inventory
v1.1-05 Secure Development
v1.1-06 Data Provider / Adapter Separation
v1.1-07 Schema / Data Dictionary
v1.1-08 Derived Metrics Engine Separation
v1.1-09 Tests / Reproducible Build
v1.1-10 Localisation Architecture
v1.1-11 Information Architecture Design
v1.1-12 Validation / Completion
```

## Next

```text
v1.2 Match Analysis Workspace
v1.3 YouTube Time Integration / Manual Event Tagging
v1.4 Sevens Event Analysis
v1.5 Team / Player / Opponent Profiles
v1.6 Tactical Interpretation / Analysis Engine
```

## Later / Scale dependent

```text
AI / ML assistance
Official event-data integration
Database / review workflow
Semi-automation
v2.0 platform architecture
```

---

# 15. Final Target

SVNS Stats Analyzerを、

> **「SVNSの公開スタッツを検索・比較するアプリ」**

から、

> **「スタッツ・派生指標・公式公開映像・イベントデータ・横断検索・戦術解釈を結ぶ、ファン向けSevens Analysis Workspace」**

へ発展させる。

最終的な中心ループ：

```text
映像を見る
↓
気になる
↓
スタッツを見る
↓
通常時と比較する
↓
Trendsを見る
↓
関連試合 / イベントを探す
↓
映像へ戻る
```

逆方向：

```text
データで異常を発見
↓
大会 / 試合へ移動
↓
関連イベント時刻へジャンプ
↓
実際の映像で確認
```

この双方向ループをSVNS Stats Analyzerの長期的な製品アイデンティティとする。
