# useAddHistory フック解説

## 概要

`useAddHistory`
は、ページ閲覧履歴を追加するためのカスタムフックです。重複チェック機能を備え、StrictMode や画面リロード時の二重発火を防ぎながら、履歴データをステートとローカルストレージに保存します。

## ファイルパス

```
src/hooks/composites/useAddHistory.js
```

## 目的

- ページアクセス時に履歴エントリを作成・追加する
- 重複した履歴の記録を防ぐ（React StrictMode の二重レンダリング対策）
- 履歴データをローカルストレージに永続化する

## シグネチャ

```javascript
function useAddHistory(setHistory): Function
```

### パラメータ

| パラメータ   | 型         | 説明                                 |
| ------------ | ---------- | ------------------------------------ |
| `setHistory` | `Function` | 履歴ステートを更新する setState 関数 |

### 戻り値

| 型         | 説明                         |
| ---------- | ---------------------------- |
| `Function` | `addHistory(path, key)` 関数 |

#### addHistory 関数

```javascript
addHistory(path: string, key?: string): void
```

- `path` (string, 必須): 追加する履歴のパス（URL）
- `key` (string, 省略可): 重複チェック用のキー（デフォルトは空文字列）

## 内部実装の詳細

### 1. 重複チェッカーの初期化

```javascript
const duplicateCheckerRef = useRef(createDuplicateChecker());
```

- `useRef` を使用して、レンダリング間で重複チェッカーのインスタンスを保持
- `createDuplicateChecker()` で重複検出用のオブジェクトを生成
- ref を使うことで、コンポーネントの再レンダリング時もインスタンスが維持される

### 2. addHistory 関数の定義

```javascript
const addHistory = useCallback(
  (path, key = '') => {
    // 実装
  },
  [setHistory]
);
```

- `useCallback` でメモ化され、`setHistory` が変更されない限り再生成されない
- パフォーマンスの最適化と不要な再レンダリングの防止

### 3. 重複チェックロジック

```javascript
if (!path) return;

const checker = duplicateCheckerRef.current;

if (checker.isDuplicate(path, key)) {
  return;
}

checker.update(path, key);
```

**処理フロー:**

1. `path` が空の場合は早期リターン（ガード句）
2. ref から重複チェッカーを取得
3. `isDuplicate()`
   で同じパスとキーの組み合わせが短時間に呼ばれていないかチェック
4. 重複の場合は処理を中断（履歴に追加しない）
5. 重複でない場合は `update()` で最後のアクセス情報を記録

### 4. 履歴の追加と保存

```javascript
setHistory((prev) => {
  const newHistory = [...prev, createHistoryEntry(path)];
  saveHistoryToStorage(newHistory);
  return newHistory;
});
```

**処理フロー:**

1. 関数型の setState を使用（現在のステートに依存）
2. スプレッド構文で既存履歴を展開し、新しいエントリを末尾に追加
3. `createHistoryEntry(path)` で新しい履歴エントリオブジェクトを生成
4. `saveHistoryToStorage()` で localStorage に保存
5. 新しい履歴配列を返してステートを更新

## 使用例

```javascript
import { useAddHistory } from './hooks/composites/useAddHistory';

function MyComponent() {
  const [history, setHistory] = useState([]);
  const addHistory = useAddHistory(setHistory);

  useEffect(() => {
    // ページアクセス時に履歴を追加
    addHistory('/home', 'initial-load');
  }, [addHistory]);

  const handleNavigation = (newPath) => {
    addHistory(newPath, 'user-click');
  };

  return (
    <div>
      <button onClick={() => handleNavigation('/about')}>About</button>
    </div>
  );
}
```

## JavaScript 文法解説

このセクションでは、コード内で使用されている JavaScript の文法要素について詳しく解説します。

### 1. アロー関数 (Arrow Function)

```javascript
const addHistory = useCallback(
  (path, key = '') => {
    // 関数本体
  },
  [setHistory]
);
```

**文法:** `(引数) => { 処理 }`

- ES6 で導入された関数の簡潔な記法
- `function` キーワードが不要
- 単一式の場合は `{}` と `return` を省略可能
- `this` のバインディングが親スコープを継承（レキシカルスコープ）

**例:**

```javascript
// 従来の関数
function add(a, b) {
  return a + b;
}

// アロー関数（短縮形）
const add = (a, b) => a + b;

// アロー関数（複数行）
const add = (a, b) => {
  const result = a + b;
  return result;
};
```

