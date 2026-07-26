# SVNS Stats Analyzer

# Version1.0-09a 起動時エラー修正

Version: v1.0-09a  
Status: Hotfix

## 症状

Version1.0-09反映後、Error Boundaryが次を表示する。

```text
画面を表示できませんでした
The app could not be rendered.
```

## 原因

Version1.0-09の`App.jsx`は、初回描画時に次を直接参照していた。

```text
t.accessibility.skipToContent
t.accessibility.languageSelector
t.accessibility.pageLoaded
```

GitHub上で`App.jsx`が先に反映され、`ja.js`または`en.js`が
旧版のままになった場合、`t.accessibility`が未定義となる。

この種の不整合は構文上は正しいため、Vite buildとGitHub Actionsは
Greenでも、ブラウザ実行時にReactの描画エラーになる。

## 修正

- accessibility文言に日英の内蔵fallbackを追加
- i18n辞書が旧版でも起動可能にする
- brandNoticeにもfallbackを追加
- Data Managementのtitle参照も安全化
- Error Boundaryは維持

## 置き換え

```text
src/App.jsx
```

## 確認

- Home画面が表示される
- 日本語／English切替が動作する
- 本文へ移動リンクが動作する
- About、Sources、Policyが開く
- Error Boundary画面へ戻らない
