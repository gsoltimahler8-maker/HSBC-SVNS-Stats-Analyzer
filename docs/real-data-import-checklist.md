# SVNS Stats Analyzer

# Real Data Import Checklist

Version: v0.6-10
Scope: Real Data Import Preparation
Status: Active

---

## 1. このチェックリストの目的

このチェックリストは、`matches.json` に real data を追加・更新する際に、作業漏れ・重複登録・sample data の残存を防ぐために使用する。

詳細な運用ルールは、以下を参照する。

* `docs/data-operation-rules.md`

このチェックリストは、実作業時に毎回確認するための簡易版である。

---

## 2. 作業前チェック

real data を追加する前に、以下を確認する。

* [ ] 対象試合が決まっている
* [ ] season が確認済み
* [ ] gender が確認済み
* [ ] tournament が確認済み
* [ ] team が確認済み
* [ ] opponent が確認済み
* [ ] stage / round が確認済み
* [ ] match date が確認済み
* [ ] 主データソースが確認済み
* [ ] source URL が確認済み
* [ ] match ID が確認できる場合は記録対象として控えている

---

## 3. データソース確認

原則として、試合別チームスタッツは Rugby.com.au Match Stats を主データソースとする。

* [ ] Rugby.com.au Match Stats の有無を確認した
* [ ] Rugby.com.au Match Stats が存在する場合、それを主データソースとする
* [ ] RugbyPass 等の別ソースを使う場合、補助データとして扱う理由が明確である
* [ ] 複数ソースの数値を同一項目として混在させていない
* [ ] source 名を `matches.json` に記録する準備ができている
* [ ] source URL または match ID を記録する準備ができている

---

## 4. 重複確認

`matches.json` に追加する前に、同一試合の既存データがないか確認する。

確認する項目：

* [ ] match ID
* [ ] season
* [ ] gender
* [ ] tournament
* [ ] team
* [ ] opponent
* [ ] stage / round
* [ ] match date
* [ ] source
* [ ] source URL

以下に該当する場合は、同一試合の可能性が高い。

* [ ] season が一致している
* [ ] gender が一致している
* [ ] tournament が一致している
* [ ] team が一致している
* [ ] opponent が一致している
* [ ] stage / round が一致している
* [ ] match date または source URL が一致している

---

## 5. sample data 確認

同一試合の sample data が存在する場合は、real data 追加前または追加時に削除する。

* [ ] 同一試合の sample data が存在するか確認した
* [ ] sample data が存在する場合、削除対象として特定した
* [ ] real data と sample data を併存させていない
* [ ] 古い表示確認用データを real data として扱っていない

---

## 6. real data 追加・更新チェック

`matches.json` に real data を追加または更新する際に、以下を確認する。

* [ ] 1試合につき1レコードとして登録している
* [ ] 同一 Rugby.com.au Match Stats 由来のレコードを複数登録していない
* [ ] season が正しい
* [ ] gender が正しい
* [ ] tournament が正しい
* [ ] team が正しい
* [ ] opponent が正しい
* [ ] stage / round が正しい
* [ ] match date が正しい
* [ ] source が明記されている
* [ ] source URL または match ID が記録されている
* [ ] sample data 由来の値が混入していない
* [ ] 数値項目の転記ミスがない
* [ ] team 側と opponent 側の値を取り違えていない

---

## 7. 追加後の表示確認

データ追加後、アプリ上で以下を確認する。

* [ ] アプリが正常に起動する
* [ ] `loadMatches.js` 経由で `matches.json` が読み込まれている
* [ ] StatsAnalysis が正常に表示される
* [ ] StatsTrends が正常に表示される
* [ ] 対象 season でフィルターできる
* [ ] 対象 gender でフィルターできる
* [ ] 対象 team でフィルターできる
* [ ] 対象 tournament でフィルターできる
* [ ] 対象試合が表示される
* [ ] 対象試合が二重表示されていない
* [ ] source 表示が正しい
* [ ] Rugby.com.au Match Stats 由来であることが画面上またはデータ上で確認できる

---

## 8. 分析結果確認

StatsAnalysis / StatsTrends で、二重集計や異常値がないか確認する。

* [ ] Match Count が想定どおりである
* [ ] 対象試合が1件として集計されている
* [ ] 古い sample data が集計に残っていない
* [ ] 平均値が不自然に変化していない
* [ ] トレンドグラフに同一試合が重複して表示されていない
* [ ] 対戦相手別平均に同一試合が二重反映されていない
* [ ] source 表示と実際のデータ内容が一致している

---

## 9. 完了判定

以下をすべて満たした場合、その試合の real data import を完了とする。

* [ ] real data が `matches.json` に登録されている
* [ ] 同一試合の sample data が残っていない
* [ ] 同一試合の real data が二重登録されていない
* [ ] source が明記されている
* [ ] source URL または match ID が記録されている
* [ ] StatsAnalysis で正常に表示される
* [ ] StatsTrends で正常に表示される
* [ ] Match Count が想定どおりである
* [ ] 対象条件で対象試合が1件として確認できる

---

## 10. 現在の基準例

### 949558 Japan Women 7s vs Fiji Women 7s

この試合を、real data import の基準例とする。

確認済み内容：

* [x] match ID: 949558
* [x] season: 2025-26
* [x] gender: Women
* [x] team: Japan Women 7s
* [x] opponent: Fiji Women 7s
* [x] tournament: Dubai SVNS
* [x] source: Rugby.com.au Match Stats
* [x] real data を `matches.json` に追加済み
* [x] 古い sample Fiji 戦を削除済み
* [x] `loadMatches.js` 経由で読み込み済み
* [x] StatsAnalysis / StatsTrends が `loadMatches.js` を参照済み
* [x] 2025-26 / Women / Japan / Dubai SVNS 条件で表示確認済み
* [x] Rugby.com.au Match Stats として表示確認済み

今後の real data import では、この処理を基準にする。

---

## 11. 禁止事項チェック

作業完了前に、以下に該当していないことを確認する。

* [ ] real data と sample data を併存させていない
* [ ] 同一試合を複数レコードとして登録していない
* [ ] Rugby.com.au と RugbyPass の数値を無区別に混在させていない
* [ ] 出典不明データを real data として扱っていない
* [ ] season / gender / tournament が異なるデータを同一条件に混ぜていない
* [ ] 古い sample data を残したままにしていない
* [ ] source URL や match ID を確認できるのに記録していない

---

## 12. 作業メモ欄

real data import 作業時に、必要に応じて以下を記録する。

```text
対象試合:

season:

gender:

tournament:

stage / round:

match date:

team:

opponent:

source:

source URL:

match ID:

既存 sample data の有無:

削除した既存データ:

追加・更新した内容:

表示確認結果:

StatsAnalysis 確認結果:

StatsTrends 確認結果:

備考:
```
