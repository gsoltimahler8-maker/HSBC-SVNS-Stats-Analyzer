# SVNS Stats Analyzer

# Version1.1 Roadmap

Version: v1.1  
Status: Planned  
Created: 2026-07-26  
Previous release: v1.0 Completed

---

## 1. Version1.1の定義

Version1.1は、Version1.0で完成した初期MVPを維持しながら、次の三点を進める工程とする。

1. World Rugbyへの公式データ照会
2. 多言語化とデータ拡張に耐えられる基盤整備
3. 利用条件を逸脱しない範囲での限定的な分析機能・データ拡張

Version1.1は、World Rugbyとの公式提携、公式認定、商業契約、アプリ売却の成立を完了条件とはしない。

World Rugbyからの返答内容により、データ拡張部分は分岐する。

---

## 2. Version1.1の主要目標

### 2.1 World Rugbyへの照会

完成したVersion1.0を提示し、次を確認する。

- HSBC SVNSの詳細な公式試合スタッツの有無
- 公式API、データフィード、ダウンロードデータの有無
- 指標定義またはdata dictionaryの有無
- 非商用分析ツールでの表示・分析条件
- データ権利者および適切な担当部署
- 将来の限定的な公式データ利用協議の可能性

初回問い合わせでは、pilot、提携、売却、移管を主目的にしない。

相手が具体的な関心を示した場合に限り、後続のやり取りで次を検討する。

- 有償pilot
- 開発委託
- 利用ライセンス
- 保守・運用契約
- World Rugbyによるホスティング
- コードまたは事業の譲渡

### 2.2 多言語化基盤

Version1.0の日英対応を、追加言語に耐えられる構造へ整理する。

Version1.1で実装対象とする言語は原則として次の四言語。

```text
日本語
英語
フランス語
スペイン語
```

ポルトガル語、イタリア語、簡体字中国語、香港繁体字、アラビア語、ジョージア語は、Version1.2以降の候補とする。

### 2.3 データ定義と品質管理

- match statisticsの項目定義を文書化
- 欠損値、推定値、取得不能値の扱いを統一
- データ提供元別の差異を記録
- REAL DATAとSAMPLE DATAの区別を維持
- metric validationを強化
- データ追加時のチェックリストを更新

### 2.4 限定的な機能改善

Version1.0の構造を壊さず、分析・検索の実用性を改善する。

優先候補：

- Stats Analysisの散布図軸切替
- Match Searchの時系列ソート改善
- 大会・相手・勝敗filterの操作改善
- データcoverage表示の明確化
- 動画なし試合のfallback改善
- スマートフォンUIの軽微な調整

---

## 3. Version1.1で行わないこと

次はVersion1.1の標準スコープ外とする。

- 自動スクレイピング
- 大規模な第三者データ複製
- CSV、Excel、PDF出力の再導入
- 認証
- ユーザーアカウント
- データベース化
- 公開管理画面
- 有料課金
- 広告
- 全SVNSシーズンの一括登録
- World Rugby公認を示す表示
- 無償のコード全面譲渡
- 権利関係が不明な状態での商業利用

これらは、必要性、工数、利用条件、データ権利を確認した後に別バージョンで判断する。

---

## 4. 実施順序

## v1.1-01 現状固定・課題台帳

### 目的

Version1.0の公開状態を基準点として固定する。

### 作業

- Version1.0の公開URLと対象commitを記録
- 既知のUI課題を課題台帳へ移す
- 重大不具合と改善要望を分離
- v1.0.x hotfixとv1.1機能追加の境界を定義
- Version1.1のbranch・commit運用を整理

### 完了条件

- Version1.0の基準状態が文書化されている
- Version1.1で扱う課題が一覧化されている
- 重大不具合が残っていない

---

## v1.1-02 World Rugby問い合わせ資料

### 目的

データ照会を、単なる要望ではなく、完成したproof of conceptを伴う正式な問い合わせとして準備する。

### 作業

- 初回問い合わせメール作成
- 公開デモURL確認
- About URL確認
- Sources URL確認
- GitHub URL確認
- 主要画面の説明
- 使用中データの説明
- RugbyPassおよびHSBC SVNS公開画面では分析用の粒度が不足することを説明
- 暫定的にRugby Australiaの公開スタッツを手入力していることを説明
- 自動スクレイピングを行っていないことを説明
- 出力機能を公開版から撤回したことを説明
- 質問事項を五項目程度に整理

### 初回問い合わせの主質問

1. World Rugbyは、公開画面より詳細なHSBC SVNS試合スタッツを保持しているか
2. 公式API、データフィード、ダウンロード手段はあるか
3. 公式data dictionaryまたは指標定義はあるか
4. 限定的・非商用の公開分析に適用される条件は何か
5. 適切なdata、digital、Game Systems、Information Management担当へ取り次げるか

### 完了条件

