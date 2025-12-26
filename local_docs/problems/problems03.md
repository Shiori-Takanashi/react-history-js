# 問題03: 履歴の永続化（セッションを超えた保存）

最終更新: 2025-12-25

## 問題の概要

現在、ページ訪問履歴は**セッションメモリのみ**で管理されており、以下の課題があります：

- ブラウザのリロード時に履歴が消失する
- タブを閉じると履歴が失われる
- 同一ユーザの再訪時に過去の履歴を参照できない

ユーザ体験（UX）の観点から、履歴を永続化して再訪問時に復元できることが望ましい場合があります。

## 現状の実装

### データフロー

```
Tracker (Observer) → addHistory() → HistoryProvider (useState)
                                    ↓
                              メモリ内配列 (揮発性)
                                    ↓
                              History Component (表示)
```

### 保存されるデータ構造

```js
{
  path: string,      // 例: "/about"
  title: string,     // 例: "About"
  timestamp: number  // Date.now()
}
```

## 解決策の選択肢

### オプション1: localStorage（推奨）

#### メリット

- 簡単に実装できる（`JSON.stringify`/`JSON.parse`）
- ブラウザ標準API、非同期処理不要
- リロード後も即座にデータ復元可能
- 5-10MB のストレージ容量（十分）

#### デメリット

- 同期的な I/O のため大量データでブロックする可能性
- 複雑なクエリができない（配列の全走査が必要）
- 容量上限に達すると例外発生

#### 適用ケース

- 履歴件数が数百〜数千件程度
- シンプルな追加/表示/削除のみ
- クロスタブ同期が必要（`storage` イベント活用）

### オプション2: IndexedDB

#### メリット

- 大容量データ対応（数百MB〜GB）
- 非同期API でメインスレッドをブロックしない
- インデックスによる高速検索
- トランザクション管理が可能

#### デメリット

- API が複雑（ラッパーライブラリ推奨: `idb`, `Dexie.js`）
- 初期学習コストが高い
- 過剰設計になりやすい

#### 適用ケース

- 履歴が数万件を超える
- 複雑な検索/フィルタリング機能が必要
- オフライン対応が必須

### オプション3: セッションストレージ（現状維持）

#### メリット

- 軽量で単純
- タブごとに独立した履歴を保持

#### デメリット

- タブを閉じると消える
- 永続化されない

#### 適用ケース

- 一時的な履歴のみで十分
- プライバシー重視（閲覧履歴を残さない）

## 推奨実装（localStorage）

### ステップ1: ストレージユーティリティの拡張

既存の `src/utils/historyStorage.js` を拡張：

```js
const STORAGE_KEY = 'react-history-js:history';

export const historyStorage = {
  // 履歴を読み込み
  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  },

  // 履歴を保存（デバウンス推奨）
  save(history) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history:', error);
      // QuotaExceededError の場合は古いエントリを削除するなどの対処
    }
  },

  // 履歴をクリア
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  },

  // エクスポート（JSON ダウンロード用）
  export() {
    const history = this.load();
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // インポート（ファイル選択から復元）
  import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const history = JSON.parse(e.target.result);
          this.save(history);
          resolve(history);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },
};
```

### ステップ2: HistoryProvider の更新

```jsx
import { useState, useEffect, useCallback } from 'react';
import { historyStorage } from '../utils/historyStorage';

export const HistoryProvider = ({ children }) => {
  // 初期値を localStorage から読み込み
  const [history, setHistory] = useState(() => historyStorage.load());

  // 履歴が更新されたら localStorage へ保存（デバウンス推奨）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      historyStorage.save(history);
    }, 300); // 300ms 待機

    return () => clearTimeout(timeoutId);
  }, [history]);

  const addHistory = useCallback((path, title) => {
    setHistory((prev) => [...prev, { path, title, timestamp: Date.now() }]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    historyStorage.clear();
  }, []);

  const value = useMemo(
    () => ({ history, addHistory, clearHistory }),
    [history, addHistory, clearHistory]
  );

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
};
```

### ステップ3: クロスタブ同期（オプション）

他のタブで履歴が更新された際に同期：

```jsx
useEffect(() => {
  const handleStorageChange = (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const updatedHistory = JSON.parse(e.newValue);
        setHistory(updatedHistory);
      } catch (error) {
        console.error('Failed to sync history:', error);
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

## トレードオフと考慮事項

### 容量制限

- localStorage は 5-10MB（ブラウザ依存）
- 1エントリ約100バイトと仮定すると、約5万〜10万件まで保存可能
- 上限に達した場合は古いエントリから削除するLRU戦略を検討

### プライバシー

- 履歴を永続化することで閲覧履歴が残る
- ユーザに「履歴を保存する」設定オプションを提供すべき
- クリアボタン/エクスポート機能で透明性を確保

### パフォーマンス

- `JSON.parse`/`JSON.stringify` は数千件までは高速
- デバウンス（300ms程度）で連続保存を抑制
- 初回ロード時のパース時間を考慮（数万件なら IndexedDB へ移行）

### セキュリティ

- XSS 対策（React の自動エスケープに依存）
- localStorage は同一オリジン内でアクセス可能（サブドメイン注意）
- 機密情報は含めない（パスとタイトルのみ）

## 実装の優先順位

### Phase 1（短期）

- [ ] `historyStorage.js` に `load`/`save`/`clear` を実装
- [ ] `HistoryProvider` で初期ロード + 自動保存
- [ ] UI にクリアボタン追加

### Phase 2（中期）

- [ ] エクスポート/インポート機能の追加
- [ ] 設定画面で「履歴を保存する」トグル追加
- [ ] クロスタブ同期の実装

### Phase 3（長期）

- [ ] 件数が多い場合の IndexedDB 移行
- [ ] 検索/フィルタリング機能の強化
- [ ] 仮想リストによる描画最適化

## 参考リンク

- [MDN: Web Storage API](https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API)
- [MDN: IndexedDB API](https://developer.mozilla.org/ja/docs/Web/API/IndexedDB_API)
- [idb (IndexedDB wrapper)](https://github.com/jakearchibald/idb)
