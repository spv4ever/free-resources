import React, { useEffect } from 'react';
import { FaTiktok } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/ThreeDPrintsPage.css';

const TIKTOK_ACCOUNT = {
  username: '3dprints_by_keikodev',
  url: 'https://www.tiktok.com/@3dprints_by_keikodev',
};

const PRINTS_SECTIONS = [
  {
    id: 'mis-disenos',
    title: 'Modelos 3D',
    emoji: '🧩',
    description: 'Modelos 3D listos para imprimir',
    bullets: [
      'Explora nuestro catálogo de diseños optimizados para impresión 3D, con fichas completas, múltiples imágenes y toda la información necesaria para imprimir sin complicaciones.',
      'Vista previa con imágenes detalladas del modelo.',
      'Especificaciones claras: tamaño, material, dificultad y recomendaciones.',
      'Diseños optimizados para impresión real, no solo visual.',
      'Acceso directo a descarga o publicación en MakerWorld.',
    ],
    status: 'Catálogo de modelos disponible',
    cta: { to: '/3dprints-keiko/modelos', label: 'Explorar catálogo de modelos' },
  },
  {
    id: 'filamentos',
    title: 'Filamentos / Colores',
    emoji: '🧵',
    description: 'Filamentos y combinaciones de color',
    bullets: [
      'Descubre los mejores materiales y colores para tus impresiones, con configuraciones recomendadas y ejemplos reales de uso.',
      'Información de marcas, materiales y acabados.',
      'Recomendaciones de temperatura y ajustes de impresión.',
      'Vista previa de colores aplicados en modelos reales.',
      'Enlaces directos para compra o referencia.',
    ],
    status: 'Catálogo de filamentos disponible',
    cta: { to: '/3dprints-keiko/filamentos', label: 'Ver catálogo de filamentos' },
  },
  {
    id: 'calculadora-costes',
    title: 'Calculadora de costes 3D',
    emoji: '🧮',
    description: 'Calcula costes de impresión y precio final',
    bullets: [
      'Configura todos los costes: filamentos por peso, electricidad, desgaste de máquina, mano de obra y extras.',
      'Modo de beneficio predefinido: x3 mayorista, x4 minorista, x5 llaveros.',
      'Modo "otros" para definir porcentaje de beneficio personalizado.',
      'Precio final con opción de redondeo siempre hacia arriba.',
      'Guardado de proyectos para usuarios PRO y ADMIN.',
    ],
    status: 'Nueva calculadora disponible',
    cta: { to: '/3dprints-keiko/calculadora-costes', label: 'Abrir calculadora de costes' },
  },
  {
    id: 'material',
    title: 'Material y herramientas',
    emoji: '🛠️',
    description: 'Herramientas y accesorios esenciales',
    bullets: [
      'Todo lo que necesitas para mejorar tus impresiones: desde mantenimiento hasta optimización del resultado final.',
      'Selección de herramientas, boquillas, camas y adhesivos.',
      'Recursos para mantenimiento y mejora de calidad.',
      'Guías, recomendaciones y configuraciones prácticas.',
      'Base en crecimiento con nuevos recursos constantemente.',
    ],
    status: 'Recursos y herramientas en expansión',
    cta: { to: '/3dprints-keiko', label: 'Explorar recursos y herramientas' },
  },
];

function ThreeDPrintsPage() {
  useEffect(() => {
    const existingTikTokScript = document.querySelector('script[data-tiktok-embed="creator-profile"]');

    if (existingTikTokScript) {
      existingTikTokScript.remove();
    }

    const tikTokScript = document.createElement('script');
    tikTokScript.src = 'https://www.tiktok.com/embed.js';
    tikTokScript.async = true;
    tikTokScript.setAttribute('data-tiktok-embed', 'creator-profile');
    document.body.appendChild(tikTokScript);

    return () => {
      tikTokScript.remove();
    };
  }, []);

  return (
    <div className="three-d-prints-page">
      <section id="three-d-sections" className="three-d-sections">
        <div className="three-d-sections__header">
          <span>Bloques modulares</span>
          <h2>Cuatro secciones base para seguir ampliando 3DPrints by Keiko</h2>
          <p>
            Cada bloque nace como un módulo independiente para que en el futuro puedas sumar tantas categorías como necesites.
          </p>
        </div>

        <div className="three-d-sections__grid">
          {PRINTS_SECTIONS.map((section, index) => (
            <article key={section.id} className="three-d-section-card">
              <div className="three-d-section-card__top">
                <span className="three-d-section-card__index">{String(index + 1).padStart(2, '0')}</span>
                <span className="three-d-section-card__emoji" aria-hidden="true">{section.emoji}</span>
              </div>

              <h3>{section.title}</h3>
              <p>{section.description}</p>

              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>

              <div className="three-d-section-card__footer">
                <span>{section.status}</span>
                {section.cta && <Link to={section.cta.to}>{section.cta.label}</Link>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="three-d-social-feed three-d-social-feed--tiktok" aria-labelledby="three-d-tiktok-feed-title">
        <div className="three-d-social-feed__content">
          <div className="three-d-social-feed__copy">
            <span>Feed TikTok</span>
            <h2 id="three-d-tiktok-feed-title">Últimos vídeos del perfil de TikTok</h2>
            <p>
              Descubre nuestros últimos vídeos directamente desde TikTok. Este espacio se actualiza automáticamente para que no te pierdas ninguna novedad, contenido creativo o lanzamiento reciente.
            </p>
            <a className="three-d-social-feed__button" href={TIKTOK_ACCOUNT.url} target="_blank" rel="noopener noreferrer">
              <span>Ver en</span>
              <FaTiktok aria-hidden="true" />
              <span className="sr-only">TikTok</span>
            </a>
          </div>

          <div className="three-d-social-feed__embed">
            <blockquote
              className="tiktok-embed"
              cite={TIKTOK_ACCOUNT.url}
              data-unique-id={TIKTOK_ACCOUNT.username}
              data-embed-from="embed_page"
              data-embed-type="creator"
            >
              <section>
                <a href={`${TIKTOK_ACCOUNT.url}?refer=creator_embed`} target="_blank" rel="noopener noreferrer">
                  @{TIKTOK_ACCOUNT.username}
                </a>
              </section>
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ThreeDPrintsPage;
