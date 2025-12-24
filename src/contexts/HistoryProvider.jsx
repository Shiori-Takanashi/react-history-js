// src/contexts/HistoryProvider.jsx
import { HistoryContext } from './HistoryContext';
import { useHistoryManager } from '../hooks/useHistoryManager';

export default function HistoryProvider({ children }) {
  const { history, addHistory, setHistory, resetHistory } = useHistoryManager();

  return (
    <HistoryContext.Provider value={{ history, setHistory, addHistory, resetHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}
