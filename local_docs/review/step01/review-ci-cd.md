# CI/CD レビュー

最終更新: 2025-12-25

## 対象範囲

- Workflows: [.github/workflows/01-ci.yml](.github/workflows/01-ci.yml),
  [.github/workflows/02-ci-setup.yml](.github/workflows/02-ci-setup.yml),
  [.github/workflows/03-ci-format.yml](.github/workflows/03-ci-format.yml),
  [.github/workflows/04-ci-lint.yml](.github/workflows/04-ci-lint.yml),
  [.github/workflows/05-ci-stylelint.yml](.github/workflows/05-ci-stylelint.yml),
  [.github/workflows/06-ci-build.yml](.github/workflows/06-ci-build.yml)
- Hooks: [.husky/pre-commit](.husky/pre-commit),
  [.husky/pre-push](.husky/pre-push)

## 強み

- タスク別にワークフローが分離され、失敗の切り分けが明確。
- ローカル（Husky）とリモート（CI）の二段品質ゲートで早期検知と可視化を両立。
- `npm ci` と `actions/setup-node@v4` の `cache: npm`
  により再現性と速度のバランスが良い。

## 詳細レビュー（Step01）

- 依存制御: 01-ci.yml をハブに `needs`
  で並列チェック（03/04/05）→ ビルド（06）を構成できる下地。現状、分離運用でも問題はなく、将来的にハブ化が容易。
- 分離方針:
  lint/format/stylelint を完全分離（03/04/05）。エラーの所在が一目で分かり、修正サイクルが短い。
- 成果物:
  06-ci-build.yml でビルドを独立。アーティファクト化の追加でリグレッション確認が容易になる（推奨）。
- ローカルゲート: pre-commit（format:check → lint →
  stylelint）、pre-push（build）で失敗を早期に抑止。`--no-verify`
  ポリシーを文書化すると更に強固。

## 課題

- アクションの厳密ピンニング（SHA）未実施。
- Node バージョンの宣言が複数ファイルへ分散（集中管理の余地）。

## 推奨アクション（短期）

- 主要アクション（checkout/setup-node/upload-artifact）をコミット SHA でピン留め。
- `NODE_VERSION`
  を 01-ci.yml など単一箇所へ集約し、他ファイルは入力/継承で統一（運用規約で明文化）。
- 06-ci-build.yml にアーティファクト upload を追加（保持期間は 7〜14 日）。

## チェックリスト

- [ ] Node バージョン集中管理
- [ ] 主要アクションのピンニング
- [ ] ビルド成果物のアーティファクト化
