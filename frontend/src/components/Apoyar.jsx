import React from 'react';
import md5 from 'md5';
import { useUser } from '../context/UserContext';
// import AdsterraSocialBar from '../components/AdsterraSocialBar';
import AdsterraNativeAd from '../components/AdsterraNativeAd';
import AdClickRewardButton from '../components/AdClickRewardButton';


const Apoyar = () => {
  const { user, loading } = useUser();

  if (loading) return <p>Cargando datos...</p>;
  if (!user || !user._id) return <p>Debes iniciar sesión para acceder al muro de apoyo.</p>;

  const publicHash = process.env.REACT_APP_CPX_PUBLIC_HASH;
  const secureHash = md5(`${user._id}-${publicHash}`);
  const appId = '28371'; // ⚠️ el que te dé CPX
  const cpxUrl = `https://offers.cpx-research.com/index.php?app_id=${appId}&ext_user_id=${user._id}&secure_hash=${secureHash}`;


  return (
    <div style={styles.container}>
      
      <h1 style={styles.heading}>🎁 Apoya el proyecto</h1>
      <p style={styles.paragraph}>
        Ayúdanos completando encuestas voluntarias. A cambio recibirás <strong>créditos</strong> que puedes usar para generar imágenes o acceder a funciones avanzadas.
      </p>
      

      <div style={styles.card}>
        <p style={styles.subheading}>🧠 CPX Research</p>
        <p style={styles.text}>Completa encuestas y gana créditos automáticamente.</p>
        <a href={cpxUrl} target="_blank" rel="noopener noreferrer">
          <button style={styles.button}>Ir al muro de encuestas</button>
        </a>
      </div>
      <AdClickRewardButton />
      <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#777' }}>
        Los créditos se suman a tu cuenta cuando completas una tarea. ¡Gracias por tu apoyo!
      </p>
      {/* <AdsterraSocialBar /> */}
      <AdsterraNativeAd />


    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#1e1e1e',
    color: '#f1f1f1',
    borderRadius: '8px',
    textAlign: 'center',
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  paragraph: {
    fontSize: '1rem',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: '#2a2a2a',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
  },
  subheading: {
    fontSize: '1.2rem',
    marginBottom: '0.5rem',
  },
  text: {
    marginBottom: '1rem',
  },
  button: {
    backgroundColor: '#4caf50',
    border: 'none',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Apoyar;
