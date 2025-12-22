# スタイルシステムの詳細

## 概要

このアプリケーションのスタイルは、機能別に整理されたCSSファイルで構成されています。
Flexboxを活用した全画面レイアウト、WebKit/Firefox両対応のスクロールバーカスタマイズが特徴です。

---

## ディレクトリ構造

```
src/styles/
├── global/
│   ├── reset.css          # ブラウザデフォルトのリセット
│   └── index.css          # グローバルスタイル（フォント、背景など）
├── components/
│   ├── header.css         # ヘッダースタイル
│   ├── footer.css         # フッタースタイル
│   └── history.css        # 履歴リストスタイル
├── layouts/
│   └── default-layout.css # レイアウト全体（Flexbox構成）
└── pages/
    └── app-shell.css      # ページタイトルスタイル
```

---

## グローバルスタイル

**ファイル**: `src/styles/global/`

### reset.css

ブラウザのデフォルトスタイルを統一：

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}
```

### index.css

アプリケーション全体に適用する基本スタイル。
ここでフォントファミリー、背景色、基本テキスト色を設定します。

---

## レイアウトシステム

**ファイル**: `src/styles/layouts/default-layout.css`

### 全体構造（Flexbox）

```
.app-shell (height: 100vh)
├── .site-header (flex: 0 0 auto)
├── .app-shell__main (flex: 1)
│   ├── .app-shell__title (flex: 0 0 auto)
│   └── .app-shell__history (flex: 1)
│       └── .history-container (flex: 1, overflow-y: auto)
└── .site-footer (flex: 0 0 auto)
```

### 主要クラス

#### `.app-shell`

```css
.app-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

- **役割** - 画面全体を100vh固定で埋める
- **子要素** - ヘッダー、メイン、フッター
- **スクロール** - `overflow: hidden` で外側スクロールを防止

#### `.app-shell__main`

```css
.app-shell__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0;
  overflow: hidden;
}
```

- **役割** - ヘッダーとフッターの間のスペースを埋める
- **中央配置** - `align-items: center` でコンテンツを横中央に配置
- **min-height: 0** - flex子要素の高さ計算を正しく行うために必須

#### `.app-shell__history`

```css
.app-shell__history {
  flex: 1;
  width: 600px;
  margin: 0.5rem;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

- **役割** - タイトル下の履歴コンテナ領域
- **幅固定** - `width: 600px` で常に一定幅を保持
- **flex: 1** - 利用可能なスペースを埋める
- **min-height: 0** - 子要素（.history-container）の高さ計算を正しく行う

---

## コンポーネントスタイル

### Header（header.css）

```css
.site-header {
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #d6deee;
  background-color: #f3f3f3;
}

.nav {
  display: flex;
  gap: 20px;
  background-color: #d0e9fe;
  border: 1px solid rgb(89, 230, 255);
  border-radius: 10px;
  padding: 12px;
}

.nav a {
  text-decoration: none;
  color: #334155;
}

.nav a.active {
  font-weight: 600;
  color: #0f172a;
}

.nav a:hover,
.nav a:focus-visible {
  color: rgb(9, 45, 224);
  text-decoration: underline;
}
```

**特徴**:
- Flexboxで横並び配置
- NavLink の `active` クラスで現在ページを強調表示
- Hover時は青色 + 下線

### Footer（footer.css）

```css
.site-footer {
  border-top: 1px solid #d6deee;
  padding: 20px 0;
  text-align: center;
  font-size: 0.8rem;
  color: #64748b;
  background-color: #f3f3f3;
}
```

**特徴**:
- `flex: 0 0 auto` で常に固定高さ
- テキスト中央寄せ、グレーテキスト

### History（history.css）

#### `.history-container`

```css
.history-container {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #c7d9fc;
  padding: 6px 12px;
  background-color: #e9f4f8cd;
}
```

**スクロールバー（WebKit対応）**:

```css
.history-container::-webkit-scrollbar {
  width: 10px;
}

.history-container::-webkit-scrollbar-track {
  background: #e9f4f8;
}

