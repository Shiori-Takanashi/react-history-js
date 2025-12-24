import { Outlet } from 'react-router-dom';
import Tracker from '../observers/Tracker';

export default function HistoryLayout({ children }) {
  return (
    <>
      <Tracker />
      {children}
    </>
  );
}
