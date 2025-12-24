// src/router/Routes.jsx
import { createBrowserRouter } from 'react-router-dom';
import DefaultLayout from '../layouts/DefaultLayout.jsx';
import HistoryLayout from '../layouts/HistoryLayout.jsx';
import NotFound from '../pages/NotFound.jsx';
import pages from '../data/pages.json';

const router = createBrowserRouter([
  ...pages.map((page) => ({
    path: page.path,
    element: <DefaultLayout />,
  })),
  {
    path: '*',
    element: (
      <HistoryLayout>
        <NotFound />
      </HistoryLayout>
    ),
  },
]);

export default router;
