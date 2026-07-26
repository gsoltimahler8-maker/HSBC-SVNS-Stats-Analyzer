# SVNS Stats Analyzer PWA運用

Version: 1.0  
Implemented: 2026-07-26

## 構成

```text
index.html
public/manifest.webmanifest
public/service-worker.js
public/offline.html
public/icons/icon-192.png
public/icons/icon-512.png
public/icons/apple-touch-icon.png
src/registerSW.js
src/components/PwaStatus.jsx
```

## GitHub Pages対応

`import.meta.env.BASE_URL`とService Workerの登録scopeを使用し、
リポジトリ名を含むGitHub Pagesのサブパス内で動作する。

Manifestの`start_url`と`scope`は`./`としているため、
manifestが配置されたGitHub Pagesの公開ディレクトリを基準に解決される。

## キャッシュ方針

### アプリ本体

- HTML
- build後のJavaScript
- build後のCSS
- CSSから参照される同一サイト内の画像
- Manifest
- アイコン
- オフライン案内ページ

Service Workerのactivate時に現在のHTMLを読み、
build後のハッシュ付きJavaScript・CSSを抽出して保存する。

### 実行時

- ページ遷移: Network First
- Manifest・JSON: Network First
- JavaScript・CSS・画像・フォント: Cache First
- YouTubeその他の外部ドメイン: キャッシュ対象外

## オフライン時の制約

- 読み込み済みのアプリ本体と公開データを再表示する
- 未読込の外部ページは利用できない場合がある
- YouTube埋め込みと外部リンクは通信を必要とする
- 初回アクセス前の完全オフライン起動は対象外

## 更新

新しいService Workerが待機状態になると、
アプリ内に「更新があります」を表示する。

「更新する」を押すと待機中のService Workerを有効化し、
ページを再読み込みする。

## インストール

### Chrome / Edge / Android

対応ブラウザでインストール条件を満たすと、
アプリ内に「インストール」通知を表示する。

### iPhone / iPad

Safariの共有メニューから「ホーム画面に追加」を使用する。
iOSではブラウザ独自のインストール通知が表示されない場合がある。

## キャッシュ削除

ブラウザ設定から当該サイトのサイトデータを削除する。
開発者ツールを使用する場合はApplicationのStorageまたは
Service Workersから解除・削除する。
