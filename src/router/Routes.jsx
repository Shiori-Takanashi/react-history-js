// src/router/Routes.jsx
import { createBrowserRouter } from "react-router-dom";
import DefaultLayout from "../layouts/DefaultLayout.jsx";

export const router = createBrowserRouter([
  {
    path: "*",
    element: <DefaultLayout />,
  },
]);