- 英文メールが確定している
- URLと説明内容が確認済み
- 初回段階ではpilot、売却、移管を主要求にしていない

---

## v1.1-03 World Rugby問い合わせ・記録

### 目的

問い合わせを送信し、以後の判断根拠を残す。

### 作業

- World Rugbyへ送信
- 送信日と送信先を記録
- 自動返信を保存
- 返答期限を内部的に設定
- 返答内容を原文のまま保存
- 事実、解釈、次の対応を分けて記録

### 時間軸

```text
送信後0～14日：通常待機
15～21日：必要に応じて一度だけfollow-up
22日以降：無回答シナリオへ移行可能
```

無回答は許諾と扱わない。

### 完了条件

- 問い合わせ送信記録がある
- 返答または無回答の状態が明確
- 次のdecision gateへ進める

---

## v1.1-04 データ利用Decision Gate

World Rugbyからの反応に応じて、Version1.1後半を分岐する。

### Scenario A：前向きな返答

例：

- 担当部署が紹介された
- APIまたはdata feedの説明があった
- data dictionaryが提供された
- 限定利用の相談が可能になった

対応：

- 技術要件を整理
- NDAや利用条件を確認
- read-onlyの限定アクセスを優先
- 公式データを使う小規模検証を設計
- 相手が具体的な関心を示した段階で、商業条件を含む協力形態を検討

### Scenario B：権利者・委託先へ転送

例：

- World Rugbyからデータ提供会社を案内された
- Rugby Australiaまたは別組織への照会を求められた

対応：

- World Rugbyからの案内であることを明記して連絡
- 利用範囲を限定して確認
- 大規模データ追加を保留
- 現在の公開版維持と新規登録を分けて判断

### Scenario C：無回答または明確な利用不可

対応：

- 無回答を許諾と扱わない
- 大量登録・自動取得は行わない
- 現在の限定的データセットを維持
- UI、i18n、data dictionary、ローカル分析機能を中心に進める
- 必要に応じて法律専門家への相談を検討

### 完了条件

- Scenario A、B、Cのいずれかが選択されている
- データ追加の許容範囲が文書化されている

---

## v1.1-05 多言語化基盤再設計

### 目的

言語追加のたびにApp本体を変更しなくてもよい構造へ移行する。

### 作業

- locale registryを作成
- language codeを統一
- language selectorを拡張可能にする
- 英語fallbackを共通化
- 翻訳キー不足validationを追加
- 日付・数値表示をIntl APIへ統一
- `html lang`の切替を維持
- 将来のRTL対応用に`dir`切替構造を準備
- ラグビー用語集を作成

### locale候補

```text
ja
en
fr
es
```

将来候補：

```text
pt-BR
it
zh-Hans
zh-Hant-HK
ar
ka
```

### 完了条件

- locale追加が独立ファイル追加中心で行える
- 未翻訳キーをbuild時に検出できる
- 日付・数値・言語名がlocale依存で表示される

---

## v1.1-06 フランス語・スペイン語対応

### 目的

World Rugbyの国際的な利用環境を意識した四言語構成にする。

### 作業

- フランス語UI
- スペイン語UI
- About翻訳
- Sources翻訳
- 利用条件・Privacy・Disclaimerの表示方針整理
- ラグビー用語の監修
- 長い文字列でのUI崩れ確認
- モバイル表示確認

### 注意

法的文書の翻訳は参考訳として扱い、正式版をどの言語とするか明記する。

機械翻訳のみで完成扱いにしない。

### 完了条件

- 日本語、英語、フランス語、スペイン語が切替可能
- 翻訳キー不足がない
- PCとスマートフォンで重大な表示崩れがない

---

## v1.1-07 Data Dictionary・Validation強化

### 目的

提供元や大会が増えても、指標の意味を混同しないようにする。

### 作業

- 各metricの英語名・日本語名
- 定義
- 単位
- null許容
- source別差異
- team totalかplayer totalか
- calculated fieldかraw fieldか
- 使用可能なchart
- 比較時の注意点
- validation rule

### 優先metric

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

### 完了条件

- data dictionaryが文書化されている
- validationがdata dictionaryと矛盾しない
- 未取得値を0として扱わない
- source差異が表示または文書で確認できる

---

## v1.1-08 限定データ拡張

この工程はv1.1-04のDecision Gateに従う。

### Scenario Aの場合

- 公式または許諾済みデータで小規模pilot
- 対象大会を一大会に限定
- 既存9試合との整合確認
- 公式metric definitionへ移行
- 取得日時・source versionを記録

### Scenario BまたはCの場合

- 大量拡張は行わない
- 現在と同程度の限定的な手入力を維持
- 新規データ追加前にsourceと利用条件を確認
- SAMPLE DATAは分析UI検証用として分離
- データcoverage表示を強化

### 候補範囲

優先順位：

```text
1. サクラセブンズの同一シーズン追加
2. 同一大会の全対戦
3. 男子日本代表の限定追加
4. 他国・他大会
```

