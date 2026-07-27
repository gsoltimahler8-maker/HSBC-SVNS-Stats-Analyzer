# SVNS Stats Analyzer

# v1.1-01 Version1.0基準状態・課題台帳

Version: v1.1  
Step: v1.1-01  
Document status: Baseline documented / Repository identifiers pending  
Baseline version: v1.0  
Baseline completion date: 2026-07-26  
Created: 2026-07-27

---

## 1. 目的

Version1.1の変更を始める前に、Version1.0の完成状態を基準点として固定する。

この文書では次を分離して管理する。

```text
Version1.0の確定済み機能
既知の制約
受容済みの設計判断
重大不具合
Version1.0.x hotfix対象
Version1.1の改善対象
外部回答に依存する事項
```

Version1.0は初期MVPとして固定し、新機能、データ拡張、分析情報設計の変更は原則としてVersion1.1で扱う。

---

## 2. Repository identifiers

次の3項目は、GitHub上の実値をproject ownerが入力した時点で固定する。

```text
Public demo URL:
https://gsoltimahler8-maker.github.io/HSBC-SVNS-Stats-Analyzer/

GitHub repository URL:
https://github.com/gsoltimahler8-maker/HSBC-SVNS-Stats-Analyzer/

Version1.0 baseline commit SHA:
045f590c634fa5d556d4625ddf44ca1ca57b038f
```

補助記録：

```text
Latest successful GitHub Actions run URL:
[OPTIONAL]

Version1.0 tag:
[OPTIONAL — example: v1.0.0]
```

### 固定規則

- commit SHAはVersion1.0完了状態を指すfull SHAとする
- URL変更時も、当時のVersion1.0基準値は履歴として残す
- Version1.1開始後にVersion1.0基準commitを書き換えない
- tagを作成する場合はVersion1.0基準commitへ付与する

---

## 3. Version1.0完了状態

Version1.0は2026-07-26に完了した。

完了確認済み事項：

- Version1.0計画の実装完了
- GitHub Actions validation成功
- build成功
- GitHub Pages deploy成功
- 公開サイトの手動確認完了
- 重大な表示・遷移不具合なし
- CSV／Excel／PDF出力機能の撤回完了
- PWA基本機能の実装完了
- 非公式・非提携表示の整備
- 法的・運用文書の整備

基準文書：

```text
docs/version-1.0-plan.md
docs/version-1.0-completion-report.md
docs/version-1.0-10-pre-release-validation.md
docs/version-1.0-10-manual-checklist-completed.md
```

---

## 4. Version1.0機能基準

### 4.1 主要画面

```text
Home
Stats Analysis
Stats Trends
Match Search
Video Library
About
Data and Video Sources
Terms / Privacy / Disclaimer / Contact
```

### 4.2 データ・動画

Version1.0完了時の確認対象：

```text
Registered matches: 9
Registered videos: 7
```

実装済みの管理項目：

- `matches.json`
- `videos.json`
- REAL DATAとSAMPLE DATAの区別
- `dataCoverageLevel`
- 外部Match ID
- primary source URL
- 取得日時
- match validation
- video validation

### 4.3 検索・動画連携

- シーズンfilter
- 大会filter
- 対戦相手filter
- 勝敗filter
- Match ID検索
- 試合詳細
- スタッツ表
- 出典表示
- 関連動画表示
- Match SearchとVideo Libraryの相互移動
- YouTube埋め込み
- YouTubeで開く
- 動画利用不能時のfallback

### 4.4 PWA・UI

- Web App Manifest
- Service Worker
- app icon
- install
- standalone表示
- 基本的なoffline再表示
- update notification
- GitHub Pages subpath対応
- PC／スマートフォン対応
- 日本語／英語
- Error Boundary
- document title
- `lang`切替
- keyboard focus
- Skip to main content
- `aria-current`
- `aria-pressed`
- reduced motion対応

### 4.5 公開・運用情報

問い合わせ先：

```text
svnsstatsanalyzer@gmail.com
```

