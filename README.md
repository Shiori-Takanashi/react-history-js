# React History JS

ページアクセス履歴を収集・表示するシンプルなReactアプリです。

React Router
v7とContextを用いて、ページ遷移をリアルタイムに記録してUIに反映します。

## 概要

- ページ遷移を自動検知して履歴に追加（パスと訪問時刻を保存）
- 履歴リストをスクロール可能ビューで表示
- StrictMode の二重発火やリロード直後の重複を除外
- ヘッダー／メイン／履歴／フッターを100vh内に収めた全画面レイアウト

## スタック

- React 19.2.0
- React Router 7.11.0
- Vite 7.2.4
- ネイティブCSS（WebKit/Firefox対応スクロールバー）
- ホスティング: Google Cloud Run

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

- ルーティング: `path: "*"`
  をDefaultLayoutに集約。`pages.json`のパスに応じてタイトル決定。
- 履歴記録:`Tracker`が`useLocation`の`pathname`と`key`を監視し`addHistory(pathname, key)`を実行。
- 重複排除:同一パス・同一navigation
  keyで120ms以内のイベントは無視（StrictMode対策）。
- スクロール:`.history-container`は`overflow-y: auto`。WebKit/Firefox用にカスタムスクロールバー適用。

## デプロイ（Google Cloud Run）

コンテナで静的ファイル（`dist/`）を配信します。Cloud
Run標準の`$PORT`で待ち受けます。

### Prerequisites

- Google Cloud Project（課金有効）
- Cloud Run 有効化、Cloud Build 有効化
- GitHub → GCP OIDC または サービスアカウント鍵（推奨は OIDC）
- 事前に `npm run build` で `dist/` を生成

### Secrets（GitHub Actions）

- `GCP_PROJECT_ID`: GCP プロジェクト ID
- `CLOUD_RUN_SERVICE`: Cloud Run サービス名（例: `react-history-js`）
- `CLOUD_RUN_REGION`: リージョン（例: `asia-northeast1`）
- （OIDC 方式推奨）必要に応じて Workload Identity の設定

### ワークフロー

- デプロイ用ワークフローは
  [.github/workflows/deploy.yml](.github/workflows/deploy.yml) にあります。
- Cloud Run の Source デプロイ（Cloud Build）で `source: .` を指定する構成です。
- 詳細手順とトラブルシュートは
  [docs/wiki/step01/deploy.md](docs/wiki/step01/deploy.md) を参照。

### ローカル確認（任意）

```bash
npm ci
npm run build
npx serve dist -p 5173
```

## スクリプト一覧

- `npm run ci` CI検証（フォーマットチェック → Lint → Stylelint → ビルド）

- `npm run format` / `npm run format:check` フォーマット（整形/検証）
- `npm run lint` ESLint 実行
- `npm run stylelint` / `npm run stylelint:fix` Stylelint 実行/自動修正
- `npm run build` Vite ビルド
- `npm run dev` 開発サーバ

詳しい解説は [docs/wiki/scripts.md](docs/wiki/scripts.md) を参照してください。

アクションのバージョン固定（SHA ピンニング）については
[docs/wiki/step01/actions-pinning.md](docs/wiki/step01/actions-pinning.md)
を参照してください。

## 既知の制限

- 履歴はセッションメモリのみ（リロードで消える）
- 記録するのはパスと時刻のみ（ページ内容やメタデータは未保持）

## ライセンス

MIT
