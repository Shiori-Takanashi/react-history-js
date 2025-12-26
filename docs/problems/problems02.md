# Wiki 02: リセット後に history-empty が表示される理由

## 問題の現象

1. ページを開く（例：`/home`）
2. 履歴が表示される
3. 「履歴リセット」ボタンをクリック
4. ✅ 履歴が消える（localStorage も reset）
5. ❌ ページは `/home` のままだが、**`history-empty` が表示される**

**期待値：** リセット後、自動的に現在のページ（`/home`）が履歴に記録されるべき

---

## 根本原因

### シナリオ分析

#### Timeline：

```
[初期ロード]
  ↓
  DefaultLayout マウント
  ↓
  Tracker コンポーネント マウント
  ↓
  useHistory() → addHistory('/home')
  ↓
  history = [{ path: '/home', timestamp: ... }]
  ↓
  History コンポーネント表示 ✓

[ユーザーが「履歴リセット」をクリック]
  ↓
  resetHistory() 実行
  ↓
  setHistory([]) ← state を空配列に
  ↓
  saveHistoryToStorage([]) ← localStorage も空に
  ↓
  History コンポーネント再レンダリング
  ↓
  history.length === 0 → history-empty 表示 ✓

[ページは /home のまま]
  ↓
  Tracker は useLocation() で現在の /home を認識
  ↓
  ❌ しかし addHistory() は呼ばれない！（ページ遷移ではないため）
```

### なぜ addHistory() が呼ばれないのか？

**Tracker.jsx の useEffect：**

```javascript
export function Tracker() {
  const location = useLocation();
  const { addHistory } = useHistory();

  useEffect(() => {
    addHistory(location.pathname, location.key);
  }, [location.pathname, location.key, addHistory]);
  // ↑ dependency に pathname と key がある
}
```

**重要：** `useEffect` の依存関係は `location.pathname` と `location.key`

- **ページ遷移時：** pathname 変更 → useEffect 実行 → addHistory 呼び出し ✓
- **同じページでリセット：** pathname は変わらない → useEffect 実行されない →
  addHistory 呼ばれない ❌

---

## より詳しい分析

### 1. 重複チェックの干渉の可能性

useAddHistory で重複判定がある：

```javascript
// src/hooks/composites/useAddHistory.js
if (checker.isDuplicate(path, key)) {
  return; // ← 重複なら記録しない
}
```

**仮説：**
リセット直後に同じ pathname が来ても、重複チェッカーがまだ古い情報を保持している可能性

```
[初期ロード時]
lastPath = '/home'
lastKey = 'key-123'
lastTime = 1700000000

[リセット実行]
checker は resetHistory() で reset されない ← ここが問題！

[同じページでリセット]
addHistory('/home', 'key-123') を呼びたいが...
isDuplicate() → true（同じ path と key）
→ return（記録されない）❌
```

---

## 解決案

### 案1：リセット時に重複チェッカーもリセット（推奨）

**問題：** `resetHistory` は `setHistory` しかしていない

```javascript
// 現在の実装（不完全）
export function useResetHistory(setHistory) {
  return useCallback(() => {
    setHistory([]);
    saveHistoryToStorage([]);
    // ❌ checker がリセットされていない
  }, [setHistory]);
}
```

**解決策：** DuplicateChecker の instance を reset する

```javascript
// 修正案
export function useResetHistory(setHistory, duplicateCheckerRef) {
  return useCallback(() => {
    setHistory([]);
    saveHistoryToStorage([]);
    duplicateCheckerRef.current.reset(); // ← 追加
  }, [setHistory, duplicateCheckerRef]);
}
```

---

### 案2：リセット後に現在のページを自動記録

リセット直後に `addHistory(location.pathname)` を明示的に呼び出す

```javascript
// History.jsx
const { history, resetHistory, addHistory } = useHistory();
const location = useLocation();

const handleReset = () => {
  resetHistory();
  // リセット後、現在のページを記録
  addHistory(location.pathname, location.key);
};

return <button onClick={handleReset}>履歴リセット</button>;
```

---

### 案3：リセット時に useEffect を強制実行

Tracker の useEffect が依存関係に基づいて判断するのではなく、リセット時に
`useLocation` を通す

```javascript
// Tracker.jsx の改善案
const location = useLocation();
const { addHistory } = useHistory();

useEffect(() => {
  addHistory(location.pathname, location.key);
}, [location.pathname, location.key, addHistory]);

// リセットイベントをリッスンする仕組みを追加
```

---

## 設計上の問題点

### 🔴 現在の設計の問題

1. **重複チェッカーの生存期間が不明確**
   - 初期化時に作成された checker が、リセット後も生存
   - state がリセットされても checker は古いまま

2. **リセット と 重複チェック の分離**
   - resetHistory は state だけリセット
   - DuplicateChecker はリセットされない
   - 両者の同期が取られていない

3. **ページ遷移と同じページでのリセット の区別がない**
   - 同じ pathname でも「新しいアクション」として扱うべき
   - しかし useEffect の依存関係では判断できない

---

## 推奨される修繕

### Priority 1: DuplicateChecker を useResetHistory でリセット

```javascript
// useResetHistory.js
export function useResetHistory(setHistory, duplicateCheckerRef) {
  return useCallback(() => {
    setHistory([]);
    saveHistoryToStorage([]);
    duplicateCheckerRef.current.reset(); // ← これを追加
  }, [setHistory, duplicateCheckerRef]);
}
```

### Priority 2: useHistoryManager で duplicateCheckerRef を useResetHistory に渡す

```javascript
export function useHistoryManager() {
  const { history, setHistory } = useHistoryState();
  const duplicateCheckerRef = useRef(createDuplicateChecker());

  const addHistory = useAddHistory(setHistory, duplicateCheckerRef);
  const setHistoryWrapper = useSetHistory(setHistory);
  const resetHistory = useResetHistory(setHistory, duplicateCheckerRef);

  return { history, addHistory, setHistory: setHistoryWrapper, resetHistory };
}
```

---

## チェックリスト

- [ ] DuplicateChecker の instance を管理する
- [ ] resetHistory で checker.reset() を呼び出す
- [ ] useAddHistory で duplicateCheckerRef を受け取る
- [ ] リセット後にページが正常に記録されることをテスト
- [ ] localStorage が正しく更新されることを確認
