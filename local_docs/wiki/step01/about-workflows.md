# GitHub Actions ワークフロー解説

## 概要

このプロジェクトの CI/CD ワークフローは、複数のチェック（フォーマット、Lint、Stylelint）を並列実行し、全て成功した후にビルドを実行する設計です。

## ファイル構成

```
.github/workflows/
├── 01-ci.yml           # メインワークフロー（トリガーポイント・依存関係管理）
├── 02-ci-setup.yml     # セットアップ（Node.js インストール）
├── 03-ci-format.yml    # Prettier フォーマットチェック
├── 04-ci-lint.yml      # ESLint チェック
├── 05-ci-stylelint.yml # Stylelint（CSS/SCSS）チェック
└── 06-ci-build.yml     # ビルド・アーティファクト生成
```

## 実行フロー図

```
GitHub にプッシュ / プルリクエスト作成
         ↓
  01-ci.yml トリガー
         ↓
  02-ci-setup.yml 実行
  (Node.js 24 + npm ci)
         ↓
     ┌─────┴─────┬──────────┐
     ↓           ↓          ↓
03-ci-format  04-ci-lint  05-ci-stylelint
  (Prettier)  (ESLint)    (Stylelint)
     ↓           ↓          ↓
     └─────┬─────┴──────────┘
           ↓
      06-ci-build.yml
      (npm run build)
           ↓
      アーティファクト保存
     (dist/ → 7日間保持)
```

## 各ファイルの詳細

### 01-ci.yml（メインワークフロー）

**役割：** トリガーとジョブの依存関係を一元管理

```yaml
name: CI
on: [push, pull_request] # push と pull_request でトリガー
env:
  NODE_VERSION: '24' # 全ワークフロー共通の Node.js バージョン

jobs:
  setup:
    uses: ./.github/workflows/02-ci-setup.yml

  format:
    needs: setup # setup 完了後に実行
    uses: ./.github/workflows/03-ci-format.yml

  lint:
    needs: setup # setup 完了後に実行
    uses: ./.github/workflows/04-ci-lint.yml

  stylelint:
    needs: setup # setup 完了後に実行
    uses: ./.github/workflows/05-ci-stylelint.yml

  build:
    needs: [format, lint, stylelint] # 全チェック成功後に実行
    uses: ./.github/workflows/06-ci-build.yml
```

**特徴：**

- `uses:` で reusable workflow を呼び出し
- `needs:` で依存関係を明示
- 各ワークフローファイルのバージョン定義を一元化

### 02-ci-setup.yml（セットアップ）

**役割：** Node.js 環境を初期化

```yaml
on:
  workflow_call: # 他のワークフローから呼び出し可能

env:
  NODE_VERSION: '24'

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm' # npm キャッシュを有効化
      - run: npm ci # package-lock.json に基づいてインストール
```

**実行内容：**

1. リポジトリをチェックアウト
2. Node.js 24 をインストール
3. npm キャッシュを有効化（2回目以降は高速化）
4. 依存関係をインストール（`npm ci` は CI/CD 向け）

**npm ci vs npm install：**

- `npm install`: 開発環境向け。package.json を優先、柔軟にバージョン管理
- `npm ci`: CI/CD 環境向け。package-lock.json を厳密に従う、再現性重視

### 03-ci-format.yml（フォーマットチェック）

**役割：** コードフォーマットの検証（修正なし）

```yaml
on:
  workflow_call:

env:
  NODE_VERSION: '24'

jobs:
  format:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run format:check # フォーマット検証のみ
```

**実行内容：**

- Prettier でコードフォーマットの検証
- エラーがあれば CI 失敗
- 自動修正は行わない（手動修正が必要）

**ポイント：**
各ワークフローが独立しているため、setup の結果を使用できません。そのため各ワークフローで checkout
→ setup → npm ci を繰り返します。

### 04-ci-lint.yml（ESLint）

**役割：** JavaScript / TypeScript の静的解析

```yaml
on:
  workflow_call:

jobs:
  lint:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint # ESLint 実行
```

**実行内容：**

- ESLint で JavaScript コードのエラーを検出
- 設定ファイル: `config/eslint.config.js`
- エラーがあれば CI 失敗

### 05-ci-stylelint.yml（Stylelint）

**役割：** CSS / SCSS の静的解析

```yaml
on:
  workflow_call:

jobs:
  stylelint:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run stylelint # Stylelint 実行
```

**実行内容：**

- Stylelint で CSS/SCSS コードのエラーを検出
- 設定ファイル: `config/stylelint.config.js`
- エラーがあれば CI 失敗

### 06-ci-build.yml（ビルド）

**役割：** プロダクション向けのビルド実行

```yaml
on:
  workflow_call:

jobs:
  build:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build # ビルド実行
      - uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: dist/ # ビルド出力ディレクトリ
          retention-days: 7 # 7日間保持
```

