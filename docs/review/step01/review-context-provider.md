# コンテキスト／Provider レビュー

最終更新: 2025-12-25

## 対象範囲
- [src/contexts/HistoryContext.jsx](src/contexts/HistoryContext.jsx), [src/contexts/HistoryProvider.jsx](src/contexts/HistoryProvider.jsx)

## 強み
- 履歴機能を Context に集約、API 境界が明快。

## 課題
- Provider `value` の安定化不足の可能性。
- 未ラップ利用へのガード未追加。

## 推奨アクション（短期）
- `value` を `useMemo` 化、ハンドラを `useCallback` 化。
- `useHistory()` にガード追加（エラーメッセージ）。

## チェックリスト
- [ ] `value` は安定化
- [ ] ガードあり
- [ ] セレクタ型フック導入検討

## 詳細レビュー（Step01）

### 設計評価（Good）
- **Provider の境界設計**: 履歴という限定的責務を `HistoryProvider` に集約（[src/contexts/HistoryProvider.jsx](src/contexts/HistoryProvider.jsx)）。アプリ全体に不要な再レンダーを波及させない構成は健全。
- **Context + Hook の API 境界**: `HistoryContext` と `useHistory()` の二層構造で、呼び出し側の抽象化レベルが揃っている。UI/ロジック分離に寄与。
- **監視の分離**: ルーター変更監視は [src/observers/Tracker.jsx](src/observers/Tracker.jsx) に閉じ込め、Provider に渡している。副作用の責務が明確。
> 総評: ⭐⭐⭐⭐☆（責務分離と境界設計が実務的）

### 改善提案（Actionable）
- **値の安定化**: Provider が渡す `value`（状態と操作関数）は `useMemo`/`useCallback` で安定化し、下位ツリーの不要な再レンダーを抑制。
- **ガードの追加**: `useHistory()` で `context === null` の場合、開発時に明確なエラーメッセージを投げる（「HistoryProvider の外で useHistory() が呼ばれています」）。
- **責務の増加に備える分割**: 将来的に「保存戦略（session/localStorage）」や「可視フィルタ」などが増える場合、`StorageProvider` 等に分割して単一責務を維持。
- **セレクタ型フックの導入**: コンシューマが一部の値だけを必要とする場合、選択的に取り出すセレクタ型フック（例: `useHistoryList()`, `useAddHistory()`）で再レンダー粒度を最適化。
> 期待効果: 不要レンダー抑制・可読性/保守性の向上。

### アンチパターン回避
- Context に頻繁に変わる値（例えば毎レンダー更新される一時状態）を無差別に詰め込まない。
- Provider の `value={{...}}` を毎レンダーで新規オブジェクト生成しない（`useMemo` 必須）。
- Provider を過剰にネストして複雑化しない（分割は責務ベースで必要最小限）。

### 実践チェックリスト
- [ ] Provider の `value` は `useMemo` で安定化している
- [ ] 渡すハンドラは `useCallback` で依存配列が正確
- [ ] `useHistory()` は未ラップ利用に対するガードを持つ
- [ ] セレクタ型フックで再レンダー粒度を最適化
- [ ] 頻繁に変わる UI 状態はローカル state（Context 経由にしない）

> 総評: ⭐⭐⭐⭐☆（現状良好。安定化とガード追加で盤石化できる）
