# React History JS - ChatGPT向けプロジェクト詳細説明

## プロジェクト概要

React History
JSは、ユーザーのページ遷移履歴をリアルタイムで記録・表示するReactアプリケーションです。React
Router
v7を用いたモダンなSPA構成で、ページアクセスの自動検知、重複排除、永続化（localStorage）を実装しています。

### 目的

- ページ遷移パターンの可視化
- ユーザーナビゲーション体験の追跡
- React 19 + React Router v7の学習用デモアプリケーション

### 技術スタック

- **React**: 19.2.0 (最新版)
- **React Router**: 7.11.0 (v7系)
- **Vite**: 7.2.4 (ビルドツール)
- **スタイリング**: ネイティブCSS (カスタムプロパティ、Flexbox、Grid)
- **コード品質**: ESLint 9, Prettier 3, Stylelint 16, Husky 9
- **ホスティング**: Google Cloud Run (コンテナベース)

---

## アーキテクチャ詳細

### 1. ディレクトリ構造

```
src/
├── main.jsx                    # エントリーポイント
├── app/
│   ├── App.jsx                 # ルートコンポーネント (HistoryProvider + RouterProvider)
│   └── App.css
├── components/
│   ├── Header.jsx              # ヘッダー (ナビゲーションリンク)
│   ├── Footer.jsx              # フッター
│   └── History.jsx             # 履歴表示コンポーネント (スクロール可能リスト)
├── contexts/
│   ├── HistoryContext.jsx      # Context 定義 (createContext)
│   └── HistoryProvider.jsx     # Context Provider (useHistoryManager統合)
├── hooks/
│   ├── useHistory.js           # Consumer向けフック (useContext wrapper)
│   ├── useHistoryManager.js    # 履歴管理の統合フック (Provider用)
│   └── composites/
│       ├── useHistoryState.js      # State管理 (useState + localStorage初期化)
│       ├── useAddHistory.js        # 追加ロジック (重複チェック + 追加)
│       ├── useSetHistory.js        # 設定ロジック (履歴上書き + 保存)
│       └── useResetHistory.js      # リセットロジック (履歴クリア)
├── layouts/
│   ├── StandardLayout.jsx      # 標準レイアウト (Header + Main + History + Footer)
│   └── BareLayout.jsx          # 最小レイアウト (Tracker + Outlet のみ、404ページ用)
├── observers/
│   └── Tracker.jsx             # ルート変更監視コンポーネント (useLocation + useEffect)
├── pages/
│   ├── Loading.jsx             # ローディング画面
│   ├── NotFound.jsx            # 404ページ
│   └── ErrorPage.jsx           # エラーページ
├── router/
│   └── Routes.jsx              # React Router設定 (createBrowserRouter)
├── data/
│   └── pages.json              # ページ定義 (path + title)
├── utils/
│   ├── historyStorage.js       # localStorage操作ユーティリティ
│   ├── index.js                # ユーティリティエクスポート
│   └── models/
│       └── DuplicateChecker.js # 重複検出クラス (120ms窓内の同一path+key判定)
└── styles/
    ├── global/
    │   ├── index.css           # グローバルスタイル
    │   └── reset.css           # リセットCSS
    ├── components/             # コンポーネント別CSS
    ├── layouts/                # レイアウト別CSS
    │   └── standard-layout.css # StandardLayout専用スタイル
    └── pages/                  # ページ別CSS
```

### 2. データフロー

```
1. ページ遷移発生
   ↓
2. Tracker コンポーネント (useLocation監視)
   ↓ location.pathname, location.key の変化を検知
3. addHistory(pathname, key) 実行
   ↓
4. DuplicateChecker による重複チェック
   - 同一 path + key が 120ms 以内 → スキップ
   - それ以外 → 履歴に追加
   ↓
5. State 更新 (setHistory)
   ↓
6. localStorage に自動保存
   ↓
7. History コンポーネントが再レンダリング
   ↓
8. 履歴リスト表示更新
```

### 3. コンポーネント階層

```
App (HistoryProvider)
 └── RouterProvider (router)
      ├── StandardLayout (pages.jsonの全ページ)
      │    ├── Tracker (履歴記録)
      │    ├── Header (ナビゲーション)
      │    ├── main
      │    │    ├── タイトル (pages.jsonから取得)
      │    │    ├── Outlet (ページコンテンツ)
      │    │    └── History (履歴表示)
      │    └── Footer
      └── BareLayout (404ページ用)
           ├── Tracker
           └── Outlet (NotFound/Loading)
```

---

## 主要機能の実装詳細

### 1. 履歴管理システム (Context + Hooks)

#### HistoryContext + HistoryProvider

- **責務**: グローバルな履歴状態の提供
- **公開API**: `{ history, addHistory, setHistory, resetHistory }`
- **Consumer**: `useHistory()` フックで取得

#### useHistoryManager (統合フック)

4つの独立したフックを統合:

