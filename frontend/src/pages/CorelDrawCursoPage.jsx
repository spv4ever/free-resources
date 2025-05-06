import React from 'react';
import '../styles/CursoPage.css';

const CorelDrawCursoPage = () => {
  return (
    <div className="curso-container">
      <h1>Curso de Corel Draw - Introducción</h1>
      <p>
        En este capítulo exploraremos las herramientas básicas de Corel Draw y cómo empezar tu primer diseño vectorial.
      </p>

      <div className="video-wrapper">
        <iframe
          src="https://terabox.com/sharing/embed?surl=9HxBvHShKJ6blnOk6f1ZPg&resolution=720&autoplay=false&mute=false&uk=4402253837231&fid=859619019109257&slid="
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          title="Curso Corel Draw"
        ></iframe>
      </div>

      <p style={{ marginTop: '1rem' }}>
        ¿Te gustó este capítulo? Explora más recursos en nuestra sección de formación.
      </p>
    </div>
  );
};

export default CorelDrawCursoPage;
