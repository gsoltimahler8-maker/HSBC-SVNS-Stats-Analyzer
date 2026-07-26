# Version1.1 Roadmap Revision Note

Updated: 2026-07-26

## 変更理由

当初案では、多言語化と分析改善を比較的早い段階に置いていた。

改訂版では、World Rugbyが次のどの方針を採用しても再利用できるよう、優先順位を変更した。

- 現在のコードをpilotとして使用
- 公式データを接続
- 内部システムとして再実装
- 開発委託またはライセンス
- 有償譲渡

## 新しい優先順位

```text
World Rugby問い合わせ
Architecture・Handover
Secure Development
Data Provider／Adapter
Schema・Data Dictionary
Test・再現可能build
多言語化
分析改善
回答に応じた公式データ接続
validation・完了報告
```

## 先送りした項目

World Rugbyの内部要件が判明するまで、次は先行実装しない。

- 認証
- SSO
- 本番DB
- API Gateway
- enterprise cloud
- role管理
- 管理画面
- 監査ログ基盤

既存技術へ過度に依存せず、評価・移植・再実装しやすい設計資産を優先する。
