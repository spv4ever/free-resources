import React from 'react';
import YoutubeUploadForm from '../components/YoutubeUploadForm';
import '../styles/YouTubeLanding.css';

function YouTubeLandingPage() {
  return (
    <div className="yt-landing-container">
      <header className="yt-header">
        <h1>Sube y Programa tus Videos en YouTube</h1>
        <p>Automatiza tus publicaciones con nuestra herramienta gratuita en fase beta.</p>
      </header>

      <section className="yt-section yt-benefits">
        <h2>✨ Beneficios</h2>
        <ul>
          <li>🚀 Subida rápida y optimizada desde el navegador.</li>
          <li>🗕️ Programación exacta de fecha y hora.</li>
          <li>📝 Edición de título, descripción y etiquetas.</li>
          <li>📊 Seguimiento de subidas recientes.</li>
          <li>🔒 Acceso exclusivo para miembros autorizados.</li>
        </ul>
      </section>

      <section className="yt-section yt-instructions">
        <h2>❓ Cómo funciona</h2>
        <ol>
          <li>🔗 Conecta tu cuenta de YouTube con un clic.</li>
          <li>📁 Selecciona el archivo de video.</li>
          <li>✍️ Rellena los detalles del video.</li>
          <li>⏰ Programa la fecha y hora.</li>
          <li>✅ Pulsa "Subir y programar" y listo.</li>
        </ol>
      </section>

      <section className="yt-cta-box">
        <h2>Formulario de subida</h2>
        <p>Completa los campos y lanza tu video en minutos. Si es tu primera vez, contacta con el administrador tras registrarte para activar la función beta.</p>
        <div className="yt-beta-info">
          <p>🔐 Esta funcionalidad está protegida y en fase <strong>beta</strong>.</p>
        </div>
        <YoutubeUploadForm />
      </section>

      <footer className="yt-footer-note">
        <p>📊 Agradecemos tu feedback para seguir mejorando esta herramienta.</p>
      </footer>
    </div>
  );
}

export default YouTubeLandingPage;
