# SVNS Stats Analyzer

# Version1.0-06 ナビゲーション統合

Version: v1.0-06  
Status: Implemented / Display check pending

---

## 1. 目的

Version1.0で追加したAbout、Sources、Policyを、既存の分析機能と同じアプリ内ナビゲーションへ統合する。

React Routerは導入せず、既存の`screen` stateによる画面切替を維持する。

---

## 2. 非Home画面

全ての非Home画面上部に共通ナビゲーションを表示する。

### 分析機能

- Home
- Stats Analysis
- Stats Trends
- Match Search
- Video Library

### プロジェクト情報

- About
- Data and Video Sources
- Terms and Privacy

現在表示中の画面にはactive表示と`aria-current="page"`を付与する。

---

## 3. Home画面

Homeの主要4カードとData Managementボタンは維持する。

About、Sources、Policyは左下の「プロジェクト情報」メニューへ統合する。

これにより、スマートフォンで言語切替と複数の固定ボタンが重なる問題を避ける。

---

## 4. 共通フッター

既存の非公式・非提携表示へ次を追加する。

- About
- Sources
- Terms and Privacy
- Contact email

フッターから各情報ページへ移動できる。

---

## 5. 多言語・レスポンシブ

- 日本語／英語対応
- PCでは横方向のグリッド
- タブレットでは3列
- スマートフォンでは2列
- 小型スマートフォンでは1列
- 360px幅で横スクロールを発生させない

---

## 6. 変更ファイル

```text
src/App.jsx
src/components/AppNavigation.jsx
src/i18n/ja.js
src/i18n/en.js
src/styles.css
```

---

## 7. 既存機能の扱い

- 各画面の「ホームへ戻る」ボタンは維持
- Match SearchとVideo LibraryのMatch ID連携を維持
- HomeMenuの主要構造は変更しない
- 外部リンクは既存どおり`target="_blank"`と`rel="noreferrer"`を使用
- 問い合わせは`mailto:`を使用

---

## 8. 確認項目

- Homeの主要メニューが従来どおり動作する
- Homeの「プロジェクト情報」を開閉できる
- About、Sources、Policyへ移動できる
- 非Home画面上部に共通ナビゲーションが表示される
- 各主要画面へ直接移動できる
- 現在画面がactive表示される
- 共通フッターのリンクが動作する
- 日本語／英語が切り替わる
- PC、タブレット、スマートフォンで表示崩れがない
- 言語切替とHomeの情報メニューが重ならない
- 360px幅で横スクロールが発生しない
- Match SearchとVideo Libraryの相互移動が引き続き動作する