### 2. デフォルト引数 (Default Parameters)

```javascript
(path, key = '') => {
  // key が渡されない場合、デフォルトで空文字列が使用される
};
```

**文法:** `関数名(引数 = デフォルト値)`

- 引数が渡されない場合や `undefined` の場合にデフォルト値が使用される
- `null` が渡された場合はデフォルト値は使用されない

**例:**

```javascript
function greet(name = 'ゲスト') {
  console.log(`こんにちは、${name}さん`);
}

greet(); // "こんにちは、ゲストさん"
greet('太郎'); // "こんにちは、太郎さん"
greet(undefined); // "こんにちは、ゲストさん"
greet(null); // "こんにちは、nullさん"
```

### 3. スプレッド構文 (Spread Syntax)

```javascript
const newHistory = [...prev, createHistoryEntry(path)];
```

**文法:** `...配列` または `...オブジェクト`

- 配列やオブジェクトの要素を展開する
- 配列のコピーや結合に使用
- イミュータブル（不変）な操作を実現

**例:**

```javascript
// 配列の展開
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

// オブジェクトの展開
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// 配列のコピー（シャローコピー）
const original = [1, 2, 3];
const copy = [...original];
```

### 4. 関数型 setState

```javascript
setHistory((prev) => {
  const newHistory = [...prev, createHistoryEntry(path)];
  return newHistory;
});
```

**文法:** `setState(前の状態 => 新しい状態)`

- React の setState に関数を渡す記法
- 現在のステート値に基づいて更新する場合に使用
- 複数の更新が連続して実行される場合も正しく動作
- クロージャによる古いステート参照のバグを防ぐ

**例:**

```javascript
// 直接値を渡す（前の状態に依存しない場合）
setCount(5);

// 関数を渡す（前の状態に依存する場合）
setCount((prev) => prev + 1);

// 複数回の更新
setCount((prev) => prev + 1); // 0 → 1
setCount((prev) => prev + 1); // 1 → 2
setCount((prev) => prev + 1); // 2 → 3
```

### 5. React Hooks: useRef

```javascript
const duplicateCheckerRef = useRef(createDuplicateChecker());
```

**用途:**

- レンダリング間でミュータブルな値を保持
- 再レンダリングをトリガーしない
- `.current` プロパティで値にアクセス

**ステートとの違い:**

| 特徴           | useState                   | useRef                             |
| -------------- | -------------------------- | ---------------------------------- |
| 再レンダリング | 値が変わると再レンダリング | 値が変わっても再レンダリングしない |
| 用途           | UI に反映する値            | DOM参照、タイマーID、前回の値など  |
| 更新           | `setState(新しい値)`       | `ref.current = 新しい値`           |

**例:**

```javascript
function Timer() {
  const intervalIdRef = useRef(null);
  const [count, setCount] = useState(0);

  const start = () => {
    intervalIdRef.current = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);
  };

  const stop = () => {
    clearInterval(intervalIdRef.current);
  };

  return (
    <div>
      <p>{count}</p>
      <button onClick={start}>開始</button>
      <button onClick={stop}>停止</button>
    </div>
  );
}
```

### 6. React Hooks: useCallback

```javascript
const addHistory = useCallback(
  (path, key = '') => {
    // 関数本体
  },
  [setHistory]
);
```

**用途:**

- 関数をメモ化（キャッシュ）する
- 依存配列の値が変わらない限り、同じ関数インスタンスを返す
- 子コンポーネントに関数を渡す際の不要な再レンダリングを防ぐ

**文法:** `useCallback(関数, 依存配列)`

**例:**

```javascript
// useCallback なし（毎回新しい関数が作成される）
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // 毎レンダリングで新しい関数
    console.log('clicked');
  };

  return <Child onClick={handleClick} />;
}

// useCallback あり（関数が再利用される）
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    // メモ化された関数
    console.log('clicked');
  }, []); // 依存配列が空なので、常に同じ関数

  return <Child onClick={handleClick} />;
}
```

### 7. 早期リターン（ガード句）

```javascript
if (!path) return;
```

**パターン:** 条件を満たさない場合に早期に関数を終了

- ネストを減らし、コードの可読性を向上
- エラーケースを先に処理する防御的プログラミング
- 正常系のロジックがインデントされずに読みやすい

