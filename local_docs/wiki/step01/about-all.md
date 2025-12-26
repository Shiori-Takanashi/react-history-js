# Step 01: 現在のアーキテクチャ構成

- ブランチ: `step01`
- 日時: 2024-12-24
- 状態: 基本的な履歴管理機能を実装完了（ただし重複チェッカー同期の問題あり）

---

## プロジェクト概要

### このアプリケーションの目的

このプロジェクトは「**ユーザーが訪問したページの履歴を記録・表示・管理するシステム**」を実装しています。

**主な特徴：**

- ページ遷移を**自動で追跡**して履歴に記録
- 履歴は**localStorage に永続化**（ブラウザを閉じても保持）
- 「履歴リセット」ボタンで全履歴削除可能
- **重複を判定**してページ遷移時に同じページを重複記録しない

### アプリケーションの流れ（シンプル版）

```
1. ユーザーがページにアクセス
         ↓
2. Tracker が「このページを訪れた」ことを検知
         ↓
3. HistoryProvider が「履歴を追加」コマンドを実行
         ↓
4. localStorage に保存（ブラウザ終了後も記憶）
         ↓
5. History コンポーネント に表示
```

---

## 全体アーキテクチャ図

```
App.jsx （アプリケーション全体の入口）
  ↓
[HistoryProvider]  ← 履歴管理を全アプリに提供
  ├── useHistoryManager()  ← 履歴ロジック統合
  │   ├── useHistoryState()      ← 状態（配列）を管理
  │   ├── useAddHistory()        ← 履歴を追加する
  │   ├── useSetHistory()        ← 履歴を更新する
  │   └── useResetHistory()      ← 履歴を全削除する
  │
  └── Context.Provider  ← 下の全コンポーネントに提供
      value = { history, addHistory, setHistory, resetHistory }
          ↓
          ├─ DefaultLayout （メインレイアウト）
          │   ├─ Tracker（useHistory を使用）← ページ遷移を監視
          │   ├─ Header
          │   ├─ Main（Outlet）← ページコンテンツ
          │   ├─ History（useHistory を使用）← 履歴を表示 + リセットボタン
          │   └─ Footer
          │
          └─ HistoryLayout（404ページ用）
              └─ NotFound
```

---

## ディレクトリ構成と役割

```
│   ├── HistoryContext.jsx      ← Context 定義
│   └── HistoryProvider.jsx     ← Provider コンポーネント
├── hooks/
│   ├── useHistory.js           ← 公開フック（コンポーネント用）
│   ├── useHistoryManager.js    ← 統合フック（Provider用）
│   └── composites/
│       ├── useHistoryState.js  ← state 管理
│       ├── useAddHistory.js    ← 追加ロジック
│       ├── useSetHistory.js    ← 更新ロジック
│       └── useResetHistory.js  ← リセットロジック
├── utils/
│   ├── index.js                ← 再エクスポート
│   ├── historyStorage.js       ← localStorage 操作
│   └── models/
│       └── DuplicateChecker.js ← 重複判定クラス + createHistoryEntry
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── History.jsx             ← 履歴表示 + リセットボタン
│   └── ...
├── layouts/
│   ├── DefaultLayout.jsx       ← メインレイアウト
│   └── HistoryLayout.jsx       ← 404用レイアウト
├── pages/
│   ├── Loading.jsx
│   ├── NotFound.jsx
│   └── ...
├── router/
│   └── Routes.jsx              ← ルート定義
├── observers/
│   └── Tracker.jsx             ← ページ遷移を監視
├── data/
│   └── pages.json              ← ページメタデータ
├── styles/
│   ├── global/
│   │   ├── index.css
│   │   └── reset.css
│   ├── components/
│   │   ├── history.css
│   │   ├── header.css
│   │   └── footer.css
│   ├── layouts/
│   │   └── default-layout.css
│   └── pages/
│       ├── loading.css
│       └── not-found.css
├── main.jsx
└── assets/
```

---

## プロジェクト設定構成

### 設定の集約と管理（config/ディレクトリ）

ルート直下の設定ファイルの散在を避けるため、すべての開発ツール設定を `config/`
ディレクトリに集約しています。

**config/ 配下のファイル**

