# SVNS Stats Analyzer

# Version1.0-10 公開前validation

Version: v1.0-10  
Status: Automatic validation implemented / Manual confirmation pending  
Updated: 2026-07-26

---

## 1. 目的

Version1.0完了判定の前に、公開候補に必要なファイル、データ、
PWA、法的表示、問い合わせ先、出力機能撤回を自動確認する。

この工程では新機能を追加しない。

---

## 2. 自動validation

次を実行する。

```text
pnpm run validate:release
```

`build`にも`validate:release`を組み込むため、GitHub Actionsで
`pnpm run build`が実行される場合、自動validationも実行される。

### 確認対象

- matches.json validation
- videos.json validation
- 必須ソースファイル
- About / Sources / Policy
- 利用条件 / Privacy / Disclaimer / Contact
- 問い合わせメール
- 非公式・非提携表示
- PWA Manifest
- Service Worker
- 通常・maskable・Appleアイコン
- 動画から試合への参照
- YouTube URL形式
- Error Boundary
- PWA状態表示
- CSV / Excel / PDF出力の撤回
- Version1.0計画のスコープ修正

---

## 3. buildへの統合

`package.json`を次の構造へ更新する。

```text
validate:release
  ├─ validate:matches
  ├─ validate:videos
  └─ validateRelease.mjs

build
  ├─ validate:release
  └─ vite build
```

validationでERRORがあればbuildを停止する。

WARNINGはbuildを停止しない。

---

## 4. 自動確認で判定できない項目

次は実機・公開サイトで手動確認する。

- PC表示
- Android表示
- iPhone / iPad表示（利用可能な場合）
- 日本語 / English切替
- Match Searchの検索・詳細
- Video Libraryの検索・再生
- YouTube埋め込み
- 外部リンク
- mailto
- PWAインストール
- オフライン再表示
- Service Worker更新通知
- コンソールエラー
- 404
- 画面遷移後のfocus
- キーボード操作
- 横スクロール

手動確認には次を使用する。

```text
docs/version-1.0-10-manual-checklist.md
```

---

## 5. 変更ファイル

置き換え：

```text
package.json
docs/version-1.0-plan.md
```

新規追加：

```text
scripts/validateRelease.mjs
docs/version-1.0-10-pre-release-validation.md
docs/version-1.0-10-manual-checklist.md
```

---

## 6. 完了条件

- GitHub ActionsのbuildがGreen
- deployがGreen
- `validate:release`がERROR 0
- 手動チェックリストの必須項目がすべてPASS
- 公開版にCSV / Excel / PDF出力がない
- 公開サイトに重大なコンソールエラーがない
- PWAの基本動作を確認
- 既知の制約をv1.0-11へ引き継げる状態
