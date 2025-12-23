# Wiki 01: useHistory.js と useHistoryState.js の違い

## 概要

このプロジェクトには「履歴を管理する」カスタムフックが2つ存在します。その役割は全く異なります。

```
useHistory.js          ← 公開フック（コンポーネントが使う）
useHistoryState.js     ← 内部フック（ProviderやHooks内部で使う）
```

---

## 詳細比較

### useHistory.js（公開フック）

**位置：** `src/hooks/useHistory.js`

**用途：** React コンポーネントで履歴を取得・操作する

**実装：**

```javascript
export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}
```

**返り値：**

```javascript
{
  history: Array,           // 履歴配列
  addHistory: Function,     // 履歴追加
  setHistory: Function,     // 履歴更新
  resetHistory: Function    // 履歴リセット（予定）
}
```

**使用例：**

```javascript
// components/History.jsx
function History() {
  const { history, resetHistory } = useHistory();

  return (
    <>
      <ul>
        {history.map((entry) => (
          <li>{entry.path}</li>
        ))}
      </ul>
      <button onClick={resetHistory}>Clear</button>
    </>
  );
}
```

**特徴：**

- ✅ React Context から value を取得するだけ
- ✅ コンポーネント内で**どこからでも使える**
- ✅ 完全に prepared された API を提供
- ✅ Error handling あり（Provider外なら自動エラー）

---

### useHistoryState.js（内部フック）

**位置：** `src/hooks/composites/useHistoryState.js`

**用途：** HistoryProvider や useHistoryManager の内部で使用される

**実装：**

```javascript
export function useHistoryState() {
  const [history, setHistory] = useState(() => getHistoryFromStorage());
  return { history, setHistory };
}
```

**返り値：**

```javascript
{
  history: Array,        // 履歴配列（raw state）
  setHistory: Function   // setState 関数（raw）
}
```

**使用例：**

```javascript
// src/hooks/useHistoryManager.js（Provider内部専用）
export function useHistoryManager() {
  const { history, setHistory } = useHistoryState(); // ← ここで使う
  const addHistory = useAddHistory(setHistory);
  const resetHistory = useResetHistory(setHistory);

  return { history, addHistory, setHistory, resetHistory };
}
```

**特徴：**

- ✅ raw な state 管理（localStorage と同期）
- ✅ **ProviderやHooks内部専用**
- ✅ setHistory は「素の setState」
- ✅ 他のロジックの材料として機能

---

## アーキテクチャ図

```
useHistory.js
    ↓
Context から value を取得
    ↓
useHistoryManager.js
    ├─ useHistoryState.js （state 管理）
    ├─ useAddHistory.js   （addHistory 実装）
    └─ useResetHistory.js （resetHistory 実装）
    ↓
HistoryProvider.jsx
    ↓
コンポーネント（useHistory を使用）
```

---

## 比較表

| 項目                   | useHistory.js                                       | useHistoryState.js        |
| ---------------------- | --------------------------------------------------- | ------------------------- |
| **役割**               | Context から value を取得                           | state を管理              |
| **用途**               | コンポーネント（公開）                              | Provider/Hooks 内部       |
| **返り値**             | `{ history, addHistory, setHistory, resetHistory }` | `{ history, setHistory }` |
| **依存関係**           | Context のみ                                        | localStorage の初期化     |
| **エラーハンドリング** | あり（Provider外なら throw）                        | なし                      |
| **state 管理**         | Context が管理                                      | 自分で管理                |
| **実装内容**           | `useContext()` のみ                                 | `useState()` のみ         |
| **複雑度**             | ⭐ シンプル                                         | ⭐ シンプル               |

---

## 層別の責務

### 層1：状態管理（useHistoryState）

```
localStorage ← → React state（raw）
```

### 層2：ロジック実装（useAddHistory, useResetHistory）

```
重複チェック → 履歴エントリ生成 → 保存
```

### 層3：統合（useHistoryManager）

```
層1 + 層2 を組み合わせて API を提供
```

### 層4：Context（HistoryProvider）

```
層3 の結果を Context.Provider で配信
```

### 層5：コンポーネント（useHistory）

```
Context から層4 の value を取得して使用
```

---

## なぜ分けたのか？

### 理由1：責務の分離

- `useHistoryState` ← **state だけ管理**
- `useHistory` ← **API だけ提供**

### 理由2：テスト性

- state 管理のみをテストしたい → `useHistoryState` を単体テスト
- API 動作をテストしたい → `useHistory` を統合テスト

### 理由3：再利用性

- `useHistoryState` を他のロジック（hooks）に再利用できる
- `useHistory` はコンポーネント専用

---

## よくある間違い

### ❌ 間違い：コンポーネントで useHistoryState を使う

```javascript
// これは間違い！
function MyComponent() {
  const { history, setHistory } = useHistoryState(); // ❌ ダメ
  // ...
}
```

**理由：**

- setHistory の返り値が Promise ではない（非同期処理できない）
- addHistory, resetHistory などの API がない
- ロジックが無い raw state だけ

### ✅ 正しい：コンポーネントで useHistory を使う

```javascript
// これが正しい！
function MyComponent() {
  const { history, resetHistory } = useHistory(); // ✅ 良い
  // ...
}
```

---

## まとめ

| フック            | 使う場所               | 返り値     |
| ----------------- | ---------------------- | ---------- |
| `useHistory`      | **コンポーネント**     | 完全な API |
| `useHistoryState` | **Provider/Hooks内部** | raw state  |

**ポイント：**

- コンポーネントから見えるのは `useHistory` だけ
- 内部は複数の小さい hooks で構成（composites/）
- API は Context を通じて提供される
