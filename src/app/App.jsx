// src/App.jsx
import "./App.css";
import { RouterProvider } from "react-router-dom";

import Router from "../router/Routes.jsx";
import HistoryProvider from "../contexts/HistoryProvider.jsx";

export default function App() {
  return (
    <HistoryProvider>
      <RouterProvider router={Router} />
    </HistoryProvider>
  );
}
