# DX／ツーリングレビュー

最終更新: 2025-12-25

## 対象範囲
- ESLint/Stylelint/Prettier, Husky, Vite

## 強み
- 開発体験が軽量で高速、品質ゲート明確。

## 課題
- `--no-verify` の乱用防止ルール明文化。

## 推奨アクション（短期）
- ドキュメントへ緊急時以外の `--no-verify` 禁止を明記。

## チェックリスト
- [ ] Lint/Format/Build のローカル実行手順が明示

## 詳細レビュー（Step01）
- スクリプト群: `format:check`/`lint`/`stylelint`/`build` の役割が明確で CI と整合。`ci:` 接頭辞の有無が統一されると更に分かりやすい。
- Husky: pre-commit にフォーマット/静的解析、pre-push にビルド。失敗時のメッセージが分かりやすく、チーム標準として優秀。
- Lint 設定: ESLint 9 / Stylelint 16 / Prettier 3 の最新系。ルールセットの厳しさは段階導入でも充分（`warn` → `error` 移行計画の文書化が有益）。
- Vite: 開発・ビルド速度とも高速。`vite.config.js` に最低限の最適化（chunk 分割）を追加しても良い。

### 改善提案（Actionable）
- `npm run help` 的なコマンド一覧の導入（簡易 CLI 出力）でオンボーディングを更に改善。
- VS Code 設定（`.vscode/settings.json`）へ `editor.formatOnSave` と ESLint/Stylelint の連携推奨を追記。
- ルール違反時のガイド（よくある失敗と修正の例）を `docs/wiki/step01/workflows.md` に追加。
