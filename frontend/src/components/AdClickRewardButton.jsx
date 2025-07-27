import { useEffect, useState } from 'react';
import API from '../utils/api';

const AD_URL = 'https://cockpiteconomicspayroll.com/ab8hb45if?key=717b6a4728a329b76dfa3e233cf65300';

export default function AdClickRewardButton({ className = '', style = {} }) {
  const [clicks, setClicks] = useState(0);
  const [mensaje, setMensaje] = useState('');

  const handleClick = async () => {
    try {
      const res = await API.post('/api/tracking/click');
      setClicks(res.data.clicks);

      if (res.data.rewardGiven) {
        setMensaje('🎉 ¡Has ganado 1 token!');
        setTimeout(() => setMensaje(''), 4000);
      }

      // Abrir enlace publicitario en nueva pestaña
      window.open(AD_URL, '_blank');
    } catch (err) {
      console.error('❌ Error al registrar clic:', err);
      setMensaje('Error al registrar clic.');
    }
  };

  useEffect(() => {
    // Opcional: podrías cargar el número actual de clics desde backend
    // para persistencia entre sesiones (añadir otro endpoint si lo deseas)
  }, []);

  return (
    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
      <button
        onClick={handleClick}
        className={className}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#ffcc00',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          ...style
        }}
      >
        💸 Apoyar (clics: {clicks}/5) = 1 tokens
      </button>
      {mensaje && <p style={{ marginTop: '0.5rem', color: 'limegreen' }}>{mensaje}</p>}
    </div>
  );
}