| ファイル              | 役割                         | 説明                                                      |
| --------------------- | ---------------------------- | --------------------------------------------------------- |
| `eslint.config.js`    | ESLint フラット設定          | ブラウザ向けJSX と Node向けスクリプトの 2つオーバーライド |
| `prettier.config.js`  | Prettier フォーマッタ設定    | JS/JSX、CSS、Markdown ファイルの統一的なスタイル定義      |
| `.prettierignore`     | Prettier 無視パターン        | `node_modules`, `dist`, `coverage` など除外対象           |
| `stylelint.config.js` | Stylelint CSS チェッカー設定 | CSS ファイルのコード品質管理                              |
| `.stylelintignore`    | Stylelint 無視パターン       | ビルド出力やテンポラリを対象外に                          |

**ルート直下に残している設定**

- `.editorconfig` - エディタ共通設定（VS Code, IDE などが自動検出）
- `vite.config.js` - Vite ビルド設定（Vite が自動検出するため必須）

**メリット**

1. **エディタ自動検出維持** - Vite や EditorConfig はルートで自動検出
2. **スクリプト統一** - `package.json` の lint/format スクリプトが `config/`
   を明示参照
3. **ルート整理** - 設定ファイルが集約されてシンプル
4. **保守性向上** - 設定の所在が明確で、チーム内での齟齬が減る

**package.json スクリプト例**

```json
{
  "scripts": {
    "lint": "eslint . --config config/eslint.config.js",
    "lint:fix": "eslint . --config config/eslint.config.js --fix",
    "stylelint": "stylelint \"src/**/*.css\" --config config/stylelint.config.js --ignore-path config/.stylelintignore",
    "stylelint:fix": "stylelint \"src/**/*.css\" --config config/stylelint.config.js --ignore-path config/.stylelintignore --fix",
    "format": "prettier --config config/prettier.config.js --ignore-path config/.prettierignore --write .",
    "format:check": "prettier --config config/prettier.config.js --ignore-path config/.prettierignore --check ."
  }
}
```

---

## Layer 1: Data Layer（utils/）

**役割：** React に依存しない純粋な関数・クラス

| ファイル              | 責務                   | 特徴                    |
| --------------------- | ---------------------- | ----------------------- |
| `historyStorage.js`   | localStorage との連携  | エラーハンドリング付き  |
| `DuplicateChecker.js` | 重複判定とエントリ生成 | クラス + ファクトリ関数 |

**データフロー：**

```
localStorage ← → historyStorage (get/save)

DuplicateChecker で重複判定
createHistoryEntry で エントリ生成 { path, timestamp }
```

---

### `historyStorage.js`

- **役割：** ブラウザの localStorage に履歴を保存・読み込みする

```javascript
// 履歴を localStorage から取得
getHistoryFromStorage();
// もし localStorage に 'appHistory' があれば JSON.parse して返す
// なければ空配列を返す

// 履歴を localStorage に保存
saveHistoryToStorage(history);
// history を JSON.stringify して localStorage に保存
// 失敗時はコンソールにエラー出力（スロー出さない）
```

**何故この設計？**

- localStorage に保存することで、ブラウザを閉じても履歴が**消えない**
- ページリロード後も前回の履歴を復元できる
- エラーが出てもアプリがクラッシュしないように try-catch

---

### `DuplicateChecker.js`

- **役割：** 同じページへの重複アクセスを判定

```javascript
class DuplicateChecker {
  isDuplicate(path, key) {
    // 同じ path と key で、120ms 以内なら「重複」と判定
    // 例：ユーザーが素早く同じリンクを2回クリック → 1回だけ記録
  }

  update(path, key) {
    // 「今このページにアクセスした」という情報を記録
    // 次の isDuplicate() の判定に使われる
  }

  reset() {
    // 判定情報をクリア（リセット時に呼ぶべき）
  }
}

function createHistoryEntry(path) {
  // { path: '/home', timestamp: 1703429304000 } を作成
  // この形式で localStorage に保存される
}
```

## Layer 2: Manager Hook（hooks/useHistoryManager.js）

- **役割：** Layer 2 のフックを組み合わせて、完全な API を提供
- **返り値：** 完全な履歴管理 API

```javascript
export function useHistoryManager() {
  const { history, setHistory } = useHistoryState();
  const addHistory = useAddHistory(setHistory);
  const setHistoryWrapper = useSetHistory(setHistory);
  const resetHistory = useResetHistory(setHistory);

  return {
    history,
    addHistory,
    setHistory: setHistoryWrapper,
    resetHistory,
  };
}
```

---

### Layer 3: Composite Hooks（hooks/composites/\*）

- **useHistoryState:** localStorage から初期化し、state と setHistory を提供
- **useAddHistory:** DuplicateChecker で重複判定しつつ履歴を追加、保存
- **useSetHistory:** 任意の配列を state と localStorage に反映
- **useResetHistory:** state と localStorage を空配列にする（※
  DuplicateChecker.reset は未連携で Issue）