**例:**

```javascript
// 早期リターンなし（ネストが深い）
function processUser(user) {
  if (user) {
    if (user.age >= 18) {
      if (user.email) {
        // 正常な処理
        sendEmail(user.email);
      }
    }
  }
}

// 早期リターンあり（フラットで読みやすい）
function processUser(user) {
  if (!user) return;
  if (user.age < 18) return;
  if (!user.email) return;

  // 正常な処理
  sendEmail(user.email);
}
```

### 8. メソッドチェーン

```javascript
const checker = duplicateCheckerRef.current;
if (checker.isDuplicate(path, key)) {
  return;
}
checker.update(path, key);
```

**パターン:** オブジェクトのメソッドを順番に呼び出す

- `.` 記法でオブジェクトのプロパティやメソッドにアクセス
- `ref.current` で ref の現在の値を取得
- オブジェクト指向プログラミングの基本パターン

**例:**

```javascript
// メソッドチェーン
const result = 'hello world'
  .toUpperCase() // "HELLO WORLD"
  .split(' ') // ["HELLO", "WORLD"]
  .join('-'); // "HELLO-WORLD"

// オブジェクトのメソッド呼び出し
const user = {
  name: 'John',
  greet() {
    return `Hello, ${this.name}`;
  },
};
console.log(user.greet()); // "Hello, John"
```

### 9. 論理否定演算子 (!)

```javascript
if (!path) return;
```

**文法:** `!値` は値を Boolean に変換して反転

**真偽値の変換:**

```javascript
// Falsy な値（false に変換される）
!false; // true
!0; // true
!''; // true
!null; // true
!undefined; // true
!NaN; // true

// Truthy な値（true に変換される）
!true; // false
!1; // false
!'hello'; // false
![]; // false
!{}; // false
```

### 10. 分割代入（このコードでは未使用だが関連技術）

```javascript
// 配列の分割代入
const [first, second] = [1, 2, 3];
// first = 1, second = 2

// オブジェクトの分割代入
const { name, age } = { name: 'John', age: 30 };
// name = 'John', age = 30

// React での使用例
const [history, setHistory] = useState([]);
```

## 依存関係

### インポート

- `useCallback`, `useRef` from `'react'`
- `saveHistoryToStorage` from `'../../utils/historyStorage'`
- `createDuplicateChecker`, `createHistoryEntry` from `'../../utils'`

### 外部ユーティリティ

| ユーティリティ                  | 役割                                                 |
| ------------------------------- | ---------------------------------------------------- |
| `createDuplicateChecker()`      | 重複検出オブジェクトを生成                           |
| `createHistoryEntry(path)`      | 履歴エントリオブジェクトを生成（タイムスタンプ付き） |
| `saveHistoryToStorage(history)` | 履歴を localStorage に保存                           |

## 重要なポイント

### ✅ メリット

1. **重複防止**: React
   StrictMode での二重レンダリングや、リロード時の重複記録を防ぐ
2. **メモ化**: `useCallback` と `useRef` による最適化
3. **単一責任**: 履歴追加のロジックのみを担当
4. **不変性**: スプレッド構文で元の配列を変更せず新しい配列を生成
5. **永続化**: 自動的にローカルストレージに保存

### ⚠️ 注意点

1. **key パラメータ**: 同じパスでも異なるコンテキスト（初回ロード vs ユーザークリック）を区別できる
2. **依存配列**: `setHistory` が変わると `addHistory` も再生成される
3. **非同期**: ストレージへの保存は同期的に実行される
4. **ガード句**: `path` が空の場合は何もしない（防御的プログラミング）

## 関連ファイル

- [useHistoryManager.js](../hooks/useHistoryManager.js) - このフックを内部で使用
- [DuplicateChecker.js](../utils/models/DuplicateChecker.js) - 重複検出ロジック
- [historyStorage.js](../utils/historyStorage.js) - ストレージ操作
- [utils/index.js](../utils/index.js) - ユーティリティ関数のエクスポート

## まとめ

`useAddHistory` は、履歴管理機能の核となるフックで、以下を実現します:

- 🔄 重複排除による正確な履歴記録
- 💾 自動的な永続化
- ⚡ パフォーマンスの最適化
- 🎯 単一責任の原則に従った設計

このフックを使用することで、アプリケーション全体で一貫した履歴管理を実現できます。
