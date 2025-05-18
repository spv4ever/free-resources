import openai from '../config/openai.js';

export const analyzeCouponImage = async (imageUrl) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-2024-04-09',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `
Analiza esta imagen que contiene múltiples cupones de descuento.

Para cada cupón detectado, devuelve un array JSON con los siguientes campos:

- "title": nombre de la tienda o marca (por ejemplo: "Nike", "Shein", "Lopesan", "LG"...).
- "description": descripción clara del descuento ofrecido.
- "code": código del cupón (si está presente).
- "url": URL oficial de la marca detectada, como "https://www.nike.com" o "https://www.zalando.es".

🧠 Importante:
- Extrae el nombre de la marca aunque esté solo en el texto o logo.
- Si no se menciona una URL explícita, dedúcela usando el dominio más probable y oficial de la marca.
- Usa solo URLs de confianza (.com, .es, .fr, etc.).
- No inventes cupones si no hay código visible.
- Devuelve SOLO el JSON, sin texto adicional ni bloques markdown.
`
            },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 1000
    });

    let content = response.choices[0]?.message?.content?.trim() || '';

    // ✅ Muestra lo que devuelve OpenAI para depurar
    //console.log('\n🔍 Respuesta RAW de OpenAI:\n', content, '\n');

    // Limpieza si incluye ```json o similares
    if (content.startsWith('```')) {
      content = content.replace(/```(?:json)?\n?/, '').replace(/```$/, '').trim();
    }

    return JSON.parse(content); // Aquí puede lanzar si sigue sin ser JSON
  } catch (error) {
    console.error('Error en análisis IA:', error.message);
    return [];
  }
};
