# SVNS Stats Analyzer

# Version1.0-08a 出力機能撤回

Version: v1.0-08a  
Status: Implemented / Display check pending  
Updated: 2026-07-26

---

## 1. 撤回対象

公開版から次の機能を削除する。

```text
CSV出力
Excel出力
PDF出力
```

これらはユーザーから要求された機能ではなく、実装側の判断で追加された。
また、検索結果や試合スタッツを再利用可能なファイルとして渡すため、
公開データの再配布性を高める。

Version1.0の公開スコープには含めない。

---

## 2. 復元するファイル

```text
src/components/MatchSearch.jsx
src/i18n/ja.js
src/i18n/en.js
src/styles.css
docs/terms-of-use.md
docs/disclaimer.md
docs/version-1.0-plan.md
```

Match Search、日英文言、CSSは出力機能導入前の状態へ戻す。
利用条件と免責事項から、存在しない出力機能を前提とする表現を削除する。

---

## 3. 削除するファイル

```text
src/utils/exportUtils.js
docs/export-operation.md
docs/version-1.0-08-export.md
```

GitHub上で上記3ファイルを削除する。

---

## 4. 残す機能

次は変更しない。

- Match Searchの検索・絞り込み
- 試合詳細表示
- データ出典表示
- Match ID検索
- Video Libraryとの相互移動
- PWA
- 日本語／英語切替
- About、Sources、Policy
- CSV取込を含む既存のデータ管理構想

「CSV取込」は管理用データ投入の構想であり、
利用者へのCSV出力とは別の機能なので削除対象ではない。

---

## 5. 将来の再導入条件

CSV・Excel・PDF出力を再検討する場合は、少なくとも次を事前に確認する。

1. ユーザーが機能を明示的に必要としていること
2. 出力対象が独自計算結果か元スタッツか
3. データ提供元の利用条件
4. 必要な許諾・クレジット表記
5. 出力範囲と件数制限
6. 公開版かローカル専用機能か

---

## 6. 確認項目

- Match SearchにCSVボタンがない
- Match SearchにExcelボタンがない
- Match SearchにPDFボタンがない
- Aboutの機能一覧に出力機能がない
- 日本語／英語で表示崩れがない
- Match Searchの検索・詳細・動画連携が動作する
- GitHub ActionsがGreen
- `exportUtils.js`が削除されている
- 出力関連文書が削除されている
