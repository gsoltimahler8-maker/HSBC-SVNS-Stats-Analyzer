# SVNS Stats Analyzer

# Version1.1 Roadmap — Architecture, Handover, Analytics and Official-Data Readiness

Version: v1.1  
Status: Planned  
Revision: World Rugby / RugbyPass handover and analytics information architecture  
Created: 2026-07-26  
Updated: 2026-07-27  
Previous release: v1.0 Completed

---

## 1. Version1.1の定義

Version1.1は、Version1.0で完成した初期MVPを維持しながら、World Rugby、RugbyPass、World Rugbyが指定するデータ提供者・デジタル運用者・開発委託先、または同等の組織が、次のいずれを選んでも扱いやすい状態へ整える工程とする。

RugbyPassが実際にどのデータ権利・システム運用・技術判断を担うかは現時点では確定していない。したがって、RugbyPassへの移管を前提とはせず、World Rugbyから案内され得るデータ・デジタル・実装側の候補として扱う。

1. 現在のコードを限定pilotとして利用する
2. 公式データへ接続して継続開発する
3. 別の技術基盤へ内部再実装する
4. 開発委託、利用許諾、運用、譲渡を協議する

目標は、World Rugbyの内部環境を推測して先回り実装することではない。

目標は、アプリの仕様、データ契約、分析ロジック、設計判断、テスト、運用条件を明確にし、評価・移植・再実装・引継ぎを容易にすることである。

---

## 2. 優先順位

Version1.1の優先順位は次のとおり。

```text
1. World Rugby問い合わせ準備
2. Architecture・Handover文書
3. Secure Development基盤
4. Data Provider／Adapter分離
5. Schema・Data Dictionary
6. Test・再現可能build
7. 多言語化基盤
8. 分析・検索改善
9. 回答に応じた公式データ接続
10. Version1.1 validation・完了報告
```

フランス語・スペイン語の追加は維持するが、Architecture、Security、Data Contract、Testより後に置く。

---

## 3. Version1.1の主要目標

### 3.1 World Rugbyへの照会

完成したVersion1.0を提示し、次を確認する。

- HSBC SVNSの詳細な公式試合スタッツの有無
- 公式API、data feed、downloadable datasetの有無
- 指標定義またはdata dictionaryの有無
- 限定的・非商用の公開分析に適用される条件
- データ権利者および適切な担当部署
- 将来の技術的協議が可能か

初回問い合わせでは、pilot、提携、売却、移管を主要求にしない。

相手が具体的な関心を示した場合に限り、後続のやり取りで次を検討する。

- 有償pilot
- 開発委託
- 利用ライセンス
- 保守・運用契約
- World Rugby側でのhosting
- コードまたは関連資産の譲渡

### 3.2 World Rugby・RugbyPass・指定委託先への引継ぎ容易性

World Rugby、RugbyPass、または指定された開発・運用委託先が、React、GitHub Pages、現在のデータ形式を採用しない場合でも、次を再利用できる状態を目指す。

- product scopeと利用者像
- 画面仕様と画面遷移
- Stats Analysis／Stats Trendsの情報設計
- データスキーマとprovenance
- 指標定義と派生指標計算
- 集約・filter・comparison rule
- validation rule
- provider contractとAPI接続点
- 翻訳辞書とrugby terminology
- test caseとacceptance criteria
- 設計判断、既知の制約、未確定事項
- build、deploy、release、rollback手順

コードの全面採用だけを成功条件としない。別技術基盤への再実装、限定pilot、委託開発、ライセンス、保守運用、商業条件付き譲渡のいずれにも転用できる設計資産を作る。

### 3.3 セキュアな開発工程

現状は認証、決済、個人情報、書込みAPIを持たない静的PWAである。

したがってVersion1.1では、存在しない内部要件を推測して認証や本番DBを作るのではなく、現在の攻撃面に対応する。

主対象：

- dependency vulnerability
- supply-chain risk
- GitHub Actions改変
- secret誤登録
- 公開データの完全性
- Service Worker更新
- 外部リンク・YouTube埋め込み
- repository権限

### 3.4 データ接続の交換可能性

画面が`matches.json`や特定提供元へ直接依存しない構造へ移行する。

将来的に次を同一UIへ接続できる設計を目指す。

```text
静的JSON
手入力データ
World Rugby API
許諾済みdata feed
CSV等の内部import
内部database API
```

