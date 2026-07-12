# SVNS Stats Analyzer

# Version0.7 Completion Check

Version: v0.7-12  
Scope: Real Data Expansion Phase 1  
Status: Completed

---

## 1. この文書の目的

この文書は、Version0.7「Real Data Expansion Phase 1」の実装・データ・表示・運用文書を最終確認し、Version0.7を完了扱いにできるか判定するためのものである。

---

## 2. Version0.7 の完了判定

**判定：Completed**

Version0.7 の中核目的である、Dubai SVNS / Women / Japan の実データ拡張、表示反映、重複整理、運用ルール更新は完了した。

Version0.7 完了時点の主要成果：

- Dubai SVNS / Women / Japan の5試合を real data 化
- Rugby.com.au Match Stats を直接確認する運用を確立
- `metres` を標準フィールドとして追加
- 勝敗関連フィールドを拡張
- New Zealand / Fiji の旧 sample data を real data に置換
- StatsAnalysis / StatsTrends に実データを反映
- 試合一覧・推移グラフを時系列順に整理
- 分布図を X軸・Y軸選択式に変更
- 欠損値を `0` として扱わない処理を追加
- real data / sample data の識別と警告を追加
- real data import checklist を v0.7仕様へ更新

---

## 3. Version0.7 作業一覧

| Task | 内容 | Status |
|---|---|---|
| v0.7-01 | Version0.7 plan 作成 | Completed |
| v0.7-02 | real data import log 作成 | Completed |
| v0.7-03 | Dubai SVNS import targets 作成 | Completed |
| v0.7-04 | Great Britain 戦 real data 追加 | Completed |
| v0.7-05 | 初期表示確認 | Completed |
| v0.7-06 | Dubai SVNS Japan Women 5試合 real data 化 | Completed |
| v0.7-07 | sample data cleanup | Completed |
| v0.7-08 | import log addendum 作成 | Completed |
| v0.7-09 | Video Library candidate 整理 | Completed at candidate level |
| v0.7-10 | source / dataCoverage / 新フィールド表示確認 | Completed |
| v0.7-10A | StatsAnalysis 表示修正 | Completed |
| v0.7-10B | StatsTrends 新フィールド対応 | Completed |
| v0.7-11 | real-data-import-checklist 更新 | Completed |
| v0.7-12 | Version0.7 completion check | Completed |
| v0.7-13 | 試合一覧の時系列ソート | Completed |
| v0.7-14 | 分布図の指標選択化 | Completed |

---

## 4. Real Data Coverage

Version0.7 で real data 化した試合：

| Match ID | Date | Stage | Opponent | Score | Result |
|---|---|---|---|---|---|
| 949542 | 2025-11-29 | Pool | Australia | Japan 7-31 Australia | Australia Win |
| 949546 | 2025-11-29 | Pool | Great Britain | Japan 36-5 Great Britain | Japan Win |
| 949550 | 2025-11-29 | Pool | Canada | Japan 21-19 Canada | Japan Win |
| 949554 | 2025-11-30 | Semi Final | New Zealand | Japan 5-31 New Zealand | New Zealand Win |
| 949558 | 2025-11-30 | Bronze Final | Fiji | Japan 22-12 Fiji | Japan Win |

Coverage summary：

| Scope | Real Data | Sample Data | Status |
|---|---:|---:|---|
| 2025-26 / Women / Japan / Dubai SVNS | 5 | 0 | Complete |
| 2025-26 / Women / Japan / Cape Town SVNS | 0 | 2 | Sample only |
| 2025-26 / Men / Japan / Dubai SVNS | 0 | 1 | Sample only |
| 2024-25 / Women / Japan / Hong Kong SVNS | 0 | 1 | Sample only |

---

## 5. Data Structure Check

### 5.1 新規・更新フィールド

以下を real data に反映済み。

- [x] `metres`
- [x] `teamResult`
- [x] `matchResult`
- [x] `winner`
- [x] `loser`
- [x] `dataType: "real"`

### 5.2 互換性維持

- [x] 既存コード互換のため `result` を維持
- [x] `teamResult` が存在する場合は優先使用
- [x] 旧データ用 fallback を追加

### 5.3 欠損値

- [x] 未確認値は `null`
- [x] 未確認値を `0` として扱わない
- [x] 詳細画面では欠損値を `—` 表示
- [x] StatsTrends の平均値から欠損値を除外
- [x] 分布図では必要指標が存在する試合のみ使用

---

## 6. Source Discipline Check

- [x] `sourceProvider: "Rugby.com.au Match Stats"` の根拠を Rugby.com.au Match Centre に限定
- [x] `sourceUrl` を Rugby.com.au 直接URLに統一
- [x] Rugby Network 系ミラーを数値確定根拠に使用しない
- [x] 他サイトは補助確認に限定
- [x] Rugby.com.au で確認できない場合は推測入力しない
- [x] source discipline を checklist に反映

