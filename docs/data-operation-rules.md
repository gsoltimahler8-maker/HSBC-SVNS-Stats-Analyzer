# SVNS Stats Analyzer

# Data Operation Rules

Version: v0.6-09
Scope: Real Data Import Preparation
Status: Active

---

## 1. この文書の目的

この文書は、`matches.json` に試合データを追加・更新・削除する際の運用ルールを定める。

特に、以下を防ぐことを目的とする。

* 同一試合の二重登録
* sample data と real data の混在
* Rugby.com.au Match Stats と RugbyPass 等の異なるデータソースの混同
* 旧データを残したまま新データを追加することによる分析結果の歪み
* 将来のデータ追加時に、判断基準が担当者の記憶に依存すること

---

## 2. 基本方針

SVNS Stats Analyzer では、分析精度と再現性を優先する。

そのため、`matches.json` に登録するデータは、以下の原則に従う。

1. real data を優先する。
2. Rugby.com.au Match Stats を主データソースとする。
3. sample data は real data が存在しない場合の暫定データとして扱う。
4. 同一試合について real data と sample data を併存させない。
5. 同一試合について同じ用途のデータを二重登録しない。
6. データソースが異なる場合は、同じ試合であっても、用途と項目を明確に分ける。
7. 追加・更新・削除の判断は、必ずこの文書のルールに基づいて行う。

---

## 3. データ種別の定義

### 3.1 real data

real data とは、実際の試合に基づき、外部の公開データソースから取得・転記したデータを指す。

現時点での主な real data は以下。

* Rugby.com.au Match Stats
* RugbyPass live stats
* World Rugby 公式情報
* SVNS 公式情報

ただし、`matches.json` の試合別スタッツとしては、原則として Rugby.com.au Match Stats を主データソースとする。

---

### 3.2 sample data

sample data とは、アプリ開発・UI確認・分析表示確認のために作成した仮データを指す。

sample data は、以下の用途に限って使用する。

* UI表示確認
* フィルター挙動確認
* グラフ表示確認
* 分析ロジックの暫定確認

sample data は、実際の試合分析には使用しない。

同一試合の real data が追加された場合、対応する sample data は削除する。

---

## 4. 同一試合の判定基準

同一試合かどうかは、原則として以下の情報を組み合わせて判定する。

### 4.1 最優先キー

外部データソースに公式または準公式の match ID がある場合、その ID を最優先で使用する。

例：

* Rugby.com.au match ID
* RugbyPass game ID
* World Rugby / SVNS の試合識別子

Rugby.com.au Match Stats の URL に含まれる試合番号が確認できる場合は、同一試合判定の最重要情報とする。

例：

* `949558`
* Japan Women 7s vs Fiji Women 7s
* 2025-26 Dubai SVNS
* Rugby.com.au Match Stats

---

### 4.2 match ID がない場合の複合キー

match ID が確認できない場合、以下の情報を組み合わせて同一試合を判定する。

* season
* gender
* tournament
* stage / round
* match date
* team
* opponent
* source
* source URL

このうち、少なくとも以下が一致する場合は、同一試合の可能性が高い。

* season
* gender
* tournament
* team
* opponent
* stage / round

match date または source URL も一致する場合は、同一試合として扱う。

---

## 5. 重複データの扱い

### 5.1 real data と sample data が重複する場合

同一試合について real data と sample data が存在する場合は、real data を残し、sample data は削除する。

sample data を残してはいけない。

理由は、分析画面・トレンド画面・対戦相手別平均などで、同じ試合が二重に集計される危険があるためである。

---

### 5.2 real data 同士が重複する場合

同一試合について同じデータソース由来の real data が複数ある場合は、原則として1件に統合する。

同じ Rugby.com.au Match Stats 由来のデータを、複数レコードとして残してはいけない。

修正・追記が必要な場合は、既存レコードを更新する。

---

### 5.3 異なるデータソースが同一試合を扱う場合

Rugby.com.au Match Stats と RugbyPass など、異なるデータソースが同一試合を扱う場合は、用途を分ける。

原則は以下。

* Rugby.com.au Match Stats

  * 試合別チームスタッツの主データソース
  * StatsAnalysis / StatsTrends の基礎データ

* RugbyPass

  * 補助データソース
  * 個人ランキング、選手別情報、Rugby.com.au にない補足情報の確認用

異なるソースの数値を、同じ項目として無条件に混ぜてはいけない。

ソース間で数値が異なる場合、どちらを使用したかを明記する。

---

## 6. Rugby.com.au Match Stats の優先順位

`matches.json` に登録する試合別チームスタッツでは、Rugby.com.au Match Stats を最優先とする。

理由は以下。

