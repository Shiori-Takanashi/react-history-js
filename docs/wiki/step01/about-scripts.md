# NPM Scripts 解説

このプロジェクトで利用可能な `npm run`
スクリプトの役割と使い方をまとめます。よく使うコマンドは「よく使う例」にシンプルに記載しています。

## 目次

- [NPM Scripts 解説](#npm-scripts-解説)
  - [目次](#目次)
  - [開発・ビルド](#開発ビルド)
  - [Lint（JavaScript/JSX）](#lintjavascriptjsx)
  - [Lint（CSS）](#lintcss)
  - [フォーマット（Prettier）](#フォーマットprettier)
  - [CI（継続的インテグレーション）](#ci継続的インテグレーション)
    - [GitHub Actions](#github-actions)
  - [よく使う例](#よく使う例)
  - [メモ](#メモ)

## 開発・ビルド

- `dev`: Viteの開発サーバーを起動（HMR対応）。
- `build`: 本番用にバンドルして`dist/`を生成。
- `preview`: 生成済み`dist/`をローカルで配信して挙動確認。

## Lint（JavaScript/JSX）

- `lint`: ESLintを実行（設定: `config/eslint.config.js`）。
- `lint:fix`: ESLintで自動修正（`--fix`）。

## Lint（CSS）

- `stylelint`: CSSをチェック（対象: `src/**/*.css`、設定:
  `config/stylelint.config.js`、無視: `config/.stylelintignore`）。
- `stylelint:fix`: CSSを自動修正（`--fix`）。

## フォーマット（Prettier）

- `format`: リポジトリ全体を整形（設定: `config/prettier.config.js`、無視:
  `config/.prettierignore`）。
- `format:check`: 変更の必要があるファイルを検出（書き込みなし）。

## CI（継続的インテグレーション）

- `ci`: 下記の`ci:verify`を実行するエントリーポイント。
- `ci:verify`: `format:check` → `lint` → `stylelint` → `build`
  を順に実行して、品質とビルドの成立を検証。
- `ci:lint`: JS/CSSのLintのみ実行（PRの快速チェック向け）。
- `ci:format`: Prettierの整形要否チェックのみ実行。

### GitHub Actions

ワークフローは `.github/workflows/ci.yml` に定義されています。Push／Pull
Requestで自動実行され、Node.js 20で依存関係をインストール後に `npm run ci`
を実行します。

## よく使う例

```bash
# ESLintで自動修正
npm run lint:fix

# CSSのスタイルを自動整形
npm run stylelint:fix && npm run format

# 全体の整形が必要かチェック（書き込みなし）
npm run format:check

# CIローカル実行（同じ検証をローカルで再現）
npm run ci
```

## メモ

- ESLint/Stylelint/Prettierは `config/` 配下の設定・無視ファイルを参照します。
- `package.json`
  はJSON仕様のためコメント不可。スクリプトの説明はこのドキュメントで管理します。
