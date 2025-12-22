// src/App.jsx
import "./App.css";
import { RouterProvider } from "react-router-dom";

import HistoryProvider from "../contexts/HistoryProvider.jsx";
import { router } from "../router/Routes.jsx";

export default function App() {
  return (
    <HistoryProvider>
      <RouterProvider router={router} />
    </HistoryProvider>
  );
}
