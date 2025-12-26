import '../styles/pages/loading.css';
import cat from '../assets/cat_of_dev.svg';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tiger from '../assets/tiger_of_build.svg';

export default function Loading() {
  const animal = import.meta.env.DEV ? cat : tiger;
  const navigate = useNavigate();

  // 3秒後にトップにリダイレクト
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-shell">
      <div className="loading-container">
        <h1 className="loading-title">Histories By React</h1>

        {/* ロゴ */}
        <div className="logo-container">
          <img src={animal} alt="Logo" className="logo" />
        </div>

        <h2 className="loading-text">Loading...</h2>
        <p className="loading-description">
          アプリケーションを読み込んでいます...
          <br />
          しばらくお待ちください
        </p>

        <div className="dots-container">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  );
}