**実行内容：**

1. Vite でビルド実行（`dist/` に出力）
2. ビルド成果物をアーティファクトとして保存
3. GitHub で 7 日間ダウンロード可能

## 実行順序と依存関係

```yaml
# 依存関係の定義

setup (必須 - 基盤) ↓ format, lint, stylelint (並列実行) ↓ build
(全チェック完了後)
```

**実行パターン：**

| シナリオ           | 実行結果                                         |
| ------------------ | ------------------------------------------------ |
| push / PR 作成     | setup → [format, lint, stylelint] (並列) → build |
| format でエラー    | 以降のジョブは実行されない                       |
| lint でエラー      | build は実行されない                             |
| stylelint でエラー | build は実行されない                             |
| 全チェック成功     | build が実行されてアーティファクトが生成される   |

## Node.js バージョン管理

各ワークフロー内で `env: NODE_VERSION: "24"` を定義しています。

**変更時の手順：**

1. **01-ci.yml の env セクションを更新**

   ```yaml
   env:
     NODE_VERSION: '26' # 変更
   ```

2. **02-06-ci-\*.yml でも同じバージョンに更新**
   ```yaml
   env:
     NODE_VERSION: '26' # 同じバージョンに統一
   ```

環境変数 `${{ env.NODE_VERSION }}`
で参照されているため、値を変更すれば自動的に反映されます。

## 効率性の考慮

### npm キャッシュ

各ワークフローで `cache: "npm"` を設定しています。

**動作：**

- 1回目実行: npm パッケージをダウンロード＆キャッシュ化（遅い）
- 2回目以降: キャッシュから復元（高速）

**効果：**

- CI 実行時間が大幅に短縮
- ネットワークI/O を最小化

### 並列実行

format、lint、stylelint は setup 完了後に**並列実行**されます。

**メリット：**

- 全体実行時間が短縮（直列実行の 1/3 程度）
- リソースの効率的利用

## 設計の理由

### ファイル分割を採用

**理由：**

1. **関心の分離**: 各タスク（フォーマット、Lint、ビルド）を独立して管理
2. **保守性**: 新しいチェック（例: TypeScript チェック）を追加しやすい
3. **可視性**: GitHub Actions の UI で各ジョブが独立して表示される

### 各ワークフローで checkout + setup を繰り返す

**理由：**

- GitHub Actions のジョブはそれぞれ**独立したランナー**で実行される
- ジョブ間では環境を共有できない
- 各ジョブが確実にセットアップされることを保証する必要がある

**選択肢と比較：**

| 方法                               | メリット               | デメリット                     |
| ---------------------------------- | ---------------------- | ------------------------------ |
| **現在**: 各ワークフロー内で setup | 独立性強い、安全性高い | 重複あり、npm cache で緩和     |
| Composite Action                   | 重複削減               | 新たなファイル体系、学習コスト |
| shell script                       | 柔軟                   | 複雑性増加、保守難             |

### 各方法の詳細比較

#### 1. 現在の設計（各ワークフロー内で setup）

**実装：**

```yaml
# 02-ci-setup.yml
jobs:
  setup:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci

# 03-ci-format.yml
jobs:
  format:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run format:check
```

**デメリットの詳細：**

1. **コード重複**
   - checkout、Node.js セットアップ、npm ci が 5 ファイルで繰り返される
   - 変更時に全ファイルを修正する必要がある
   - 修正漏れのリスク

   **例：** Node.js 24 → 26 に変更する場合

   ```
   修正が必要なファイル：
   ✗ 02-ci-setup.yml
   ✗ 03-ci-format.yml
   ✗ 04-ci-lint.yml
   ✗ 05-ci-stylelint.yml
   ✗ 06-ci-build.yml

   計 5 箇所の修正
   ```

2. **ファイルサイズの増加**
   - 各ファイルが大きくなり、可読性が低下
   - リポジトリ全体のメンテナンスコスト増

3. **バージョン管理の難しさ**
   - npm
     ci を複数回実行するため、npm パッケージのバージョンが異なる可能性（低確率）

**ただし、現在の設計で対策：**

- npm cache により 2 回目以降は高速化
- 環境変数 `NODE_VERSION` で一元管理（ある程度の緩和）
- 各ジョブの独立性により、確実にセットアップが実行される（安全性）

#### 2. Composite Action による共通化

**実装：**

```
.github/
├── actions/
│   └── setup-node-and-deps/
│       └── action.yml           # 新規作成
├── workflows/
    ├── 01-ci.yml
    ├── 02-ci-setup.yml
    └── ...
```

**Composite Action の内容：**

```yaml
# .github/actions/setup-node-and-deps/action.yml
name: Setup Node.js and Dependencies

runs:
  using: composite
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    - run: npm ci
      shell: bash
```

**各ワークフローで呼び出し：**

