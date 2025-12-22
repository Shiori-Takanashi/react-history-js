# Cloud Run デプロイガイド

## 前提条件

1. GCPプロジェクトを作成
2. Cloud Run API を有効化
3. gcloud CLIをインストール・初期化
4. GitHubリポジトリにプッシュ

## デプロイ方法

### オプション1: gcloud コマンドで直接デプロイ

```bash
# ローカルでビルド・デプロイ
gcloud run deploy react-history-js \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### オプション2: Cloud Build 経由でデプロイ（推奨）

```bash
# Cloud Build を使用してデプロイ
gcloud builds submit \
  --config cloudbuild.yaml \
  --region us-central1
```

### オプション3: Cloud Console から手動デプロイ

1. [Cloud Console](https://console.cloud.google.com) にアクセス
2. Cloud Run を開く
3. 「サービスを作成」をクリック
4. イメージURL: `gcr.io/YOUR_PROJECT_ID/react-history-js:latest`
5. リージョン: `us-central1`
6. 「認証を許可」にチェック
7. 「作成」をクリック

## 環境変数の設定

Cloud Run での環境変数設定（必要に応じて）:

```bash
gcloud run services update react-history-js \
  --update-env-vars KEY=VALUE \
  --region us-central1
```

## ドメイン設定

デフォルトで `https://react-history-js-xxxxx.run.app` でアクセス可能

カスタムドメインを設定する場合:

```bash
gcloud run services update react-history-js \
  --set-cloudsql-instances PROJECT:REGION:INSTANCE \
  --region us-central1
```

## ログ確認

```bash
# リアルタイムログを表示
gcloud run services logs read react-history-js --limit 50

# 特定の日時のログを確認
gcloud run services logs read react-history-js \
  --limit 100 \
  --format json
```

## パフォーマンスチューニング

Cloud Run サービスの設定を更新:

```bash
gcloud run services update react-history-js \
  --memory 256Mi \
  --cpu 1 \
  --timeout 900 \
  --concurrency 80 \
  --region us-central1
```

## トラブルシューティング

### イメージがビルドできない

```bash
# ローカルでビルドテスト
docker build -t react-history-js:test .

# イメージを実行テスト
docker run -p 8080:8080 react-history-js:test
```

### デプロイ後に 404 エラーが出る

Nginx の `try_files` 設定を確認（`nginx.conf` を参照）

### メモリ不足エラー

メモリ制限を増やす:

```bash
gcloud run services update react-history-js \
  --memory 512Mi \
  --region us-central1
```

## リソースの削除

```bash
# Cloud Run サービスを削除
gcloud run services delete react-history-js --region us-central1

# Container Registry のイメージを削除
gcloud container images delete gcr.io/YOUR_PROJECT_ID/react-history-js
```

## 参考リンク

- [Cloud Run ドキュメント](https://cloud.google.com/run/docs)
- [Cloud Build ドキュメント](https://cloud.google.com/build/docs)
- [Container Registry ドキュメント](https://cloud.google.com/container-registry/docs)
