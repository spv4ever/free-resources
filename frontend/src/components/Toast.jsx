import { useEffect } from 'react';

const toastStyle = {
  position: 'fixed',
  bottom: '2rem',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#333',
  color: '#fff',
  padding: '0.75rem 1.25rem',
  borderRadius: '8px',
  fontSize: '0.9rem',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  zIndex: 1000,
  animation: 'fadein 0.3s ease, fadeout 0.3s ease 1.7s'
};

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000); // Auto-cierre en 2 segundos
    return () => clearTimeout(timer);
  }, [onClose]);

  return <div style={toastStyle}>{message}</div>;
};

export default Toast;