公開版は独立した非公式分析ツールであり、World Rugby、HSBC、Rugby Australia、YouTubeその他の権利者による公認・提携・提供を受けたものではない。

---

## 5. 受容済みの設計判断

次はVersion1.0の不具合ではなく、意図的なスコープ判断である。

| ID | 判断 | 状態 | Version1.1での扱い |
|---|---|---|---|
| DEC-001 | CSV／Excel／PDF公開出力を撤回 | Accepted | 利用条件・明示要望なしに再導入しない |
| DEC-002 | 認証・ユーザーアカウントなし | Accepted | 内部要件判明前に実装しない |
| DEC-003 | databaseなし | Accepted | 公式data flow判明前に実装しない |
| DEC-004 | 公開管理画面なし | Accepted | v1.1対象外 |
| DEC-005 | 自動scrapingなし | Accepted | 維持 |
| DEC-006 | 公式API接続なし | Accepted limitation | World Rugby回答後に判断 |
| DEC-007 | YouTube動画ファイルを保存・再配布しない | Accepted | 維持 |
| DEC-008 | 静的PWAを初期MVPとする | Accepted | 移植可能性を高める |
| DEC-009 | 日本語／英語をVersion1.0対象とする | Accepted | v1.1でフランス語・スペイン語を検討 |
| DEC-010 | スマートフォン細部より重大な操作阻害の解消を優先 | Accepted | 軽微な改善はv1.1 |

---

## 6. 重大不具合の基準

次はVersion1.0.x hotfixとして扱う。

```text
公開画面が黒画面または起動不能
buildまたはdeployの継続的失敗
試合・動画データの破損または誤消去
主要route・navigationの利用不能
Service Workerによる重大な旧版固定または起動障害
重大なsecurity incident
secretまたは非公開情報の公開
権利者からの削除・停止要請
利用者を誤認させる公式・公認表示
```

2026-07-27時点で、会話上確認されている未解決の重大不具合はない。

新たな重大不具合を確認した場合は、Version1.1機能開発よりhotfixを優先する。

---

## 7. Version1.1課題台帳

Severity：

```text
Critical = 公開停止、データ破損、security、権利上の緊急対応
High     = 引継ぎ、公式データ接続、分析正確性に重大な影響
Medium   = 主要な機能・品質改善
Low      = 軽微なUI・文書・運用改善
```

Status：

```text
Open
Planned
Blocked
Accepted
Completed
```

| ID | 分類 | 課題 | Severity | Status | 対応工程 |
|---|---|---|---|---|---|
| V11-001 | Documentation | Public URL、repository URL、baseline commitが未記録 | Medium | Open | v1.1-01 |
| V11-002 | External / Data rights | World Rugby公式データの保有・提供・利用条件が未確認 | High | Planned | v1.1-02 / 03 / 10 |
| V11-003 | External / Data rights | Rugby Australia公開スタッツの限定的公開利用条件が未確認 | High | Planned | v1.1-02 / 03 / 10 |
| V11-004 | External / Ownership | RugbyPass、data provider、digital partnerの担当範囲が未確認 | High | Planned | v1.1-02 / 03 / 10 |
| V11-005 | Data quality | 同名metricでもsourceごとに定義が異なる可能性 | High | Planned | v1.1-07 |
| V11-006 | Architecture | UIが特定の静的データ構造へ依存する部分を分離する必要 | High | Planned | v1.1-04 / 06 |
| V11-007 | Architecture | Derived Metrics、Aggregation、Coverageを共通serviceへ分離する必要 | High | Planned | v1.1-04 / 07 / 08 |
| V11-008 | Handover | World Rugby、RugbyPass、指定委託先向けの構成・移植文書が不足 | High | Planned | v1.1-04 |
| V11-009 | Security | threat model、SECURITY.md、dependency・secret・code scanningの正式整備が未完 | High | Planned | v1.1-05 |
| V11-010 | Testing | analysis calculation、provider contract、component、E2E testが不足 | High | Planned | v1.1-08 |
| V11-011 | Analytics | Stats AnalysisをOverview／Comparison／Relationshipsへ再構成する必要 | Medium | Planned | v1.1-09 |
| V11-012 | Analytics | Stats TrendsをMatch／Tournament／Seasonへ再構成する必要 | Medium | Planned | v1.1-09 |
| V11-013 | Analytics | 現行raw metricから算出する派生指標の正式実装が未完 | High | Planned | v1.1-07 / 08 / 09 |
| V11-014 | Analytics | Penalties Conceded × Points Differential等の関連分析が未実装 | Medium | Planned | v1.1-09 |
| V11-015 | Data UX | coverage、definition version、raw/calculated、provenance表示が不足 | High | Planned | v1.1-07 / 09 |
| V11-016 | Data scope | 登録試合9、動画7で複数シーズン分析には不足 | Medium | Blocked | v1.1-04 Decision Gate / 08 |
| V11-017 | Localization | フランス語・スペイン語未実装、翻訳key validation未整備 | Medium | Planned | v1.1-09 |
| V11-018 | UI | スマートフォン細部配置に改善余地 | Low | Planned | v1.1-09 |
| V11-019 | Operations | release、rollback、incident、handover手順の統合文書が不足 | High | Planned | v1.1-04 / 05 |
| V11-020 | Commercial boundary | 自作資産と第三者データ・外部サービスの権利境界をhandover資料で明確化する必要 | High | Planned | v1.1-04 / 10 |