---

## 7. Duplicate / Sample Replacement Check

- [x] Dubai SVNS 5試合に同一 real data の二重登録なし
- [x] New Zealand 旧 sample data を削除
- [x] Fiji 旧 sample data を削除
- [x] 別大会の同一カードは削除していない
- [x] Cape Town / Men Dubai / Hong Kong の sample data は対象外として維持

---

## 8. StatsAnalysis Check

- [x] Dubai SVNS 5試合が表示される
- [x] Match Count が5件
- [x] 試合一覧が日付昇順
- [x] 同日は Rugby.com.au Match ID 順
- [x] 表示順が Australia → Great Britain → Canada → New Zealand → Fiji
- [x] 試合一覧に勝者名を含む結果を表示
- [x] 試合詳細に match result を表示
- [x] 試合詳細に winner / loser を表示
- [x] 試合詳細に `metres` を表示
- [x] sourceProvider / dataCoverageLevel を表示
- [x] 旧データ用 fallback が機能する

---

## 9. StatsTrends Check

- [x] Dubai SVNS 5試合が時系列順に表示される
- [x] 同日は Rugby.com.au Match ID 順
- [x] `metres` を指標として選択できる
- [x] Dubai 5試合の metres が 198 → 336 → 258 → 133 → 289
- [x] 欠損値を0として表示しない
- [x] 対象試合数と有効データ数を区別
- [x] real data / sample data を表示
- [x] 混在時に警告
- [x] 大会別平均で欠損値を除外
- [x] 対戦相手別平均で欠損値を除外
- [x] ツールチップに試合情報と結果を表示

---

## 10. Scatter Plot Check

- [x] Clean Breaks × Point Difference 固定を解除
- [x] X軸を選択可能
- [x] Y軸を選択可能
- [x] `metres` を選択可能
- [x] 初期表示を Metres × Point Difference に設定
- [x] 欠損値を含む試合を除外
- [x] 有効プロット数を表示
- [x] 小標本警告を表示
- [x] 同一指標選択時に警告
- [x] ツールチップに試合情報・スコア・結果を表示

---

## 11. Documentation Check

- [x] `docs/version-0.7-plan.md`
- [x] `docs/real-data-import-log.md`
- [x] `docs/dubai-svns-import-targets.md`
- [x] `docs/real-data-import-log-v0.7-08-addendum.md`
- [x] `docs/real-data-import-checklist.md`
- [x] `docs/version-0.7-completion-check.md`

不要となった場合に削除可能な文書：

- `docs/real-data-import-workflow-v0.7-11.md`

この文書は、既存 checklist を貼り忘れた段階で作成された暫定ファイルである。配置済みの場合は削除してよい。

---

## 12. Video Library Candidate Check

Version0.7 では、動画URLの実取得・埋め込み実装は行わず、match data と Video Library を将来接続できる候補として整理した。

- [x] 5試合を Video Library candidate として記録
- [x] Rugby.com.au match ID を保持
- [x] source URL を保持
- [ ] video URL の確認
- [ ] embed 可否確認
- [ ] Video Library 画面との実接続

未完了3項目は Version0.8 以降へ繰り越す。これらは Version0.7 の完了を妨げない。

---

## 13. Version0.7 完了後の既知の制約

### 13.1 データ量

real data は Dubai SVNS / Women / Japan の5試合のみである。

相関・平均・分布図は小標本であり、傾向を確定的に判断できない。

### 13.2 sample data

他大会・男子・前シーズンには sample data が残っている。

画面では real data / sample data の識別と警告を行う。

### 13.3 team filter

現時点の team 選択肢は Japan のみである。

`winner` / `loser` / `matchResult` は将来の複数チーム対応に備えた構造である。

### 13.4 Video Library

試合データと動画の実リンクは未実装である。

### 13.5 Match Search

独立した MatchSearch コンポーネントは存在せず、現時点の試合一覧・詳細機能は `StatsAnalysis.jsx` 内に実装されている。

---

## 14. Version0.8 への繰越候補

優先候補：

1. Video Library の実リンク設計
2. Match Search の独立画面化または検索機能強化
3. Cape Town SVNS real data 追加
4. 他チーム・男子への real data 拡張
5. match kickoff time / match order の追加
6. CSV import または管理用データ入力フロー
7. 相関分析の最低標本数・表示条件の再設計
8. sample data の段階的削除

---

## 15. 最終判定

Version0.7 の定義済み中核範囲は完了した。

**Version0.7 Status: Completed**

次の開発は Version0.8 として開始する。
