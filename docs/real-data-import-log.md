# SVNS Stats Analyzer

# Real Data Import Log

Version: v0.7-02
Scope: Real Data Expansion Phase 1
Status: Active

---

## 1. この文書の目的

この文書は、`matches.json` に追加した real data の作業履歴を記録するためのログである。

目的は以下である。

* どの試合を real data として追加したか記録する
* match ID / source URL / source を追跡できるようにする
* sample data を削除したか確認する
* StatsAnalysis / StatsTrends / Match Search の確認結果を残す
* 将来の Video Library 連携候補を整理する
* Version0.8 以降の CSV import / 検索強化 / データ管理画面の検討材料にする

詳細ルールは以下を参照する。

* `docs/data-operation-rules.md`
* `docs/real-data-import-checklist.md`
* `docs/matches-json-field-rules.md`
* `docs/version-0.7-plan.md`

---

## 2. 基本方針

real data import は、1試合ずつ行う。

各試合について、以下を必ず記録する。

* match ID
* source
* source URL
* season
* gender
* tournament
* team
* opponent
* stage / round
* match date
* dataType
* dataCoverageLevel
* sample data 削除有無
* StatsAnalysis 確認結果
* StatsTrends 確認結果
* Match Search 確認結果
* Video Library 連携候補
* 備考

作業履歴を記録せずに real data を追加し続けてはいけない。

---

## 3. 記録ステータス

各試合の import status は、以下のいずれかで記録する。

| Status        | 意味                                              |
| ------------- | ----------------------------------------------- |
| `Planned`     | 追加予定                                            |
| `In Progress` | 作業中                                             |
| `Imported`    | `matches.json` に追加済み                            |
| `Verified`    | StatsAnalysis / StatsTrends / Match Search 確認済み |
| `Blocked`     | source 不明、データ不足、重複疑い等で保留                        |
| `Replaced`    | sample data から real data に置き換え済み                |
| `Removed`     | 不要データとして削除済み                                    |

原則として、Version0.7 の完了対象は `Verified` まで到達した試合とする。

---

## 4. 確認項目の定義

### 4.1 StatsAnalysis 確認

以下を確認する。

* 対象条件で試合が表示される
* Match Count が想定どおりである
* source が正しく表示される
* sample data と誤認されていない
* 同一試合が二重表示されていない

---

### 4.2 StatsTrends 確認

以下を確認する。

* 対象条件で試合がトレンドに反映される
* グラフが正常に表示される
* 同一試合が二重表示されていない
* 欠損値により表示崩れが起きていない
* Match Count が想定どおりである

---

### 4.3 Match Search 確認

以下を確認する。

* 対象試合が検索対象に入っている
* season で絞り込める
* gender で絞り込める
* tournament で絞り込める
* team / opponent で絞り込める
* source を確認できる
* real data / sample data の区別に問題がない

---

### 4.4 Video Library 連携候補

Version0.7 では Video Library の本格改修は行わない。

ただし、将来的な連携のために以下を記録する。

* 動画URLが確認できるか
* YouTube などの外部動画があるか
* 埋め込み可能か
* 外部リンクのみか
* matchId と videoUrl を紐づけられそうか
* Match Search から動画へ遷移させる候補になるか

動画URLが未確認の場合は `Not Checked` とする。

---

## 5. Import Log Summary

| Import ID | Match ID | Season  | Gender | Tournament | Team           | Opponent      | Source                   | Status   | Notes                                                  |
| --------- | -------- | ------- | ------ | ---------- | -------------- | ------------- | ------------------------ | -------- | ------------------------------------------------------ |
| IMP-0001  | 949558   | 2025-26 | Women  | Dubai SVNS | Japan Women 7s | Fiji Women 7s | Rugby.com.au Match Stats | Verified | First real data import. Old sample Fiji match removed. |

---

## 6. Import Detail Records

---

### IMP-0001

#### Basic Information