一度に複数シーズン・男女・全チームへ拡張しない。

### 完了条件

- 追加範囲の根拠が明確
- validationがGreen
- sourceと取得日が全試合にある
- 権利判断とデータ追加が矛盾していない

---

## v1.1-09 分析・検索改善

### 優先作業

#### Stats Analysis

- 散布図のX軸・Y軸切替
- 点差、Clean Breaks、Defenders Beaten、Metres等から選択
- 指標の欠損がある試合を明示
- SAMPLEとREALの表示区別

#### Stats Trends

- 大会順・試合日順の統一
- 対戦相手filter
- 指標ごとのcoverage表示

#### Match Search

- 日付の昇順・降順
- 大会・相手・勝敗filterの整理
- source表示の明確化
- 動画あり・なしfilterの検討

#### Video Library

- availability表示
- 動画なしfallback
- 外部リンク切れの確認方法を文書化

### 完了条件

- Version1.0の主要導線を壊していない
- 新しい分析軸がdata dictionaryに基づく
- スマートフォンで操作可能

---

## v1.1-10 公開前確認・完了報告

### 自動確認

- translation key validation
- match validation
- video validation
- metric validation
- PWA build
- export機能が復活していないこと
- unofficial notice
- required document
- 404とasset path

### 手動確認

- 四言語切替
- PC
- Android
- iPhoneまたはiPad
- PWA更新
- offline再表示
- Match Search
- Video Library
- 外部リンク
- Console error
- 長いフランス語・スペイン語表記

### 完了条件

- buildとdeployがGreen
- manual checklistがPASS
- Decision Gateの結果が完了報告に記録されている
- 既知の制約がv1.2へ引き継がれている

---

## 5. 推奨時間軸

World Rugbyの返答時期は制御できないため、固定日ではなく経過期間で管理する。

```text
Week 0      v1.1-01 現状固定
Week 0～1   v1.1-02 問い合わせ資料
Week 1      v1.1-03 送信
Week 1～3   返答待ち／i18n基盤準備
Week 2～5   v1.1-05 多言語化基盤
Week 3～6   v1.1-06 仏語・西語
Week 4～7   v1.1-07 Data Dictionary
Week 3以降  v1.1-04 Decision Gate
Week 6～9   v1.1-08 限定データ拡張
Week 7～10  v1.1-09 分析・検索改善
Week 10     v1.1-10 validation・完了報告
```

World Rugbyから早期に返答があった場合は、v1.1-04を前倒しする。

無回答の場合も、i18n、Data Dictionary、UI改善は進められる。

---

## 6. 優先順位

### Must

- World Rugby問い合わせ
- Decision Gate
- 多言語化基盤
- 翻訳key validation
- Data Dictionary
- 既存データvalidation維持
- Version1.1完了報告

### Should

- フランス語
- スペイン語
- 散布図軸切替
- Match Searchソート
- coverage表示
- 限定的データ追加

### Could

- ポルトガル語準備
- RTL基盤
- 男子データの少数追加
- 動画availabilityの改善

### Not in v1.1

- アラビア語・ジョージア語の本実装
- DB
- 認証
- 管理画面
- 自動取得
- 大規模データ投入
- public export
- 課金

---

## 7. リスクと対応

### World Rugbyから返答がない

対応：

- 一度だけfollow-up
- 無回答を許諾としない
- データ拡張を限定
- i18n、data quality、UIを進める

### World RugbyがRugby Australiaへ照会するよう求める

対応：

- World Rugbyからの案内を添えて連絡
- 現行公開版と将来拡張を分けて説明
- 利用停止要請があれば速やかに対象データを非公開化できるようにする

### 翻訳量が増えすぎる

対応：

- v1.1は仏語・西語まで
- 用語集を先に作る
- 法的文書は参考訳と正式版を区別
- 未翻訳keyをbuild errorにする

### データ定義が一致しない

対応：

- source別の定義を保存
- 同名metricを自動的に同一視しない
- 比較不能な場合はUI上で警告
- 欠損値を0へ変換しない

### 商業交渉へ進む

対応：

- 無償譲渡を約束しない
- コード、データ、第三者素材を分離
- NDA、IP、ライセンス、保守責任を確認
- 必要に応じて法律・契約の専門家へ相談

---

## 8. Version1.1完了時の到達点

Version1.1は、次の状態で完了とする。

```text
World Rugbyへの照会が完了し、回答または無回答の状態が記録されている
データ利用Decision Gateが確定している
日本語・英語・フランス語・スペイン語の基盤が完成している
Data Dictionaryとvalidationが整備されている
限定的なデータ拡張方針が確定している
分析・検索の主要改善が反映されている
buildとdeployがGreen
公開サイトの手動確認がPASS
```

World Rugbyとの契約、公式pilot、売却、正式運用は、相手の反応と条件に応じてv1.2以降または別プロジェクトとして扱う。
