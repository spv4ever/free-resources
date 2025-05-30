import axios from 'axios';
import * as cheerio from 'cheerio';
import openai from '../config/openai.js';

export async function analyzeWithAI(url) {
  try {
    const { data: html } = await axios.get(url, { timeout: 7000 });
    const $ = cheerio.load(html);

    const title = $('title').text().trim();
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 1000); // Limitar longitud

    const resumen = `Título: ${title}
Descripción: ${metaDesc}
Texto visible: ${textContent}`;

    const prompt = `
Analiza el siguiente contenido web. Devuelve una respuesta en JSON con los campos:
- riskLevel: "alto", "medio" o "bajo"
- threatType: tipo de amenaza (ej. phishing, scam, publicidad engañosa, clickbait, etc.)
- summary: breve resumen del contenido
- model: modelo utilizado

Contenido:
"""${resumen}"""
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    });

    let textResponse = response.choices[0].message.content.trim();

        // Eliminar bloques de Markdown si existen
        if (textResponse.startsWith("```")) {
        textResponse = textResponse.replace(/```json|```/g, '').trim();
        }

        const aiResult = JSON.parse(textResponse);


    return {
      ...aiResult,
      model: 'gpt-4o',
      createdAt: new Date()
    };

  } catch (error) {
    console.error('❌ Error en analyzeWithAI:', error.message);
    throw new Error('Fallo al analizar el contenido del enlace con IA');
  }
}
