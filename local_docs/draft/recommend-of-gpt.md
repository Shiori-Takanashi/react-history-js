以下は、提示された内容を
**Markdown（.md）形式**として整理・清書した出力です。Obsidian 等にそのまま貼り付け可能な構成にしています。内容は元資料に忠実で、装飾や冗長表現は避けています。

（出典：アップロードされた提案資料 ）

---

# React History JS プロジェクト向け Husky 導入構成の提案

## 提案概要

本提案は、実務初心者でも破綻なく運用できることを最優先に、Git フックに Husky を用いた最小限かつ現実的な構成を示すものである。

コミット時およびプッシュ時に、「やらないと事故になる検査」のみに絞って自動実行し、設定や依存関係を過剰に増やさない方針を取る。

目的は以下に限定される。

- フォーマット崩れの混入防止
- Lint エラーを含むコードの共有防止
- ビルド不能な状態での push 防止

CI での包括的検証は GitHub
Actions に委ね、ローカルでは最低限の安全装置のみを設ける。

---

## Pre-commit フック（コミット前チェック）

`pre-commit`
フックでは、コード品質に関する静的な検査のみを行う。実行内容は次の 3 点に限定する。

### 実行内容

1. **Prettier によるフォーマット確認**

   ```bash
   npm run format:check
   ```

   フォーマット不整合が存在する場合、コミットは中断される。修正は
   `npm run format` により明示的に行う。

2. **ESLint による Lint チェック**

   ```bash
   npm run lint
   ```

   JavaScript / JSX に対する静的解析を実行し、明確なエラーを検出する。

3. **Stylelint による CSS チェック**

   ```bash
   npm run stylelint
   ```

   CSS の記述ミスやルール違反を検出する。

これらは `&&` で連結し、いずれかが失敗した時点でコミットを停止する。

### `.husky/pre-commit` 例

```sh
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run format:check && npm run lint && npm run stylelint
```

Husky によりフックファイルには実行権限が付与される。 `husky.sh`
を読み込むことで、Git フック環境でも Node コマンドが正しく実行される。

---

## Pre-push フック（プッシュ前チェック）

`pre-push` フックでは、 **本番ビルドが通るかどうか**のみを確認する。

### 実行内容

- **ビルド確認**

  ```bash
  npm run build
  ```

コンパイルエラーや型エラーなど、ビルド不能な状態での push を防止する。

テストの実行はここでは行わない。詳細な検証は CI に委ねる。

### `.husky/pre-push` 例

```sh
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run build
```

---

## package.json のスクリプト設定

Husky フックから呼び出す処理は、すべて `package.json` の scripts に定義する。

### 設定例

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

    "prepare": "husky install"
  }
}
```

`prepare` スクリプトにより、 `npm install` 実行時に自動で Husky が初期化される。

---

## lint-staged / commitlint を採用しない理由

### lint-staged

本構成では **採用しない**。

理由は以下の通り。

- 設定ファイルが増え、初心者には負担が大きい
- 中規模想定では全ファイル検査でも実用上問題ない
- 構成の理解コストを増やす割に効果が限定的

### commitlint

本構成では **導入しない**。

コミットメッセージ規約の強制は、チーム開発が本格化してから検討すればよい。

導入する場合でも、

```sh
npx commitlint --edit "$1"
```

を `commit-msg` フックに追加するだけで足りるが、現段階では不要と判断する。

---

## 必要ファイル構成

```
Project Root
├── package.json
├── .husky/
│   ├── pre-commit
│   ├── pre-push
│   └── _/husky.sh
└── config/
    ├── eslint.config.js
    ├── prettier.config.js
    ├── stylelint.config.js
    ├── .prettierignore
    └── .stylelintignore
```

---

## 結論

この構成により、次の点が確実に担保される。

- フォーマット漏れの混入防止
- 明確な Lint エラーの早期検出
- ビルド不能コードの push 防止

設定は最小限で、保守負荷も低く、初心者が破綻せずに運用できる。

本プロジェクトにおける **現実的かつ妥当な Husky 導入構成**は以上である。

---
