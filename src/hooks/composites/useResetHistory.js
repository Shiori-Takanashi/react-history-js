// src/hooks/composites/useResetHistory.js
import { useCallback } from 'react';
import { saveHistoryToStorage } from '../../utils/historyStorage';

/**
 * 履歴をリセットするカスタムフック
 * @param {Function} setHistory - setState 関数
 * @returns {Function} resetHistory 関数
 */
export function useResetHistory(setHistory) {
  const resetHistory = useCallback(() => {
    setHistory([]);
    saveHistoryToStorage([]);
  }, [setHistory]);

  return resetHistory;
}
