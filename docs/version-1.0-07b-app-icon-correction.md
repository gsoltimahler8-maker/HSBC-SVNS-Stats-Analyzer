# SVNS Stats Analyzer

# Version1.0-07b アプリアイコン修正

Version: v1.0-07b  
Status: Hotfix

## 修正内容

PWAで使用するアプリアイコンを、指定済みの
「動的でスポーティなSVNSロゴ」画像へ変更する。

## 通常アイコン

```text
public/icons/icon-192.png
public/icons/icon-512.png
public/icons/apple-touch-icon.png
```

指定画像をそのまま正方形へ縮小して使用する。

## Maskableアイコン

```text
public/icons/icon-maskable-192.png
public/icons/icon-maskable-512.png
```

Android等のマスク処理で文字や人物が切れないよう、
同じ指定画像を安全領域内へ収めた版を使用する。

## Manifest

通常アイコンは`purpose: any`、
安全領域版は`purpose: maskable`として分離する。

## Service Worker

キャッシュ版を`v1.0.07b`へ更新し、
古い自動生成アイコンが端末に残らないようにする。

## 反映後

- GitHub ActionsがGreenになることを確認
- サイトを強制再読み込み
- 更新通知が出た場合は「更新する」
- 既にインストール済みの場合、一度削除して再インストールすると確実
