import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css'; // opcional para estilos



const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const validations = {
      minLength: pwd.length >= 8,
      hasNumber: /\d/.test(pwd),
      hasSymbol: /[^A-Za-z0-9]/.test(pwd),
      hasUppercase: /[A-Z]/.test(pwd)
    };
    return validations;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessage('');

    if (password !== repeatPassword) {
      setErrors(['Las contraseñas no coinciden.']);
      return;
    }

    const validations = validatePassword(password);
    const failed = Object.entries(validations)
      .filter(([_, valid]) => !valid)
      .map(([rule]) => {
        switch (rule) {
          case 'minLength': return 'Al menos 8 caracteres';
          case 'hasNumber': return 'Debe incluir un número';
          case 'hasSymbol': return 'Debe incluir un símbolo';
          case 'hasUppercase': return 'Debe incluir una mayúscula';
          default: return '';
        }
      });

    if (failed.length) {
      setErrors(failed);
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        email,
        password
      });

      setMessage(res.data.message);
      setEmail('');
      setPassword('');
      setRepeatPassword('');
      // Redirige después de 3 segundos
    setTimeout(() => {
        navigate('/login');
    }, 3000);
    } catch (err) {
      setErrors([err.response?.data?.message || 'Error al registrar']);
    }
  };

  const pwdCheck = validatePassword(password);

  return (
    <div className="register-container">
      <h2>Registro de nuevo usuario</h2>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Contraseña:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <ul className="password-check">
          <li style={{ color: pwdCheck.minLength ? 'green' : 'red' }}>✔ Al menos 8 caracteres</li>
          <li style={{ color: pwdCheck.hasUppercase ? 'green' : 'red' }}>✔ Una mayúscula</li>
          <li style={{ color: pwdCheck.hasNumber ? 'green' : 'red' }}>✔ Un número</li>
          <li style={{ color: pwdCheck.hasSymbol ? 'green' : 'red' }}>✔ Un símbolo</li>
        </ul>

        <label>Repite la contraseña:</label>
        <input type="password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required />

        <button type="submit">Registrarse</button>
      </form>

      {errors.length > 0 && (
        <div className="error-box">
          {errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      {message && <p className="success-message">{message}</p>}
    </div>
  );
};

export default RegisterPage;
