import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/error.css';

export default function Error() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="error-container">
      <h1>予期せぬ操作が行われました。</h1>
      <p>トップページにリダイレクトします。</p>
    </div>
  );
}
