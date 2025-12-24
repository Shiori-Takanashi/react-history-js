// src/observers/Tracker.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useHistory } from '../hooks/useHistory';

export default function Tracker() {
  const location = useLocation();
  const { addHistory } = useHistory();

  useEffect(() => {
    addHistory(location.pathname, location.key);
  }, [location.pathname, location.key, addHistory]);

  return null;
}
