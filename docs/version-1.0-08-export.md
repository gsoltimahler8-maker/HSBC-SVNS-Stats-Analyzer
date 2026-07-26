# SVNS Stats Analyzer

# Version1.0-08 PDF／CSV／Excel出力

Version: v1.0-08  
Status: Implemented / Browser check pending

## 1. 実装対象

Match Searchへ次の出力機能を追加する。

- CSV：現在の検索結果
- Excel（.xlsx）：現在の検索結果
- PDF：選択中の試合詳細

## 2. CSV／Excelの範囲

フィルター適用後に表示されている試合のみを出力する。

出力項目には次を含める。

- 内部Match ID
- Rugby.com.au／SVNS／RugbyPass ID
- シーズン、日付、男女区分、大会、ステージ
- 分析対象チーム、対戦相手、結果、勝者、敗者
- 登録されている全チームスタッツ
- 主ソース、ソースURL、最終取得日時
- dataCoverageLevel、dataCoverageSource
- statDefinitionVersion
- REAL DATA／SAMPLE DATA
- 登録動画数

## 3. Excel形式

外部ライブラリを追加せず、ブラウザ内で最小構成のOpen XML Workbookを生成する。

- 拡張子：.xlsx
- 1シート
- ヘッダー固定
- オートフィルター
- 列幅調整
- ヘッダー装飾
- 日本語／英語の列名

package.jsonとpnpm-lock.yamlの変更は不要。

## 4. PDF形式

選択中の試合について印刷用HTMLを別画面に生成し、ブラウザの印刷機能を開く。

利用者は印刷先で「PDFとして保存 / Save as PDF」を選択する。

この方式により、日本語フォントをPDFライブラリへ埋め込まず、ブラウザの日本語印刷機能を利用する。

内容：

- スコアと結果
- 試合情報
- Attack／Defence／Possession・Breakdown／Discipline
- 出典追跡
- 登録動画
- 非公式・免責表示

## 5. ファイル名

CSV／Excelは次の形式。

```text
svns-match-search-YYYY-MM-DDTHH-MM-SS-sssZ.csv
svns-match-search-YYYY-MM-DDTHH-MM-SS-sssZ.xlsx
```

PDFのファイル名はブラウザの印刷画面で指定する。

## 6. 変更ファイル

```text
src/components/MatchSearch.jsx
src/utils/exportUtils.js
src/i18n/ja.js
src/i18n/en.js
src/styles.css
```

文書：

```text
docs/export-operation.md
docs/version-1.0-08-export.md
```

## 7. 確認項目

- フィルター後の件数とCSV／Excelの行数が一致する
- CSVがUTF-8 BOM付きで日本語文字化けしない
- Excelが.xlsxとして開く
- Excelの先頭行が固定される
- Excelでフィルターが使用できる
- sourceUrl、fetchedAt、dataCoverageLevelが含まれる
- SAMPLE DATAが明示される
- 選択試合のPDF印刷画面が開く
- PDF印刷画面で日本語が表示される
- PDFに出典追跡と免責表示がある
- ポップアップ拒否時にメッセージが表示される
- 日本語／英語切替後の列名・文書名が切り替わる
- スマートフォンで出力ボタンが1列表示になる
- package.jsonを変更せずActionsがGreenになる

## 8. 次工程

v1.0-09 UI／アクセシビリティ／パフォーマンス最終調整
