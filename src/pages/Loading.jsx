import "../styles/pages/loading.css";
import cat from "../assets/cat.svg";
import tiger from "../assets/tiger.svg";

export default function Loading() {
  const animal = import.meta.env.DEV ? cat : tiger;

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