---

### Layer 4: Context Provider（contexts/HistoryProvider.jsx）

**役割：** Manager Hook の値を Context で配信

```javascript
export default function HistoryProvider({ children }) {
  const { history, addHistory, setHistory, resetHistory } = useHistoryManager();

  return (
    <HistoryContext.Provider
      value={{ history, addHistory, setHistory, resetHistory }}
    >
      {children}
    </HistoryContext.Provider>
  );
}
```

---

### Layer 5: Public Hook（hooks/useHistory.js）

**役割：** コンポーネントが Context から value を取得するための
**唯一のエントリーポイント**

```javascript
export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
```

**特徴：** Error handling 付き（Provider外で使用すると throw）

---

### Layer 6: Observer（observers/Tracker.jsx）

**役割：** ページ遷移を監視して自動で履歴を記録

```javascript
export default function Tracker() {
  const location = useLocation();
  const { addHistory } = useHistory();

  useEffect(() => {
    addHistory(location.pathname, location.key);
  }, [location.pathname, location.key, addHistory]);

  return null; // UI なし
}
```

**流れ：**

1. `useLocation()` でページパスを取得
2. `useHistory()` で addHistory を取得
3. パス変更時に自動で `addHistory()` を呼び出し

---

## データフロー（全体）

### 初期ロード時

```
[Browser]
  ↓ URL: /home
[Router]
  ↓ render
[DefaultLayout]
  ├─ [Tracker]
  │   ├─ useLocation() → '/home'
  │   ├─ useHistory() → { addHistory, ... }
  │   ├─ useEffect → addHistory('/home')
  │   └─ HistoryProvider → setHistory([...])
  │       └─ saveHistoryToStorage([...])
  │
  └─ [History]
      ├─ useHistory() → { history: [{ path: '/home' }] }
      └─ render history list
```

### ページ遷移時

```
[User click link]
  ↓
[Router] → URL changed to /about
  ↓
[useLocation()] → location.pathname = '/about'
  ↓
[Tracker useEffect] → dependency changed
  ↓
[addHistory('/about')]
  ├─ DuplicateChecker.isDuplicate() → false
  ├─ DuplicateChecker.update()
  ├─ setHistory([...old, { path: '/about' }])
  └─ saveHistoryToStorage([...])
      ↓
[History component] → re-render with new history
```

### リセット時

```
[User click reset button]
  ↓
[History.jsx] → onClick={resetHistory}
  ↓
[resetHistory()]
  ├─ setHistory([])
  ├─ saveHistoryToStorage([])
  └─ ❌ DuplicateChecker.reset() されない ← BUG
      ↓
[History component] → history-empty 表示
  ↓
[ユーザーは同じページに留まる]
  ↓
[Tracker useEffect] → pathname 変わらず → addHistory 呼ばれない ← BUG
```

---

## 主要な判定・チェック

### DuplicateChecker

**目的：** StrictMode や初期化時の重複を除外

```javascript
isDuplicate(path, key) {
  const isSamePath = this.lastPath === path;
  const isSameKey = this.lastKey === key;
  const withinWindow = now - this.lastTime < 120; // 120ms 以内

  return isSamePath && isSameKey && withinWindow;
}
```

**問題：** リセット時に `reset()` が呼ばれないため、古い情報を保持し続ける

---

## Context Value の詳細

### HistoryContext 値

```javascript
{
  history: Array<{
    path: string,        // '/home'
    timestamp: number    // Date.now()
  }>,

  addHistory: Function(path: string, key?: string) -> void,
    // 履歴を追加（重複チェック込み）

  setHistory: Function(newHistory: Array) -> void,
    // 履歴を直接設定（通常は使わない）

  resetHistory: Function() -> void,
    // 履歴をリセット
}
```

---

## 実装の特徴

### Good Points

1. **責務の明確な分離**
   - utils = 純粋関数
   - hooks = React 特有
   - Context = グローバル配信

2. **層の適切な階層化**
   - composites/ で細かい実装
   - manager で統合
   - Context Provider で配信

3. **error handling**
   - useHistory で Provider 外エラー検出
   - localStorage のエラーハンドリング

4. **localStorage 連携**
   - リロード後も履歴が保持される

5. **自動追跡**
   - Tracker で自動的にページ遷移を記録

### Issues（現状と改善提案）

1. **リセット後の挙動と DuplicateChecker の連携**

