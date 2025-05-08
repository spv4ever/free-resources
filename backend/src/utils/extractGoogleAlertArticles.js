
import * as cheerio from 'cheerio';

/**
 * Parsea el HTML de un correo de Google Alerts y extrae las noticias.
 * @param {string} html - Contenido HTML del correo.
 * @returns {Array} Lista de objetos con título, descripción y URL.
 */
export function extractGoogleAlertArticles(html) {
  const $ = cheerio.load(html);
  const articles = [];

  $('tr[itemtype="http://schema.org/Article"]').each((_, element) => {
    const row = $(element);
    const title = row.find('[itemprop="name"]').text().trim();
    const description = row.find('[itemprop="description"]').text().trim();
    const url = row.find('[itemprop="url"]').attr('href');

    if (title && url) {
      articles.push({
        title,
        description,
        url,
      });
    }
  });

  return articles;
}
