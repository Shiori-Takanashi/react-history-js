// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app/App.jsx';
import './styles/global/index.css';
import './styles/global/reset.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
