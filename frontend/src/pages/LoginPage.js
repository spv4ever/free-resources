import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/LoginPage.css';
import { useUser } from '../context/UserContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();

const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);


  useEffect(() => {
    const queryError = new URLSearchParams(location.search).get('error');
    if (queryError === 'unauthorized') {
      setErrorMessage('No tienes acceso. Tu cuenta no está registrada.');
    } else if (queryError === 'unverified') {
      setErrorMessage('Debes verificar tu correo electrónico antes de acceder.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = { email, password };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.token;
        localStorage.setItem('token', token);
        const userInfo = data.user;
        localStorage.setItem('user', JSON.stringify(userInfo));
        setUser(userInfo);
        navigate('/');
        window.location.reload();
      } else {
        setErrorMessage(data.message || 'Credenciales no válidas');
      }
    } catch (error) {
      setErrorMessage('Error en el servidor');
      console.error(error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Iniciar Sesión</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button type="submit" className="login-btn">Entrar</button>

          <div className="separator">o</div>

          <button type="button" className="google-login-btn" onClick={handleGoogleLogin}>
            Iniciar sesión con Google
          </button>

          <div className="login-links">
            <p><a href="/forgot-password">¿Olvidaste tu contraseña?</a></p>
            <p>¿No tienes cuenta? <a href="/register">Registrarse como nuevo usuario</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
