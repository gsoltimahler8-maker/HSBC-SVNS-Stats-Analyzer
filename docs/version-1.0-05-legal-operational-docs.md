# SVNS Stats Analyzer

# Version1.0-05 法的・運用文書

Version: v1.0-05  
Status: Implemented / Display check pending

---

## 1. 実装対象

- 利用条件
- プライバシーポリシー
- 免責事項
- 問い合わせ方針
- 第三者サービス方針へのリンク
- 問い合わせメール導線

---

## 2. 現在のデータ取得状況

Version1.0時点では次を前提とする。

- アカウント登録なし
- ログインなし
- 入力フォームなし
- 独自アクセス解析なし
- 問い合わせはメールのみ
- GitHub Pagesで公開
- YouTubeはyoutube-nocookie.comの埋め込みを使用
- PWAキャッシュはv1.0-07で追加予定

---

## 3. プライバシー上の第三者サービス

- GitHub Pages
- Google / Gmail
- YouTube
- 外部データ・動画提供元

本アプリ側の直接取得と、第三者サービス側の処理を分けて表示する。

---

## 4. 文書の性質

個人開発・非商用の初期MVPについて、現在の実装と運用を利用者へ説明するための文書である。

法域、商用化、広告、独自分析、ログイン、決済、ユーザー投稿などが追加される場合は、専門家による確認を含めて改訂する。

---

## 5. Homeからの導線

Home右下へ次のボタンを追加する。

```text
利用条件・プライバシー
Terms and privacy
```

ページ内では次の4タブを切り替える。

```text
利用条件
プライバシー
免責事項
問い合わせ
```

本格的な共通ナビゲーション統合はv1.0-06で行う。

---

## 6. 変更ファイル

```text
src/App.jsx
src/components/PolicyPage.jsx
src/i18n/ja.js
src/i18n/en.js
src/styles.css
```

新規文書：

```text
docs/terms-of-use.md
docs/privacy-policy.md
docs/disclaimer.md
docs/contact-policy.md
docs/version-1.0-05-legal-operational-docs.md
```

---

## 7. 確認項目

- Homeからポリシーページへ移動できる
- Homeへ戻れる
- 4タブを切り替えられる
- 日本語／英語が切り替わる
- メールリンクが開く
- 第三者ポリシーの外部リンクが開く
- PC・スマートフォンで表示崩れがない
- 360px幅で横スクロールが発生しない
- AboutとSourcesへの既存導線が動作する
- 共通の非公式・非提携表示が表示される

---

## 8. 今後の改訂点

- v1.0-07でPWAキャッシュの実装内容に合わせて再確認
- 独自アクセス解析を追加する場合は事前改訂
- 問い合わせフォームを追加する場合は取得項目を追記
- 商用化、広告、認証、管理画面、ユーザー投稿前に全面改訂
