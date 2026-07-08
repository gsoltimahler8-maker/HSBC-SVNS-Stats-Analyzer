# SVNS Stats Analyzer

# Version0.6 Completion Check

Version: v0.6-12
Scope: Real Data Import Preparation
Status: Active

---

## 1. この文書の目的

この文書は、Version0.6: Real Data Import Preparation の完了前確認を行うためのチェックリストである。

Version0.6 の目的は、SVNS Stats Analyzer のデータ管理を sample data 中心の状態から、real data import に対応できる構造へ移行することである。

この文書では、以下を確認する。

* `matches.json` への移行が完了しているか
* `loadMatches.js` 経由の読み込みが機能しているか
* StatsAnalysis / StatsTrends が新しいデータ読み込み方式を参照しているか
* real data の追加事例が正常に機能しているか
* 古い sample data が削除されているか
* real data import に必要な運用文書が揃っているか
* Version0.7 へ送るべき課題が整理されているか

---

## 2. Version0.6 の対象範囲

Version0.6 の対象範囲は、Real Data Import Preparation である。

主な対象は以下。

* データ本体を `matches.json` に移行する
* `loadMatches.js` 経由でデータを読み込む
* StatsAnalysis / StatsTrends の参照先を整理する
* Rugby.com.au Match Stats 由来の real data を追加する
* 古い sample data を削除する
* real data import 用の運用ルールを文書化する

Version0.6 は、まだ大量の real data を投入する段階ではない。

大量の実データ追加・CSV import・管理画面・Supabase 等は、Version0.7 以降の検討対象とする。

---

## 3. 完了済みタスク確認

### 3.1 matches.json への移行

確認項目：

* [x] 試合データを `matches.json` へ移行した
* [x] 旧 sampleMatches 依存から脱却する準備ができた
* [x] データ本体をコンポーネント外に分離した
* [x] 今後 real data を追加しやすい構造になった

補足：

`matches.json` は、今後の real data import の中心ファイルとして扱う。

---

### 3.2 loadMatches.js 経由の読み込み

確認項目：

* [x] `loadMatches.js` を作成済み
* [x] `matches.json` を `loadMatches.js` 経由で読み込む構造にした
* [x] データ読み込み処理をコンポーネント側から分離した
* [x] 将来的に読み込み処理を拡張しやすい状態になった

補足：

今後、CSV import、外部JSON、Supabase 等へ拡張する場合も、まず `loadMatches.js` を入口として設計する。

---

### 3.3 StatsAnalysis の参照先確認

確認項目：

* [x] StatsAnalysis が `loadMatches.js` を参照している
* [x] StatsAnalysis が `matches.json` 由来のデータを扱っている
* [x] season / gender / team / tournament フィルターが機能している
* [x] source 表示が機能している
* [x] Rugby.com.au Match Stats 由来の試合が表示できる

補足：

StatsAnalysis は、試合別・条件別分析の中心画面である。
そのため、今後 real data を追加する際は、最初に StatsAnalysis で表示確認を行う。

---

### 3.4 StatsTrends の参照先確認

確認項目：

* [x] StatsTrends が `loadMatches.js` を参照している
* [x] StatsTrends が `matches.json` 由来のデータを扱っている
* [x] tournament / opponent 等の条件が反映されている
* [x] トレンド表示が正常に機能している
* [x] 同一試合が二重表示されていない

補足：

StatsTrends は、今後 real data が増えた時に重要度が上がる画面である。
特に Match Count とトレンドグラフの重複表示には注意する。

---

## 4. real data 追加事例確認

### 4.1 基準例

以下の試合を Version0.6 の real data import 基準例とする。

* match ID: `949558`
* season: `2025-26`
* gender: `Women`
* team: `Japan Women 7s`
* opponent: `Fiji Women 7s`
* tournament: `Dubai SVNS`
* source: `Rugby.com.au Match Stats`

---

### 4.2 実施済み内容

確認項目：

* [x] Rugby.com.au Match Stats 由来の real data を追加した
* [x] `matches.json` に登録した
* [x] 古い sample Fiji 戦を削除した
* [x] `loadMatches.js` 経由で読み込まれている
* [x] StatsAnalysis で表示確認済み
* [x] StatsTrends で表示確認済み
* [x] 2025-26 / Women / Japan / Dubai SVNS 条件で表示確認済み
* [x] Rugby.com.au Match Stats として表示確認済み

---

### 4.3 この事例から得た運用ルール

この試合の処理により、以下の運用方針を確定した。

