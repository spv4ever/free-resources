import { OpenAI } from 'openai';
import CyberScamPost from '../models/CyberScamPost.js';
import EmailEntry from '../models/EmailEntry.js';
import { extractGoogleAlertArticles } from '../utils/extractGoogleAlertArticles.js';
import * as cheerio from 'cheerio';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function safeTrim(value, fallback = 'No detectado') {
  return typeof value === 'string' ? value.trim() : fallback;
}

export async function processEmailToPost(email) {
  try {
    if (!email.html) throw new Error('El campo HTML del correo está vacío o no definido');

    const articles = extractGoogleAlertArticles(email.html);
    if (!articles.length) throw new Error('No se encontraron noticias en el correo.');

    const resultados = [];

    for (const article of articles) {
      const { title, description, url } = article;

      // Paso 1: Análisis
      const prompt1 = `
Eres un experto en ciberseguridad. Analiza el siguiente artículo y responde exclusivamente en este formato:

1. Resumen: [1 párrafo]
2. Clasificación: [phishing, smishing, timo bancario, malware, falsa suscripción, etc.]
3. Explicación: [por qué pertenece a esa categoría]

Artículo: "${title}"
Descripción: "${description}"
Fuente: ${url}
`;

      const completion1 = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt1 }],
      });

      const output = completion1.choices?.[0]?.message?.content;
      if (!output) continue;

      const resumenMatch = output.match(/1\.\s*Resumen:\s*(.+?)(?:\n|$)/s);
      const clasificacionMatch = output.match(/2\.\s*Clasificaci[oó]n:\s*(.+?)(?:\n|$)/s);
      const explicacionMatch = output.match(/3\.\s*Explicaci[oó]n:\s*(.+?)(?:\n|$)/s);

      const resumen = safeTrim(resumenMatch?.[1], 'Resumen no detectado');
      const clasificacion = safeTrim(clasificacionMatch?.[1], 'Clasificación desconocida');
      const explicacion = safeTrim(explicacionMatch?.[1], '');

      // Paso 2: Redacción del artículo
      const prompt2 = `
Redacta una noticia tipo blog informativa, clara y para todos los públicos, basada en el resumen de una ciberestafa.

📝 Formato requerido:
- Empieza con una línea que contenga únicamente el título del artículo entre comillas, precedido por "Título:".
- Luego redacta el cuerpo de la noticia.
- Incluye consejos para evitar este tipo de estafa.

📄 Datos de entrada:
Resumen: "${resumen}"
Clasificación: "${clasificacion}"
Explicación: "${explicacion}"
Fuente: ${url}
`;

      const completion2 = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt2 }],
      });

      const rawRedaccion = safeTrim(completion2.choices?.[0]?.message?.content, 'Redacción no generada');

      // Extraer título y limpiar redacción
      let tituloMatch = rawRedaccion.match(/Título:\s*["“](.+?)["”]/i);
      if (!tituloMatch) {
        tituloMatch = rawRedaccion.match(/T[íi]tulo:\s*(.+?)(?:\n|\.|$)/i);
      }

      const titulo = tituloMatch?.[1]?.trim() || 'Título no disponible';
      const redaccionFinal = rawRedaccion.replace(/T[íi]tulo:\s*(["“].+?["”]|.+?)(\n|\.|$)/is, '').trim();

      // Paso 3: Generar resumen SEO y social post
      const prompt3 = `
Con base en esta redacción:

"${redaccionFinal}"

1. Resume el contenido en una sola frase de máximo 160 caracteres para SEO.
2. Redacta un post para redes sociales (máx. 280 caracteres) que alerte al público general. Usa emojis y lenguaje directo.

Devuelve exactamente este formato:

SEO: ...
SOCIAL: ...
`;

      const completion3 = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt3 }],
      });

      const result3 = completion3.choices?.[0]?.message?.content || '';
      const seoMatch = result3.match(/SEO:\s*(.+)/);
      const socialMatch = result3.match(/SOCIAL:\s*(.+)/);

      const seoSummary = safeTrim(seoMatch?.[1], '');
      const socialPost = safeTrim(socialMatch?.[1], '');

      // Guardar en base de datos
      const nuevoPost = await CyberScamPost.create({
        emailId: email._id,
        resumen,
        redaccion: redaccionFinal,
        clasificacion,
        explicacion,
        titulo,
        fuente: url,
        imageUrl: null,
        seoSummary,
        socialPost,
      });

      resultados.push(nuevoPost);
    }

    return resultados;
  } catch (error) {
    console.error('❌ Error al procesar email a post:', error.message);
    throw error;
  }
}

export async function processLatestPendingEmail() {
  console.log('🔁 Buscando el último email pendiente del contexto "ciberestafas"...');
  const latest = await EmailEntry.findOne({
    context: 'ciberestafas',
    approvedForPost: true,
    postCreated: false
  }).sort({ date: -1 });

  if (!latest) {
    console.log('⚠️ No se encontró ningún email con contexto "ciberestafas".');
    return null;
  }

  const existing = await CyberScamPost.findOne({ emailId: latest._id });
  if (existing) {
    console.log(`🟡 El correo más reciente ya tiene un post asociado (ID: ${latest._id}).`);
    return null;
  }

  const result = await processEmailToPost(latest);

  latest.postCreated = true;
  await latest.save();

  return result;
}
