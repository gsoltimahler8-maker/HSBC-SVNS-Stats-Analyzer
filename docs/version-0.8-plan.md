# SVNS Stats Analyzer

# Version0.8 Plan

Version: v0.8-01  
Title: Match Search & Video Library Foundation  
Status: Planned

---

## 1. Version0.8 の目的

Version0.8 では、Version0.7 で整備した real data と試合メタデータを、分析画面だけでなく以下の独立機能から利用できるようにする。

- Match Search
- Video Library

Version0.8 の主目的は、データ件数を増やすことよりも、試合単位で検索・参照・遷移できる構造を整えることである。

Version0.7 では `StatsAnalysis.jsx` 内に試合一覧・試合詳細が実装されている。Version0.8 では、この機能を整理し、独立した検索画面と動画ライブラリの基盤を作る。

---

## 2. Version0.8 の基本方針

### 2.1 優先順位

優先順位は以下とする。

1. Match Search の独立機能化
2. Match Detail の共通化
3. Video Library の基盤作成
4. Match Search と Video Library の相互リンク
5. Cape Town SVNS real data 追加
6. sample data の段階的整理

### 2.2 データ拡張より先に画面構造を整える

Version0.8 の前半では、Cape Town SVNS の大量追加を先に行わない。

理由：

- Match Search の検索条件と表示項目を先に確定する必要がある
- Video Library で必要なフィールドを先に確定する必要がある
- `matches.json` の将来拡張を画面設計と合わせて判断する必要がある
- データ追加後の再修正を減らす必要がある

### 2.3 一作業ずつ進める

Version0.8 でも以下を維持する。

- 1回の作業で1つの目的だけを扱う
- 既存ファイルは全文確認後に全文置き換え
- 長いコードはダウンロード可能なファイルとして出力
- 作業完了ごとに進捗を更新
- 推測でファイル名・データ・画面構造を決めない

---

## 3. Version0.8 の対象範囲

### 3.1 Match Search

独立した Match Search 画面を作成する。

最低限の検索条件：

- season
- gender
- team
- opponent
- tournament
- stage
- result
- data type
- source provider

最低限の一覧表示項目：

- date
- tournament
- stage
- team
- opponent
- score
- match result
- source provider
- data coverage
- data type

最低限の詳細表示項目：

- score
- winner
- loser
- match result
- principal stats
- Rugby.com.au match ID
- source URL
- fetchedAt
- data coverage
- video link status

---

### 3.2 Match Detail の共通化

現状では、試合詳細表示は `StatsAnalysis.jsx` 内に実装されている。

Version0.8 では、将来的に以下の画面から再利用できる構造を検討する。

- StatsAnalysis
- Match Search
- StatsTrends
- Video Library

候補：

- `MatchDetail`
- `MatchCard`
- `MatchResultBadge`
- `SourceMetadata`

ただし、コンポーネント名・配置先は実際の `src` 構成を確認してから決定する。

---

### 3.3 Video Library

Version0.8 では、Video Library の最小基盤を作る。

最低限の機能：

- match data と動画情報の対応付け
- 試合単位の一覧表示
- 対戦カード・日付・大会・結果表示
- 動画URLがある場合の外部リンク
- 動画URLがない場合の `Not available` 表示
- Match Search から Video Library への遷移
- Video Library から Match Detail への遷移

---

## 4. Video Data の基本設計

### 4.1 Version0.8 時点の候補フィールド

`matches.json` に直接持たせる場合の候補：

```json
{
  "videoUrl": null,
  "videoProvider": null,
  "videoType": null,
  "videoAvailability": "not_checked"
}
```

候補値：

### `videoProvider`

- `YouTube`
- `RugbyPass TV`
- `SVNS`
- `World Rugby`
- `Other`
- `null`

### `videoType`

- `full_match`
- `highlights`
- `short_clip`
- `external_page`
- `null`

### `videoAvailability`

- `available`
- `not_available`
- `not_checked`
- `geo_restricted`
- `login_required`
- `removed`

### 4.2 分離ファイル案

動画情報を別管理する場合の候補：

```text
src/data/videos.json
```

例：

```json
{
  "matchId": "R-202526-W-DUB-949550-JPN-CAN",
  "rugbyComAuMatchId": "949550",
  "videoUrl": null,
  "videoProvider": null,
  "videoType": null,
  "videoAvailability": "not_checked"
}
```

### 4.3 Version0.8 で決めること

以下を実装前に決定する。

- `matches.json` に動画情報を持たせるか
- `videos.json` に分離するか
- full match と highlights を複数保持するか
- 埋め込み表示を行うか
- 外部リンクのみとするか

Version0.8 前半では、無理に複雑な複数動画対応を入れない。

---

## 5. Match Search の結果表示ルール

### 5.1 勝敗表示

一覧では以下を使用する。

- `matchResult`
- `winner`
- `loser`

`result: "W"` / `"L"` だけを画面表示に使用しない。

表示例：

```text
Japan 21-19 Canada
Japan 勝利
```

### 5.2 team 検索時の表示

検索対象が Japan 以外の場合でも、勝敗表示が曖昧にならないようにする。

例：

```text
Canada 19-21 Japan
Japan 勝利
```

必要に応じて、検索対象チーム側から見た結果を別表示する。

例：

```text
Canada perspective: Loss
```

ただし、Version0.8 の初期実装では、勝者名を明示する方式を優先する。

---

## 6. 検索・並び順ルール

### 6.1 基本並び順

標準表示は以下の順とする。

1. date
2. Rugby.com.au match ID
3. internal match ID

### 6.2 並び替え候補

Version0.8 内で以下を検討する。

