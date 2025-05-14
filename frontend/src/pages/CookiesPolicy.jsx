import React from 'react';

const CookiesPolicy = () => {
  const containerStyle = {
    padding: '2rem',
    maxWidth: '800px',
    margin: 'auto',
    lineHeight: '1.8',
    color: '#e0e0e0',
    backgroundColor: '#121212',
    fontFamily: 'sans-serif'
  };

  const titleStyle = {
    color: '#ffffff'
  };

  const linkStyle = {
    color: '#00bfff',
    textDecoration: 'none'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Política de Cookies</h1>

      <p>
        Esta web utiliza cookies propias y de terceros con la finalidad de mejorar la experiencia del usuario, ofrecer contenido personalizado y analizar el tráfico de navegación.
      </p>

      <h2 style={titleStyle}>1. ¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos que se almacenan en el navegador del usuario al visitar una página web. Sirven para recordar información sobre la visita, como el idioma, las preferencias o datos de acceso.
      </p>

      <h2 style={titleStyle}>2. Tipos de cookies que usamos</h2>
      <ul>
        <li><strong>Cookies técnicas:</strong> necesarias para el funcionamiento básico del sitio.</li>
        <li><strong>Cookies de análisis:</strong> como las de Google Analytics, que recopilan datos estadísticos de forma anónima.</li>
        <li><strong>Cookies publicitarias:</strong> como las de Adsterra, que muestran anuncios personalizados según el comportamiento del usuario.</li>
      </ul>

      <h2 style={titleStyle}>3. Cookies de terceros</h2>
      <p>
        Este sitio utiliza servicios externos como:
      </p>
      <ul>
        <li><strong>Google Analytics</strong> – <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>Política de privacidad</a></li>
        <li><strong>Adsterra</strong> – red publicitaria que instala cookies para mostrar anuncios relevantes.</li>
      </ul>

      <h2 style={titleStyle}>4. Cómo gestionar las cookies</h2>
      <p>
        El usuario puede permitir, bloquear o eliminar las cookies desde la configuración del navegador:
      </p>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={linkStyle}>Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies" target="_blank" rel="noopener noreferrer" style={linkStyle}>Mozilla Firefox</a></li>
        <li><a href="https://support.microsoft.com/es-es/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank" rel="noopener noreferrer" style={linkStyle}>Internet Explorer</a></li>
        <li><a href="https://support.apple.com/es-es/HT201265" target="_blank" rel="noopener noreferrer" style={linkStyle}>Safari</a></li>
      </ul>

      <h2 style={titleStyle}>5. Consentimiento</h2>
      <p>
        Al navegar y continuar en esta web, el usuario consiente el uso de cookies en las condiciones contenidas en esta política.
      </p>

      <h2 style={titleStyle}>6. Cambios en esta política</h2>
      <p>
        Esta política puede actualizarse. Se recomienda revisarla periódicamente para estar informado de cualquier cambio.
      </p>
    </div>
  );
};

export default CookiesPolicy;
