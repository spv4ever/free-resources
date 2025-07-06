import React from 'react';
// import MetaTags from '../components/MetaTags';

const LegalNotice = () => {
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

  // const linkHoverStyle = {
  //   textDecoration: 'underline'
  // };

  return (
    <div style={containerStyle}>
      {/* <MetaTags 
        title="Aviso Legal - Keikodev"
        description="Consulta el aviso legal de Keikodev, incluyendo información sobre el titular de la web, finalidad, condiciones de uso y propiedad intelectual."
      /> */}
      <h1 style={titleStyle}>Aviso Legal</h1>

      <p><strong>Titular de la web:</strong> Alberto García Sabadell</p>
      <p>
        <strong>Correo electrónico de contacto:</strong>{' '}
        <a href="mailto:keikodevfree@gmail.com" style={linkStyle}>keikodevfree@gmail.com</a>
      </p>
      <p><strong>Localización:</strong> Segur de Calafell, España</p>
      <p>
        <strong>Dominio web:</strong>{' '}
        <a href="https://keikodev.es" target="_blank" rel="noopener noreferrer" style={linkStyle}>https://keikodev.es</a>
      </p>

      <h2 style={titleStyle}>1. Finalidad del sitio web</h2>
      <p>
        La web keikodev.es ofrece recursos gratuitos, enlaces de interés, herramientas online, noticias y contenidos relacionados con tecnología, ciberseguridad, inteligencia artificial y otros temas educativos o informativos.
      </p>

      <h2 style={titleStyle}>2. Condiciones de uso</h2>
      <p>
        El acceso y la navegación atribuyen la condición de usuario e implican la aceptación de este aviso legal. No se permite el uso con fines ilícitos o lesivos.
      </p>

      <h2 style={titleStyle}>3. Propiedad intelectual</h2>
      <p>
        Los contenidos están protegidos por la normativa de propiedad intelectual. No se permite su reproducción sin consentimiento expreso.
      </p>

      <h2 style={titleStyle}>4. Publicidad</h2>
      <p>
        Este sitio muestra anuncios mediante plataformas como Adsterra. El titular no se responsabiliza del contenido ofrecido por terceros anunciantes.
      </p>

      <h2 style={titleStyle}>5. Enlaces a terceros</h2>
      <p>
        Los enlaces a sitios externos no implican responsabilidad del titular respecto a sus contenidos o políticas.
      </p>

      <h2 style={titleStyle}>6. Limitación de responsabilidad</h2>
      <p>
        No se garantiza la disponibilidad continua del sitio ni la ausencia de errores técnicos ajenos al titular.
      </p>

      <h2 style={titleStyle}>7. Legislación aplicable</h2>
      <p>
        Este aviso legal se rige por la legislación española. En caso de conflicto, las partes se someterán a los tribunales de Tarragona, salvo disposición legal en contrario.
      </p>
    </div>
  );
};

export default LegalNotice;
