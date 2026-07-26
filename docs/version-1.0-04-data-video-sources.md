# SVNS Stats Analyzer

# Version1.0-04 データ・動画ソースページ

Version: v1.0-04  
Status: Implemented / Display check pending

---

## 1. 目的

データや動画の提供元を単に列挙するのではなく、主ソース、照合ソース、補助ソース、サンプルデータを区別し、登録・検証方法と制約を公開する。

---

## 2. 試合情報・スタッツ

掲載するソース区分：

- Rugby.com.au Match Stats
- SVNS / World Rugby Match Centre
- RugbyPass
- SAMPLE DATA

各ソースについて、次を表示する。

- アプリ内での役割
- 確認する情報
- 主ソースか補助ソースか
- 外部Match IDの扱い
- データ不足時の扱い
- 元ページを複製しない方針

---

## 3. 公式動画

掲載するソース区分：

- ワールドラグビー日本チャンネル
- World Rugby Women
- YouTube公式埋め込み
- 公開状態管理

動画ファイルは保存・再配布せず、公式埋め込みと外部リンクで参照する。

---

## 4. 動的な登録件数

ページ上部に現在のデータから次を自動表示する。

```text
登録試合数
REAL DATA件数
SAMPLE DATA件数
登録動画数
```

公式YouTubeチャンネルごとの登録動画件数も自動表示する。

---

## 5. 登録・検証手順

1. 対象試合と公式Match IDを特定
2. 主ソースで結果とスタッツを確認
3. 補助ソースで大会・日付・対戦カードを照合
4. sourceUrl、fetchedAt、dataCoverageLevelを記録
5. 動画は公式投稿者とチャンネルを確認
6. validationと公開画面を確認

---

## 6. 制約

- 提供元による項目定義差
- 欠損値を0として補完しない
- 古いシーズンの限定データ
- 提供元によるページ・動画変更
- 公式記録の代替ではないこと

---

## 7. Homeからの導線

Home右下の補助ナビゲーションを次の2ボタンへ変更する。

```text
このアプリについて
データ・動画ソース
```

共通ナビゲーションへの本格統合はv1.0-06で行う。

---

## 8. 変更ファイル

```text
src/App.jsx
src/components/SourcesPage.jsx
src/i18n/ja.js
src/i18n/en.js
src/styles.css
```

---

## 9. 確認項目

- HomeからSourcesページへ移動できる
- Homeへ戻れる
- 登録件数が表示される
- 日本語／英語が切り替わる
- 公式YouTubeチャンネルリンクが開く
- PCで2列表示になる
- スマートフォンで1列表示になる
- 360px幅でも横スクロールが発生しない
- Aboutボタンが引き続き動作する
- 共通の非公式・非提携表示が表示される
