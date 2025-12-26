# 状態管理／Hooks レビュー

最終更新: 2025-12-25

## 対象範囲

- [src/hooks/useHistory.js](src/hooks/useHistory.js),
  [src/hooks/composites](src/hooks/composites),
  [src/contexts/HistoryProvider.jsx](src/contexts/HistoryProvider.jsx)

## 強み

- ベースフック + 合成フックで責務分離。
- 重複抑止ロジックがモデル化（`DuplicateChecker`）。

## 課題

- 依存配列の厳密化（`location.key` を含める）。
- 合成フックのテスト補助（モックしやすいAPI設計）。

## 推奨アクション（短期）

- `Tracker` の `useEffect` 依存に `location.key` を追加。
- ハンドラの `useCallback` 化。

## 推奨アクション（中期）

- 複合更新の `useReducer` への移行検討。

## チェックリスト

- [ ] 依存配列は正確
- [ ] ハンドラは `useCallback`
- [ ] 複雑化時は `useReducer`

## 詳細レビュー（Step01）

### 設計の全体観（Good）

- **カスタムフックの分割**: ベース（[src/hooks/useHistory.js](src/hooks/useHistory.js)）と合成（[src/hooks/composites/useAddHistory.js](src/hooks/composites/useAddHistory.js)、[src/hooks/composites/useResetHistory.js](src/hooks/composites/useResetHistory.js)
  など）で責務を整理。再利用とテスト容易性を高めている。
- **監視と UI の分離**: ルーター監視は
  [src/observers/Tracker.jsx](src/observers/Tracker.jsx)
  に集約し、表示はコンポーネント側へ委譲。副作用の置き場が明確。
- **Context + Hook API**:
  [src/contexts/HistoryProvider.jsx](src/contexts/HistoryProvider.jsx) と
  `useHistory()` の API 境界がシンプルで、呼び出し側の理解コストが低い。
  > 総評: ⭐⭐⭐⭐☆（役割分担が明確で実務的）

### 改善できるポイント（Actionable）

- **依存配列の厳密化（Tracker）**: 履歴追加の `useEffect` は `location.pathname`
  だけでなく `location.key`
  も依存に含めると、同一パス連続遷移の検知精度が上がる。StrictMode の二重発火対策として
  `useRef` で初回フラグを持つ実装も有効。
- **Context 値の安定化**: `HistoryProvider` で提供するオブジェクト/関数は
  `useMemo`/`useCallback` で安定化し、無駄な再レンダリングを抑制。
- **複合更新の一元化**: 履歴操作（追加/削除/リセット）の分岐が増える場合は
  `useReducer` を採用し、ロジックの予測可能性とテスト容易性を向上。
- **非同期副作用の安全性**: 将来的に外部 I/O（永続化やフェッチ）が入る場合、`AbortController`
  やエフェクトのクリーンアップで競合状態を回避。ステールクロージャ対策として依存配列の見直し/関数型更新を徹底。
  > 期待効果: 不要なレンダー/バグの抑制と将来変更への耐性向上。

### アンチパターン回避

- 条件分岐内で Hook を呼ばない（Rules of Hooks の遵守）。
- `useEffect` 内の `setState` で依存を省略しない（無限ループの温床）。
- 計算コストが軽微な箇所に過剰な `useMemo` を適用しない（複雑性過多）。

### 実践チェックリスト

- [ ] Provider が返す値は `useMemo` で安定化している
- [ ] 外に渡すハンドラは `useCallback`（依存配列は正確）
- [ ] `useEffect` は明示的な依存とクリーンアップを持つ
- [ ] `Tracker` は `location.key` を依存に含める／StrictMode 二重発火を考慮
- [ ] 重複抑止は `ref`/`Set`
      等で O(1) に抑える（[src/utils/models/DuplicateChecker.js](src/utils/models/DuplicateChecker.js)
      の活用）
- [ ] 複雑化時は `useReducer` で状態遷移を集中管理

> 総評: ⭐⭐⭐⭐☆（現状良好。安定化と依存設計を一段強化すると盤石）
