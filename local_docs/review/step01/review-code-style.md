# コードスタイルレビュー

最終更新: 2025-12-25

## 対象範囲

- ESLint/Prettier の規約、CSS の命名

## 強み

- 規約チェックが CI/Husky 双方に組み込まれている。

## 課題

- CSS の BEM/変数化の徹底度。

## 推奨アクション（短期）

- カラー/スペーシングの CSS 変数化、BEM 見直し。

## チェックリスト

- [ ] 主要色/間隔を変数管理
- [ ] BEM 準拠の再確認

## 詳細レビュー（Step01）

### スタイリング

- **構成**: グローバル/コンポーネント/レイアウト/ページで CSS が分割され、Stylelint により規約順守（[src/styles/global/index.css](src/styles/global/index.css)、[src/styles/layouts/default-layout.css](src/styles/layouts/default-layout.css)）。
- **改善余地**:
  CSS 変数の導入（色・スペーシング）/BEM ネーミングの徹底/レスポンシブ補強。テーマ切替の足場作りに有用。
  > 評価: ⭐⭐⭐⭐☆（整理良好。変数化で運用性向上）
