# SVNS Stats Analyzer

# Version1.0 Initial MVP Plan

Version: v1.0  
Revision: v1.0-11  
Status: Completed  
Updated at: 2026-07-26

---

## 1. Version1.0の目的

Version0.8〜0.9で完成した試合検索・動画ライブラリを、外部へ説明・公開できる初期MVPとして仕上げる。

Version1.0では、公開に必要な情報整備に加えて、PWA化を実装する。CSV・Excel・PDF出力はユーザー要件ではなく、公開データの再配布性を高めるためVersion1.0の対象外とする。

- プロジェクトの正体と目的を明確にする
- 非公式・独立ツールであることを明示する
- データと動画の出典を整理する
- 利用規約・プライバシーポリシー・免責事項を整備する
- PWAとしてインストールできるようにする
- オフライン時の基本動作を整える
- UI・レスポンシブ・アクセシビリティ・パフォーマンスを最終確認する
- 公開デモとして安定させる
- v1.0完了後のWorld Rugby／Rugby Australiaへの初回連絡に備える

---

## 2. Version1.0で行わないこと

以下はVersion1.1以降またはVersion2.0の対象とする。

- 登録試合の大規模拡張
- 高度指標の本格実装
- 管理画面
- データベース化
- ユーザー認証
- 自動データ取得
- 商用化
- 公式ロゴ利用
- 公認・公式提携表記
- World RugbyまたはRugby Australiaへの正式な公認申請

---

## 3. 実装工程

### v1.0-01：計画・スコープ確定

- Version1.0の目的を固定
- 必須項目と対象外項目を整理
- 完了条件を定義
- 公開前チェック項目を定義

成果物：

```text
docs/version-1.0-plan.md
```

---

### v1.0-02：名称・非公式表示・ブランド整理

- 公開名称の最終確認
- HSBC、SVNS、World Rugbyとの関係を誤認させない表記
- 公式・公認・提携を示す表現の排除
- 独立した非公式分析ツールであることを明記
- 公式ロゴを使用していないことを確認
- ホーム画面または共通フッターへ非公式表示を追加

---

### v1.0-03：Aboutページ

以下を掲載する。

- プロジェクト名
- 目的
- 対象競技・大会
- 主な機能
- データ更新方針
- 手入力中心であること
- 開発者情報
- 非商用または商用化前であること
- GitHubリポジトリ
- バージョン情報
- 問い合わせ先

---

### v1.0-04：データソース・動画ソースページ

#### データソース

- Rugby.com.au
- RugbyPass
- その他補助ソース
- 出典ごとの役割
- データ取得日
- dataCoverageLevel
- REAL／SAMPLEの区別
- 出典間で差異がある場合の扱い

#### 動画ソース

- World Rugby
- World Rugby Women
- ワールドラグビー日本チャンネル
- YouTube公式埋め込み
- 動画ファイルを保存・再配布しないこと
- 埋め込み不可・削除時の扱い

---

### v1.0-05：法的・運用文書

以下のページまたは文書を整備する。

- 利用規約
- プライバシーポリシー
- 免責事項
- 著作権・商標表示
- データ訂正依頼
- 動画リンク修正依頼
- 問い合わせ先

---

### v1.0-06：ナビゲーション統合

- HomeからAboutへ移動
- HomeからSourcesへ移動
- HomeからTerms／Privacy／Disclaimerへ移動
- 全画面からHomeへ戻れる
- 共通フッター
- 日本語／英語切替
- スマートフォン対応
- 外部リンクの安全な設定

---

### v1.0-07：PWA化

当初ロードマップでVersion1.0に予定していたPWA対応を実装する。

- Web App Manifest
- Service Worker
- 192pxアイコン
- 512pxアイコン
- インストール対応
- スプラッシュ画面
- 基本的なオフラインキャッシュ
- 更新通知
- GitHub Pages環境でのPWA動作確認
- スマートフォンのホーム画面追加確認