---

## 8. Version1.0.xとVersion1.1の境界

### Version1.0.x

```text
起動不能
重大route障害
build / deploy障害
data corruption
security incident
rights-holder emergency request
重大なPWA更新障害
誤認を生む公式表示
```

### Version1.1

```text
Architecture・Handover文書
Secure Development基盤
Provider／Adapter分離
Schema・Data Dictionary
Derived Metrics Engine
Test強化
Stats Analysis再構成
Stats Trends再構成
フランス語・スペイン語
分析・検索改善
World Rugby回答に応じた公式data接続
限定的なデータ拡張
```

### Version2.0以降または内部要件確認後

```text
authentication
World Rugby SSO
role-based access control
production database
API Gateway
enterprise cloud
public admin console
enterprise audit log
payment
personal-data management
semi-automated operation
```

---

## 9. Branch・commit運用基準

組織側の開発規則が判明するまでは、次を推奨基準とする。

```text
main
= deploy可能な安定状態

v1.1-XX-short-description
= 各工程の短期branch
```

commit原則：

- 1工程につき目的を明確にする
- documentationとapplication変更を識別できるようにする
- 大規模な無関係変更を混在させない
- build・validationがGreenの状態で統合する
- hotfixは機能追加と分離する
- Version1.0 baseline commitを変更しない

commit message例：

```text
docs: add v1.1-01 baseline and issue register
docs: prepare World Rugby data inquiry
refactor: introduce match data provider interface
feat: add derived metrics engine
test: add provider contract validation
fix: restore PWA update flow
```

---

## 10. v1.1-01完了チェック

### 確認済み

```text
[x] Version1.0 completion dateを記録
[x] Version1.0機能基準を記録
[x] 登録試合数・動画数を記録
[x] 既知の制約を整理
[x] 受容済み設計判断を不具合から分離
[x] v1.0.x hotfix基準を定義
[x] Version1.1課題台帳を作成
[x] Version1.1との境界を定義
[x] branch・commit運用基準を定義
```

### Project ownerによる入力待ち

```text
[ ] Public demo URL
[ ] GitHub repository URL
[ ] Version1.0 baseline commit SHA
```

上記3項目を入力後、v1.1-01をCompletedとする。

---

## 11. 次工程

次工程：

```text
v1.1-02 World Rugby問い合わせ資料
```

初回問い合わせでは、完成済みprototypeを示しながら、詳細な公式HSBC SVNSデータ、APIまたはdata feed、data dictionary、限定的な非商用公開分析の条件、適切な担当部署を確認する。

pilot、提携、売却、無償移管を初回の主要求にはしない。