```yaml
# 03-ci-format.yml
jobs:
  format:
    steps:
      - uses: ./.github/actions/setup-node-and-deps # 一行で済む
      - run: npm run format:check
```

**デメリットの詳細：**

1. **新たなファイル体系の導入**
   - `.github/actions/` ディレクトリを新規作成
   - Composite Action という新たな概念の学習が必要
   - チーム内で使用方法の統一が必要

2. **学習コスト**
   - Workflow のみ経験のメンバーには理解しにくい
   - GitHub Actions の新しい機能を学ぶ必要がある
   - ドキュメント整備の負担増

3. **デバッグの複雑さ**
   - Composite Action 内のエラーをデバッグする際、別ファイルを確認する必要がある
   - エラーメッセージが分かりにくくなる可能性

4. **GitHub UI での可視性が低下**
   - Composite Action の内部ステップが UI に表示されない
   - 実行ログから詳細を確認する必要がある

**例：GitHub Actions UI での見え方**

現在（Composite Action なし）：

```
✓ Checkout repository
✓ Setup Node.js
✓ Install dependencies
✓ Run format check
```

Composite Action 使用時：

```
✓ Setup Node.js and dependencies  （内部構造が見えない）
✓ Run format check
```

#### 3. Shell Script による共通化

**実装：**

```bash
# .github/scripts/setup.sh
#!/bin/bash
set -e

echo "Checking out repository..."
# checkout ロジック

echo "Setting up Node.js..."
# setup ロジック

echo "Installing dependencies..."
npm ci
```

**各ワークフローで呼び出し：**

```yaml
jobs:
  format:
    steps:
      - run: ./.github/scripts/setup.sh
      - run: npm run format:check
```

**デメリットの詳細：**

1. **複雑性の増加**
   - Shell script の記述、テストが必要
   - クロスプラットフォーム対応が困難（Windows ランナー使用時）
   - エラーハンドリングが複雑になる

2. **保守性の低下**
   - GitHub
     Actions の公式アクション（actions/checkout@v4 など）の更新を手動で追跡
   - セキュリティアップデート対応が遅れるリスク
   - Script 内でバージョン固定が必要

3. **チーム内での可視性が低下**
   - GitHub Actions に不慣れなメンバーには理解しにくい
   - Script の変更と Workflow の関連性が不明確
   - Code Review がしにくい

4. **デバッグの困難さ**
   - Script の実行結果がワークフロー UI に統合されない
   - エラー時の原因特定が難しい

**例：デバッグ時の違い**

現在：

```
✗ Setup Node.js             ← どのステップで失敗したか明確
✗ Install dependencies
```

Shell Script 使用時：

```
✗ Run setup.sh              ← スクリプト内のどこで失敗したか不明確
  (details を確認する必要がある)
```

## 最適な選択：現在の設計の理由

以上を踏まえて、**現在の設計（各ワークフロー内で setup）** を採用した理由：

| 観点           | 評価                                          |
| -------------- | --------------------------------------------- |
| **安全性**     | ⭐⭐⭐⭐⭐ 各ジョブが確実にセットアップされる |
| **可視性**     | ⭐⭐⭐⭐⭐ GitHub UI で全ステップが表示される |
| **学習コスト** | ⭐⭐⭐⭐⭐ Workflow のみで完結                |
| **効率性**     | ⭐⭐⭐⭐ npm cache により実運用上は高速       |
| **保守性**     | ⭐⭐⭐ 環境変数で緩和（完全ではない）         |

**トレードオフ：**

- コード重複 → npm cache + 環境変数で実用上は許容可能
- メンテナンスコスト → チーム規模が小さい場合は問題なし
- 将来の拡張 → 必要に応じて Composite Action へ移行可能

## トラブルシューティング

### CI が失敗する場合

**1. format でエラー**

```bash
npm run format:check  # 確認
npm run format        # 修正
```

**2. lint でエラー**

```bash
npm run lint          # 確認
npm run lint -- --fix # 修正（可能な場合）
```

**3. stylelint でエラー**

```bash
npm run stylelint     # 確認
npm run stylelint -- --fix # 修正（可能な場合）
```

**4. build でエラー**

- 上記 3 つのチェックが全て成功している場合は、ビルド設定を確認してください
- `vite.config.js` を確認

### npm ci でエラー

**原因：** package-lock.json が古い可能性

**解決策：**

```bash
npm install           # package-lock.json を更新
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

## まとめ

| 側面         | 説明                                             |
| ------------ | ------------------------------------------------ |
| **トリガー** | push / pull_request                              |
| **Node.js**  | バージョン 24                                    |
| **フロー**   | setup → [format, lint, stylelint] (並列) → build |
| **保存期間** | ビルド成果物 7 日間                              |
| **最適化**   | npm cache で高速化                               |
| **信頼性**   | 各ジョブが確実にセットアップ                     |
