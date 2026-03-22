"# free-resources" 
Cambios recomendados (prioridad alta → media)
1) Quitar estilos de debug globales en producción (alta)
Tienes un outline: 1px solid red !important aplicado a *, lo que rompe la apariencia final y puede afectar percepción de calidad. Además, hay duplicación de * { box-sizing: border-box; }.

2) Dividir rutas con lazy loading/code splitting (alta)
App.js centraliza muchísimas importaciones y rutas en un único archivo (~263 líneas), lo que penaliza el bundle inicial y complica mantenimiento. Conviene usar React.lazy + Suspense por secciones (público, auth, admin, utilidades).

3) Homogeneizar seguridad de rutas admin (alta)
Varias rutas admin usan AdminRoute, pero otras no (ej. /admin/ig-monitor, /admin/spacex, /admin/top-series-sync, /admin/anime-options). Esto sugiere una protección inconsistente y potencial exposición de vistas sensibles.

4) Mejorar accesibilidad en componentes clicables (alta)
En HomePage se usan div con onClick como tarjetas navegables; eso no es ideal para teclado/screen readers. Conviene migrar a <button> o <Link> semánticos y añadir focus-visible claro. También el botón hamburguesa en navbar carece de aria-label, aria-expanded, aria-controls.

5) Reducir llamadas duplicadas y normalizar capa API (media-alta)
HomePage hace múltiples axios.get en varios useEffect, todos usando process.env.REACT_APP_API_URL inline. Mejor centralizar en un cliente (api.js), paralelizar con Promise.allSettled, y consolidar loading/error states para evitar renders y lógica dispersa.

6) Rehabilitar SEO técnico (meta dinámicas) (media-alta)
Veo HelmetProvider comentado en index.js, MetaTags totalmente comentado, y en Home también comentado. Estás perdiendo títulos/descripciones por página y Open Graph/Twitter Card dinámicos.

7) Limpiar scripts terceros y revisar impacto de rendimiento/CSP (media)
En public/index.html hay scripts globales de ads y platform.js cargados en todas las páginas. Esto puede afectar LCP/INP y seguridad (CSP). Recomendado: cargar condicionalmente por ruta/componente y con estrategia controlada.

8) Hacer el script de build multiplataforma (media)
El build usa xcopy (Windows), lo que rompe o complica CI/CD Linux/macOS. Cambiar a solución cross-platform (cpx, cpy-cli, script Node) mejora portabilidad y dev experience.

9) Reducir “ruido” y deuda técnica en código fuente (media)
Hay comentarios de “ajusta la ruta”, logs de depuración y carpeta paraborrar en src/pages, lo que indica deuda técnica pendiente y riesgo de confusión para el equipo.

10) Definir estrategia de diseño global coherente (media)
App.css y styles/index.css mezclan reglas globales (tipografías, overflow, fondo oscuro, etc.) que podrían entrar en conflicto. Conviene establecer un “design token layer” (colores, spacing, tipografías) y separar reset/base/components/utilities.

Plan sugerido de ejecución (rápido)
Sprint 1: quitar debug CSS, corregir rutas admin, accesibilidad navbar/cards.

Sprint 2: lazy loading por módulos + refactor HomePage (API/state).

Sprint 3: SEO dinámico + carga controlada de scripts de terceros + build cross-platform.

Sprint 4: limpieza técnica (logs/comentarios/carpeta paraborrar) + unificación de estilos.

Si quieres, en el siguiente paso te preparo un backlog técnico priorizado con esfuerzo estimado (S/M/L) y te propongo PRs pequeños para implementar esto sin romper nada.
