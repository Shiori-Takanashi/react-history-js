# React History JS

ページアクセス履歴を管理・表示するReactアプリケーションです。訪問したページの履歴をコンテキストで管理し、時系列で表示します。

## 機能

- **ページ履歴の自動記録** - ページ遷移時に自動的に履歴が記録されます
- **履歴の表示** - 訪問したページをパスと訪問時刻とともに表示
- **重複排除** - StrictMode時の二重発火やリロード直後の重複を除外
- **レスポンシブレイアウト** - ヘッダー・メイン・履歴・フッターを画面内に整理

## 技術スタック

- **React** 19.2.0
- **React Router** 7.11.0
- **Vite** 7.2.4
- **CSS** - ネイティブCSS（WebKit/Firefox両対応）

## プロジェクト構造

```
src/
├── app/              # メインアプリケーション
├── components/       # React コンポーネント
│   ├── Header.jsx    # ヘッダー
│   ├── Footer.jsx    # フッター
│   └── History.jsx   # 履歴表示コンポーネント
├── contexts/         # React Context
│   ├── HistoryContext.jsx
│   └── HistoryProvider.jsx
├── hooks/            # カスタムフック
│   └── useHistory.js
├── layouts/          # レイアウトコンポーネント
│   └── DefaultLayout.jsx
├── observers/        # 監視・トラッキング
│   └── Tracker.jsx
├── router/           # ルーティング設定
│   └── Routes.jsx
├── styles/           # CSS スタイル
├── data/             # 静的データ
│   └── pages.json
└── main.jsx          # エントリーポイント
```

## 主要コンポーネント

### Tracker（src/observers/Tracker.jsx）

ページ遷移を監視し、`useHistory` フックで`addHistory`を呼び出して履歴を記録します。

```jsx
const { addHistory } = useHistory();
const { pathname, key } = useLocation();

useEffect(() => {
  addHistory(pathname, key);
}, [pathname, key, addHistory]);
```

### History（src/components/History.jsx）

履歴コンテキストから取得した履歴データをリスト表示します。

- `className="history-item"` - 各履歴アイテム
- `className="history-name"` - ページパス表示（幅固定）
- `className="history-time"` - 訪問時刻表示

### HistoryProvider（src/contexts/HistoryProvider.jsx）

履歴状態を一元管理するContext Provider。以下を提供：

- `history` - 履歴配列
- `setHistory` - 履歴を直接更新する関数
- `addHistory(path, key)` - 新しい履歴を追加する関数

## 使い方

### 履歴の追加

```javascript
const { addHistory } = useHistory();

// ページ遷移時に自動で呼び出される
addHistory('/page-path', navigationKey);
```

### 履歴の取得

```javascript
const { history } = useHistory();

// 履歴配列を参照
history.forEach(item => {
  console.log(item.path, item.timestamp);
});
```

### 履歴のクリア

```javascript
const { setHistory } = useHistory();

setHistory([]);
```

## スタイルのカスタマイズ

各コンポーネントのスタイルは `src/styles/components/` 配下にあります：

- `history.css` - 履歴リストのスタイル
- `header.css` - ヘッダーのスタイル
- `footer.css` - フッターのスタイル

レイアウトは `src/styles/layouts/default-layout.css` で定義されています。

## 既知の制限

- 履歴はセッション中のみ保持されます（ローカルストレージ未対応）
- 履歴にはページパスと時刻のみ記録されます

### 履歴管理（HistoryProvider）

`HistoryContext` を使用してアプリケーション全体で履歴を管理します。以下の重複排除ロジックを実装：

- 同一パス・同一キーで120ms以内の重複を除外（StrictMode対策）
- 新しいnavigation keyでの連打は許容

### 履歴の表示

`History` コンポーネントで訪問履歴を表示。以下の特徴：

- ページパスと訪問時刻を表示
- スクロール可能な固定高さコンテナ
- Hover時に下線とハイライト表示
- 空の場合は「まだ履歴がありません」と表示

### レイアウト

Flexboxを使用した全画面レイアウト：

- `.app-shell` - 100vh固定、ヘッダー・メイン・フッターを配置
- `.app-shell__main` - 残りスペースを埋める
- `.app-shell__history` - 履歴コンテナが固定幅で履歴をスクロール表示

## ブラウザ対応

- Chrome/Edge（WebKit scrollbar対応）
- Firefox（scrollbar-color/scrollbar-width対応）

## ライセンス

MIT