.history-container::-webkit-scrollbar-thumb {
  background-color: #94a3b8;
  border-radius: 5px;
}

.history-container::-webkit-scrollbar-thumb:hover {
  background-color: #64748b;
}
```

**スクロールバー（Firefox対応）**:

```css
.history-container {
  scrollbar-color: #94a3b8 #e9f4f8;
  scrollbar-width: thin;
}
```

#### `.history-item`

```css
.history-item {
  margin: 3px;
  user-select: none;
}

.history-item:hover,
.history-item:focus {
  display: block;
  color: rgb(9, 45, 224);
  background-color: #d0daed;
  border-bottom: 1px solid rgb(82, 15, 237);
  margin: 2px;
}

.history-item:hover .history-name {
  text-decoration: underline;
}
```

**特徴**:
- `user-select: none` - テキスト選択を無効化
- Hover時: 背景色が変わり、下線が表示される
- `margin` が変更されるが、レイアウトシフトは最小限

#### `.history-name` と `.history-time`

```css
.history-name {
  font-size: 1rem;
  padding: 2px 0;
  display: inline-block;
  width: 4.5rem;
  text-align: center;
}

.history-time {
  font-size: 0.85rem;
}
```

**特徴**:
- `.history-name` は固定幅（4.5rem）でページパスを表示
- `.history-time` はより小さいフォントで時刻を表示

---

## 色彩設計

### プライマリカラー

- **青系**: `#d0e9fe`（背景）、`rgb(9, 45, 224)`（アクティブ）、`#0f172a`（濃い青）
- **グレー**: `#64748b`（テキスト）、`#f3f3f3`（背景）
- **ボーダー**: `#d6deee`、`#c7d9fc`

### 背景色

- **ヘッダー/フッター**: `#f3f3f3`（白グレー）
- **履歴コンテナ**: `#e9f4f8cd`（薄い青、半透明）
- **履歴Hover**: `#d0daed`（濃い薄青）

---

## レスポンシブ対応

### 現在の制約

- `.app-shell__history` は固定幅（600px）で設定
- モバイルデバイスでは見切れる可能性あり

### 改善案

```css
@media (max-width: 768px) {
  .app-shell__history {
    width: 100%;
    max-width: 600px;
    padding: 0 10px;
  }
}
```

---

## パフォーマンス最適化

### flexbox の活用

- `flex: 1` と `flex: 0 0 auto` で明示的なレイアウト制御
- `min-height: 0` で不要な再計算を防止

### スクロール最適化

- `overflow-y: auto` で必要な場合のみスクロールバー表示
- スクロール可能領域を明確に区切り、パフォーマンス向上

---

## カスタマイズ例

### 履歴コンテナのサイズ変更

```css
.app-shell__history {
  width: 500px;  /* 幅を変更 */
  /* または */
  width: 100%;
  max-width: 500px;  /* 最大幅を設定 */
}
```

### 色配色の変更

```css
.history-container {
  background-color: #fff;  /* 白背景に変更 */
  border: 1px solid #ccc;
}

.history-item:hover {
  background-color: #f0f0f0;  /* グレーハイライト */
  color: #333;
}
```

### スクロールバーの非表示

```css
.history-container {
  overflow-y: scroll;  /* 常に表示 */
  scrollbar-width: none;  /* Firefox */
}

.history-container::-webkit-scrollbar {
  display: none;  /* Chrome */
}
```

---

## トラブルシューティング

### 履歴がページを飛び出す

**原因**: `.app-shell__history` に `min-height: 0` がない

**解決**:

```css
.app-shell__history {
  min-height: 0;  /* 追加 */
}
```

### スクロールバーが見えない

**原因**: Firefox で `scrollbar-color` が設定されていない

**解決**:

```css
.history-container {
  scrollbar-color: #94a3b8 #e9f4f8;  /* 追加 */
  scrollbar-width: thin;
}
```

### 中央配置がされていない

**原因**: `.app-shell__main` に `align-items: center` がない

**解決**:

```css
.app-shell__main {
  align-items: center;  /* 追加 */
}
```
