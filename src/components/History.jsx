// src/components/History.jsx
import { useHistory } from "../hooks/useHistory";
import "../styles/components/history.css";

export default function History() {
  const { history } = useHistory();

  if (history.length === 0) {
    return <p className="history-empty">まだ履歴がありません</p>;
  }

  return (
    <div className="history-container">
      <ul className="history-list">
        {history.map((item, index) => (
          <li className="history-item" key={index}>
            <span className="history-name">{item.path}</span>
            <span className="history-time">
              （{new Date(item.timestamp).toLocaleTimeString()}）
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