| Field               | Value                    |
| ------------------- | ------------------------ |
| Import ID           | IMP-0001                 |
| Import Status       | Verified                 |
| Match ID            | 949558                   |
| Season              | 2025-26                  |
| Gender              | Women                    |
| Tournament          | Dubai SVNS               |
| Team                | Japan Women 7s           |
| Opponent            | Fiji Women 7s            |
| Stage / Round       | 未記録                      |
| Match Date          | 未記録                      |
| Source              | Rugby.com.au Match Stats |
| Source URL          | 未記録                      |
| Data Type           | real                     |
| Data Coverage Level | full または現行仕様に準拠          |

#### Import Work

| Check Item                     | Result |
| ------------------------------ | ------ |
| `matches.json` に追加済み           | Yes    |
| `loadMatches.js` 経由で読み込み       | Yes    |
| 同一試合の sample data 確認           | Yes    |
| 古い sample data 削除              | Yes    |
| 同一試合の二重登録なし                    | Yes    |
| source 表示確認                    | Yes    |
| Rugby.com.au Match Stats として表示 | Yes    |

#### Screen Verification

| Screen            | Result      | Notes                                        |
| ----------------- | ----------- | -------------------------------------------- |
| StatsAnalysis     | Verified    | 2025-26 / Women / Japan / Dubai SVNS で表示確認済み |
| StatsTrends       | Verified    | `loadMatches.js` 参照で表示確認済み                   |
| Match Search      | Not Checked | Version0.7 で確認対象                             |
| Source Display    | Verified    | Rugby.com.au Match Stats として確認済み             |
| Data Availability | Verified    | 現行仕様に準拠                                      |

#### Video Library Candidate

| Item                      | Value       |
| ------------------------- | ----------- |
| Video URL                 | Not Checked |
| Video Source              | Not Checked |
| Embed Available           | Not Checked |
| External Link Only        | Not Checked |
| Match Data Link Candidate | Yes         |

#### Notes

This match is the baseline case for real data import operation.

The old sample Fiji match was removed and replaced with Rugby.com.au Match Stats based real data.

---

## 7. Planned Import Targets

Version0.7 の第一対象は以下とする。

* season: `2025-26`
* gender: `Women`
* team: `Japan Women 7s`
* tournament: `Dubai SVNS`
* source: `Rugby.com.au Match Stats`

追加予定試合は、v0.7-03 で整理する。

| Priority | Match ID | Team           | Opponent      | Tournament | Source                   | Status   | Notes                       |
| -------- | -------- | -------------- | ------------- | ---------- | ------------------------ | -------- | --------------------------- |
| 1        | 949558   | Japan Women 7s | Fiji Women 7s | Dubai SVNS | Rugby.com.au Match Stats | Verified | Completed baseline case     |
| 2        | TBD      | Japan Women 7s | TBD           | Dubai SVNS | Rugby.com.au Match Stats | Planned  | To be identified in v0.7-03 |
| 3        | TBD      | Japan Women 7s | TBD           | Dubai SVNS | Rugby.com.au Match Stats | Planned  | To be identified in v0.7-03 |
| 4        | TBD      | Japan Women 7s | TBD           | Dubai SVNS | Rugby.com.au Match Stats | Planned  | To be identified in v0.7-03 |

---

## 8. New Import Record Template

新しい real data を追加する際は、以下のテンプレートをコピーして記録する。

---

### IMP-XXXX

#### Basic Information

| Field               | Value    |
| ------------------- | -------- |
| Import ID           | IMP-XXXX |
| Import Status       | Planned  |
| Match ID            |          |
| Season              |          |
| Gender              |          |
| Tournament          |          |
| Team                |          |
| Opponent            |          |
| Stage / Round       |          |
| Match Date          |          |
| Source              |          |
| Source URL          |          |
| Data Type           | real     |
| Data Coverage Level |          |

#### Import Work

| Check Item                     | Result |
| ------------------------------ | ------ |
| `matches.json` に追加済み           | No     |
| `loadMatches.js` 経由で読み込み       | No     |
| 同一試合の sample data 確認           | No     |
| 古い sample data 削除              | No     |
| 同一試合の二重登録なし                    | No     |
| source 表示確認                    | No     |
| Rugby.com.au Match Stats として表示 | No     |

#### Screen Verification