公開CSV／Excel／PDF出力を再導入することとは別である。


### 3.5 組織中立の分析プロダクト構造

World RugbyまたはRugbyPass側が画面構成、hosting、認証、データ基盤を変更しても、分析ロジックを再利用できるよう、次を分離する。

```text
Canonical Data Model
Derived Metrics Engine
Aggregation Service
Filter / Comparison Rules
Visualization Configuration
Presentation Components
Navigation / Drill-down
```

特に、Stats AnalysisとStats Trendsは同一の派生指標・集約処理を共有し、表示目的だけを分ける。

```text
Stats Analysis
= 選択範囲の概要・比較・指標間関係

Stats Trends
= Match → Tournament → Seasonの時系列変化
```

第三者データの権利と、自作したコード、UI、仕様、データモデル、分析ロジック、文書、ブランド資産は分けて管理する。

---
---

## 4. Version1.1で行わないこと

World Rugbyの要件が判明する前に、次を本実装しない。

- World Rugby SSO
- ユーザー認証
- role-based access control
- 本番database
- API Gateway
- cloud infrastructure
- enterprise audit log
- 公開管理画面
- 課金
- 個人情報管理
- 自動scraping
- 大規模な第三者データ複製
- CSV、Excel、PDF公開出力
- World Rugby公認を示す表示
- 無償の全面譲渡
- 権利関係が不明な状態での商業運用

これらは、相手の技術・契約・セキュリティ要件が確認できた後に判断する。

---

# 5. 実施工程

## v1.1-01 Version1.0基準状態・課題台帳

### 目的

Version1.0の公開状態を変更前の基準点として固定する。

### 作業

- 公開URL
- repository URL
- 対象commit
- Version1.0 completion report
- 既知のUI課題
- 重大不具合
- 改善要望
- v1.0.x hotfixとv1.1変更の境界
- branch・commit運用

### 完了条件

- Version1.0の基準状態が文書化されている
- 重大不具合と機能改善が分離されている
- Version1.1の作業対象が明確

---

## v1.1-02 World Rugby問い合わせ資料

### 目的

完成済みproof of conceptを伴う正式なデータ照会を準備する。

### 説明事項

- RugbypassおよびHSBC SVNSの一般公開スタッツは、分析用途には項目数・粒度が限定的
- 初期prototypeでは、便宜的・暫定的にRugby Australiaの公開スタッツを少数試合分だけ手入力
- source attributionを明記
- 自動scrapingなし
- 公開data exportなし
- 本来は適切なWorld Rugby公式データを使用したい

### 主質問

1. 公開画面より詳細なHSBC SVNS match statisticsを保持しているか
2. 公式API、data feed、download手段はあるか
3. data dictionaryまたはmetric definitionはあるか
4. 限定的・非商用の公開分析に適用される条件は何か
5. 適切なdata、digital、Game Systems、Information Management担当へ取り次げるか

### 添付・提示情報

- 公開デモURL
- About
- Data and Video Sources
- Terms / Privacy / Disclaimer
- GitHub repository
- 主要画面の短い説明
- データ構造の概要

### 完了条件

- 英文問い合わせが確定
- URLが確認済み
- pilot、売却、移管を初回の主要求にしていない

---

## v1.1-03 問い合わせ送信・対応記録

### 目的

送信、返信、解釈、次の対応を記録する。

### 時間軸

```text
送信後0～14日：通常待機
15～21日：必要に応じて一度だけfollow-up
22日以降：無回答scenarioへ移行可能
```

### 記録項目

- 送信日
- 送信先
- 使用した本文
- 自動返信
- 人的返信
- 原文
- 確認できた事実
- こちらの解釈
- 次に必要な対応

無回答は許諾と扱わない。

### 完了条件

- 送信記録がある
- 返信または無回答の状態が明確
- 後続Decision Gateで利用できる

---

## v1.1-04 Architecture・Handover文書

### 目的

現在のコードを使う場合にも、別基盤へ再実装する場合にも利用できる設計資産を作る。

### 作成文書

```text
System Context
Container / Component overview
画面遷移図
データフロー
データライフサイクル
主要directory構成
build・deploy flow
PWA / Service Worker構成
外部依存関係
第三者サービス
既知の制約
移植時の注意
```

### Architecture Decision Record

主要判断をADRとして残す。

候補：

