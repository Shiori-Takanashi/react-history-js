# テスト戦略レビュー

最終更新: 2025-12-25

## 対象範囲
- ユニット/コンポーネント/E2E

## 強み
- スクリプトと構成が単純で導入容易。

## 課題
- 公式テスト未導入。

## 推奨アクション（短期）
- `vitest + @testing-library/react` を導入して、履歴の追加/重複抑止をユニット化。
- `playwright` でナビゲーションと履歴表示の E2E。

## チェックリスト
- [ ] ユニットテスト追加
- [ ] E2E スモーク追加

## 詳細レビュー（Step01）

### テスト整備
- **現状**: まだテスト未導入（目視）。
- **提案**: `vitest + @testing-library/react` でユニット/コンポーネントテスト、`playwright` で簡易 E2E（履歴表示/重複抑止/ナビゲーションの検証）。
> 評価: ⭐⭐⭐☆（導入余地あり。着手容易）

### テストピラミッド / 対象
- ユニット: `DuplicateChecker`、`historyStorage` の入出力、`useHistory` の純粋ロジック。
- コンポーネント: `History.jsx` の描画/追加/重複抑止の挙動、`Header` のナビゲーション。
- E2E: ルート遷移、フォーカス管理、履歴の追加→表示→フィルタの一連動作。

### 例（ユニット: DuplicateChecker）
```js
import { describe, it, expect } from 'vitest';
import DuplicateChecker from '../../src/utils/models/DuplicateChecker';

describe('DuplicateChecker', () => {
	it('detects duplicate paths', () => {
		const checker = new DuplicateChecker();
		expect(checker.isDuplicate('/home')).toBe(false);
		checker.add('/home');
		expect(checker.isDuplicate('/home')).toBe(true);
	});
});
```

### 運用
- CI に `test` ジョブを追加（07-ci-test.yml）。最初はスモーク（1-3件）から開始し、破壊的変更に備える。
- カバレッジ目標は段階設定（例: 40%→60%）。重要経路（履歴追加/表示/ナビゲーション）を優先。
