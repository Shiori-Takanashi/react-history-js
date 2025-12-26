// src/components/History.jsx
import { useHistory } from '../hooks/useHistory';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/history.css';

export default function History() {
  const { history, resetHistory } = useHistory();
  const navigate = useNavigate();

  // 履歴が空の場合、3秒後に、ローディング画面にリダイレクト
  useEffect(() => {
    if (history.length === 0) {
      const timer = setTimeout(() => {
        navigate('/loading');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [history, navigate]);

  if (history.length === 0) {
    return (
      <p className="history-empty">
        まだ履歴がありません。
        <br />
        ３秒後、ローディング画面に移行します。
      </p>
    );
  }

  return (
    <div className="history-shell">
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
      <button onClick={resetHistory} className="history-reset-button">
        履歴リセット
      </button>
    </div>
  );
}
