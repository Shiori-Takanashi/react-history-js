# Husky 実装例 - 段階的ガイド

**5つの段階を通じて、Husky を段階的に理解・実装するガイド**

このドキュメントは、シンプルな設定から段階的に拡張する方法を示します。チーム内で導入を進めるときや、カスタマイズを視野に入れたい場合に最適です。

---

## 📚 目次

- [段階 1: 基本的な pre-commit フック](#段階-1-基本的な-pre-commit-フック)
- [段階 2: pre-push フックの追加](#段階-2-pre-push-フックの追加)
- [段階 3: 実装例の全体像](#段階-3-実装例の全体像)
- [段階 4: エラーハンドリングの強化](#段階-4-エラーハンドリングの強化)
- [段階 5: 環境別の設定](#段階-5-環境別の設定)
- [よくあるカスタマイズ](#よくあるカスタマイズ)

---

## 段階 1: 基本的な pre-commit フック

### 最小限の実装

`.husky/pre-commit`:

```bash
npm run format:check
```

**効果**: Prettier でのフォーマット要否のみチェック

**実行例**:

```bash
$ git commit -m "feat: new feature"
[pre-commit] format:check
✖ Code style issues found in the above file(s). Forgot to run Prettier?

husky - pre-commit hook exited with code 1 (failure)
```

### 段階的な追加

`.husky/pre-commit` を拡張:

```bash
npm run format:check && npm run lint
```

**効果**: フォーマット確認 + ESLint チェック

---

## 段階 2: pre-push フックの追加

### ビルド確認フック

`.husky/pre-push` を新規作成:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run build
```

**効果**: プッシュ前にビルド成立を確認

**実行フロー**:

```bash
$ git push
[pre-push] ビルド開始...
npm run build

> react-history-js@1.0.0 build
> vite build

✓ built in 15.23s

husky - pre-push hook passed
```

---

## 段階 3: 実装例の全体像

### 当プロジェクトの完全な実装

**ファイル構成**:

```
.husky/
├── pre-commit
├── pre-push
├── _/husky.sh
└── .gitignore (記載なし)
```

**package.json の設定**:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --config config/eslint.config.js",
    "lint:fix": "eslint . --config config/eslint.config.js --fix",
    "stylelint": "stylelint \"src/**/*.css\" --config config/stylelint.config.js",
    "stylelint:fix": "stylelint \"src/**/*.css\" --config config/stylelint.config.js --fix",
    "format": "prettier --config config/prettier.config.js --write .",
    "format:check": "prettier --config config/prettier.config.js --check .",
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.1.7",
    "eslint": "^9.39.1",
    "prettier": "^3.7.4",
    "stylelint": "^16.26.1",
    "vite": "^7.2.4"
  }
}
```

**`.husky/pre-commit` の実装**:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run format:check && npm run lint && npm run stylelint
```

**`.husky/pre-push` の実装**:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run build
```

### 実行の流れ

```
1. git add .
   ↓
2. git commit -m "message"
   ↓
3. [pre-commit フック実行]
   ├─ npm run format:check
   ├─ npm run lint
   └─ npm run stylelint
   ↓ (失敗時はコミットがキャンセル)
4. git push
   ↓
5. [pre-push フック実行]
   └─ npm run build
   ↓ (失敗時はプッシュがキャンセル)
6. GitHub Actions で ci:verify 実行
```

---

## 段階 4: エラーハンドリングの強化

### 詳細なエラーメッセージの追加

`.husky/pre-commit` (拡張版):

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running format check..."
npm run format:check || {
  echo "❌ Format issues found!"
  echo "💡 Fix with: npm run format"
  exit 1
}

echo "🔍 Running ESLint..."
npm run lint || {
  echo "❌ ESLint errors found!"
  echo "💡 Fix with: npm run lint:fix"
  exit 1
}

echo "🔍 Running Stylelint..."
npm run stylelint || {
  echo "❌ CSS errors found!"
  echo "💡 Fix with: npm run stylelint:fix"
  exit 1
}

echo "✅ All checks passed!"
```

### 条件付き実行

`.husky/pre-push` (分岐版):

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

BRANCH=$(git rev-parse --abbrev-ref HEAD)

# main への直接プッシュを禁止
if [ "$BRANCH" = "main" ]; then
  echo "❌ Cannot push directly to main. Please create a pull request."
  exit 1
fi

# develop ブランチのみ全ビルド実行
if [ "$BRANCH" = "develop" ]; then
  echo "🔨 Building for develop..."
  npm run build || exit 1
  echo "✅ Build successful"
else
  echo "⏭️  Skipping build for feature branch: $BRANCH"
fi
```

---

## 段階 5: 環境別の設定

### 開発環境と本番環境での切り分け

`.husky/pre-commit` (環境対応版):

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# CI 環境では実行スキップ
if [ "$CI" = "true" ]; then
  echo "⏭️  Skipping pre-commit in CI"
  exit 0
fi

npm run format:check && npm run lint && npm run stylelint
```

### package.json での環境設定

```json
{
  "scripts": {
    "prepare": "husky",
    "husky:install": "husky install",
    "husky:uninstall": "husky uninstall"
  }
}
```

---

## よくあるカスタマイズ

### パターン A: lint-staged による最適化

大規模プロジェクト向け（ファイル数 100+）

**インストール**:

```bash
npm install --save-dev lint-staged
```

**`.lintstagedrc.json`**:

```json
{
  "*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "*.css": ["stylelint --fix", "prettier --write"],
  "*.md": ["prettier --write"]
}
```

**`.husky/pre-commit`**:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**メリット**: 変更ファイルのみチェック → 高速化
**デメリット**: セットアップが複雑

### パターン B: コミットメッセージ検証

commitlint を使用

**インストール**:

```bash
npm install --save-dev @commitlint/config-conventional @commitlint/cli
```

**`commitlint.config.js`**:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
};
```

**`.husky/commit-msg`**:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx commitlint --edit "$1"
```

**例**:

```bash
# ✅ OK
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"

# ❌ NG
git commit -m "added new feature"
git commit -m "fix bug"
```

### パターン C: セキュリティチェック

**`.husky/pre-push` に追加**:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔐 Running security audit..."
npm audit || {
  echo "⚠️  Security vulnerabilities found"
  echo "💡 Run: npm audit fix"
  # exit 1  # 厳格にしたい場合はコメント解除
}

npm run build
```

### パターン D: CI との連携確認

**`.husky/pre-push` に追加**:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔄 Simulating CI verification..."
npm run ci:verify || {
  echo "❌ CI verification failed"
  exit 1
}
```

---

## セットアップから実行まで

### 1. インストール

```bash
npm install
# → package.json の "prepare": "husky" が実行される
```

### 2. フック確認

```bash
ls -la .husky/
# → pre-commit, pre-push が表示される
```

### 3. テスト実行

```bash
# pre-commit を手動実行
bash .husky/pre-commit

# pre-push を手動実行
bash .husky/pre-push
```

### 4. 実際の使用

```bash
git add .
git commit -m "feat: implement feature"
# → pre-commit が自動実行

git push
# → pre-push が自動実行
```

---

## 公式ドキュメント

詳細は Husky 公式ドキュメントを参照してください:

- https://typicode.github.io/husky/
