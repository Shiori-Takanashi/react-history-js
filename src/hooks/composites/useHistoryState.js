// src/hooks/useHistoryState.js
import { useState } from "react";
import { getHistoryFromStorage } from "../../utils/historyStorage";

/**
 * 履歴の状態管理のみを行うカスタムフック
 * @returns {Object} { history, setHistory }
 */
export function useHistoryState() {
  const [history, setHistory] = useState(() => getHistoryFromStorage());
  return { history, setHistory };
}