Version1.0では、全データを完全にオフライン化するのではなく、アプリ本体と直近読み込み済みデータを再表示できる基本対応を目標とする。

---

### v1.0-08：出力機能撤回・スコープ修正

CSV・Excel・PDF出力はユーザー要件ではなく、公開データを再利用可能な形で配布する性質が強いため、公開版から撤回する。

- Match SearchからCSV・Excel・PDFボタンを削除
- 出力用utilityを削除
- 出力用CSS・日英文言を削除
- Aboutページの機能一覧から出力機能を削除
- 利用条件・免責事項の出力機能前提表現を修正
- Version1.0計画から出力機能を除外
- 将来の再導入は、ユーザーの明示要望と利用条件・権利関係の確認後に別工程として判断

---

### v1.0-09：UI・アクセシビリティ・パフォーマンス最終調整

#### UI

- PC表示
- タブレット表示
- スマートフォン表示
- 横スクロール
- 文字折り返し
- ボタンサイズ
- 配色・コントラスト
- 長い英語表記

#### アクセシビリティ

- 見出し構造
- ボタンとリンクの区別
- キーボード操作
- focus表示
- iframe title
- 画像alt
- aria-label
- フォームlabel

#### パフォーマンス

- 不要な再レンダリング
- 画像サイズ
- lazy loading
- JSON読み込み
- YouTube iframe
- GitHub Pagesでの初期表示
- buildサイズ
- Service Worker更新挙動

---

### v1.0-10：公開前validation

- 動画validation
- データvalidation
- build成功
- GitHub Actions成功
- 公開ページ確認
- PWAインストール確認
- オフライン基本動作
- 更新通知
- CSV・Excel・PDF出力機能が公開版に残っていないこと
- 日本語／英語
- Match Search
- Video Library
- About
- Sources
- Terms
- Privacy
- Disclaimer
- Contact
- PC／スマートフォン
- 外部リンク
- 404確認
- コンソールエラー確認

---

### v1.0-11：Version1.0完了報告

- 実装機能一覧
- 登録試合数
- 登録動画数
- PWA対応状況
- 出力機能撤回とスコープ修正の記録
- 既知の制約
- v1.1以降への引継ぎ
- v1.0完了判定
- 公開デモURL
- GitHub URL
- 対外連絡準備状況

---

## 4. Version1.0完了後の工程

Version1.0完了後、World RugbyおよびRugby Australiaへの初回連絡を行う。

初回連絡の目的：

- 公開スタッツの利用条件確認
- スタッツ項目定義の確認
- 公式APIまたはデータフィードの有無
- 適切な担当部署の確認
- 現在の出典表示方法の確認

最初から公認やデータ提供を要求しない。

---

## 5. Version1.0完了条件

以下をすべて満たした時点でVersion1.0完了とする。

- Match Searchが安定動作する
- Video Libraryが安定動作する
- 日本語／英語が安定動作する
- PC／スマートフォンで表示崩れがない
- 非公式表示がある
- Aboutページがある
- データソース一覧がある
- 動画ソース一覧がある
- 利用規約がある
- プライバシーポリシーがある
- 免責事項がある
- 問い合わせ先がある
- PWAとしてインストールできる
- 基本的なオフライン動作ができる
- CSV／Excel／PDF出力機能が公開版に残っていない
- buildが成功する
- GitHub Actionsが成功する
- 公開ページで確認済み
- v1.0完了報告がある

---

## 6. 現在地

```text
v0.9 Completed
v1.0-01a Plan Corrected
v1.0 Initial MVP + PWA / Export Removed
Post-v1.0 External Inquiry
v1.1〜v1.5 Data Expansion / Advanced Metrics / Admin
v2.0 Database / Authentication / Semi-automated Operation
```

---

# Version1.0 completion

Completed: 2026-07-26

Version1.0の計画、実装、自動validation、公開サイトの手動確認が完了した。

完了報告：

```text
docs/version-1.0-completion-report.md
```

Version1.0以降の追加機能・データ拡張は、v1.1以降の別工程として扱う。

