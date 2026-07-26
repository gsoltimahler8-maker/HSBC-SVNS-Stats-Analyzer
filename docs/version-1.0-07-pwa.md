# SVNS Stats Analyzer

# Version1.0-07 PWA化

Version: v1.0-07  
Status: Implemented / Device check pending

## 1. 実装内容

- Web App Manifest
- Service Worker
- 192pxアイコン
- 512pxアイコン
- Apple Touch Icon
- standalone表示
- Android等のスプラッシュ画面用設定
- 基本的なオフラインキャッシュ
- アプリ内インストール通知
- オフライン状態表示
- Service Worker更新通知
- GitHub Pagesのサブパス対応
- 日本語／英語表示

## 2. 更新ファイル

```text
index.html
src/main.jsx
src/registerSW.js
src/App.jsx
src/i18n/ja.js
src/i18n/en.js
src/styles.css
docs/privacy-policy.md
```

## 3. 新規ファイル

```text
src/components/PwaStatus.jsx
public/manifest.webmanifest
public/service-worker.js
public/offline.html
public/icons/icon-192.png
public/icons/icon-512.png
public/icons/apple-touch-icon.png
docs/pwa-operation.md
docs/version-1.0-07-pwa.md
```

## 4. キャッシュ範囲

Version1.0では全データ・全動画を完全にオフライン化しない。

対象：

- アプリ本体
- 現在のbuildに含まれるデータ
- 読み込み済みの同一サイト内画像
- Manifestとアイコン
- オフライン案内ページ

対象外：

- YouTube動画
- 外部データ提供元ページ
- 未読込の外部コンテンツ

## 5. プライバシー文書更新

「PWA対応後」という将来表現を削除し、
Service Workerによる公開ファイル・読み込み済みデータの
キャッシュを現在の実装として明記した。

## 6. 確認項目

### 公開直後

- GitHub ActionsがGreen
- 通常表示で黒画面にならない
- Manifestが読み込まれる
- Service Workerがactivatedになる
- アイコンが表示される
- 日本語／英語を切り替えられる

### インストール

- ChromeまたはEdgeでインストール可能
- Androidでホーム画面へ追加可能
- standalone表示で起動する
- iPhone / iPadではSafariの「ホーム画面に追加」を確認

### オフライン

1. オンラインでアプリを一度開く
2. 各主要画面を一度表示する
3. DevToolsまたは端末でオフラインにする
4. 再読み込みする
5. 読み込み済み画面が表示される
6. YouTube等の外部コンテンツが利用不能でもアプリが落ちない

### 更新

1. Service WorkerのCACHE_VERSIONを変更して再公開
2. 既存タブを再読み込みまたは再フォーカス
3. 「更新があります」が表示される
4. 「更新する」で再読み込みされる
5. 新しい画面が表示される

## 7. 次工程

v1.0-08 PDF／CSV／Excel出力