- 現状: `useResetHistory` は `setHistory([])` と `saveHistoryToStorage([])`
  のみで、`DuplicateChecker.reset()` を呼ばない。
- 影響: 直後に同一パス・同一キーで 120ms 以内に再遷移した場合、重複判定により記録されない可能性あり。なお、リセット直後に同ページに留まる場合は遷移イベントがないため
  `Tracker` が再記録しないのは仕様。
- 提案: `useResetHistory` に `duplicateCheckerRef` を渡して `reset()`
  を呼ぶ、または「リセット後に現在ページを再記録する」明示的な UI/仕様を追加。

2. **CSS 構造の改善余地**（Issue 03）

- 現状: 色・間隔のハードコード、命名規則の不統一、変数未使用。
- 提案:
  CSS 変数の導入、ファイル分割の整理（reset/base/variables 等）、BEM 準拠の命名への統一、レスポンシブ対応の追加。

3. **localStorage 例外ハンドリングの拡充**

- 現状: 保存失敗時はログ出力のみ。
- 提案: ユーザ通知、フォールバック（メモリのみ運用）、容量監視の追加。

4. **マルチタブ同期仕様の検討**

- 現状: タブごとに独立した履歴を保持（仕様）。同期は未対応。
- 提案: 要件次第で同期戦略（BroadcastChannel など）の導入を検討。

---

## 今後の改善予定（Step別）

| Step   | 内容                      | Issue             |
| ------ | ------------------------- | ----------------- |
| step01 | 基本機能実装（現在）      | Wiki 02, Issue 03 |
| step02 | DuplicateChecker 同期修正 | Wiki 02           |
| step03 | CSS リファクタ            | Issue 03          |
| step04 | エラーハンドリング拡充    | TBD               |
| step05 | テスト実装                | TBD               |

---

## 総括

**step01 では以下が完成：**

- 履歴管理の基本機能（追加・リセット）
- localStorage との同期
- Context によるグローバル状態管理
- 自動追跡（Tracker）
- UI（Header, Footer, History）

**既知の問題：**

- リセット後の重複チェッカー同期ズレ
- CSS の統一性不足

**次ステップ：** Wiki 02 の修繕を実施予定

---

## 深掘り解説

### useHistory() の使い方（コンポーネント視点）

#### 例1: 履歴を表示したい場合

```javascript
// components/History.jsx
import { useHistory } from '../hooks/useHistory';

export default function History() {
  const { history } = useHistory(); // Context から履歴配列を取得

  return (
    <ul>
      {history.map((item, i) => (
        <li key={i}>
          {item.path} at {new Date(item.timestamp).toLocaleTimeString()}
        </li>
      ))}
    </ul>
  );
}
```

**ここで何が起きているか：**

1. `useHistory()` を呼び出す
2. Context から `{ history, addHistory, setHistory, resetHistory }` を取得
3. 履歴配列の長さが変わると自動で再レンダリング
4. 画面に最新の履歴を表示

#### 例2: リセットボタンを作りたい場合

```javascript
export default function History() {
  const { history, resetHistory } = useHistory();

  return (
    <>
      <div>
        {history.map((item) => (
          <span key={item.timestamp}>{item.path}</span>
        ))}
      </div>
      <button onClick={resetHistory}>履歴をリセット</button>
    </>
  );
}
```

**ボタン処理の流れ：**

```
ユーザーが「履歴をリセット」をクリック
  ↓
resetHistory() 実行
  ├─ setHistory([]) ← state を空に
  ├─ saveHistoryToStorage([]) ← localStorage も空に
  └─ (⚠️ DuplicateChecker.reset() されない！)
  ↓
history が [] に変わる
  ↓
このコンポーネント自動再レンダリング（history が変わったため）
  ↓
「まだ履歴がありません」 表示
```

#### 例3: 手動で履歴を追加したい場合

```javascript
export default function MyComponent() {
  const { addHistory } = useHistory();

  const handleCustomAction = () => {
    addHistory('/custom-page', 'unique-key');
  };

  return <button onClick={handleCustomAction}>カスタムアクション</button>;
}
```

---

### localStorage との同期について

#### localStorage に何が保存されるのか？

```javascript
// localStorage 内のデータ

// キー: "appHistory"
// 値: JSON 文字列
[
  {
    path: '/home',
    timestamp: 1703429304000,
  },
  {
    path: '/about',
    timestamp: 1703429320500,
  },
  {
    path: '/contact',
    timestamp: 1703429335100,
  },
];
```

#### リロード後の流れ

