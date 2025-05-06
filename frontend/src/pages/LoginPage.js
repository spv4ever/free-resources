import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import { useUser } from '../context/UserContext';


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Hook de navegación
  const { setUser } = useUser();
  const decodeJwt = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  
    return JSON.parse(jsonPayload);  // Devuelve el payload decodificado
  };

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
        // Guardar el token en localStorage
        const token = data.token;
        localStorage.setItem('token', token);
        //console.log('Token guardado:', token);
  
        // Decodificar el token y extraer la información del usuario
        const decodedToken = decodeJwt(token);
        //console.log('Decoded Token:', decodedToken);
  
        // Guardar información de usuario (nombre y rol) en el estado
        localStorage.setItem('user', JSON.stringify({
          name: decodedToken.name,
          role: decodedToken.role
        }));
        setUser({
          name: decodedToken.name,
          role: decodedToken.role
        });
        
  
        navigate('/'); // Redirigir al HomePage
        // Forzar la recarga de la página
        window.location.reload(); // Recarga la página
      } else {
        setErrorMessage(data.message || 'Credenciales no válidas');
      }
    } catch (error) {
      setErrorMessage('Error en el servidor');
      console.error(error);
    }
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
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
