# ページ構造の詳細

## 全体構成

このアプリケーションは、React Router v7 を使用したシングルページアプリケーション（SPA）です。
すべてのルートが同じレイアウト（BaseLayout）を表示し、ページ固有のコンテンツは持たず、
ナビゲーション履歴を記録・表示することに特化しています。

---

## ルーティング構造

**ファイル**: [src/router/Routes.jsx](../../src/router/Routes.jsx)

```jsx
export const router = createBrowserRouter([
  {
    path: "*",
    element: <BaseLayout />,
  },
]);
```

### 特徴

- **ワイルドカード `path: "*"`** を使用し、すべてのパスを BaseLayout にマッピング
- 個別のページコンポーネントは存在しない（pages/ ディレクトリは削除済み）
- `children` ルートなし（Outlet を使用しない設計）

---

## レイアウト構造

**ファイル**: [src/layouts/BaseLayout.jsx](../../src/layouts/BaseLayout.jsx)

### レンダリング順序（上から下）

1. **Tracker** - ルート変更を監視し、HistoryProvider に記録
2. **Header** - ナビゲーションリンク（pages.json から動的生成）
3. **base-content** (div)
   - **base-content\_\_title** (div) - 現在のページタイトル（h1）
   - **base-content\_\_body** (div) - History コンポーネント
4. **Footer** - フッター表示

### コード構造

```jsx
export default function BaseLayout() {
  const location = useLocation();
  const currentPage = pages.find((p) => p.path === location.pathname);
  const title = currentPage?.title || "Page";

  return (
    <>
      <Tracker />
      <Header />
      <div className="base-content">
        <div className="base-content__title">
          <h1>{title}</h1>
        </div>
        <div className="base-content__body">
          <History />
        </div>
      </div>
      <Footer />
    </>
  );
}
```

### タイトルの決定ロジック

- `useLocation()` で現在のパスを取得
- `pages.json` から一致する `path` を検索
- 該当する `title` を表示（デフォルトは "Page"）

---

## ナビゲーションデータ

**ファイル**: [src/data/pages.json](../../src/data/pages.json)

```json
[
  { "path": "/", "component": "Top", "title": "Top" },
  { "path": "/about", "component": "About", "title": "About" },
  { "path": "/contact", "component": "Contact", "title": "Contact" },
  { "path": "/news", "component": "News", "title": "News" }
]
```

### 使用箇所

1. **Header.jsx** - NavLink の生成に使用
2. **BaseLayout.jsx** - タイトル表示に使用

### 注意点

- `component` フィールドは現在**未使用**
- ページ固有のコンポーネントが存在しないため、このフィールドは削除可能

---

## Header コンポーネント

**ファイル**: [src/components/Header.jsx](../../src/components/Header.jsx)

### 実装

```jsx
export default function Header() {
  return (
    <header className="site-header">
      <nav className="nav">
        {pages.map((page) => (
          <NavLink key={page.path} to={page.path} end={page.path === "/"}>
            {page.title}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
```

### 動作

- `pages.json` を読み込み、各エントリーを `NavLink` に変換
- `end` プロパティは `/` のみに適用（完全一致を要求）
- ナビゲーション追加時は `pages.json` を編集するだけで反映

---

## History コンポーネント

**ファイル**: [src/components/History.jsx](../../src/components/History.jsx)

### 役割

- HistoryProvider から履歴データを取得
- 訪問したパスとタイムスタンプをリスト表示
- スクロール可能な領域に配置

### 特徴

- BaseLayout 内に直接配置されているため、ページ遷移時も**再マウントされない**
- スクロール位置が保持される

---

## Tracker コンポーネント

**ファイル**: [src/observers/Tracker.jsx](../../src/observers/Tracker.jsx)

### 役割

- `useLocation()` でルート変更を監視
- `location.pathname` と `location.key` を HistoryProvider に送信
- 重複防止ロジック（120ms ウィンドウ + location.key 比較）

---

## 表示フロー

```
ユーザーがリンクをクリック
  ↓
React Router がルート変更を処理
  ↓
Tracker が変更を検知
  ↓
HistoryProvider に記録
  ↓
BaseLayout が再レンダリング（タイトル更新）
  ↓
History コンポーネントが更新された履歴を表示
```

---

## 設計上の特徴

### シンプルさ

- ページ固有のコンテンツなし（Header、Title、History、Footer のみ）
- `pages.json` 一元管理（ルート、タイトル、ナビゲーション）
- 最小限のコンポーネント構成

### スケーラビリティ

- 新しいルート追加は `pages.json` に 1 エントリー追加するだけ
- コードの変更不要

### パフォーマンス

- History が再マウントされないため、スクロール位置が保持される
- 不要な再レンダリングを回避

---

## 今後の拡張可能性

1. **ページコンテンツの追加**
   - `<Outlet />` を復活させ、`pages.json` の `component` フィールドを活用

2. **履歴のフィルタリング**
   - ページごとの履歴表示、検索機能など

3. **永続化**
   - localStorage に履歴を保存し、リロード後も復元