1. **useHistoryState**: useState + localStorage初期化
2. **useAddHistory**: 重複チェック付き追加ロジック
3. **useSetHistory**: 履歴上書き + localStorage保存
4. **useResetHistory**: 履歴クリア

### 2. 重複排除メカニズム

#### DuplicateChecker クラス

```javascript
// StrictMode二重発火、高速クリック、ブラウザバック対策
isDuplicate(path, key, window = 120) {
  const isSamePath = this.lastPath === path;
  const isSameKey = this.lastKey === key;  // React Router の navigation key
  const withinWindow = now - this.lastTime < window; // 120ms以内
  return isSamePath && isSameKey && withinWindow;
}
```

**対策するシナリオ**:

- React StrictMode の開発時二重マウント
- ブラウザバック/フォワードの重複発火
- 高速なページ遷移

### 3. ルーティング設計

#### Routes.jsx の構成

```javascript
const router = createBrowserRouter([
  // pages.json の全ページを StandardLayout で処理
  ...pages.map((page) => ({
    path: page.path, // /, /about, /contact, /news
    element: <StandardLayout />,
  })),
  // 404ページ等を BareLayout で処理
  {
    element: <BareLayout />,
    children: [
      { path: '/loading', element: <Loading /> },
      { path: '*', element: <NotFound /> }, // Fallback
    ],
  },
]);
```

#### pages.json

```json
[
  { "path": "/", "title": "Top" },
  { "path": "/about", "title": "About" },
  { "path": "/contact", "title": "Contact" },
  { "path": "/news", "title": "News" }
]
```

**メリット**:

- ページ追加は `pages.json` のみで完結
- StandardLayout でタイトルを動的に取得
- 設定ファイル駆動のルーティング

### 4. レイアウトシステム

#### StandardLayout (標準ページ用)

```jsx
<div className="app-shell">
  <Tracker />
  <Header />
  <main className="app-shell__main">
    <h1>{title}</h1> {/* pages.jsonから動的取得 */}
    <Outlet /> {/* ページコンテンツ */}
    <History /> {/* 履歴表示 */}
  </main>
  <Footer />
</div>
```

**CSS設計**:

- 100vh固定 (overflow hidden)
- Flexbox縦積み
- スクロールはHistoryコンポーネント内のみ

#### BareLayout (404ページ用)

```jsx
<>
  <Tracker />
  <Outlet /> {/* 最小限の構成 */}
</>
```

### 5. 永続化 (localStorage)

#### historyStorage.js

```javascript
const STORAGE_KEY = 'appHistory';

// 初期化時に自動読み込み (useHistoryState内)
getHistoryFromStorage() → JSON.parse(localStorage.getItem('appHistory'))

// 履歴更新時に自動保存 (useSetHistory内)
saveHistoryToStorage(history) → localStorage.setItem('appHistory', JSON.stringify(history))
```

**エラーハンドリング**:

- try-catch で localStorage例外をキャッチ
- 失敗時は console.error + 空配列返却/保存スキップ

---

## スタイリング戦略

### CSS設計方針

- **ネイティブCSS**: フレームワーク不使用
- **カスタムプロパティ**: 色、サイズの統一管理
- **BEM的命名**: コンポーネント別にスコープ
- **モジュール分割**: global / components / layouts / pages

### 主要なスタイル特徴

#### グローバル (index.css)

```css
:root {
  --primary-color: #007bff;
  --text-color: #333;
  --bg-color: #f5f5f5;
  /* ... */
}
```

#### スクロールバーカスタマイズ (WebKit/Firefox)

```css
.history-container {
  overflow-y: auto;
}

/* WebKit (Chrome, Safari) */
.history-container::-webkit-scrollbar {
  width: 8px;
}

/* Firefox */
.history-container {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}
```

#### レスポンシブ対応

- モバイル: 単列レイアウト
- タブレット/デスクトップ: 適宜拡大

---

## 開発ワークフロー

### スクリプト一覧

```bash
# 開発
npm run dev              # Vite開発サーバー起動 (HMR有効)

# ビルド
npm run build            # 本番ビルド (dist/生成)
npm run preview          # ビルド結果のプレビュー

# コード品質
npm run lint             # ESLint (自動修正なし)
npm run lint:fix         # ESLint (自動修正あり)
npm run stylelint        # Stylelint (CSS検証)
npm run stylelint:fix    # Stylelint (CSS自動修正)
npm run format           # Prettier (整形実行)
npm run format:check     # Prettier (整形チェックのみ)

# CI検証
npm run ci               # format:check → lint → stylelint → build
npm run ci:lint          # lint + stylelint
npm run ci:format        # format:check
```

### Git Hooks (Husky + lint-staged)

#### .husky/pre-commit

```bash
npx lint-staged  # ステージングされたファイルのみ検証
```

#### lint-staged設定

