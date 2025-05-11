import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/VerifySuccessPage.css';

const VerifySuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="verify-container">
      <h2>✅ ¡Tu cuenta ha sido verificada!</h2>
      <p>Ya puedes iniciar sesión con tus credenciales.</p>
      <button onClick={() => navigate('/login')}>Ir a Login</button>
    </div>
  );
};

export default VerifySuccessPage;
