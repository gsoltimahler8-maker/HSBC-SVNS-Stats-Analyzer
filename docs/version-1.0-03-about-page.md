# SVNS Stats Analyzer

# Version1.0-03 Aboutページ

Version: v1.0-03  
Status: Implemented / Display check pending

---

## 1. 目的

外部利用者、権利者、協会関係者が、アプリの目的・機能・データ運用・動画運用・非公式性・問い合わせ先を確認できるAboutページを追加する。

---

## 2. 掲載内容

- プロジェクト名
- Version1.0初期MVP開発中であること
- プロジェクトの目的
- 主な機能
- 分析方針
- データ登録・検証方針
- REAL DATAとSAMPLE DATAの区別
- dataCoverageLevel
- YouTube動画の扱い
- 個人開発・非公式・非商用であること
- 問い合わせ先

---

## 3. 問い合わせ先

```text
svnsstatsanalyzer@gmail.com
```

データ訂正、動画リンク、表示不具合、その他のプロジェクト関連連絡に使用する。

---

## 4. Homeからの導線

Home画面右下に「このアプリについて / About this app」ボタンを追加する。

共通ナビゲーションへの本格統合はv1.0-06で行う。

---

## 5. GitHubリンク

公開リポジトリURLは未確定のため、この工程では掲載しない。

URL確定後、v1.0-06またはv1.0-11で追加する。

---

## 6. 変更ファイル

```text
src/App.jsx
src/components/AboutPage.jsx
src/i18n/ja.js
src/i18n/en.js
src/styles.css
```

---

## 7. 確認項目

- Home右下にAboutボタンが表示される
- Aboutページへ移動できる
- Homeへ戻れる
- 日本語／英語が切り替わる
- 問い合わせメールリンクが開く
- PCで2列表示になる
- スマートフォンで1列表示になる
- 横スクロールが発生しない
- 共通の非公式・非提携表示がページ下部に表示される
