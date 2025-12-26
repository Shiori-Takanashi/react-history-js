# ルーティングレビュー

最終更新: 2025-12-25

## 対象範囲
- [src/router/Routes.jsx](src/router/Routes.jsx), [src/layouts/DefaultLayout.jsx](src/layouts/DefaultLayout.jsx), [src/pages](src/pages)

## 強み
- `path: "*"` 集約でシンプル、メンテ容易。
- 404/Loading ページが用意されている。

## 課題
- ルートごとの `lazy` ロードが未実装。
- タイトル決定ロジックのテスタビリティ向上余地。

## 推奨アクション（短期）
- `react` の `lazy` と `Suspense` 導入。
- ルートメタ情報用ヘルパの抽出（テスト可能に）。

## チェックリスト
- [ ] 遅延読み込み対応
- [ ] 404/Loading の遷移時フォーカス管理

## 詳細レビュー（Step01）

### ルーティング
- **設計**: React Router v7 によるルート集約。`path: "*"` を [src/layouts/DefaultLayout.jsx](src/layouts/DefaultLayout.jsx) で受け、[src/data/pages.json](src/data/pages.json) を参照してタイトル等を決定する設計がシンプルでメンテ容易。
- **404/Loading**: 専用ページが用意されている（[src/pages/NotFound.jsx](src/pages/NotFound.jsx)、[src/pages/Loading.jsx](src/pages/Loading.jsx)）。
- **改善余地**: ルート単位の遅延読み込み（`lazy` + `Suspense`）で初期バンドルを削減可能（[src/router/Routes.jsx](src/router/Routes.jsx)）。
> 評価: ⭐⭐⭐⭐☆（明快。パフォーマンス最適化余地あり）
