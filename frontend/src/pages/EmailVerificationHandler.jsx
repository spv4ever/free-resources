import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/EmailVerificationHandler.css';

const EmailVerificationHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading | success | error | invalid
  const [hasChecked, setHasChecked] = useState(false); // ✅ clave para evitar el flash

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('invalid');
      setHasChecked(true);
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/verify-email?token=${token}`);
        if (res.status === 200) {
          setStatus('success');
          setTimeout(() => navigate('/verify-success'), 2000);
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      } finally {
        setHasChecked(true); // ✅ solo ahora permitimos el render
      }
    };

    verify();
  }, [searchParams, navigate]);

  if (!hasChecked) return null; // 🔒 bloquea completamente el render

  return (
    <div className="email-verify-handler">
      {status === 'loading' && (
        <>
          <div className="spinner"></div>
          <p>Verificando tu cuenta, por favor espera...</p>
        </>
      )}
      {status === 'success' && <p className="success">✅ Cuenta verificada. Redirigiendo...</p>}
      {status === 'error' && <p className="error">❌ El token es inválido o expiró.</p>}
      {status === 'invalid' && <p className="error">❌ Token no proporcionado.</p>}
    </div>
  );
};

export default EmailVerificationHandler;