* real data は sample data より優先する
* 同一試合の sample data は削除する
* Rugby.com.au Match Stats を試合別チームスタッツの主データソースとする
* match ID は重複判定の重要キーとする
* source 表示は必ず確認する
* StatsAnalysis / StatsTrends の両方で表示確認する

---

## 5. sample data 削除確認

確認項目：

* [x] 古い sample Fiji 戦を削除した
* [x] real data と sample data が併存していない
* [x] 同一試合が二重集計されていない
* [x] Match Count が不自然に増えていない
* [x] source が Sample Data のまま残っていない

補足：

今後も、同一試合の real data を追加した場合は、対応する sample data を削除する。

sample data は、real data が存在しない試合の表示確認用に限って残す。

---

## 6. 追加済みドキュメント確認

Version0.6 では、real data import に向けて以下の文書を追加した。

---

### 6.1 data-operation-rules.md

ファイル：

* `docs/data-operation-rules.md`

目的：

* 重複データ運用ルールの明文化
* real data / sample data の優先順位整理
* Rugby.com.au Match Stats と RugbyPass 等の扱いの整理
* 既存データ削除基準の整理

確認項目：

* [x] 同一試合の判定基準を明文化した
* [x] real data と sample data の優先順位を明文化した
* [x] Rugby.com.au Match Stats の優先順位を明文化した
* [x] sample data 削除基準を明文化した
* [x] 949558 Japan Women 7s vs Fiji Women 7s を基準例として記録した

---

### 6.2 real-data-import-checklist.md

ファイル：

* `docs/real-data-import-checklist.md`

目的：

* 実データ追加時の作業漏れ防止
* 追加前・追加後の確認手順整理
* 重複確認・source確認・表示確認の定型化

確認項目：

* [x] 作業前チェックを整理した
* [x] データソース確認を整理した
* [x] 重複確認を整理した
* [x] sample data 削除確認を整理した
* [x] 追加後の表示確認を整理した
* [x] StatsAnalysis / StatsTrends の確認項目を整理した

---

### 6.3 matches-json-field-rules.md

ファイル：

* `docs/matches-json-field-rules.md`

目的：

* `matches.json` の項目ルール整理
* 表記揺れ防止
* source / sourceUrl / matchId の扱い整理
* sample data / real data の区別整理
* フィールド追加・変更時のルール整理

確認項目：

* [x] 必須項目を整理した
* [x] 推奨項目を整理した
* [x] season / gender / tournament / team / opponent の表記ルールを整理した
* [x] source / sourceUrl / matchId の扱いを整理した
* [x] 数値項目の扱いを整理した
* [x] sample data / real data の区別を整理した
* [x] フィールド追加・変更時のルールを整理した

---

## 7. Version0.6 完了条件

Version0.6 は、以下を満たした場合に完了とする。

* [x] `matches.json` へ移行済み
* [x] `loadMatches.js` 経由でデータを読み込んでいる
* [x] StatsAnalysis が `loadMatches.js` を参照している
* [x] StatsTrends が `loadMatches.js` を参照している
* [x] Rugby.com.au Match Stats 由来の real data を1試合追加済み
* [x] 古い sample Fiji 戦を削除済み
* [x] 2025-26 / Women / Japan / Dubai SVNS 条件で Fiji 戦を表示確認済み
* [x] Rugby.com.au Match Stats として表示確認済み
* [x] 重複データ運用ルールを文書化済み
* [x] real data import 用チェックリストを作成済み
* [x] `matches.json` の項目ルールを文書化済み
* [ ] Version0.6 完了前の最終動作確認を行う
* [ ] Version0.7 に送る課題を整理する

---

## 8. Version0.6 最終動作確認

Version0.6 完了宣言前に、以下を確認する。

### 8.1 起動確認

* [ ] アプリが正常に起動する
* [ ] コンソールエラーが出ていない
* [ ] 画面遷移が正常に機能する

---

### 8.2 StatsAnalysis 確認

* [ ] StatsAnalysis が表示される
* [ ] 2025-26 を選択できる
* [ ] Women を選択できる
* [ ] Japan Women 7s を選択できる
* [ ] Dubai SVNS を選択できる
* [ ] Fiji Women 7s 戦が表示される
* [ ] source が Rugby.com.au Match Stats として表示される
* [ ] Match Count が想定どおりである
* [ ] 古い sample Fiji 戦が表示されていない

---

### 8.3 StatsTrends 確認

