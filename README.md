# React History JS

ページアクセス履歴を管理・表示するReactアプリケーションです。訪問したページの履歴をコンテキストで管理し、時系列で表示します。

## 機能

- **ページ履歴の自動記録** - ページ遷移時に自動的に履歴が記録されます
- **履歴の表示** - 訪問したページをパスと訪問時刻とともに表示
- **重複排除** - StrictMode時の二重発火やリロード直後の重複を除外
- **全画面レイアウト** - ヘッダー・メイン・履歴・フッターを画面内に整理

## 技術スタック

- **React** 19.2.0
- **React Router** 7.11.0
- **Vite** 7.2.4
- **CSS** - ネイティブCSS（WebKit/Firefox両対応）
- **デプロイ** - Vercel

## セットアップ

### インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます

### ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

## デプロイ（Vercel）

### 方法1: Vercel CLI でデプロイ

```bash
npm install -g vercel
vercel --prod
```

### 方法2: GitHub 連携でデプロイ

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. 「Add New」 → 「Project」をクリック
3. GitHubリポジトリを選択
4. フレームワーク: **Vite** を選択
5. 「Deploy」をクリック

デプロイ完了後、`https://your-project-name.vercel.app` でアクセス可能です。

## プロジェクト構造

### ソースコード

```
src/
├── app/              # メインアプリケーション
├── components/       # React コンポーネント
│   ├── Header.jsx    # ナビゲーションヘッダー
│   ├── Footer.jsx    # フッター
│   └── History.jsx   # 履歴表示コンポーネント
├── contexts/         # React Context
│   ├── HistoryContext.jsx     # コンテキスト定義
│   └── HistoryProvider.jsx    # 状態管理
├── hooks/            # カスタムフック
│   └── useHistory.js # 履歴フック
├── layouts/          # レイアウトコンポーネント
│   └── DefaultLayout.jsx
├── observers/        # 監視・トラッキング
│   └── Tracker.jsx   # ルート変更監視
├── router/           # ルーティング設定
│   └── Routes.jsx
├── styles/           # CSS スタイル
│   ├── components/   # コンポーネントスタイル
│   ├── layouts/      # レイアウトスタイル
│   ├── pages/        # ページスタイル
│   └── global/       # グローバルスタイル
├── data/
│   └── pages.json    # ナビゲーションデータ
└── main.jsx          # エントリーポイント
```

### スタイルディレクトリ

```
src/styles/
├── global/
│   ├── reset.css          # ブラウザデフォルトリセット
│   └── index.css          # グローバルスタイル
├── components/
│   ├── header.css         # ヘッダースタイル
│   ├── footer.css         # フッタースタイル
│   └── history.css        # 履歴リストスタイル
├── layouts/
│   └── default-layout.css # Flexboxレイアウト
└── pages/
    └── app-shell.css      # ページタイトルスタイル
```

## ページ構造の詳細

### 全体構成

このアプリケーションは、React Router v7 を使用したシングルページアプリケーション（SPA）です。
すべてのルートが同じレイアウト（DefaultLayout）を表示します。

### ルーティング構造

```jsx
export const router = createBrowserRouter([
  {
    path: "*",
    element: <DefaultLayout />,
  },
]);
```

**特徴**:

- **ワイルドカード `path: "*"`** ですべてのパスをマッピング
- 個別のページコンポーネントなし
- `<Outlet />` を使用しない設計

### レンダリング順序（上から下）

1. **Tracker** - ルート変更を監視し、履歴に記録
2. **Header** - ナビゲーションリンク（pages.json から動的生成）
3. **app-shell\_\_main**
   - **app-shell\_\_title** - 現在のページタイトル
   - **app-shell\_\_history** - History コンポーネント（スクロール可能）
4. **Footer** - フッター表示

### タイトルの決定ロジック

```jsx
const currentPage = pages.find((p) => p.path === location.pathname);
const title = currentPage?.title || "Page";
```

`pages.json` から現在のパスに対応するタイトルを取得・表示します。

### ナビゲーションデータ（pages.json）

```json
[
  { "path": "/", "component": "Top", "title": "Top" },
  { "path": "/about", "component": "About", "title": "About" },
  { "path": "/contact", "component": "Contact", "title": "Contact" },
  { "path": "/news", "component": "News", "title": "News" }
]
```

**使用箇所**:

- **Header.jsx** - NavLink の生成
- **DefaultLayout.jsx** - タイトル表示

新しいルート追加は `pages.json` にエントリーを追加するだけで反映されます。

## コンポーネント詳細

### Tracker（src/observers/Tracker.jsx）

