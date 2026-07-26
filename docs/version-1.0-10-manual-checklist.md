# SVNS Stats Analyzer

# Version1.0-10 手動確認チェックリスト

確認日:  
確認者:  
公開デモURL:  
GitHubリポジトリURL:  
確認対象コミット:  

判定記号：

```text
PASS = 正常
FAIL = 修正が必要
N/A  = 対象端末・環境なし
```

---

## A. GitHub Actions

| 項目 | 判定 | メモ |
|---|---|---|
| `validate:release`がERROR 0 |  |  |
| buildがGreen |  |  |
| deployがGreen |  |  |
| 最新runが最新コミットを対象としている |  |  |
| `github-pages` artifact重複エラーがない |  |  |

---

## B. 公開Home

| 項目 | 判定 | メモ |
|---|---|---|
| 黒画面・Error Boundaryにならない |  |  |
| 指定したアプリアイコンが使用されている |  |  |
| 日本語表示が正常 |  |  |
| English表示が正常 |  |  |
| Stats Analysisへ移動 |  |  |
| Stats Trendsへ移動 |  |  |
| Match Searchへ移動 |  |  |
| Video Libraryへ移動 |  |  |
| Project Informationを開閉 |  |  |
| Aboutへ移動 |  |  |
| Sourcesへ移動 |  |  |
| Terms and Privacyへ移動 |  |  |
| スマートフォンで横スクロールなし |  |  |

---

## C. Match Search

| 項目 | 判定 | メモ |
|---|---|---|
| 9試合が読み込まれる |  |  |
| シーズンfilter |  |  |
| 大会filter |  |  |
| 対戦相手filter |  |  |
| 勝敗filter |  |  |
| Match ID検索 |  |  |
| 試合を選択して詳細表示 |  |  |
| スタッツ表が表示 |  |  |
| 出典・外部Match IDが表示 |  |  |
| 関連動画がある試合で動画表示 |  |  |
| Video Libraryへ移動 |  |  |
| CSVボタンがない |  |  |
| Excelボタンがない |  |  |
| PDFボタンがない |  |  |

---

## D. Video Library

| 項目 | 判定 | メモ |
|---|---|---|
| 7動画が読み込まれる |  |  |
| シーズンfilter |  |  |
| チーム・対戦相手filter |  |  |
| 動画種別filter |  |  |
| 言語filter |  |  |
| provider / availability filter |  |  |
| 動画を選択 |  |  |
| YouTube埋め込み表示 |  |  |
| `YouTubeで開く`が動作 |  |  |
| Match Searchへ移動 |  |  |
| 削除・制限時のfallback表示 |  |  |

---

## E. 情報・法的ページ

| 項目 | 判定 | メモ |
|---|---|---|
| Aboutページ |  |  |
| Data and Video Sourcesページ |  |  |
| 利用条件タブ |  |  |
| Privacyタブ |  |  |
| Disclaimerタブ |  |  |
| Contactタブ |  |  |
| `svnsstatsanalyzer@gmail.com`が表示 |  |  |
| mailtoリンクが開く |  |  |
| 非公式・非提携表示がある |  |  |
| World Rugby / HSBC / Rugby Australia / YouTubeとの非提携が明記 |  |  |
| GitHub・Google・YouTube等の外部方針リンク |  |  |

---

## F. PWA

| 項目 | 判定 | メモ |
|---|---|---|
| Manifestが認識される |  |  |
| Service Workerがactivated |  |  |
| インストール可能 |  |  |
| 指定アイコンでホーム画面へ追加 |  |  |
| standalone表示で起動 |  |  |
| オンラインで主要画面を一度開く |  |  |
| オフラインでアプリ本体を再表示 |  |  |
| オフライン時にアプリが落ちない |  |  |
| YouTubeが利用不能でもfallback |  |  |
| 新版公開後に更新通知 |  |  |
| 「更新する」で新版へ切替 |  |  |

---

## G. PC・スマートフォン

### PC

| 項目 | 判定 | メモ |
|---|---|---|
| Chrome / Edgeで表示 |  |  |
| 共通ナビゲーション |  |  |
| キーボードTab操作 |  |  |
| 黄色いfocus枠 |  |  |
| 本文へ移動リンク |  |  |
| コンソールに重大エラーなし |  |  |

### Android

| 項目 | 判定 | メモ |
|---|---|---|
| Chromeで表示 |  |  |
| Home配置 |  |  |
| 各ページの2列ナビゲーション |  |  |
| ボタンが押しやすい |  |  |
| 横スクロールなし |  |  |
| PWAインストール |  |  |

### iPhone / iPad

利用可能な場合のみ確認する。

| 項目 | 判定 | メモ |
|---|---|---|
| Safariで表示 |  |  |
| ホーム画面に追加 |  |  |
| Apple Touch Icon |  |  |
| standalone表示 |  |  |
| safe-areaで表示欠けなし |  |  |

---

## H. 404・外部リンク・Console

| 項目 | 判定 | メモ |
|---|---|---|
| 公開トップURL |  |  |
| 再読み込みで404にならない |  |  |
| YouTube外部リンク |  |  |
| World Rugby外部リンク |  |  |
| Rugby Australia外部リンク |  |  |
| GitHub / Google policyリンク |  |  |
| ConsoleにUncaught Errorなし |  |  |
| Service Worker登録エラーなし |  |  |
| Manifest iconエラーなし |  |  |

---

## I. 最終判定

```text
[ ] PASS — v1.0-11完了報告へ進む
[ ] FAIL — 修正工程を追加する
```

既知の制約・引継ぎ事項：

```text


```