```
1. ページをリロード
   ↓
2. App.jsx → HistoryProvider マウント
   ↓
3. useHistoryManager() 実行
   ↓
4. useHistoryState() で：
   getHistoryFromStorage()  ← localStorage から復元！
   ↓
5. state に [{ path: "/home", ... }, { path: "/about", ... }] が入る
   ↓
6. History コンポーネントが自動的に表示
```

**重要：**
localStorage に保存されているので、ブラウザを閉じても、1週間後にアクセスしても履歴が残ります！

---

### Tracker がどう動くのか（詳しく）

```javascript
// src/observers/Tracker.jsx
import { useLocation } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';

export default function Tracker() {
  const location = useLocation(); // React Router から現在地を取得
  const { addHistory } = useHistory(); // Context から addHistory を取得

  // ページが遷移するたびにこの effect が実行される
  useEffect(() => {
    addHistory(location.pathname, location.key);
  }, [location.pathname, location.key, addHistory]); // 依存関係

  return null; // UI を持たないコンポーネント
}
```

#### Tracker がいる場所

```
DefaultLayout（すべてのページ）
  ├─ <Tracker />  ← ここ！ 常に監視中
  ├─ Header
  ├─ Main
  └─ Footer
```

#### Tracker の動き（ステップバイステップ）

```
【初回ロード】
URL: http://example.com/home
  ↓
DefaultLayout マウント
  ↓
Tracker マウント
  ↓
useEffect のdependency 初期化
  ↓
location.pathname = "/home"
  ↓
effect 実行：addHistory("/home", "key-abc123")
  ↓
DuplicateChecker → 初回なので「重複」ではない
  ↓
history に追加される ✓

【ユーザーが「About」をクリック】
Router が動作：URL → /about
  ↓
location オブジェクト変更
  ↓
Tracker の useEffect：「location.pathname が変わった！」と検知
  ↓
effect 再実行：addHistory("/about", "key-def456")
  ↓
DuplicateChecker → 前は /home だったので「重複」ではない
  ↓
history に "/about" が追加される ✓

【ユーザーが「About」ボタンをもう1回クリック】
Router が動作：URL は /about のまま
  ↓
location オブジェクト... 実は「key」が変わる（React Router の仕様）
  ↓
Tracker の useEffect：「location.key が変わった！」と検知
  ↓
effect 再実行：addHistory("/about", "key-ghi789")
  ↓
DuplicateChecker → 前は "key-def456"、今は "key-ghi789" → 「重複」ではない
  ↓
history に "/about" が2回追加される ✓
```

**Tracker がなかったら：**
ユーザーが何をしても、誰も addHistory() を呼ばないので履歴に何も記録されません。だからどのページにも Tracker を配置する必要があるんです。

---

### よくある疑問

#### Q1: なぜ useRef で duplicateCheckerRef を保持しているのか？

```javascript
const duplicateCheckerRef = useRef(createDuplicateChecker());
// useRef ではなく useState では駄目？
```

**答え：**

- useRef は値が変わっても再レンダリングしない
- 重複チェッカーは「状態」ではなく、「ツール」だから
- useState だと、checker が変わるたびに全コンポーネントが再レンダリングされて無駄

#### Q2: localStorage がいっぱいになったらどうなる？

**答え：**
現在は catch で無視されるため、新しい履歴が保存されません。（Issue として future で改善予定）

#### Q3: 複数タブでアクセスしたらどうなる？

**答え：**
複数タブは独立した Context を持つので、各タブで独立した履歴を管理します。1つのタブでリセットしても他のタブには影響ありません。

#### Q4: useCallback の dependency に setHistory を指定するのはなぜ？

**答え：**
setHistory が変わる可能性があるため（通常はありませんが、依存関係を正確にするため）。もし忘れると、古い setHistory を使い続ける可能性があります。

---

### まとめ（初心者向け）

| 概念                 | 説明                               | 例                                    |
| -------------------- | ---------------------------------- | ------------------------------------- |
| **履歴**             | ユーザーが訪れたページの記録       | `/home`, `/about`, `/contact`         |
| **localStorage**     | ブラウザのローカルストレージ       | ブラウザ再開後も消えない              |
| **Context**          | 全コンポーネントで共有できるデータ | HistoryContext で history を共有      |
| **Tracker**          | ページ遷移を監視するコンポーネント | 自動で addHistory を呼ぶ              |
| **DuplicateChecker** | 重複を判定するツール               | 同じページの連続アクセスを1回だけ記録 |
| **useHistory()**     | 履歴にアクセスするフック           | `const { history } = useHistory()`    |
