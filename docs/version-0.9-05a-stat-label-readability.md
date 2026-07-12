# SVNS Stats Analyzer

# Version0.9 Match Search Stat Label Readability Adjustment

Version: v0.9-05a  
Status: Implemented / Display check pending

## Problem

PCのスタッツ・動画並列表示では、スタッツ側の横幅に対して3列のメトリクスカードが狭く、項目名が細かく折り返されて読みにくくなっていた。

## Adjustment

- Match SearchのスタッツカードをPCで3列から2列へ変更
- 項目名を0.82remへわずかに縮小
- ラベルと数値の間隔を縮小
- 数値欄の最小幅を48pxから32pxへ縮小
- スマートフォンでは従来どおり1列表示

小さい文字だけで解決せず、カード自体の横幅を確保することで可読性を改善する。

## Changed file

```text
src/styles.css
```