- date ascending
- date descending
- tournament
- opponent
- points difference
- match result

初期値は date descending または date ascending のどちらかを、画面用途に応じて決定する。

Match Search は新しい試合を探しやすくするため date descending、StatsAnalysis は時系列分析のため date ascending が有力候補である。

---

## 7. Data Type / Coverage 表示

Match Search と Video Library では、以下を明示する。

- real data
- sample data
- full match stats
- limited data
- results only
- unknown

sample data が検索結果に含まれる場合は、画面上で識別できるようにする。

real data と sample data を同じ見た目で表示しない。

---

## 8. Cape Town SVNS real data 追加方針

Version0.8 後半の real data 拡張候補は、Japan Women 7s の Cape Town SVNS とする。

ただし、以下を満たしてから開始する。

- Match Search の基本検索が完成
- Match Detail の表示項目が確定
- Video Library のデータ構造が確定
- `matches.json` の必須フィールドが確定
- real data import checklist が Version0.8仕様に対応

Cape Town 追加時も、Rugby.com.au Match Stats の直接確認を必須とする。

---

## 9. Version0.8 で行わないこと

Version0.8 では、以下を原則として行わない。

- Supabase 導入
- 外部データベース導入
- 管理画面の本格実装
- CSV一括インポート
- 自動スクレイピング
- RugbyPassとの数値統合
- player stats の本格導入
- 動画自動収集
- 動画ファイルの保存
- 全SVNS試合の一括登録
- 複数ユーザー機能
- ログイン機能
- お気に入り機能
- 高度な相関分析の追加

---

## 10. Version0.8 作業計画

| Task | 内容 | Status |
|---|---|---|
| v0.8-01 | Version0.8 plan 作成 | Completed |
| v0.8-02 | 現在の画面遷移・ファイル構成確認 | Planned |
| v0.8-03 | Match Search requirements 確定 | Planned |
| v0.8-04 | Match Search データ抽出ロジック作成 | Planned |
| v0.8-05 | Match Search 一覧画面作成 | Planned |
| v0.8-06 | Match Detail 表示作成 | Planned |
| v0.8-07 | Match Search フィルター実装 | Planned |
| v0.8-08 | Match Search 並び替え実装 | Planned |
| v0.8-09 | Match Search 表示確認 | Planned |
| v0.8-10 | Video Library data model 確定 | Planned |
| v0.8-11 | Video Library 一覧画面作成 | Planned |
| v0.8-12 | Match Search / Video Library 相互リンク | Planned |
| v0.8-13 | Dubai 5試合の video candidate 確認 | Planned |
| v0.8-14 | Cape Town import targets 作成 | Planned |
| v0.8-15 | Cape Town real data import | Planned |
| v0.8-16 | sample data cleanup | Planned |
| v0.8-17 | documentation update | Planned |
| v0.8-18 | Version0.8 completion check | Planned |

---

## 11. Version0.8 前半の完了条件

Match Search Foundation は、以下を満たした場合に完了とする。

- [ ] 独立した Match Search 画面が存在する
- [ ] HomeMenu から遷移できる
- [ ] season で検索できる
- [ ] gender で検索できる
- [ ] team で検索できる
- [ ] opponent で検索できる
- [ ] tournament で検索できる
- [ ] stage で検索できる
- [ ] result で検索できる
- [ ] data type で検索できる
- [ ] 一覧に score と winner が表示される
- [ ] Match Detail を開ける
- [ ] source metadata を確認できる
- [ ] real data / sample data を識別できる
- [ ] 並び順が安定している

---

## 12. Version0.8 後半の完了条件

Video Library Foundation と data expansion は、以下を満たした場合に完了とする。

- [ ] 独立した Video Library 画面が存在する
- [ ] HomeMenu から遷移できる
- [ ] match data と動画情報を対応付けられる
- [ ] 動画URLの有無を表示できる
- [ ] 外部動画リンクを開ける
- [ ] Match Search と相互遷移できる
- [ ] Dubai 5試合の video candidate 状態を記録している
- [ ] Cape Town import targets を作成している
- [ ] Cape Town real data を追加している
- [ ] sample data の重複を整理している
- [ ] documentation を更新している

---

## 13. Version0.8 の成功基準

Version0.8 は、単に試合データが増えた状態ではなく、以下の利用導線が成立した状態を成功とする。

```text
Home
  ↓
Match Search
  ↓
Match Detail
  ↓
StatsAnalysis / StatsTrends / Video Library
```

または、

```text
Home
  ↓
Video Library
  ↓
Match Detail
  ↓
Match Search / StatsAnalysis
```

Version0.8 の中心は、試合単位でデータ・分析・動画へ移動できる構造を作ることである。

---

## 14. Version0.8 開始時点の既知の制約

- real data は Dubai SVNS / Women / Japan の5試合
- Cape Town / Men Dubai / Hong Kong は sample data
- team filter は Japan のみ
- Video URL は未確認
- 独立した Match Search コンポーネントは未実装
- 独立した Video Library コンポーネントは未実装
- 現在の試合一覧・詳細は `StatsAnalysis.jsx` 内に実装
- ルーティング構造は Version0.8-02 で確認する

---

## 15. 次の作業

次は **v0.8-02：現在の画面遷移・ファイル構成確認** を行う。

確認対象：

- `src` 配下の全ファイル
- `App.jsx`
- `HomeMenu.jsx`
- HomeMenu の各ボタンの遷移先
- Match Search ボタンの現在の挙動
- Video Library ボタンの現在の挙動
- ルーティングの有無
- 試合一覧・詳細の現在の実装位置

実際の構成を確認したうえで、Match Search / Video Library のファイル名と配置先を決定する。
