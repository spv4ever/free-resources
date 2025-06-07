import Serie from '../models/Series.js'; // usa tu modelo real

export const renderShareSerie = async (req, res) => {
  try {
    const serie = await Serie.findOne({ tmdbId: req.params.id });

    if (!serie) return res.status(404).send('Serie no encontrada');

    const { title, overview, posterPath, tmdbId } = serie;
    const finalUrl = `https://keikodev.es/series/${tmdbId}`;
    const imageUrl = posterPath || 'https://keikodev.es/assets/series-default.jpg';

    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Compartiendo: ${title}</title>

        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${(overview || '').slice(0, 200)}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="${finalUrl}" />
        <meta property="og:type" content="video.tv_show" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${(overview || '').slice(0, 200)}" />
        <meta name="twitter:image" content="${imageUrl}" />

        <meta http-equiv="refresh" content="1; URL='${finalUrl}'" />
      </head>
      <body>
        <p>Redirigiendo a <a href="${finalUrl}">${title}</a>...</p>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Error en renderShareSerie:', err);
    res.status(500).send('Error interno del servidor');
  }
};
