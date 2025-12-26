# セキュリティ／依存関係レビュー

最終更新: 2025-12-25

## 対象範囲
- 依存管理: [package.json](package.json), [package-lock.json](package-lock.json)

## 強み
- `npm ci` 採用で決定的ビルド、基本的な最小権限構成。

## 課題
- `npm audit` のCI組み込み（pre-push/ワークフロー）未導入。

## 推奨アクション（短期）
- `npm audit --production` を pre-push か専用ワークフローに追加。

## チェックリスト
- [ ] 監査の定期実行
- [ ] 主要アクションのピンニング

## 詳細レビュー（Step01）
- サプライチェーン: GitHub Actions をコミット SHA でピン留め（checkout/setup-node/upload-artifact）。
- 依存監査: `npm audit --production` の定期実行と、重大脆弱性の閾値による CI fail ポリシー策定。
- フロント防御: CSP/`rel="noopener"`/入力エスケープなどの基本対策を README に明記。
- Secrets: デプロイ導入時は OIDC/GCP Workload Identity を活用して長期キーを避ける。
