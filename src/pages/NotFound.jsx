import { Link } from "react-router-dom";
import HistoryLayout from "../layouts/HistoryLayout";
import "../styles/pages/not-found.css";

export default function NotFound() {
  return (
    <HistoryLayout>
      <div className="not-found-container">
        <h1>404 - Page Not Found</h1>
        <p>お探しのページが見つかりません。</p>
        <Link to="/">トップに戻る</Link>
      </div>
    </HistoryLayout>
  );
}