* 試合別のチームスタッツが比較的まとまっている
* SVNS Stats Analyzer の既存設計が Rugby.com.au Match Stats を主軸にしている
* StatsAnalysis / StatsTrends で使う項目との対応が取りやすい
* 将来の real data import に向けて、基準ソースを固定した方が管理しやすい

Rugby.com.au Match Stats が確認できる試合については、RugbyPass 等の別ソースで同じチームスタッツを上書きしない。

---

## 7. 既存データを置き換える場合の手順

同一試合の real data を追加する場合は、以下の順で作業する。

1. `matches.json` 全体で、同一試合に該当する既存レコードの有無を確認する。
2. sample data が存在する場合は、その sample data を削除する。
3. real data のレコードを1件だけ登録する。
4. `source` または `dataSource` に Rugby.com.au Match Stats 由来であることを記録する。
5. 可能であれば source URL または match ID を記録する。
6. アプリ上で、対象条件に該当する試合が1件だけ表示されることを確認する。
7. StatsAnalysis / StatsTrends の表示に、同一試合が二重集計されていないことを確認する。

---

## 8. 削除してよいデータ

以下のデータは削除してよい。

* real data に置き換え済みの sample data
* 同一試合を重複登録している古いレコード
* 出典が不明で、かつ real data と競合する仮データ
* 開発初期の表示確認だけを目的にした不要データ
* 現在の season / tournament / gender / team 条件と整合しないテストデータ

---

## 9. 残すべきデータ

以下のデータは、原則として残す。

* Rugby.com.au Match Stats 由来の real data
* source URL または match ID が確認できる real data
* まだ real data が存在しない試合の sample data
* UI・分析ロジック確認に必要な最低限の sample data
* 将来の比較分析に使う予定が明確な real data

ただし、sample data は実データではないため、real data が追加された時点で削除対象になる。

---

## 10. matches.json 追加時の確認項目

`matches.json` に新しい試合データを追加する前に、以下を確認する。

* season は正しいか
* gender は正しいか
* tournament は正しいか
* team は正しいか
* opponent は正しいか
* stage / round は正しいか
* source は明記されているか
* source URL または match ID は記録されているか
* sample data ではなく real data として扱えるか
* 同一試合の既存 sample data が残っていないか
* 同一試合の既存 real data が二重登録されていないか
* アプリ上で同一試合が1件として表示されるか

---

## 11. 現在の適用済み事例

### 11.1 949558 Japan Women 7s vs Fiji Women 7s

以下の試合について、real data への置き換えを実施済み。

* match ID: 949558
* season: 2025-26
* gender: Women
* team: Japan Women 7s
* opponent: Fiji Women 7s
* tournament: Dubai SVNS
* source: Rugby.com.au Match Stats

実施内容：

* Rugby.com.au Match Stats 由来の real data を `matches.json` に追加
* 古い sample Fiji 戦データを削除
* `loadMatches.js` 経由で読み込み
* StatsAnalysis / StatsTrends が `loadMatches.js` を参照
* 2025-26 / Women / Japan / Dubai SVNS 条件で Fiji 戦が Rugby.com.au Match Stats として表示されることを確認

この事例を、今後の real data import の基準例とする。

---

## 12. 禁止事項

以下は禁止する。

* 同一試合の sample data と real data を併存させること
* 同一 Rugby.com.au Match Stats 由来の試合を複数レコードとして登録すること
* Rugby.com.au と RugbyPass の数値を、出典を分けずに同一項目として混在させること
* 出典不明のデータを real data として扱うこと
* season / gender / tournament の異なるデータを同じ分析条件に混ぜること
* 古い sample data を残したまま real data を追加すること
* URL や match ID を確認できるのに記録しないこと

---

## 13. 今後の運用方針

Version0.6 以降、real data import を進める際は、1試合ずつ以下の単位で処理する。

1. 対象試合を決める。
2. データソースを確認する。
3. 同一試合の既存データを確認する。
4. sample data があれば削除する。
5. real data を1件として登録する。
6. アプリ上で表示確認を行う。
7. 分析・トレンド画面で二重集計がないことを確認する。

大量の試合データを一括で追加する場合でも、このルールは維持する。

---

## 14. 完了条件

この運用ルールが適用された状態で、以下を満たせば v0.6-09 は完了とする。

* `docs/data-operation-rules.md` が作成されている
* real data と sample data の優先順位が明文化されている
* 同一試合の判定基準が明文化されている
* Rugby.com.au Match Stats の優先順位が明文化されている
* 既存 sample data を削除する基準が明文化されている
* 949558 Japan Women 7s vs Fiji Women 7s の処理が基準例として記録されている
