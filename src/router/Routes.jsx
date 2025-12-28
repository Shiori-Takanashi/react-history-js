// src/router/Routes.jsx
import { createBrowserRouter } from 'react-router-dom';
import StandardLayout from '../layouts/StandardLayout.jsx';
import BareLayout from '../layouts/BareLayout.jsx';
import Loading from '../pages/Loading.jsx';
import NotFound from '../pages/NotFound.jsx';
import Strage01 from '../pages/Strage01.jsx';
import pages from '../data/pages.json';

const router = createBrowserRouter([
  ...pages.map((page) => ({
    path: page.path,
    element: <StandardLayout />,
  })),
  {
    element: <BareLayout />,
    children: [
      { path: '/loading', element: <Loading /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
