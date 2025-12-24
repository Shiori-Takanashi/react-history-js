# React History JS

ページアクセス履歴を収集・表示するシンプルな React アプリです。React Router v7 と Context を用いて、ページ遷移をリアルタイムに記録して UI に反映します。

## 目次

- 概要（できること）
- スタック
- セットアップ
- ディレクトリ構成（抜粋）
- 挙動メモ
- デプロイ（Google Cloud Run）
- スクリプト一覧
- 既知の制限
- ライセンス

## 概要（できること）

- ページ遷移を自動検知して履歴に追加（パスと訪問時刻を保存）
- 履歴リストをスクロール可能ビューで表示
- StrictMode の二重発火やリロード直後の重複を除外
- ヘッダー／メイン／履歴／フッターを 100vh 内に収めた全画面レイアウト

## スタック

- React 19.2.0
- React Router 7.11.0
- Vite 7.2.4
- ネイティブ CSS（WebKit / Firefox 対応スクロールバー）
- ホスティング: Google Cloud Run

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev   # http://localhost:5173

# 本番ビルドとプレビュー
npm run build
npm run preview
```

## ディレクトリ構成（抜粋）

```
src/
├── app/
├── components/        # Header, Footer, History
├── contexts/          # HistoryContext, HistoryProvider
├── hooks/             # useHistory など
├── layouts/           # DefaultLayout
├── observers/         # Tracker（ルート変更検知）
├── router/            # Routes 設定
├── styles/            # CSS（global/components/layouts/pages）
├── data/pages.json    # ナビゲーション定義
└── main.jsx
```

## 挙動メモ

- ルーティング: `path: "*"` を DefaultLayout に集約。Outlet は使わず、`pages.json` のパスに応じてタイトルを決定。
- 履歴記録: `Tracker` が `useLocation` の `pathname` と `key` を監視し `addHistory(pathname, key)` を実行。
- 重複排除: 同一パス・同一 navigation key で 120ms 以内のイベントは無視（StrictMode 対策）。
- スクロール: `.history-container` は `overflow-y: auto`。WebKit/Firefox 用にカスタムスクロールバー適用。

## デプロイ（Google Cloud Run）

コンテナで静的ファイル（`dist/`）を配信します。Cloud Run 標準の `$PORT` で待ち受けます。

### Dockerfile（例）

```dockerfile
# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine AS runtime
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist
ENV PORT=8080
EXPOSE 8080
# Cloud Run の $PORT を使用して配信
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
```

### デプロイ手順（Artifact Registry 経由）

```bash
# 変数設定
PROJECT_ID=your-project-id
REGION=us-central1
REPO=react-history-js
IMAGE=$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/web:latest

# Artifact Registry（初回のみ）
gcloud artifacts repositories create $REPO \
	--repository-format=docker --location=$REGION

# Docker レジストリ認証（初回のみ）
gcloud auth configure-docker $REGION-docker.pkg.dev

# ビルド & プッシュ
docker build -t $IMAGE .
docker push $IMAGE

# Cloud Run へデプロイ（公開）
gcloud run deploy react-history-js \
	--image $IMAGE --region $REGION --platform managed \
	--allow-unauthenticated
```

デプロイ後、Cloud Run のサービス URL にアクセスできます。

## スクリプト一覧

- `npm run dev` 開発サーバー起動
- `npm run build` 本番ビルド
- `npm run preview` ビルド結果のローカルプレビュー

## 既知の制限

- 履歴はセッションメモリのみ（リロードで消える）
- 記録するのはパスと時刻のみ（ページ内容やメタデータは未保持）

## ライセンス

MIT
