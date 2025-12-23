// src/hooks/useAddHistory.js
import { useCallback, useRef } from "react";
import { saveHistoryToStorage } from "../../utils/historyStorage";
import { createDuplicateChecker, createHistoryEntry } from "../../utils";

/**
 * 履歴追加ロジックを提供するカスタムフック
 * @param {Function} setHistory - setState 関数
 * @returns {Function} addHistory 関数
 */
export function useAddHistory(setHistory) {
  const duplicateCheckerRef = useRef(createDuplicateChecker());

  const addHistory = useCallback(
    (path, key = "") => {
      if (!path) return;

      const checker = duplicateCheckerRef.current;

      // 重複をチェック（StrictModeやリロード時の二重発火を除外）
      if (checker.isDuplicate(path, key)) {
        return;
      }

      // 前回のアクセス情報を更新
      checker.update(path, key);

      // 新しい履歴エントリを作成して保存
      setHistory((prev) => {
        const newHistory = [...prev, createHistoryEntry(path)];
        saveHistoryToStorage(newHistory);
        return newHistory;
      });
    },
    [setHistory],
  );

  return addHistory;
}
