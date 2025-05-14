import React from 'react';

const PrivacyPolicy = () => {
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
      <h1 style={titleStyle}>Política de Privacidad</h1>

      <p>
        En cumplimiento del Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica de Protección de Datos y Garantía de los Derechos Digitales (LOPDGDD), informamos a los usuarios sobre el tratamiento de sus datos personales al navegar por esta web: <strong>keikodev.es</strong>.
      </p>

      <h2 style={titleStyle}>1. Responsable del tratamiento</h2>
      <p>
        <strong>Nombre:</strong> Alberto García Sabadell<br />
        <strong>Email:</strong> <a href="mailto:keikodevfree@gmail.com" style={linkStyle}>keikodevfree@gmail.com</a><br />
        <strong>Ubicación:</strong> Segur de Calafell, España
      </p>

      <h2 style={titleStyle}>2. Finalidad del tratamiento</h2>
      <p>Los datos personales se recogen con los siguientes fines:</p>
      <ul>
        <li>Gestionar las consultas recibidas a través del correo electrónico.</li>
        <li>Ofrecer contenidos y recursos informativos relacionados con tecnología y educación.</li>
        <li>Analizar el comportamiento de navegación mediante herramientas como Google Analytics.</li>
        <li>Mostrar publicidad personalizada a través de plataformas como Adsterra.</li>
        <li>Gestionar el acceso a cuentas de usuario registradas (email y contraseña).</li>
      </ul>

      <h2 style={titleStyle}>3. Datos que recopilamos</h2>
      <p>
        Se pueden recoger los siguientes datos personales:
      </p>
      <ul>
        <li>Dirección de correo electrónico (si el usuario contacta o se suscribe).</li>
        <li>Dirección IP y datos técnicos de navegación.</li>
        <li>Cookies de terceros con fines analíticos y publicitarios.</li>
      </ul>

      <h2 style={titleStyle}>4. Base legal del tratamiento</h2>
      <p>
        El tratamiento de los datos se basa en el consentimiento expreso del usuario, así como en el interés legítimo para el funcionamiento técnico y estadístico de la web.
      </p>

      <h2 style={titleStyle}>5. Destinatarios de los datos</h2>
      <p>
        Los datos no se comparten con terceros, salvo los necesarios para el funcionamiento del sitio, como:
      </p>
      <ul>
        <li><strong>Google Analytics:</strong> análisis del comportamiento de navegación.</li>
        <li><strong>Adsterra:</strong> servicio de anuncios personalizados.</li>
      </ul>

      <h2 style={titleStyle}>6. Derechos del usuario</h2>
      <p>El usuario puede ejercer los siguientes derechos:</p>
      <ul>
        <li>Acceder a sus datos personales.</li>
        <li>Solicitar la rectificación o supresión de sus datos.</li>
        <li>Solicitar la limitación u oposición al tratamiento.</li>
        <li>Solicitar la portabilidad de los datos (cuando aplique).</li>
      </ul>
      <p>
        Para ejercer estos derechos, puede enviar una solicitud al correo <a href="mailto:keikodevfree@gmail.com" style={linkStyle}>keikodevfree@gmail.com</a>.
      </p>

      <h2 style={titleStyle}>7. Conservación de los datos</h2>
      <p>
        Los datos se conservarán solo el tiempo necesario para los fines descritos, o hasta que el usuario solicite su eliminación.
      </p>

      <h2 style={titleStyle}>8. Seguridad</h2>
      <p>
        Se han implementado medidas técnicas y organizativas para proteger la información personal contra pérdida, mal uso o acceso no autorizado.
      </p>

      <h2 style={titleStyle}>9. Cambios en esta política</h2>
      <p>
        Esta política puede actualizarse en el futuro. Se recomienda revisar periódicamente esta sección.
      </p>

      <h2 style={titleStyle}>10. Registro de usuarios</h2>
        <p>
          Cuando un usuario se registra en la plataforma, se solicitan únicamente dos datos: su dirección de correo electrónico y una contraseña.
        </p>
        <p>
          La contraseña es tratada de forma segura mediante cifrado con tecnología <strong>bcrypt</strong>, y no es visible ni accesible directamente por el responsable del tratamiento.
        </p>
        <p>
          Los datos se utilizan exclusivamente para permitir el acceso a la cuenta personal, y no serán cedidos a terceros ni usados para otros fines sin el consentimiento del usuario.
        </p>
    </div>
  );
};

export default PrivacyPolicy;
