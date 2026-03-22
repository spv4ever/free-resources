import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ThreeDPrintsPage.css';

const PRINTS_SECTIONS = [
  {
    id: 'mis-disenos',
    title: 'Mis Diseños',
    emoji: '🧩',
    description: 'Colección principal para publicar creaciones propias, organizar modelos destacados y preparar futuras fichas descargables.',
    bullets: [
      'Escaparate de piezas y prototipos creados por Keiko.',
      'Espacio listo para añadir galerías, filtros y fichas por proyecto.',
      'Ideal para conectar después STL, renders, tiempos de impresión y revisiones.',
    ],
    status: 'Frontend base listo para crecer',
  },
  {
    id: 'filamentos',
    title: 'Filamentos / Colores',
    emoji: '🧵',
    description: 'Área pensada para clasificar materiales por marca, color, acabado o configuración recomendada de impresión.',
    bullets: [
      'Comparativas de colores, texturas y resultados reales.',
      'Preparado para incorporar perfiles, temperaturas y notas de uso.',
      'Escalable para catálogos amplios con filtros por fabricante o impresora.',
    ],
    status: 'Sección preparada para catálogos dinámicos',
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
  return (
    <div className="three-d-prints-page">
      <section className="three-d-hero">
        <span className="three-d-hero__eyebrow">Nuevo espacio en construcción</span>
        <h1>🖨️ 3DPrints by Keiko</h1>
        <p>
          Empezamos con un frontend sólido y escalable para que esta sección pueda crecer sin fricción.
          Hoy nace con tres bloques principales, pero la estructura ya está preparada para alojar muchas más áreas.
        </p>

        <div className="three-d-hero__actions">
          <a href="#three-d-sections" className="three-d-button three-d-button--primary">Ver secciones iniciales</a>
          <Link to="/" className="three-d-button three-d-button--secondary">Volver al inicio</Link>
        </div>
      </section>

      <section className="three-d-overview">
        <article className="three-d-overview__card">
          <strong>Arquitectura escalable</strong>
          <p>Las tarjetas y la navegación de esta página se renderizan desde una estructura de datos, facilitando añadir nuevas secciones.</p>
        </article>
        <article className="three-d-overview__card">
          <strong>Preparado para catálogo</strong>
          <p>Más adelante se podrán conectar colecciones, fichas, filtros, imágenes, descargas y comparativas sin rehacer la base visual.</p>
        </article>
        <article className="three-d-overview__card">
          <strong>Enfoque iterativo</strong>
          <p>Primero consolidamos la experiencia visual y después podremos incorporar contenido real, backend o herramientas específicas.</p>
        </article>
      </section>

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
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ThreeDPrintsPage;
