# Issue 01: utils と hooks における重複関数の存在

## 問題概要

`src/utils/historyStorage.js` に定義されている `clearHistoryFromStorage()` 関数が、実際には使用されておらず、かつ設計原則に違反している。

## 重複の詳細

### 現状

| ファイル                                | 関数                        | 用途                       | ステータス    |
| --------------------------------------- | --------------------------- | -------------------------- | ------------- |
| `src/utils/historyStorage.js`           | `clearHistoryFromStorage()` | localStorage をクリア      | ❌ **未使用** |
| `src/hooks/composites/useSetHistory.js` | `useSetHistory()`           | state + storage を同期更新 | ✅ 使用中     |

### 問題点

1. **未使用のコード**
   - `clearHistoryFromStorage()` は定義されているが、どこからも呼び出されていない
   - コードベースの複雑性を不必要に増加させている

2. **設計原則違反**
   - 前回の検討で「履歴管理は Context を通じて一元管理すべき」と結論づけた
   - utils で直接 localStorage を操作することは、状態管理の一貫性を失う
   - state と storage の同期が保証されない可能性がある

3. **今後の混乱**
   - リセット機能実装時に、どちらの関数を使うべきか不明確になる
   - `clearHistoryFromStorage()` を使用すると Context の state と不一致

## 修繕計画

### Step 1: `clearHistoryFromStorage()` を削除

```javascript
// src/utils/historyStorage.js
// clearHistoryFromStorage() を削除
```

### Step 2: `useResetHistory.js` を作成

```javascript
// src/hooks/composites/useResetHistory.js
import { useCallback } from "react";
import { saveHistoryToStorage } from "../../utils/historyStorage";

/**
 * 履歴をリセットするカスタムフック
 * @param {Function} setHistory - setState 関数
 * @returns {Function} resetHistory 関数
 */
export function useResetHistory(setHistory) {
  return useCallback(() => {
    setHistory([]); // Context の state をリセット
    saveHistoryToStorage([]); // localStorage を同期
  }, [setHistory]);
}
```

### Step 3: `useHistoryManager.js` に統合

```javascript
// src/hooks/useHistoryManager.js
const resetHistory = useResetHistory(setHistory);

return {
  history,
  addHistory,
  setHistory: setHistoryWrapper,
  resetHistory, // ← 追加
};
```

### Step 4: `HistoryProvider.jsx` の Context value を更新

```javascript
value={{ history, setHistory, addHistory, resetHistory }}
```

### Step 5: コンポーネントで使用

```javascript
// components/History.jsx
const { resetHistory } = useHistory();

<button onClick={resetHistory}>Clear History</button>;
```

## 修繕の必要性

**重要度：** 🔴 高

**理由：**

- ✗ 不要な関数がコードベースを汚染
- ✗ 設計原則（Context 一元管理）違反
- ✗ 将来的な保守性低下の原因
- ✓ リセット機能実装前に解決すべき

## 影響範囲

- `src/utils/historyStorage.js` - `clearHistoryFromStorage()` 削除
- `src/hooks/composites/useResetHistory.js` - 新規作成
- `src/hooks/useHistoryManager.js` - 統合
- `src/contexts/HistoryProvider.jsx` - Context value 更新
- `src/hooks/useHistory.js` - JSDoc 更新

## 実装状況

- [ ] `clearHistoryFromStorage()` を削除
- [ ] `useResetHistory.js` を作成
- [ ] `useHistoryManager.js` に統合
- [ ] `HistoryProvider.jsx` の Context value を更新
- [ ] テスト実施
- [ ] ドキュメント更新
