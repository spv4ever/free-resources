import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function AuthCallback() {
  const navigate = useNavigate();
  const { setUser, setToken } = useUser();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      setToken(token); // ✅ actualiza el contexto

      fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          localStorage.setItem('user', JSON.stringify(data));
          setUser(data); // ✅ actualiza el contexto
          navigate('/');
        })
        .catch((err) => {
          console.error('❌ Error al cargar usuario desde token:', err);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [navigate, apiUrl, setUser, setToken]);

  return <p>Iniciando sesión con Google...</p>;
}

export default AuthCallback;
