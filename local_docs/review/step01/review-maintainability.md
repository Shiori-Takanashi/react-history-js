# 保守性／モジュール性レビュー

最終更新: 2025-12-25

## 対象範囲

- ディレクトリ構成、責務分離、拡張容易性

## 強み

- ディレクトリ単位で責務分離が明確、フック合成が容易。

## 課題

- Provider 境界の最小化とセレクタ型フックの導入余地。

## 推奨アクション（短期）

- セレクタフックで再レンダー抑制、Provider value 安定化。

## チェックリスト

- [ ] 単一責務の原則が守られている
- [ ] 拡張時の依存関係が明快

## 詳細レビュー（Step01）

- 構成: [src/layouts](src/layouts), [src/components](src/components),
  [src/contexts](src/contexts), [src/hooks](src/hooks)
  の分離が良好。監視（[src/observers/Tracker.jsx](src/observers/Tracker.jsx)）をUIから分離。
- Provider: `HistoryProvider` の `value`
  安定化（`useMemo`/`useCallback`）で下位ツリーの再レンダー削減が見込める。
- セレクタ型フック: `useHistoryList()` や `useAddHistory()`
  などの細粒度 API で、消費側の無駄な更新を抑制できる。
- 命名/規約:
  CSS の BEM 規約と変数化（色/スペーシング）を進めるとメンテ性が向上。

### 中期提案

- 責務増加時の Provider 分割（Storage/Filter）で単一責務を維持。
- `useReducer` への移行で動作の予測可能性とテスト性を確保。
