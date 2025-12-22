# マルチステージビルド - ビルドステージ
FROM node:20-alpine AS builder

WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# ソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN npm run build

# マルチステージビルド - 実行ステージ
FROM nginx:alpine

# ビルドステージから dist ディレクトリをコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx設定をコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run はデフォルトでポート8080を使用
EXPOSE 8080

# Nginxをフォアグラウンドで起動
CMD ["nginx", "-g", "daemon off;"]
