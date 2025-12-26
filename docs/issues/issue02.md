# Issue 02: reset 機能実装後のページ表示エラー

## 問題概要

reset 機能を追加した後、アプリケーションがページを正常に表示しなくなった。

## 根本原因分析

### 1. **useResetHistory.js が未実装**

`src/hooks/useHistoryManager.js` で以下のインポートがされているが：

```javascript
import { useResetHistory } from './composites/useResetHistory';
```

`src/hooks/composites/useResetHistory.js` ファイルが存在しない可能性が高い。

**結果：** Import エラー → アプリケーション起動失敗

### 2. **clearHistoryFromStorage が削除されていない**

`src/utils/index.js` にまだ `clearHistoryFromStorage` がエクスポートされている：

```javascript
export {
  getHistoryFromStorage,
  saveHistoryToStorage,
  clearHistoryFromStorage, // ← これは削除すべき
} from './historyStorage';
```

`src/utils/historyStorage.js` で定義されているが、使用されていない未使用コード。

### 3. **historyStorage.js に clearHistoryFromStorage が残っている**

前回の issue01 の修繕計画に従い、`clearHistoryFromStorage()`
を削除するはずだったが、削除されていない。

## エラースタック

おそらく以下のようなエラーが発生：

```
Module not found: Can't resolve './composites/useResetHistory'
in '/home/tani09/allprojects/frontend/react-history-js/src/hooks'
```

または

```
useResetHistory is not a function
```

## 修繕手順

### Step 1: useResetHistory.js を作成

```javascript
// src/hooks/composites/useResetHistory.js
import { useCallback } from 'react';
import { saveHistoryToStorage } from '../../utils/historyStorage';

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

### Step 2: clearHistoryFromStorage を削除

`src/utils/historyStorage.js` から削除：

```javascript
// 削除対象
export function clearHistoryFromStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear history from localStorage:', error);
  }
}
```

### Step 3: src/utils/index.js を更新

```javascript
export {
  getHistoryFromStorage,
  saveHistoryToStorage,
  // clearHistoryFromStorage は削除
} from './historyStorage';
```

## ファイル一覧（修繕対象）

| ファイル                                  | 状態                  | 修繕内容 |
| ----------------------------------------- | --------------------- | -------- |
| `src/hooks/composites/useResetHistory.js` | ❌ 存在しない         | **作成** |
| `src/utils/historyStorage.js`             | ⚠️ 未使用コード残り   | **削除** |
| `src/utils/index.js`                      | ⚠️ 不要なエクスポート | **削除** |

## 修繕の必要性

**重要度：** 🔴 緊急

**理由：**

- ✗ アプリケーション起動不可
- ✗ ページが表示されない
- ✗ ユーザーは何もできない状態

## チェックリスト

- [ ] useResetHistory.js を作成
- [ ] clearHistoryFromStorage を historyStorage.js から削除
- [ ] index.js の export から clearHistoryFromStorage を削除
- [ ] npm run dev で動作確認
- [ ] ブラウザでページが正常に表示されることを確認
- [ ] 履歴のリセットボタンが機能することを確認
- [ ] git push

## 参考

- Issue 01: utils と hooks における重複関数の存在
- Wiki 01: useHistory.js と useHistoryState.js の違い
