import EmailArticleEntry from '../models/EmailArticleEntry.js';

export function extractGoogleAlertArticles(html) {
  try {
    const match = html.match(/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (!match) return [];

    const jsonData = JSON.parse(match[1]);
    const widgets = jsonData?.cards?.[0]?.widgets || [];

    const articles = widgets
      .filter(w => w.type === 'LINK')
      .map(w => ({
        title: w.title,
        description: w.description,
        url: w.url
      }));

    return articles;
  } catch (err) {
    console.error('❌ Error extrayendo artículos:', err.message);
    return [];
  }
}

export async function saveArticlesFromEmail(emailDoc) {
  const articles = extractGoogleAlertArticles(emailDoc.html);

  const resultados = [];

  for (const article of articles) {
    const alreadyExists = await EmailArticleEntry.findOne({ url: article.url });
    if (alreadyExists) continue;

    const nuevo = await EmailArticleEntry.create({
      emailId: emailDoc._id,
      title: article.title,
      description: article.description,
      url: article.url,
      context: emailDoc.context
    });

    resultados.push(nuevo);
  }

  return resultados;
}
