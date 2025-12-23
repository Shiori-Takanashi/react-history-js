// src/hooks/useHistoryManager.js
import { useHistoryState } from "./composites/useHistoryState";
import { useAddHistory } from "./composites/useAddHistory";
import { useSetHistory } from "./composites/useSetHistory";
import { useResetHistory } from "./composites/useResetHistory";

/**
 * 履歴管理の全ロジックを統合したカスタムフック
 * HistoryProvider 内で使用することを想定
 * @returns {Object} { history, addHistory, setHistory }
 */
export function useHistoryManager() {
  const { history, setHistory } = useHistoryState();
  const addHistory = useAddHistory(setHistory);
  const setHistoryWrapper = useSetHistory(setHistory);
  const resetHistory = useResetHistory(setHistory);

  return {
    history,
    addHistory,
    setHistory: setHistoryWrapper,
    resetHistory,
  };
}