- GitHub Pagesを採用した理由
- React / Viteを採用した理由
- 静的JSONを初期データ源とした理由
- PWA化した理由
- public exportを撤回した理由
- YouTube埋め込み方針
- REAL / SAMPLEの区別
- 多言語辞書構造
- Stats AnalysisをOverview／Comparison／Relationshipsへ分ける理由
- Stats TrendsをMatch／Tournament／Season集約へ分ける理由
- 派生指標を表示componentから分離する理由
- 小標本では因果推論を行わない方針
- 欠損値を0として扱わない方針

### Analytics Architecture

次の責務を独立したmoduleまたは明確なinterfaceとして整理する。

```text
DerivedMetricsEngine
AggregationService
FilterService
ComparisonService
RelationshipDatasetBuilder
TrendDatasetBuilder
CoverageService
ProvenanceService
VisualizationConfig
```

World Rugby、RugbyPass、または指定委託先が別UIへ作り替える場合でも、同じ計算結果とvalidationを再利用できる状態にする。

### Handover項目

- local setup
- validate
- test
- build
- deploy
- release
- rollback
- Service Worker更新
- data追加
- video追加
- translation追加
- incident対応

### 完了条件

- コードを読まなくても全体構造を説明できる
- 別技術スタックへ再実装するための入力資料になる
- 設計判断の理由が追跡できる

---

## v1.1-05 Secure Development基盤

### 目的

現在の公開静的PWAに適したsecurity controlと証跡を整える。

### repository・CI

- Dependabot alerts
- Dependabot security updates
- dependency review
- code scanning
- secret scanning
- lockfile固定
- GitHub Actions permission最小化
- third-party Actionのcommit SHA固定
- branch protectionの検討
- release前security check

### application

- Content Security Policyの検討・導入
- external linkの`rel`確認
- iframe originとtitle
- Service Worker cache更新方針
- user-controlled HTMLを描画しない
- error messageにsecretを含めない
- dependency license確認

### 文書

- `SECURITY.md`
- vulnerability reporting
- supported version
- incident response outline
- dependency / license inventory
- threat model

### 基準

OWASP ASVS、NIST SSDF、Secure by Designを参照するが、現在の機能に適用可能な項目だけを採用する。

### 完了条件

- repositoryでsecurity checkが自動化されている
- 脆弱性報告経路がある
- 現行PWAのthreat modelが文書化されている
- security controlの未対応理由が説明できる

---

## v1.1-06 Data Provider／Adapter分離

### 目的

UI・分析ロジックを特定のデータ取得方法から分離する。

### 構造案

```text
Data Source
  ↓
Provider / Adapter
  ↓
Normalization
  ↓
Validation
  ↓
Canonical Match Model
  ↓
Derived Metrics / Aggregation / Coverage
  ↓
Analysis / Search / Trends / Video UI
```

### Provider候補

- StaticJsonProvider
- ManualDataProvider
- WorldRugbyApiProvider（interfaceのみ）
- InternalApiProvider（interfaceのみ）

### 要件

- UI componentがsource固有fieldを直接参照しない
- providerがcanonical modelへ変換
- provider errorを統一形式で返す
- loading / empty / partial / unavailableを区別
- source metadataとprovenanceを保持
- 派生指標計算はprovider固有fieldを参照しない
- Stats AnalysisとStats Trendsが同じcanonical metricを使用する
- interfaceのmockを用意

### 完了条件

- 現行JSON providerで既存画面が動く
- 別providerの追加が画面変更を最小限にできる
- World Rugby API仕様が判明した際に接続点が明確

---

## v1.1-07 Schema・Data Dictionary

### 目的

指標名の一致を、定義の一致と誤認しないデータ契約を作る。

### Schema

- canonical match schema
- video schema
- source metadata
- provenance
- acquiredAt
- sourceVersion
- coverageLevel
- nullability
- enum
- schema version

### Data Dictionary

各metricについて次を記録する。

```text
key
display name
definition
unit
raw / calculated
team / player
null allowed
valid range
source-specific difference
usable chart
comparison caveat
validation rule
```

### 優先raw metric

```text
pointsFor
pointsAgainst
tries
conversions
carries
passes
offloads
cleanBreaks
defendersBeaten
metres
tackles
missedTackles
turnoversWon
turnoversConceded
rucksWon
rucksLost
possession
territory
penaltiesConceded
yellowCards
redCards
```

### 現行データから算出する優先derived metric

