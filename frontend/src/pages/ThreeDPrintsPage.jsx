import React, { useEffect, useState } from 'react';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/ThreeDPrintsPage.css';

const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');

const TIKTOK_ACCOUNT = {
  username: '3dprints_by_keikodev',
  url: 'https://www.tiktok.com/@3dprints_by_keikodev',
};

const INSTAGRAM_ACCOUNT = {
  username: '3dprintsbykeiko',
  url: 'https://www.instagram.com/3dprintsbykeiko/',
};

const PRINTS_SECTIONS = [
  {
    id: 'mis-disenos',
    title: 'Modelos 3D',
    emoji: '🧩',
    description: 'Catálogo para publicar diseños con ficha completa, MakerWorld opcional, galería, tamaños, materiales y metadatos de impresión.',
    bullets: [
      'Modelos con imagen principal y múltiples imágenes secundarias.',
      'Fichas con tipo, material, tamaño, colores, dificultad, peso y notas.',
      'Panel admin con CRUD para gestionar todo el catálogo desde el menú de administración.',
    ],
    status: 'Catálogo dinámico disponible',
    cta: { to: '/3dprints-keiko/modelos', label: 'Ver catálogo de modelos' },
  },
  {
    id: 'filamentos',
    title: 'Filamentos / Colores',
    emoji: '🧵',
    description: 'Catálogo conectado a base de datos con tarjetas visuales, detalle ampliado, imagen de tarjeta de color y enlace de compra.',
    bullets: [
      'Fichas públicas con marca, material, color y temperaturas recomendadas.',
      'Página de detalle para mostrar especificaciones completas y notas de impresión.',
      'Panel admin CRUD para alta, edición, borrado y carga de imagen de muestra.',
    ],
    status: 'Catálogo dinámico disponible',
    cta: { to: '/3dprints-keiko/filamentos', label: 'Ver catálogo de filamentos' },
  },
  {
    id: 'material',
    title: 'Material',
    emoji: '🛠️',
    description: 'Zona reservada para herramientas, accesorios, recambios y todo el ecosistema que acompaña a la impresión 3D.',
    bullets: [
      'Base para listar herramientas, boquillas, camas, adhesivos y mantenimiento.',
      'Lista para enlazar guías, recomendaciones y packs de trabajo.',
      'Pensada para soportar nuevas categorías sin rehacer la interfaz.',
    ],
    status: 'Diseño modular para nuevas subsecciones',
  },
];

function ThreeDPrintsPage() {
  const [instagramFeed, setInstagramFeed] = useState([]);
  const [instagramMeta, setInstagramMeta] = useState(null);
  const [instagramLoading, setInstagramLoading] = useState(true);
  const [instagramError, setInstagramError] = useState('');
  const [instagramWarning, setInstagramWarning] = useState('');

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

  useEffect(() => {
    let cancelled = false;

    async function loadInstagramFeed() {
      try {
        setInstagramLoading(true);
        setInstagramError('');
        setInstagramWarning('');

        const response = await fetch(`${API_BASE}/api/instagram/public-feed?username=${encodeURIComponent(INSTAGRAM_ACCOUNT.username)}&limit=6`);
        const text = await response.text();
        const payload = text ? JSON.parse(text) : null;

        if (!response.ok) {
          throw new Error(payload?.error || 'No se pudo cargar el feed de Instagram');
        }

        if (!cancelled) {
          setInstagramMeta(payload);
          setInstagramFeed(Array.isArray(payload?.posts) ? payload.posts : []);
          setInstagramWarning(payload?.warning || '');
        }
      } catch (error) {
        if (!cancelled) {
          setInstagramError(error.message || 'No se pudo cargar el feed de Instagram');
          setInstagramFeed([]);
        }
      } finally {
        if (!cancelled) {
          setInstagramLoading(false);
        }
      }
    }

    loadInstagramFeed();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="three-d-prints-page">
      <section id="three-d-sections" className="three-d-sections">
        <div className="three-d-sections__header">
          <span>Bloques iniciales</span>
          <h2>Una base modular para seguir ampliando 3DPrints by Keiko</h2>
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

      <section className="three-d-social-feed" aria-labelledby="three-d-instagram-feed-title">
        <div className="three-d-social-feed__content">
          <div className="three-d-social-feed__copy">
            <span>Feed Instagram</span>
            <h2 id="three-d-instagram-feed-title">Últimas publicaciones del perfil de Instagram</h2>
            <p>
              Ahora el bloque carga una galería real de publicaciones recientes del perfil de Instagram para que el feed sí se vea directamente en la página.
            </p>
            <a className="three-d-social-feed__button" href={INSTAGRAM_ACCOUNT.url} target="_blank" rel="noopener noreferrer">
              <span>Ver en</span>
              <FaInstagram aria-hidden="true" />
              <span className="sr-only">Instagram</span>
            </a>
            {instagramMeta?.followers ? (
              <small className="three-d-social-feed__meta">{instagramMeta.followers.toLocaleString('es-ES')} seguidores</small>
            ) : null}
          </div>

          <div className="three-d-social-feed__embed three-d-social-feed__embed--instagram-grid">
            {instagramLoading ? <p className="three-d-social-feed__status">Cargando feed de Instagram…</p> : null}
            {!instagramLoading && instagramError ? (
              <div className="three-d-social-feed__status three-d-social-feed__status--error">
                <p>{instagramError}</p>
                <a href={INSTAGRAM_ACCOUNT.url} target="_blank" rel="noopener noreferrer">
                  Abrir perfil en Instagram
                </a>
              </div>
            ) : null}
            {!instagramLoading && !instagramError && instagramWarning ? (
              <div className="three-d-social-feed__status">
                <p>{instagramWarning}</p>
                <a href={INSTAGRAM_ACCOUNT.url} target="_blank" rel="noopener noreferrer">
                  Abrir perfil en Instagram
                </a>
              </div>
            ) : null}
            {!instagramLoading && !instagramError && instagramFeed.length > 0 ? (
              <div className="three-d-instagram-grid">
                {instagramFeed.map((post) => (
                  <a
                    key={post.id}
                    className="three-d-instagram-card"
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={post.thumbnailUrl} alt={post.caption || `Publicación de Instagram de ${INSTAGRAM_ACCOUNT.username}`} loading="lazy" />
                    <div className="three-d-instagram-card__overlay">
                      <span>{post.isVideo ? '▶ Reel / vídeo' : '📷 Publicación'}</span>
                      {post.caption ? <p>{post.caption}</p> : null}
                    </div>
                  </a>
                ))}
              </div>
            ) : null}
            {!instagramLoading && !instagramError && !instagramWarning && instagramFeed.length === 0 ? (
              <div className="three-d-social-feed__status">
                <p>No hay publicaciones disponibles ahora mismo.</p>
                <a href={INSTAGRAM_ACCOUNT.url} target="_blank" rel="noopener noreferrer">
                  Abrir perfil en Instagram
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ThreeDPrintsPage;
