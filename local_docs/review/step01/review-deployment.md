# デプロイ（Cloud Run）レビュー

最終更新: 2025-12-25

## 対象範囲

- Cloud Run（想定）／ワークフロー（未作成）、ビルド成果物: [dist/](dist/)

## 強み

- ビルド成果の生成が安定、Cloud Run 前提の静的配信に適合。

## 課題

- 認証/権限の扱い（Secrets）がドキュメント上未定義。
- デプロイ用ワークフロー（deploy.yml）未整備。

## 推奨アクション（短期）

- 環境変数の一覧と設定手順を docs に追記。
- `deploy.yml` を追加（`gcloud auth` or GitHub Marketplace
  Action、`service`/`region`/`source` の明示）。

## チェックリスト

- [ ] リージョン/サービス名/イメージの定義
- [ ] Secrets の設定手順が整備
- [ ] デプロイワークフローの存在（deploy.yml）