* [ ] StatsTrends が表示される
* [ ] 2025-26 / Women / Japan Women 7s / Dubai SVNS 条件で表示できる
* [ ] Fiji Women 7s 戦がトレンドに反映される
* [ ] 同一試合が二重表示されていない
* [ ] グラフが正常に表示される
* [ ] 欠損値による表示崩れがない

---

### 8.4 Data Availability / Source 表示確認

* [ ] dataCoverageLevel が想定どおり表示される
* [ ] source 表示が想定どおり表示される
* [ ] Sample Data と Rugby.com.au Match Stats が区別されている
* [ ] real data が sample data と誤表示されていない

---

## 9. Version0.7 へ送る課題

Version0.6 では扱わず、Version0.7 以降に送る課題は以下とする。

---

### 9.1 real data の追加拡大

Version0.7 以降で、Rugby.com.au Match Stats 由来の real data を追加していく。

候補：

* Japan Women 7s の 2025-26 Dubai SVNS 全試合
* Japan Women 7s の 2025-26 Cape Town SVNS
* Japan Women 7s の 2025-26 Singapore SVNS
* Japan Women 7s の 2025-26 Perth SVNS
* 比較対象として Canada Women 7s / France Women 7s / USA Women 7s 戦
* 必要に応じて Men の Japan 7s データ

---

### 9.2 CSV import 検討

将来的に、手作業で `matches.json` に直接追記する方式から、CSV import に移行する可能性がある。

検討項目：

* CSVテンプレート
* CSVからJSONへの変換
* source / matchId / sourceUrl の必須化
* 入力エラー検出
* 重複チェック
* 表記揺れチェック

---

### 9.3 データ管理画面

将来的に、管理者のみが使用するデータ管理画面を検討する。

検討項目：

* 試合データ一覧
* 新規試合追加
* 既存試合編集
* source 確認
* sample / real 切替
* 重複警告
* JSON export

ただし、Version0.6 では実装しない。

---

### 9.4 Supabase 等の外部DB

将来的に、`matches.json` から Supabase 等の外部DBへ移行する可能性がある。

検討項目：

* 無料枠で運用可能か
* データ構造をどう設計するか
* 静的サイトとの相性
* 管理者更新フロー
* 読み込み速度
* バックアップ方法

ただし、現段階では `matches.json` を基本とする。

---

### 9.5 Match Search との接続

今後、Match Search 機能を拡張する場合、`matches.json` の real data が検索対象になる。

検討項目：

* season 検索
* gender 検索
* tournament 検索
* team / opponent 検索
* source 検索
* matchId 検索
* real data / sample data の絞り込み

---

### 9.6 複数指標比較

Version0.7 以降で、複数指標同時比較を強化する。

候補：

* Points For / Points Against
* Carries / Defenders Beaten
* Tackles / Missed Tackles
* Possession / Territory
* Turnovers Won / Turnovers Conceded
* Penalties Conceded

---

## 10. Version0.6 の成果

Version0.6 により、SVNS Stats Analyzer は以下の状態になった。

* データ本体が `matches.json` に分離された
* データ読み込みが `loadMatches.js` に集約された
* StatsAnalysis / StatsTrends が新しい読み込み方式に対応した
* real data の追加事例ができた
* sample data と real data の置き換えルールが明確になった
* Rugby.com.au Match Stats を主データソースとする方針が明確になった
* 今後の real data import に必要な文書が整備された

これにより、Version0.7 以降で実データを増やす準備が整った。

---

## 11. Version0.6 完了宣言

以下を確認した時点で、Version0.6 は完了とする。

* [ ] 最終動作確認が完了した
* [ ] 既知の重大な表示崩れがない
* [ ] 既知の重大な集計ミスがない
* [ ] real data と sample data の重複がない
* [ ] Version0.7 へ送る課題が整理済みである

完了後の状態：

* Version0.6: Complete
* 次フェーズ: Version0.7
* Version0.7 の主対象: real data 追加拡大、CSV import 検討、データ管理基盤検討

---

## 12. 備考

Version0.6 は、実データ大量投入そのものではなく、実データ投入に耐えるための準備フェーズである。

したがって、Version0.6 の完了条件は「大量の実データが揃っていること」ではない。

Version0.6 の完了条件は、以下である。

* real data を追加できる構造になっていること
* real data の追加事例があること
* sample data との重複を避けるルールがあること
* `matches.json` の項目ルールがあること
* 追加後の確認手順があること

この条件を満たせば、Version0.6 は完了として扱う。
