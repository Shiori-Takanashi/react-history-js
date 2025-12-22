import { useLocation } from "react-router-dom";
import Tracker from "../observers/Tracker";
import Header from "../components/Header";
import Footer from "../components/Footer";
import History from "../components/History";
import pages from "../data/pages.json";
import "../styles/layouts/default-layout.css";
import "../styles/pages/page.css";

export default function DefaultLayout() {
  const location = useLocation();
  const currentPage = pages.find((p) => p.path === location.pathname);
  const title = currentPage?.title || "Page";

  return (
    <div className="app-shell">
      <Tracker />
      <Header />
      <main className="app-shell__main">
        <div className="app-shell__title">
          <h1>{title}</h1>
        </div>
        <div className="app-shell__history">
          <History />
        </div>
      </main>
      <Footer />
    </div>
  );
}
