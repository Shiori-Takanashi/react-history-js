# Cloud Run デプロイ手順（Step01）

最終更新: 2025-12-25

## 概要
- 本プロジェクトを Cloud Run に Source デプロイします（Cloud Build 経由）。
- フロントは `npm run build` で生成された `dist/` を静的配信する構成です。

## Prerequisites
- GCP プロジェクト作成・課金有効化
- Cloud Run / Cloud Build API 有効化
- OIDC による GitHub → GCP 認証設定（推奨）
  - Workload Identity Pool / Provider の作成
  - 対象サービスアカウントへのロール付与（`roles/run.admin`, `roles/artifactregistry.admin`, `roles/iam.serviceAccountUser` など最小権限に調整）

## Secrets（GitHub Actions）
- `GCP_PROJECT_ID`: GCP プロジェクト ID
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: Workload Identity Provider のリソース名
- `GCP_SERVICE_ACCOUNT_EMAIL`: Cloud Run デプロイ権限を持つ SA メール
- `CLOUD_RUN_SERVICE`: Cloud Run サービス名（例: `react-history-js`）
- `CLOUD_RUN_REGION`: リージョン（例: `asia-northeast1`）

## ワークフロー
- ファイル: `.github/workflows/deploy.yml`
- フロー: checkout → setup-node → build → auth(OIDC) → setup-gcloud → deploy-cloudrun → URL 出力

## ローカル確認（任意）
```bash
npm ci
npm run build
npx serve dist -p 5173
```

## トラブルシュート
- 認可エラー: SA に必要ロールが付与されているか確認。OIDC の audience と subject の一致を見直し。
- リージョン不一致: `CLOUD_RUN_REGION` が実環境のリージョンと一致しているか確認。
- ビルド失敗: `npm ci`/`npm run build` をローカルで再現。キャッシュクリア（`npm cache clean --force`）。
- URL 取得失敗: `gcloud run services describe ...` で直接確認。サービス名/リージョンを再チェック。

## 今後の強化
- アクションの SHA ピンニング（供給網対策）
- デプロイ前に 06-ci-build の成果物を再利用（アーティファクト／Cloud Build キャッシュ）
