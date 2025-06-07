import Serie from '../models/Series.js'; // usa el nombre correcto de tu modelo

export const renderShareSerie = async (req, res) => {
  try {
    const serie = await Serie.findOne({ tmdbId: req.params.id });

    if (!serie) return res.status(404).send('Serie no encontrada');

    const escapeHtml = (str) =>
      String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const title = escapeHtml(serie.title);
    const overview = escapeHtml((serie.overview || '').slice(0, 200));
    const imageUrl = serie.posterPath || 'https://keikodev.es/assets/series-default.jpg';
    const finalUrl = `https://keikodev.es/series/${serie.tmdbId}`;

    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Compartiendo: ${title}</title>

        <!-- Open Graph -->
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${overview}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="${finalUrl}" />
        <meta property="og:type" content="video.tv_show" />

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${overview}" />
        <meta name="twitter:image" content="${imageUrl}" />

        <!-- Redirección doble -->
        <meta http-equiv="refresh" content="1; URL='${finalUrl}'" />
        <script>
          setTimeout(() => {
            window.location.href = '${finalUrl}';
          }, 1000);
        </script>
      </head>
      <body>
        <p style="text-align:center; font-family:sans-serif;">
          Redirigiendo a <a href="${finalUrl}">${title}</a>...
        </p>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Error en renderShareSerie:', err);
    res.status(500).send('Error interno del servidor');
  }
};
