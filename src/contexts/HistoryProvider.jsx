// src/contexts/HistoryProvider.jsx
import { useState, useCallback, useRef } from "react";
import { HistoryContext } from "./HistoryContext";

export default function HistoryProvider({ children }) {
  const [history, setHistory] = useState([]);
  const lastPathRef = useRef("");
  const lastKeyRef = useRef("");
  const lastTimeRef = useRef(0);

  // 同一キーかつ瞬間的な二重発火（StrictModeやリロード時の重複）を除外しつつ、
  // 新しい navigation key での連打は許容する。
  const addHistory = useCallback((path, key = "") => {
    if (!path) return;

    const now = Date.now();
    const isSamePath = lastPathRef.current === path;
    const isSameKey = lastKeyRef.current === key;
    const withinWindow = now - lastTimeRef.current < 120; // 極小ウィンドウで瞬間重複のみ除外

    if (isSamePath && isSameKey && withinWindow) {
      return; // StrictModeの二重発火やリロード直後の重複のみ抑制
    }

    lastPathRef.current = path;
    lastKeyRef.current = key;
    lastTimeRef.current = now;
    setHistory((prev) => [...prev, { path, timestamp: now }]);
  }, []);

  return (
    <HistoryContext.Provider value={{ history, setHistory, addHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}
