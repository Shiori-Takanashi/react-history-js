# Husky 実装例 - シンプル版

**4つのパターンを横並びで比較し、実行例を示すガイド**

このドキュメントは、複数の実装パターンを並べて比較し、実際の実行例を通じて最適なパターンを選択できるようにしています。

---

## 📚 目次

- [最小限の実装](#最小限の実装)
- [推奨実装（当プロジェクト）](#推奨実装当プロジェクト)
- [実装パターン比較](#実装パターン比較)
- [実行例](#実行例)
- [トラブルシューティング](#トラブルシューティング)

---

## 最小限の実装

### Step 1: Husky インストール

```bash
npm install --save-dev husky
npx husky init
```

**生成されるファイル**:

```
.husky/
├── pre-commit
└── _/husky.sh
```

### Step 2: pre-commit フック作成

`.husky/pre-commit`:

```bash
npm run lint
```

**効果**: ESLint でエラーをチェック

### Step 3: テスト

```bash
bash .husky/pre-commit
```

---

## 推奨実装（当プロジェクト）

### 完全な設定ファイル

**`.husky/pre-commit`**:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run format:check && npm run lint && npm run stylelint
```

**`.husky/pre-push`**:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run build
```

**`package.json` (抜粋)**:

```json
{
  "scripts": {
    "lint": "eslint . --config config/eslint.config.js",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "stylelint": "stylelint \"src/**/*.css\" --config config/stylelint.config.js",
    "build": "vite build",
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.1.7"
  }
}
```

### 実行フロー

```
git commit
  ↓ [pre-commit]
  npm run format:check && npm run lint && npm run stylelint
  ↓ (失敗 → コミット中止)

git push
  ↓ [pre-push]
  npm run build
  ↓ (失敗 → プッシュ中止)
```

---

## 実装パターン比較

### パターン 1: 最小限（Lint のみ）

**`.husky/pre-commit`**:

```bash
npm run lint
```

**メリット**: 高速、セットアップ簡単 **デメリット**: フォーマット/スタイル未検査

**用途**: 小規模プロジェクト、Lint のみで十分な場合

---

### パターン 2: 基本（推奨・当プロジェクト）

**`.husky/pre-commit`**:

```bash
npm run format:check && npm run lint && npm run stylelint
```

**メリット**: バランス良し、セットアップ簡潔
**デメリット**: 全ファイルをチェック（大規模時は遅い）

**用途**: 中規模プロジェクト、品質重視

---

### パターン 3: 最適化（大規模用）

**`.husky/pre-commit`**:

```bash
npx lint-staged
```

**`.lintstagedrc.json`**:

```json
{
  "*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "*.css": ["stylelint --fix", "prettier --write"]
}
```

**メリット**: 高速（変更ファイルのみ） **デメリット**: セットアップ複雑

**用途**: 大規模プロジェクト（ファイル数 100+）

---

### パターン 4: 強化版（本番環境向け）

**`.husky/pre-commit`**:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Checking format..."
npm run format:check || {
  echo "❌ Format issues. Run: npm run format"
  exit 1
}

echo "🔍 Running ESLint..."
npm run lint || {
  echo "❌ ESLint errors. Run: npm run lint:fix"
  exit 1
}

echo "🔍 Running Stylelint..."
npm run stylelint || {
  echo "❌ CSS errors. Run: npm run stylelint:fix"
  exit 1
}

echo "✅ All checks passed!"
```

**メリット**: エラーメッセージが詳細 **デメリット**: スクリプトが長い

**用途**: チーム開発、新メンバー対応

---

## 実行例

### 正常系

```bash
$ git add .
$ git commit -m "feat: add new feature"

[pre-commit]
✓ Prettier check
✓ ESLint check
✓ Stylelint check

[main c4f8a9b] feat: add new feature
```

### エラー系（フォーマット）

```bash
$ git commit -m "add code"

[pre-commit]
✖ Prettier check FAILED

husky - pre-commit hook exited with code 1 (failure)

$ npm run format      # 修正
$ git add .
$ git commit -m "add code"  # 再度コミット
```

### エラー系（Lint）

```bash
$ git commit -m "add code"

[pre-commit]
✓ Prettier check
✗ ESLint FAILED

husky - pre-commit hook exited with code 1 (failure)

$ npm run lint:fix    # 修正
$ git add .
$ git commit -m "add code"  # 再度コミット
```

### エラー系（ビルド）

```bash
$ git push

[pre-push]
Building...

✗ Build FAILED
src/App.jsx:5:1 error ...

husky - pre-push hook exited with code 1 (failure)

$ npm run build       # デバッグ・修正
$ git push            # 再度プッシュ
```

---

## トラブルシューティング

### フックが実行されない

```bash
# パーミッション確認
ls -la .husky/pre-commit

# 修正
chmod +x .husky/pre-commit
chmod +x .husky/pre-push

# 再初期化
npx husky uninstall
npm install
```

### Windows での改行コード問題

```bash
# .prettierrc に追加
{
  "endOfLine": "lf"
}

# 既存ファイル修正
npm run format
git add .
git commit -m "fix: normalize line endings"
```

### フックをスキップしたい

```bash
# 緊急時のみ（後で必ず修正すること）
git commit --no-verify -m "emergency fix"
git push --no-verify
```

### パーミッション確認

```bash
# 実行権限を確認
ls -la .husky/

# 必要に応じて修正
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

---

## 関連コマンド

```bash
npm run format       # ファイル整形
npm run format:check # フォーマット要否確認
npm run lint         # ESLint 実行
npm run lint:fix     # ESLint 自動修正
npm run stylelint    # Stylelint 実行
npm run stylelint:fix # Stylelint 自動修正
npm run build        # ビルド実行
npm run ci           # CI 検証（ローカル）
```

---

## 公式ドキュメント

詳細は Husky 公式ドキュメントを参照してください:

- https://typicode.github.io/husky/
