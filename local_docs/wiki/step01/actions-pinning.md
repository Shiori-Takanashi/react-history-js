# GitHub Actions のバージョン固定（SHA ピンニング）

最終更新: 2025-12-25

## なぜピンニングするのか

- メジャータグ（例:
  `@v4`）は将来の更新で挙動が変わる可能性があるため、供給網リスクを低減する目的で特定コミット SHA へ固定します。

## 対象（本プロジェクト）

- `actions/checkout@v4`
- `actions/setup-node@v4`
- `actions/upload-artifact@v4`
- `google-github-actions/auth@v2`
- `google-github-actions/setup-gcloud@v2`
- `google-github-actions/deploy-cloudrun@v2`

## 取得方法（例）

1. リポジトリの Releases/Tags から該当バージョンのコミット SHA を確認
2. あるいは `git ls-remote` で取得

```bash
# 例: actions/checkout v4 の SHA を取得
git ls-remote https://github.com/actions/checkout.git refs/tags/v4

# 例: google-github-actions/auth v2 の SHA を取得
git ls-remote https://github.com/google-github-actions/auth.git refs/tags/v2
```

上記の出力先頭がコミット SHA です。`uses: owner/repo@<SHA>` に置き換えます。

## 置換例（deploy.yml）

```yaml
- uses: actions/checkout@v4
+ uses: actions/checkout@<COMMIT_SHA>

- uses: actions/setup-node@v4
+ uses: actions/setup-node@<COMMIT_SHA>

- uses: google-github-actions/auth@v2
+ uses: google-github-actions/auth@<COMMIT_SHA>

- uses: google-github-actions/setup-gcloud@v2
+ uses: google-github-actions/setup-gcloud@<COMMIT_SHA>

- uses: google-github-actions/deploy-cloudrun@v2
+ uses: google-github-actions/deploy-cloudrun@<COMMIT_SHA>
```

## 運用ガイド

- 半期〜年次でピン SHA の更新レビューを実施（CHANGELOG を確認）。
- 重大修正があれば臨時更新。PR で差分と理由を明記。
