// src/hooks/useSetHistory.js
import { useCallback } from 'react';
import { saveHistoryToStorage } from '../../utils/historyStorage';

/**
 * 履歴の更新/リセットロジックを提供するカスタムフック
 * @param {Function} setHistory - setState 関数
 * @returns {Function} setHistoryWrapper 関数
 */
export function useSetHistory(setHistory) {
  const setHistoryWrapper = useCallback(
    (newHistory) => {
      setHistory(newHistory);
      saveHistoryToStorage(newHistory);
    },
    [setHistory]
  );

  return setHistoryWrapper;
}
