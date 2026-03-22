import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ThreeDPrintsPage.css';

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
    </div>
  );
}

export default ThreeDPrintsPage;