```json
{
  "*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "*.css": ["stylelint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

### 設定ファイル構成

```
config/
├── eslint.config.js       # ESLint設定 (Flat Config)
├── prettier.config.js     # Prettier設定
├── stylelint.config.js    # Stylelint設定
├── .prettierignore
└── .stylelintignore
```

---

## デプロイ戦略 (Google Cloud Run)

### アーキテクチャ

1. **GitHub Actions**: `.github/workflows/deploy.yml`
2. **Cloud Build**: ソースベースデプロイ
3. **Cloud Run**: コンテナ実行 + HTTPSエンドポイント

### デプロイフロー

```
1. GitHub (main push)
   ↓
2. GitHub Actions ワークフロー起動
   ↓
3. npm ci && npm run build (dist/生成)
   ↓
4. Cloud Run Source Deploy
   ↓ (Cloud Buildが自動でコンテナ化)
5. Nginx/Static File Server で dist/ を配信
   ↓
6. Cloud Run Service 起動 ($PORT 待ち受け)
   ↓
7. HTTPS URL で公開
```

### 環境変数 (GitHub Secrets)

- `GCP_PROJECT_ID`: GCPプロジェクトID
- `CLOUD_RUN_SERVICE`: サービス名 (例: react-history-js)
- `CLOUD_RUN_REGION`: リージョン (例: asia-northeast1)
- **認証**: Workload Identity (OIDC推奨) or サービスアカウント鍵

### vercel.json (リダイレクト設定)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

→ SPA用: すべてのパスを index.html にリライト

---

## 既知の制限と今後の拡張

### 現在の制限

1. **履歴件数制限なし**: localStorage制限到達の可能性
2. **ページコンテンツ固定**: Outlet内が空 (構造のみ)
3. **テストコード未実装**: Vitest/React Testing Library未導入
4. **エラーバウンダリ未実装**: 予期しないエラー時のフォールバック不足
5. **アクセシビリティ**: ARIA属性、キーボード操作の部分的対応

### 拡張案

- **履歴検索・フィルタ機能**: 日付、パス名での絞り込み
- **履歴エクスポート**: CSV/JSON形式でのダウンロード
- **アナリティクス統合**: 訪問パターンの可視化
- **ページコンテンツ拡充**: MDXやリモートコンテンツの読み込み
- **国際化 (i18n)**: 多言語対応
- **テーマ切替**: ダークモード対応

---

## コードガイドライン

### 命名規則

- **コンポーネント**: PascalCase (例: StandardLayout)
- **フック**: useXxx (例: useHistory)
- **ユーティリティ**: camelCase (例: getHistoryFromStorage)
- **定数**: UPPER_SNAKE_CASE (例: STORAGE_KEY)

### ファイル命名

- **コンポーネント**: `ComponentName.jsx`
- **フック**: `useHookName.js`
- **スタイル**: `component-name.css` (kebab-case)

### JSDoc推奨

- 関数/フックには説明コメントを付与
- パラメータ、返り値の型を記載

### インポート順序

1. React系
2. サードパーティライブラリ
3. プロジェクト内のコンポーネント/フック
4. スタイル

---

## トラブルシューティング

### よくある問題

#### 1. 履歴が重複して記録される

- **原因**: StrictMode二重マウント、ブラウザバック
- **対策**: DuplicateChecker の window 値調整 (デフォルト120ms)

#### 2. ビルド時のESLintエラー

- **原因**: 未使用変数、プラグインの設定ミス
- **対策**: `npm run lint:fix` 実行、設定ファイル確認

#### 3. Cloud Runデプロイ失敗

- **原因**: OIDC設定、権限不足
- **対策**: `docs/wiki/step01/deploy.md` の手順確認

#### 4. localStorageが保存されない

- **原因**: シークレットモード、容量制限
- **対策**: try-catch でエラーログ確認、Quotaチェック

---

## 参考資料

### プロジェクト内ドキュメント

- `docs/wiki/step01/about-all.md`: アーキテクチャ全体像
- `docs/wiki/step01/deploy.md`: デプロイ手順詳細
- `docs/review/step01/`: 各観点でのコードレビュー結果

### 外部リファレンス

- [React 19 公式ドキュメント](https://react.dev/)
- [React Router v7 ガイド](https://reactrouter.com/)
- [Vite ドキュメント](https://vitejs.dev/)
- [Google Cloud Run ドキュメント](https://cloud.google.com/run/docs)

---

## まとめ

このプロジェクトは以下の要素を統合した学習用アプリケーションです:

1. **モダンなReactパターン**: Hooks、Context、カスタムフック分離
2. **クリーンな設計**: 単一責任原則、関心の分離
3. **開発体験重視**: HMR、Linter、Formatter、Git Hooks
4. **本番運用可能**: コンテナデプロイ、CI/CD、永続化

コード全体が教育的な目的で構造化されており、各モジュールが明確な責務を持っています。拡張や改善の余地を残しつつ、コアな機能は完成している状態です。

---

**最終更新**: 2025年12月26日 **バージョン**: 0.1.0 **ライセンス**: Private
(package.json指定)
