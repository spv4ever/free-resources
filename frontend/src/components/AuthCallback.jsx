import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function AuthCallback() {
  const navigate = useNavigate();
  const { setToken } = useUser(); // ← solo necesitas esto ahora

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token); // opcional si el contexto también lo guarda
      setToken(token); // activa carga automática desde /api/auth/me
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [navigate, setToken]);

  return <p>Iniciando sesión con Google...</p>;
}

export default AuthCallback;