```text
pointsDifferential
= pointsFor - pointsAgainst

metresPerCarry
= metres / carries

defendersBeatenPerCarry
= defendersBeaten / carries

cleanBreaksPer100Carries
= cleanBreaks / carries * 100

triesPer100Metres
= tries / metres * 100

pointsPer100Metres
= pointsFor / metres * 100

metresPerTry
= metres / tries

tackleSuccess
= tackles / (tackles + missedTackles) * 100

ruckSuccess
= rucksWon / (rucksWon + rucksLost) * 100

turnoverDifferential
= turnoversWon - turnoversConceded

penaltiesPerMatch
= penaltiesConceded
```

### 派生指標の計算規則

- 必要なraw metricが欠損している場合は`null`
- 分母が0の場合は`null`
- 欠損値を0へ変換しない
- 単位をmetric definitionへ記録する
- 丸めは保存時ではなく表示時に行う
- sourceごとの定義差を保持する
- calculated metricであることをUIに表示できる
- 小標本で因果関係を断定しない

### 現段階でconversion rateとして扱わないもの

```text
tries / turnoversWon
triesConceded / penaltiesConceded
```

これらは同一ポゼッション内のイベント連鎖を確認できないため、Turnover-to-Try ConversionまたはPenalty-to-Try Concession Rateとは呼ばない。

必要な場合でも単なる試合単位ratioとして明示し、Version1.1の中心指標にはしない。

### 完了条件

- 未取得値を0として扱わない
- source差異が追跡できる
- schema versionがある
- providerとvalidationが同じ契約を使用する

---

## v1.1-08 Test・再現可能build

### 目的

作者の環境に依存せず、第三者が同じ結果を再現できる状態にする。

### 固定

- Node version
- package manager version
- lockfile
- build command
- base path
- environment variable一覧

### Test

- raw-to-derived metric calculation unit test
- division-by-zero / null propagation test
- aggregation level test（Match / Tournament / Season）
- win / loss comparison dataset test
- relationship dataset test
- normalization test
- provider contract test
- schema validation test
- translation key test
- component smoke test
- main navigation E2E
- Match Search E2E
- Video Library E2E
- PWA build check
- no-export regression test

### CI flow

```text
install
lint
validate data
validate translation
unit test
component test
E2E smoke
security check
build
deploy
```

### 完了条件

- clean cloneから文書どおりbuildできる
- 主要分析結果にtestがある
- provider差し替え時のregressionを検出できる
- third partyが同じ手順を実行できる

---

## v1.1-09 多言語化・分析情報設計・検索改善

### 優先順位

Architecture、Security、Provider、Schema、Data Dictionary、Testの基盤を整えた後に実装する。

### 9.1 多言語化基盤

- locale registry
- English fallback
- translation key validation
- `Intl.DateTimeFormat`
- `Intl.NumberFormat`
- `html lang`
- 将来の`dir=rtl`
- rugby terminology glossary

### Version1.1対象言語

```text
日本語
英語
フランス語
スペイン語
```

法的文書の翻訳は参考訳と正式版を区別する。

### 9.2 共通分析filter

Stats AnalysisとStats Trendsで、可能な範囲で同じfilter modelを使用する。

```text
Team
Gender
Season
Tournament
Opponent
Stage
Result
Data Type
```

各画面は、対象試合数、data coverage、source、definition versionを表示できるようにする。

### 9.3 Stats Analysis — Season and Tournament Analysis

#### 役割

最新または選択した1シーズンを既定範囲として、選択範囲の概要、カテゴリー比較、指標間の関連を分析する。

時間推移そのものを主役にせず、「選択範囲では何が異なっていたか」を扱う。

#### 分析モード

利用者には次の3モードとして表示する。

```text
Overview
Comparison
Relationships
```

当初の分析要素は次のように整理する。

```text
Season Overview        → Overview
Tournament Comparison  → Comparison / Tournament
Win-Loss Comparison    → Comparison / Result
Opponent Comparison    → Comparison / Opponent
Relationship Explorer  → Relationships
```

#### Overview

主な表示候補：

```text
Matches
Win Rate
Average Points Differential
Average Penalties Conceded
Average Turnover Differential
Average Metres per Carry
Average Tackle Success
Data Coverage
```

KPI cardから該当するComparisonまたはRelationshipsへ移動できる構造を検討する。

#### Comparison

比較単位を選択する。

```text
Tournament
Result
Opponent
```

