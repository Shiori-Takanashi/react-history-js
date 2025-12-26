# Husky 推奨実装 - React History JS

React History JS プロジェクトの **推奨 Husky 実装** を定義します。

---

## � 目次

- [推奨レベル](#推奨レベル)
- [選定理由](#選定理由)
- [セットアップ手順](#セットアップ手順)
- [実装結果のテスト](#実装結果のテスト)
- [使用例](#使用例)
- [トラブルシューティング](#トラブルシューティング)
- [今後のカスタマイズ可能性](#今後のカスタマイズ可能性)
- [ベストプラクティス](#ベストプラクティス)
- [チェックリスト](#チェックリスト)
- [まとめ](#まとめ)

---

## �📋 推奨レベル

**「基本実装」- 中規模プロジェクト向け**

| 項目                 | 内容                       |
| -------------------- | -------------------------- |
| **難易度**           | ★★☆☆☆ 中程度               |
| **セットアップ時間** | 約 5-10 分                 |
| **メンテナンス**     | 簡潔（追加スクリプト不要） |
| **プロジェクト規模** | 中規模向け                 |

---

## 選定理由

- ✅ チーム内で容易に導入・運用可能
- ✅ CI/CD と同等のチェック（format, lint, stylelint）を実施
- ✅ 開発速度を著しく低下させない
- ✅ カスタマイズの余地あり

---

## セットアップ手順

### 1. Husky 初期化

```bash
npm install --save-dev husky
npx husky init
```

### 2. pre-commit フック設定

ファイル: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running format check..."
npm run format:check || exit 1

echo "🔍 Running ESLint..."
npm run lint || exit 1

echo "🔍 Running Stylelint..."
npm run stylelint || exit 1

echo "✅ All checks passed!"
```

**役割**:

- Prettier: コード整形を確認（修正は不可、チェックのみ）
- ESLint: JS/JSX の規約違反を検出
- Stylelint: CSS の規約違反を検出

### 3. pre-push フック設定

ファイル: `.husky/pre-push`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔨 Building project..."
npm run build || exit 1

echo "✅ Build successful!"
```

**役割**:

- プッシュ前にビルドが成功することを確認
- デプロイ時のエラーを事前防止

### 4. package.json 確認

```json
{
  "scripts": {
    "format:check": "prettier --check .",
    "lint": "eslint src",
    "stylelint": "stylelint 'src/**/*.css'",
    "build": "vite build"
  },
  "devDependencies": {
    "husky": "^9.1.7"
  }
}
```

---

## 実装結果のテスト

### テスト 1: pre-commit フック動作確認

```bash
# 意図的にフォーマット違反を作る
echo "const x=1" > src/test.js
git add src/test.js

# pre-commit フック実行
git commit -m "test"

# 期待動作: Prettier チェック失敗 → コミット中断
# エラー:
# 🔍 Running format check...
# ❌ [warn] src/test.js
# husky - pre-commit hook exited with code 1 (failure)

# 修正してリトライ
npm run format
git add src/test.js
git commit -m "test"
# 成功！
```

### テスト 2: pre-push フック動作確認

```bash
# ビルドエラーを引き起こす（JSX の構文エラー等）
# ブランチを作成してプッシュ試行
git checkout -b test-branch
git commit --allow-empty -m "test"
git push origin test-branch

# 期待動作: ビルド失敗 → プッシュ中断
# その後、エラーを修正してリトライ
```

---

## 使用例

### 成功シナリオ

```bash
$ git add src/App.jsx docs/README.md
$ git commit -m "feat: add new feature"

🔍 Running format check...
✅ Prettier check passed

🔍 Running ESLint...
✅ ESLint check passed

🔍 Running Stylelint...
✅ Stylelint check passed

✅ All checks passed!

[main a1b2c3d] feat: add new feature
 2 files changed, 15 insertions(+)
```

### 失敗シナリオ（フォーマット）

```bash
$ git commit -m "add code"

🔍 Running format check...
❌ Prettier found formatting issues in:
  - src/App.jsx (2 issues)
  - src/components/Header.jsx (1 issue)

husky - pre-commit hook exited with code 1 (failure)

# 対策: フォーマット自動修正
$ npm run format
$ git add -A
$ git commit -m "add code"
# → 成功
```

### 失敗シナリオ（ESLint）

```bash
$ git commit -m "add rule"

🔍 Running format check...
✅ Prettier check passed

🔍 Running ESLint...
❌ ESLint found problems:
  src/hooks/useHistory.js:15:5  warning  'unused variable'

husky - pre-commit hook exited with code 1 (failure)

# 対策: 変数削除 or コメント追加
$ vim src/hooks/useHistory.js
$ npm run lint  # 再確認
$ git add -A
$ git commit -m "add rule"
# → 成功
```

### 失敗シナリオ（ビルド）

```bash
$ git push origin main

🔨 Building project...
❌ Error compiling JSX in src/App.jsx:
  Unexpected token '<'

husky - pre-push hook exited with code 1 (failure)

# 対策: JSX エラー修正
$ npm run build  # ローカルで再確認
$ git commit --amend
$ git push
# → 成功
```

---

## トラブルシューティング

### Q1: フックが実行されない

**症状**: `git commit` でフックが走らない

**原因**: `.husky/` ディレクトリのパーミッション不足

**解決**:

```bash
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x .husky/_/husky.sh
```

---

### Q2: 特定のコミットをスキップしたい（緊急時）

**症状**: どうしても走らせたくない

**対応**:

```bash
# pre-commit を無視
git commit --no-verify -m "emergency fix"

# pre-push を無視
git push --no-verify
```

⚠️ **注意**: `--no-verify` は緊急時のみ。乱用は避けること。

---

### Q3: Windows で改行コードが原因で Prettier エラー

**症状**: `git commit` で常に Prettier 失敗

**原因**: CRLF (Windows) vs LF (Git) の不一致

**解決**:

`.prettierrc.json` に追加:

```json
{
  "endOfLine": "lf"
}
```

`.gitattributes` を作成:

```
* text=auto
*.js text eol=lf
*.jsx text eol=lf
*.css text eol=lf
```

---

### Q4: 大規模ファイルで pre-commit が遅い

**症状**: `npm run format:check` が 10 秒以上かかる

**対応方法** (将来的):

by-claude の「パターン A:
lint-staged による最適化」を検討。ただし現在は、プロジェクト規模が中程度のため不要。

---

## 今後のカスタマイズ可能性

### オプション 1: commitlint を追加（コミットメッセージ検証）

by-claude「パターン B」参照。Conventional Commits に従う場合。

```bash
npm install --save-dev commitlint
npx husky add .husky/commit-msg 'commitlint --edit "$1"'
```

**例**:

```
feat: add new feature      ✅ OK
fix: resolve bug issue     ✅ OK
add feature                ❌ NG (接頭辞がない)
```

---

### オプション 2: lint-staged による最適化（大規模時）

by-claude「パターン A」参照。チェック対象をステージ済みファイルのみに限定。

```bash
npm install --save-dev lint-staged
```

`.lintstagedrc.json`:

```json
{
  "*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "*.css": ["stylelint --fix", "prettier --write"],
  "*.md": ["prettier --write"]
}
```

---

### オプション 3: セキュリティチェック（本番運用時）

by-claude「パターン C」参照。`npm audit` をフックに統合。

```bash
npx husky add .husky/pre-push 'npm audit --production'
```

---

## ベストプラクティス

| 項目               | 推奨                                            |
| ------------------ | ----------------------------------------------- |
| **フック数**       | 2個（pre-commit, pre-push）で十分               |
| **フック責務**     | 1フック = 1責務（単一責任の原則）               |
| **エラー時の処理** | `exit 1` で即座に中断                           |
| **ログ出力**       | わかりやすい日本語メッセージ（emoji 活用）      |
| **スクリプト長**   | 20 行程度が目安（超える場合は専用スクリプト化） |
| **カスタマイズ**   | package.json の scripts に統一                  |

---

## チェックリスト

セットアップ完了後、以下を確認：

- [ ] `.husky/pre-commit` が存在し、実行可能（`x` パーミッション）
- [ ] `.husky/pre-push` が存在し、実行可能
- [ ] 実際に `git commit` でフックが走ることを確認
- [ ] 実際に `git push` でビルドチェックが走ることを確認
- [ ] `git commit --no-verify` でスキップ可能なことを確認

---

---

## 実装ファイル構成

実装は `.husky/` ディレクトリに格納されます:

```
.husky/
├── pre-commit     ← format:check && lint && stylelint
├── pre-push       ← npm run build
└── _/husky.sh     ← Husky 共通スクリプト
```

---

## まとめ

**React History JS プロジェクト用 Husky 構成**:

```
.husky/
├── pre-commit       ← format:check && lint && stylelint
└── pre-push         ← npm run build
```

このシンプルな 2-フック構成で：

- ✅ コミット時に品質チェック（format, lint, style）
- ✅ プッシュ時にビルド可能性確認
- ✅ セットアップ簡潔、メンテナンス容易
- ✅ 開発効率と品質のバランス取得

必要に応じて、オプション 1-3 で段階的に拡張可能。
