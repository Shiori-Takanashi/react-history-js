# Issue 03: CSS 全体の構造と一貫性の問題

## 問題概要

CSS ファイル全体に以下の問題が存在し、保守性とスケーラビリティが低下している。

---

## 具体的な問題点

### 1. **色の定義が散在している（デザイン変数の欠落）**

**例：**

```css
/* history.css */
border: 1px solid #c7d9fc;
background-color: #e9f4f8cd;

/* history.css の reset ボタン */
background-color: #ff6b6b;

/* footer.css */
border-top: 1px solid #d6deee;
color: #64748b;
```

**問題：**

- ✗ 色コードが複数ファイルに分散
- ✗ 同じような色が異なるコード値で定義（#c7d9fc vs #d6deee）
- ✗ デザイン変更時に複数ファイルを修正が必要
- ✗ カラースキームの一貫性がない

**解決策：** CSS 変数（CSS Custom Properties）で色を一元管理

```css
:root {
  --color-primary: #007bff;
  --color-danger: #ff6b6b;
  --color-border: #c7d9fc;
  --color-bg-light: #e9f4f8;
  --color-text-muted: #64748b;
}
```

---

### 2. **サイズ（spacing, font-size）の一貫性がない**

**例：**

```css
/* header.css で padding: 20px */
padding: 20px 0;

/* history.css で padding: 0.5rem */
padding: 0.5rem 0;

/* history-reset-button で padding: 0.5rem 1rem */
padding: 0.5rem 1rem;
```

**問題：**

- ✗ px と rem が混在
- ✗ spacing が統一されていない（20px? 0.5rem? どちらが基準？）
- ✗ デザイン系統がブレている

**解決策：** spacing スケール を CSS 変数で定義

```css
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

---

### 3. **命名規則が統一されていない**

| ファイル           | クラス名           | パターン      |
| ------------------ | ------------------ | ------------- |
| footer.css         | `.site-footer`     | BEM準拠っぽい |
| header.css         | `.header-nav`      | 不明          |
| history.css        | `.history-shell`   | BEM準拠       |
| default-layout.css | `.app-shell__main` | BEM準拠       |

**問題：**

- ✗ 一部ファイルは BEM（Block\_\_Element--Modifier）
- ✗ 一部ファイルはケバブケース
- ✗ 統一がない

**解決策：** BEM + ケバブケースに統一

```css
/* Good */
.history-shell {
}
.history-shell__list {
}
.history-shell__list-item {
}
.history-shell__button {
}
.history-shell__button--reset {
}
```

---

### 4. **reset.css と index.css の重複設定**

**reset.css:**

```css
body {
  min-height: 100vh;
  text-rendering: optimizespeed;
}
```

**index.css:**

```css
body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}
```

**問題：**

- ✗ 同じ要素に対する設定が複数ファイルに分散
- ✗ どちらが優先されるか不明確
- ✗ 保守が困難

**解決策：**

- reset.css: リセット用のみ
- index.css: グローバル変数とテーマ設定
- 重複設定を削除

---

### 5. **ファイル組織が曖昧**

**現状：**

```
styles/
├── global/
│   ├── index.css      ← グローバル設定
│   └── reset.css      ← リセット
├── components/        ← コンポーネント毎
├── layouts/           ← レイアウト
└── pages/             ← ページ毎
```

**問題：**

- ✗ `global/index.css` は何が入るか不明確
- ✗ `components/` と `layouts/` の境界が曖昧
- ✗ 新しいスタイルをどこに入れるか迷う

**解決策：**

```
styles/
├── _variables.css    ← 色、サイズ、フォント
├── _reset.css        ← リセット
├── _base.css         ← body, html などの基本
├── components/       ← コンポーネント固有
├── layouts/          ← レイアウト固有
└── pages/            ← ページ固有
```

---

### 6. **フォント定義がない**

**問題：**

- ✗ font-family が全ファイルで一貫性がない
- ✗ font-size の単位が混在（px と rem）
- ✗ font-weight が定義されていない

**解決策：** グローバル CSS 変数で定義

```css
:root {
  --font-family-base: system-ui, Avenir, Helvetica, Arial, sans-serif;
  --font-size-sm: 0.85rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-weight-normal: 400;
  --font-weight-bold: 700;
}
```

---

### 7. **レスポンシブ対応が不十分**

**問題：**

```css
.app-shell__history {
  width: 600px; /* ← ハードコード。モバイルどうする？ */
}
```

- ✗ ハードコードされた幅
- ✗ メディアクエリがない
- ✗ モバイル表示を考慮していない

**解決策：** メディアクエリとブレークポイントを定義

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
}

@media (max-width: 768px) {
  .app-shell__history {
    width: 100%;
  }
}
```

---

## 修繕計画

### Phase 1: CSS 変数の統一（優先度：高）

- [ ] `_variables.css` を作成
  - 色定義（primary, danger, border など）
  - spacing スケール
  - font 定義
  - ブレークポイント

### Phase 2: ファイル組織の再構成（優先度：高）

- [ ] ファイル構成をリファクタ
- [ ] `_reset.css` と `_base.css` に分離
- [ ] `index.css` を削除or修正

### Phase 3: 命名規則の統一（優先度：中）

- [ ] すべてのクラス名を BEM + ケバブケースに統一
- [ ] ドキュメント作成

### Phase 4: レスポンシブ対応（優先度：中）

- [ ] メディアクエリを追加
- [ ] モバイル表示をテスト

---

## ファイル一覧（修繕対象）

| ファイル           | 現状                    | 修繕内容       |
| ------------------ | ----------------------- | -------------- |
| `_variables.css`   | ❌ なし                 | **作成**       |
| `global/index.css` | ⚠️ グローバル混在       | **修正/削除**  |
| `global/reset.css` | ⚠️ 重複あり             | **修正**       |
| `global/_base.css` | ❌ なし                 | **作成**       |
| `components/*.css` | ⚠️ 色がハードコード     | **修正**       |
| `layouts/*.css`    | ⚠️ サイズがハードコード | **修正**       |
| `pages/*.css`      | ⚠️ 未確認               | **確認・修正** |

---

## 修繕の必要性

**重要度：** 🟡 中

**理由：**

- ✓ 現在は動作している
- ✗ 今後のメンテナンス性が悪い
- ✗ デザイン変更時に複数ファイル修正が必要
- ✗ 新しいページ追加時に命名規則の決定で迷う

---

## チェックリスト

- [ ] CSS 変数の全定義（色、spacing, font）
- [ ] ファイル再構成
- [ ] 全クラス名の BEM 化
- [ ] レスポンシブ対応
- [ ] 重複設定の削除
- [ ] CSS 命名ガイドラインドキュメント作成
- [ ] テスト実施（PC/タブレット/モバイル）

---

## 参考資料

- BEM Methodology: http://getbem.com/
- CSS Variables: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- CSS Custom Properties: https://web.dev/learn/css/custom-properties/