その後、指標を1つ選択し、平均値、対象試合数、coverageを表示する。

主なmetric：

```text
Points Differential
Penalties Conceded
Turnover Differential
Metres per Carry
Defenders Beaten per Carry
Clean Breaks per 100 Carries
Tries per 100 Metres
Points per 100 Metres
Metres per Try
Tackle Success
Ruck Success
```

異なる単位のmetricを無理に一つの軸へ重ねない。

#### Relationships

X軸・Y軸を選択するscatter plotとする。

既定表示：

```text
X = Penalties Conceded
Y = Points Differential
```

各点は1試合とし、次をtooltipまたはdrill-downで表示する。

```text
Opponent
Tournament
Date
Score
Win / Loss
X metric value
Y metric value
Coverage
Source
```

表示するのは対象試合内のassociationであり、因果関係ではない。

試合数が少ない場合は、sample sizeとdescriptive-only noticeを表示する。

### 9.4 Stats Trends — Long-term Performance Trends

#### 役割

同じmetricが、試合、大会、シーズンの順にどのように変化したかを追跡する。

#### Aggregation

```text
Match
Tournament
Season
```

- Match：各試合の値
- Tournament：大会内の1試合平均または率
- Season：シーズン内の1試合平均、率、効率、differential

大会数・試合数が異なるため、長期比較では原則として総数を用いない。

#### 既定表示

複数シーズンが十分に存在しない間：

```text
Aggregation = Match
Season = Latest
Metric = Points Differential
```

複数シーズンが蓄積した後は、Season表示を長期分析の中心にできる。

#### 主なmetric

```text
Points Differential
Win Rate
Points per Match
Tries per Match
Penalties per Match
Turnover Differential
Metres per Carry
Defenders Beaten per Carry
Clean Breaks per 100 Carries
Tries per 100 Metres
Points per 100 Metres
Tackle Success
Ruck Success
```

#### 対戦相手と大会形式への対応

- opponent filter
- same-opponent comparison
- tournament format note
- season format note
- source / definition change warning
- mixed-source comparison warning

#### Drill-down

```text
Season
  ↓ Stats Analysisで該当シーズンを開く
Tournament
  ↓ 該当大会の試合一覧
Match
  ↓ Match Details
  ↓ Video
  ↓ Source
```

### 9.5 AnalysisとTrendsの重複防止

```text
Stats Analysis
= 平均比較、勝敗比較、大会比較、相手別比較、指標間関係

Stats Trends
= 試合順、大会順、シーズン順、継続変化、同一相手の経年変化
```

同じ大会平均を使用する場合でも、Analysisではカテゴリーとして並列比較し、Trendsでは競技順・時間順に表示する。

### 9.6 Penaltiesの扱い

現在のデータでは、次を優先する。

```text
Penalties Conceded vs Points Differential
Average Penalties in Wins vs Losses
Penalties per Match over Time
```

勝率との関係は補助表示とし、少数試合では得失点差を主なoutcomeとする。

「ペナルティが敗戦を引き起こした」とは表示せず、対象試合内の関連として扱う。

### 9.7 Data Coverage・Definition・Provenance

各分析結果から次を確認できるようにする。

```text
Available matches / selected matches
Source provider
Definition version
Raw or calculated
Formula
Missing-data rule
Comparison caveat
```

World Rugby、RugbyPass、または指定data providerへ接続した場合に、source変更によるseries breakを検出・表示できる構造とする。

### 9.8 その他の改善

- Match Search date sort
- source表示
- missing metric表示
- videoなしfallback
- smartphoneの軽微な調整
- chart pointからMatch Details / Videoへの移動
- analysis modeをURLまたはstateで再現可能にする

### 完了条件

- 四言語で主要画面が使用可能
- translation key不足なし
- Stats AnalysisがOverview／Comparison／Relationshipsで動作
- Stats TrendsがMatch／Tournament／Seasonで動作
- 両画面が同じ派生指標計算を共有
- 欠損値を0として描画しない
- coverage、definition、sourceを追跡できる
- 分析結果から試合詳細・映像・sourceへdrill-downできる
- Version1.0の主要導線を壊していない

---

## v1.1-10 Decision Gate・条件付き接続・完了確認

### Scenario A：World Rugbyが前向き

- 技術担当との要件確認
- data sampleまたはAPI specification確認
- NDA・利用条件確認
- read-only限定接続
- 小規模technical validation
- 相手が具体的関心を示した段階で商業条件を検討