ページ遷移を監視し、`useHistory` で履歴を記録します。

```jsx
const { addHistory } = useHistory();
const { pathname, key } = useLocation();

useEffect(() => {
  addHistory(pathname, key);
}, [pathname, key, addHistory]);
```

### History（src/components/History.jsx）

履歴コンテキストから取得した履歴データをリスト表示します。

**構造**:

- `className="history-item"` - 各履歴アイテム
- `className="history-name"` - ページパス（幅固定4.5rem）
- `className="history-time"` - 訪問時刻

**特徴**:

- DefaultLayout内に直接配置されているため、再マウントされない
- スクロール位置が保持される
- Hover時に背景色が変わり、下線が表示される

### HistoryProvider（src/contexts/HistoryProvider.jsx）

履歴状態を一元管理するContext Provider。

**提供される関数**:

- `history` - 履歴配列
- `setHistory` - 履歴を直接更新
- `addHistory(path, key)` - 新しい履歴を追加

**重複排除ロジック**:

```javascript
const isSamePath = lastPathRef.current === path;
const isSameKey = lastKeyRef.current === key;
const withinWindow = now - lastTimeRef.current < 120;

if (isSamePath && isSameKey && withinWindow) {
  return; // 重複を除外
}
```

- 同一パス・同一キーで120ms以内は除外（StrictMode対策）
- 新しい navigation key での連打は許容

## スタイルシステム

### レイアウト構造（Flexbox）

```
.app-shell (height: 100vh)
├── .site-header (flex: 0 0 auto)
├── .app-shell__main (flex: 1)
│   ├── .app-shell__title (flex: 0 0 auto)
│   └── .app-shell__history (flex: 1)
│       └── .history-container (flex: 1, overflow-y: auto)
└── .site-footer (flex: 0 0 auto)
```

**重要なポイント**:

- `.app-shell` は `height: 100vh` で固定
- `.app-shell__main` は `flex: 1` で利用可能スペースを埋める
- `.app-shell__history` に `min-height: 0` 設定（flex計算を正しく行うため）
- `.history-container` は `overflow-y: auto` でスクロール制御

### コンポーネントスタイル

#### Header（header.css）

```css
.nav {
  display: flex;
  gap: 20px;
  background-color: #d0e9fe;
  border: 1px solid rgb(89, 230, 255);
  border-radius: 10px;
}

.nav a.active {
  font-weight: 600;
  color: #0f172a;
}

.nav a:hover {
  color: rgb(9, 45, 224);
  text-decoration: underline;
}
```

#### History（history.css）

**スクロールバー（WebKit対応）**:

```css
.history-container::-webkit-scrollbar {
  width: 10px;
}

.history-container::-webkit-scrollbar-thumb {
  background-color: #94a3b8;
  border-radius: 5px;
}
```

**スクロールバー（Firefox対応）**:

```css
.history-container {
  scrollbar-color: #94a3b8 #e9f4f8;
  scrollbar-width: thin;
}
```

**Hover効果**:

```css
.history-item:hover {
  background-color: #d0daed;
  border-bottom: 1px solid rgb(82, 15, 237);
}

.history-item:hover .history-name {
  text-decoration: underline;
}
```

### 色彩設計

- **プライマリ青**: `#d0e9fe`（背景）、`rgb(9, 45, 224)`（アクティブ）
- **テキスト**: `#334155`（通常）、`#0f172a`（濃い）
- **グレー**: `#64748b`、`#f3f3f3`（背景）

## 使用例

### 履歴の追加

```javascript
const { addHistory } = useHistory();

// ページ遷移時に自動で呼び出される
addHistory("/page-path", navigationKey);
```

### 履歴の取得

```javascript
const { history } = useHistory();

// 履歴配列を参照
history.forEach((item) => {
  console.log(item.path, item.timestamp);
});
```

### 履歴のクリア

```javascript
const { setHistory } = useHistory();

setHistory([]);
```

## 既知の制限

- 履歴はセッション中のみ保持されます（ローカルストレージ未対応）
- 履歴にはページパスと時刻のみ記録されます

## 今後の拡張可能性

1. **ページコンテンツの追加** - `<Outlet />` を復活させてページ固有のコンテンツを実装
2. **履歴のフィルタリング** - ページごとの履歴表示、検索機能など
3. **永続化** - localStorage に履歴を保存し、リロード後も復元
4. **分析機能** - 訪問パターンの分析など

## ブラウザ対応

- Chrome/Edge（WebKit scrollbar対応）
- Firefox（scrollbar-color/scrollbar-width対応）
- Safari（WebKit scrollbar対応）

## ライセンス

MIT

MIT
