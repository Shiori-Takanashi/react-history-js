# Step01 評価観点別レビュー

最終更新: 2025-12-24

## 1) CI/CD アーキテクチャ（構成・依存関係）

- メインオーケストレーションを
  [`.github/workflows/01-ci.yml`](../../.github/workflows/01-ci.yml)
  に集約し、`needs` による依存制御で「setup → 並列チェック →
  build」を明確化できている。
- チェック処理は [`03-ci-format.yml`](../../.github/workflows/03-ci-format.yml),
  [`04-ci-lint.yml`](../../.github/workflows/04-ci-lint.yml),
  [`05-ci-stylelint.yml`](../../.github/workflows/05-ci-stylelint.yml)
  に分離され、関心の分離と保守性が高い。
- セットアップは [`02-ci-setup.yml`](../../.github/workflows/02-ci-setup.yml)
  で共通化。ただしジョブ間は環境を共有しないという Actions の特性を理解し、各ジョブ側でも checkout +
  setup + `npm ci` を確実に実施している点が堅実。
- ビルドは [`06-ci-build.yml`](../../.github/workflows/06-ci-build.yml)
  に分離され、成果物の管理と失敗の切り分けが容易。

> 評価: ⭐⭐⭐⭐⭐（設計の一貫性と見通しの良さ）

## 2) 品質ゲート（ローカルとリモートの二段構え）

- ローカル: Husky の `pre-commit` で
  `format:check → lint → stylelint`、`pre-push` で `build`
  を実行し早期発見を徹底。
- リモート: GitHub
  Actions 側では同一コマンドを再実行し、UI 上の可視性・履歴・アーティファクト化まで担保。
- 二重化により、開発者体験（DX）と品質保証（QA）の両立ができている。

> 評価: ⭐⭐⭐⭐⭐（段階的品質保証の設計力）

## 3) 再現性・決定性（Reproducibility）

- すべての CI 実行で `npm ci` を使用し、`package-lock.json`
  に基づく決定的インストールを徹底。
- `actions/setup-node@v4` の `cache: npm`
  により、速度最適化と再現性のバランスを確保。
  > 評価: ⭐⭐⭐⭐⭐（CI 向けベストプラクティスを踏襲）

## 4) 保守性・拡張性（Maintainability & Modularity）

- タスク別ワークフローの分離により、新規チェック（例: 型チェック、ユニットテスト、E2E）を
  `07-*.yml` 以降として容易に追加可能。
- `NODE_VERSION` を `env`
  で宣言し意図を共有。ただし複数ファイルへ分散しているため、将来の一括更新には配慮が必要。
  > 評価: ⭐⭐⭐⭐☆（高いが、環境値の一元化に改善余地）

## 5) パフォーマンス最適化（効率性）

- 並列実行（format / lint / stylelint）により全体スループットを向上。
- npm キャッシュ活用でインストール時間を短縮。
  > 評価: ⭐⭐⭐⭐⭐（短時間での確実な検証を実現）

## 6) セキュリティ/信頼性の配慮

- `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4`
  のメジャー固定で互換性を担保。より厳密な固定（コミット SHA ピンニング）も将来的に検討可能。
- Secrets/Permissions を不要とする構成で、最小権限原則に自然に準拠。
  > 評価: ⭐⭐⭐⭐☆（十分だが、ピンニング強化の余地）

## 7) ドキュメント品質（設計意図の可視化）

- ワークフローの目的・依存関係・運用手順・トラブルシュートを
  [`docs/wiki/step01/workflows.md`](../wiki/step01/workflows.md) や
  [`docs/wiki/step01/about-ci.md`](../wiki/step01/about-ci.md) に体系化。
- トレードオフ（Composite
  Action 不採用の理由、lint-staged/commitlint の段階導入方針）を明文化しており、チーム内共有に非常に有用。
  > 評価: ⭐⭐⭐⭐⭐（説明責任とチームスケールを意識した記述）
