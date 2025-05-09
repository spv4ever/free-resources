import { OpenAI } from 'openai';
import EmailArticleEntry from '../models/EmailArticleEntry.js';
import CyberScamPost from '../models/CyberScamPost.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function safeTrim(value, fallback = 'No detectado') {
    return typeof value === 'string' ? value.trim() : fallback;
  }

export async function processArticleToPost(article) {
    try {
      if (!article || !article.title || !article.description || !article.url) {
        throw new Error('Artículo incompleto');
      }
  
      // Paso 1: Análisis del artículo
      const prompt1 = `
  Eres un experto en ciberseguridad. Analiza el siguiente artículo y responde exclusivamente en este formato:
  
  1. Resumen: [1 párrafo]
  2. Clasificación: [phishing, smishing, timo bancario, malware, falsa suscripción, etc.]
  3. Explicación: [por qué pertenece a esa categoría]
  
  Título: "${article.title}"
  Descripción: "${article.description}"
  Fuente: ${article.url}
  `;
  
      const completion1 = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt1 }]
      });
  
      const output = completion1.choices?.[0]?.message?.content;
      if (!output) throw new Error('OpenAI no devolvió análisis');
  
      const resumenMatch = output.match(/1\.\s*Resumen:\s*(.+?)(?:\n|$)/s);
      const clasificacionMatch = output.match(/2\.\s*Clasificaci[oó]n:\s*(.+?)(?:\n|$)/s);
      const explicacionMatch = output.match(/3\.\s*Explicaci[oó]n:\s*(.+?)(?:\n|$)/s);
  
      const resumen = safeTrim(resumenMatch?.[1], 'Resumen no detectado');
      const clasificacion = safeTrim(clasificacionMatch?.[1], 'Clasificación desconocida');
      const explicacion = safeTrim(explicacionMatch?.[1], '');
  
      // Paso 2: Redacción extendida
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
  Fuente: ${article.url}
  `;
  
      const completion2 = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt2 }]
      });
  
      const rawRedaccion = safeTrim(completion2.choices?.[0]?.message?.content, 'Redacción no generada');
      const tituloMatch = rawRedaccion.match(/T[íi]tulo:\s*["“]?(.+?)["”]?(?:\n|$)/i);
      const titulo = safeTrim(tituloMatch?.[1], 'Título no disponible');
      const redaccionFinal = rawRedaccion.replace(/T[íi]tulo:\s*["“]?.+?["”]?(?:\n|$)/is, '').trim();
  
      // Paso 3: SEO y Social
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
        messages: [{ role: 'user', content: prompt3 }]
      });
  
      const result3 = completion3.choices?.[0]?.message?.content || '';
      const seoMatch = result3.match(/SEO:\s*(.+)/);
      const socialMatch = result3.match(/SOCIAL:\s*(.+)/);
  
      const seoSummary = safeTrim(seoMatch?.[1], '');
      const socialPost = safeTrim(socialMatch?.[1], '');
  
      // Guardar post en la base de datos
      const nuevoPost = await CyberScamPost.create({
        emailId: article.emailId,
        resumen,
        redaccion: redaccionFinal,
        clasificacion,
        explicacion,
        titulo,
        fuente: article.url,
        imageUrl: null,
        seoSummary,
        socialPost
      });
  
      // Marcar artículo como publicado
      article.postCreated = true;
      await article.save();
  
      return nuevoPost;
  
    } catch (err) {
      console.error('❌ Error al procesar artículo a post:', err.message);
      throw err;
    }
  }
  
  export async function processAllApprovedArticles() {
    const pendientes = await EmailArticleEntry.find({
      approvedForPost: true,
      postCreated: false
    });
  
    console.log(`🧠 Encontrados ${pendientes.length} artículos aprobados sin post.`);
  
    const resultados = [];
  
    for (const article of pendientes) {
      try {
        const post = await processArticleToPost(article);
        resultados.push(post);
      } catch (err) {
        console.error(`❌ Fallo al procesar artículo con ID ${article._id}:`, err.message);
      }
    }
  
    return resultados;
  }
  