商業条件候補：

```text
paid pilot
commissioned development
non-exclusive license
maintenance and operation
hosting
exclusive transfer
```

### Scenario B：RugbyPass・別権利者・指定委託先へ案内

- World Rugbyからの案内先と担当範囲を記録
- RugbyPass、data provider、digital partner、開発委託先のどこへ案内されたかを区別
- データ利用許諾とコード・UI・運用協議を分離
- 利用範囲を限定して照会
- 現行公開版と将来のデータ拡張を分離
- 回答前の大量登録を行わない
- 相手の技術標準へ合わせる場合も、canonical schemaとanalysis contractを維持する

### Scenario C：無回答・利用不可

- 無回答を許諾と扱わない
- 公開継続、縮小、Unpublish、private化を判断
- 非公開・個人利用への移行手順を準備
- 大量公開・自動取得を行わない
- Architecture、Test、Data Dictionaryは個人ツールとして維持

### 自動確認

- security check
- provider contract
- schema validation
- translation validation
- match / video validation
- unit / component / E2E
- PWA build
- public exportがない
- unofficial notice
- required documents
- asset path

### 手動確認

- four-language UI
- PC
- Android
- iPhone / iPad
- PWA update
- offline redisplay
- Console error
- external link
- long translated labels
- provider error state

### 完了条件

- buildとdeployがGreen
- manual checklistがPASS
- World Rugbyの回答状態が記録されている
- 公開・非公開の判断が明記されている
- 既知の制約が次版へ引き継がれている

---

## 6. 推奨時間軸

World Rugbyの返答時期は制御できないため、固定日ではなく経過期間で管理する。

```text
Week 0      v1.1-01 基準状態
Week 0～1   v1.1-02 問い合わせ資料
Week 1      v1.1-03 送信
Week 1～3   v1.1-04 Architecture文書
Week 2～4   v1.1-05 Secure Development
Week 3～6   v1.1-06 Provider／Adapter
Week 4～7   v1.1-07 Schema／Data Dictionary
Week 5～8   v1.1-08 Test／Build
Week 7～11  v1.1-09 i18n／分析情報設計／検索改善
返信後       v1.1-10 Decision Gate／条件付き接続
```

World Rugbyの返信が早い場合でも、内部要件が判明するまでは認証、DB、SSO、クラウド基盤を先行実装しない。

---

## 7. Must / Should / Could / Not now

### Must

- World Rugby問い合わせ
- World Rugby／RugbyPass／指定委託先へ引き継げる設計資産
- Architecture・Handover文書
- Secure Development基盤
- Provider／Adapter分離
- Schema・Data Dictionary
- Test・再現可能build
- Decision Gate
- Version1.1完了報告

### Should

- フランス語
- スペイン語
- Stats Analysis：Overview／Comparison／Relationships
- Stats Trends：Match／Tournament／Season
- scatter plot軸切替
- penaltiesと得失点差の関連表示
- coverage／definition／provenance表示
- Match Search sort
- provider error state

### Could

- Portuguese locale準備
- RTL基盤
- OpenAPI形式のprovider contract
- 男子データの少数追加
- Storybook等のcomponent catalogue

### Not now

- SSO
- authentication
- production database
- enterprise cloud
- admin console
- automatic ingestion
- public data export
- payment
- complete transfer without commercial agreement

---

## 8. Version1.1完了時の到達点

```text
World Rugbyへの照会が完了している
回答または無回答の状態が記録されている
システム構造と設計判断が文書化されている
別技術基盤への再実装に必要な仕様が整理されている
Provider／Adapterでデータ接続が分離されている
Schema、Data Dictionary、Derived Metrics Engineが整備されている
Stats AnalysisがOverview／Comparison／Relationshipsで整理されている
Stats TrendsがMatch／Tournament／Seasonで整理されている
両画面が同じ分析・集約処理を共有している
Security checkとTestが自動化されている
第三者がclean cloneからbuildできる
World Rugby、RugbyPass、指定委託先が再実装・移植に使える文書がある
日本語・英語・フランス語・スペイン語の基盤がある
回答に応じた公開・非公開・公式接続方針が確定している
```

World Rugbyとの契約、有償pilot、正式運用、売却の成立はVersion1.1の必須完了条件ではない。

相手が関心を示した場合は、技術工程と商業交渉を分けて進める。