| Screen            | Result      | Notes |
| ----------------- | ----------- | ----- |
| StatsAnalysis     | Not Checked |       |
| StatsTrends       | Not Checked |       |
| Match Search      | Not Checked |       |
| Source Display    | Not Checked |       |
| Data Availability | Not Checked |       |

#### Video Library Candidate

| Item                      | Value       |
| ------------------------- | ----------- |
| Video URL                 | Not Checked |
| Video Source              | Not Checked |
| Embed Available           | Not Checked |
| External Link Only        | Not Checked |
| Match Data Link Candidate | Not Checked |

#### Notes

---

## 9. Blocked / Issue Log

real data import 中に問題が出た場合は、以下に記録する。

| Issue ID   | Related Import ID | Issue Type | Description | Status | Resolution |
| ---------- | ----------------- | ---------- | ----------- | ------ | ---------- |
| ISSUE-0001 |                   |            |             |        |            |

Issue Type の例：

* Duplicate Data
* Missing Match ID
* Missing Source URL
* Source Conflict
* Sample Data Conflict
* Field Mismatch
* Display Error
* StatsAnalysis Error
* StatsTrends Error
* Match Search Error
* Video Link Unknown
* Other

---

## 10. Sample Data Replacement Log

sample data を real data に置き換えた場合は、以下に記録する。

| Replacement ID | Import ID | Match ID | Team           | Opponent      | Removed Sample Data | Real Data Source         | Status    | Notes                         |
| -------------- | --------- | -------- | -------------- | ------------- | ------------------- | ------------------------ | --------- | ----------------------------- |
| REP-0001       | IMP-0001  | 949558   | Japan Women 7s | Fiji Women 7s | Yes                 | Rugby.com.au Match Stats | Completed | Old sample Fiji match removed |

---

## 11. Match Search Verification Log

Match Search での確認結果を記録する。

| Import ID | Match ID | Search by Season | Search by Gender | Search by Tournament | Search by Team | Search by Opponent | Source Visible | Status  | Notes                          |
| --------- | -------- | ---------------- | ---------------- | -------------------- | -------------- | ------------------ | -------------- | ------- | ------------------------------ |
| IMP-0001  | 949558   | Not Checked      | Not Checked      | Not Checked          | Not Checked    | Not Checked        | Not Checked    | Pending | Version0.7 verification target |

---

## 12. Video Library Candidate Log

Video Library との将来連携候補を記録する。

| Import ID | Match ID | Team           | Opponent      | Video URL   | Video Source | Embed Available | External Link Only | Link Candidate | Notes            |
| --------- | -------- | -------------- | ------------- | ----------- | ------------ | --------------- | ------------------ | -------------- | ---------------- |
| IMP-0001  | 949558   | Japan Women 7s | Fiji Women 7s | Not Checked | Not Checked  | Not Checked     | Not Checked        | Yes            | Future candidate |

---

## 13. Version0.7 Import Completion Criteria

Version0.7 の real data import 作業は、以下を満たした場合に完了扱いとする。

* [ ] `docs/real-data-import-log.md` が作成されている
* [ ] 既存の 949558 Fiji 戦が baseline case として記録されている
* [ ] Dubai SVNS の追加対象試合が記録されている
* [ ] 追加した real data の match ID が記録されている
* [ ] source が記録されている
* [ ] source URL が記録されている
* [ ] sample data の削除有無が記録されている
* [ ] StatsAnalysis の確認結果が記録されている
* [ ] StatsTrends の確認結果が記録されている
* [ ] Match Search の確認結果が記録されている
* [ ] Video Library 連携候補が記録されている
* [ ] 問題がある場合は Issue Log に記録されている

---

## 14. 備考

このログは、real data が増えるほど重要になる。

`matches.json` の中身だけを見ても、いつ・なぜ・どの sample data を削除したのかは分かりにくい。

そのため、Version0.7 以降では、real data を追加したら必ずこのログも更新する。

このログは、将来的に以下の設計資料にもなる。

* CSV import 設計
* データ管理画面設計
* Match Search 強化
* Video Library 連携
* Data Coverage Dashboard
* Supabase 等の外部DB移行
