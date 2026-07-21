# SVNS Stats Analyzer

# Version1.0-02 名称・非公式表示・ブランド整理

Version: v1.0-02  
Status: Implemented / Display check pending

---

## 1. 公開名称

公開名称は次を維持する。

```text
SVNS Stats Analyzer
```

「HSBC」はアプリ名に含めない。

---

## 2. 名称の位置づけ

「SVNS」は分析対象となる大会・競技シリーズを識別するために使用する。

この名称だけをもって、World Rugby、HSBC、Rugby Australiaその他の団体による公式、公認、提携、スポンサー提供を示すものではない。

---

## 3. 非公式・非提携表示

ホーム画面では既存の非公式表示を次の趣旨へ更新する。

```text
独立した非公式の分析ツールです。
World Rugby、HSBC、Rugby Australia、YouTube等による
公認・提携・提供を受けていません。
```

ホーム以外の画面では、共通フッターとして詳細な非公式・非提携表示を追加する。

---

## 4. ブランド運用方針

- 公開名称は「SVNS Stats Analyzer」
- HSBCをアプリ名に使用しない
- World Rugby、HSBC、Rugby Australia等の公式ロゴを使用しない
- 公式アプリと誤認させる表現を使用しない
- 「公式」「公認」「提携」「提供」等の表現は、正式な許諾がない限り使用しない
- 公式サイトの画面、写真、グラフィックをアプリのブランド素材として複製しない
- 独自UI、独自背景画像、独自アイコンを維持する
- 大会名、商標、動画その他の権利が各権利者に帰属することを表示する

---

## 5. 表示範囲

- Home：既存の `unofficialNotice`
- Stats Analysis：共通ブランドフッター
- Stats Trends：共通ブランドフッター
- Match Search：共通ブランドフッター
- Video Library：共通ブランドフッター
- Data Management：共通ブランドフッター
- 今後追加する情報ページ：共通ブランドフッター

---

## 6. 変更ファイル

```text
src/App.jsx
src/i18n/ja.js
src/i18n/en.js
src/styles.css
```

---

## 7. 確認項目

- ホーム画面に更新後の非公式表示がある
- ホーム以外の各画面下部に共通表示がある
- 日本語／英語で切り替わる
- PCで表示崩れがない
- スマートフォンで横スクロールが発生しない
- アプリ名が「SVNS Stats Analyzer」のまま
- HSBCがアプリ名に含まれていない
- 既存の画面遷移が動作する
