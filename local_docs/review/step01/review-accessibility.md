# アクセシビリティレビュー

最終更新: 2025-12-25

## 対象範囲

- [src/layouts/DefaultLayout.jsx](src/layouts/DefaultLayout.jsx),
  [src/styles](src/styles)

## 強み

- 構造化レイアウトで意味付けがしやすい。

## 課題

- ルート遷移時のフォーカス管理未導入。
- キーボード操作の配慮未整理。

## 推奨アクション（短期）

- `main` に `tabIndex` と `focus()` で遷移時フォーカス。
- キー操作ショートカットの導入（履歴スクロール）。

## チェックリスト

- [ ] フォーカス管理
- [ ] コントラスト/ARIA の確認

## 詳細レビュー（Step01）

### UI/UX・アクセシビリティ

- **UI**:
  100vh レイアウトで構造が分かりやすく、履歴はスクロール表示（[src/styles/components/history.css](src/styles/components/history.css)）。
- **A11y**: 見出し階層・フォーカス管理・キーボード操作の整理が今後の課題。ルート遷移時のフォーカス戻し（`main`
  に `tabIndex` + `focus()`）の導入を推奨。
  > 評価: ⭐⭐⭐☆（基礎良好。A11y改善でより堅実に）
