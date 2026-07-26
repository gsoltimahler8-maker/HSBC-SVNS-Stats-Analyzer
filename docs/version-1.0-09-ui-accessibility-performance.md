# SVNS Stats Analyzer

# Version1.0-09 UI・アクセシビリティ・パフォーマンス最終調整

Version: v1.0-09  
Status: Implemented / Device check pending  
Updated: 2026-07-26

---

## 1. UI調整

### 共通ナビゲーション

PC・タブレットでは次の配置に固定する。

```text
分析機能:
Home（2列分） / Stats Analysis / Stats Trends / Match Search / Video Library

プロジェクト情報:
About（2列分） / Sources / Terms and Privacy
```

画面幅1050px以下では2列にし、HomeとAboutを全幅表示する。
480px以下では1列表示にする。

以前のCSS上書きだけに依存せず、
AppNavigationにmain/info専用クラスを追加して配置を固定した。

### 長い表記

- 長い英語ラベルの折返し
- ボタン内の行間
- 横スクロール抑制
- 44px以上の主要タップ領域

---

## 2. アクセシビリティ

- 「本文へ移動 / Skip to main content」を追加
- 画面遷移後に本文へフォーカス移動
- 画面ごとにdocument titleを更新
- 表示言語をhtmlのlang属性へ反映
- 言語切替へaria-pressedを追加
- 現在画面はaria-currentで表示
- 選択中の試合・動画へaria-pressedを追加
- 検索件数をrole=statusで通知
- 全主要操作へfocus-visibleを追加
- reduced motionへ対応
- high contrast設定へ補助対応
- 実行時描画エラー用のError Boundaryを追加

Error Boundaryにより、Reactの描画エラーが発生した場合も
黒画面ではなく再読込・問い合わせ画面を表示する。

---

## 3. パフォーマンス

- YouTube iframeのloading=lazyを維持
- フィルター計算のuseMemoを維持
- スマートフォンでは高負荷なbackdrop-filterを停止
- 不要なアニメーションをOS設定に応じて停止
- Service Workerキャッシュ版をv1.0.09へ更新
- 新しいJS・CSSをインストール済みPWAへ通知

データ構造、登録試合、登録動画には変更を加えていない。

---

## 4. 置き換えファイル

```text
src/App.jsx
src/main.jsx
src/components/AppNavigation.jsx
src/components/MatchSearch.jsx
src/components/VideoLibrary.jsx
src/i18n/ja.js
src/i18n/en.js
src/styles.css
public/service-worker.js
```

## 5. 新規追加

```text
src/components/AppErrorBoundary.jsx
docs/version-1.0-09-ui-accessibility-performance.md
```

---

## 6. 確認項目

### UI

- Homeが他タブの2倍幅
- Aboutが他タブの2倍幅
- 現在画面のactive表示
- 360pxで横スクロールなし
- 長い英語表記が枠外へ出ない

### キーボード

- Tabで全主要ボタンへ移動できる
- focusが黄色の枠で見える
- Enter / Spaceでボタンを操作できる
- Skip to main contentが動作する
- 画面遷移後に本文へフォーカスが移る

### PWA・性能

- ActionsがGreen
- 更新通知が表示される
- 「更新する」で再読込
- Match SearchとVideo Libraryのiframeは選択時のみ表示
- iframeにloading=lazyとtitleがある
- スマートフォンでスクロールが重くならない

### 安定性

- 通常画面で黒画面なし
- JavaScript描画エラー時はError Boundaryが表示される
- CSV／Excel／PDF出力が復活していない
