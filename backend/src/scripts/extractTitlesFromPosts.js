import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CyberScamPost from '../models/CyberScamPost.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

function extractTituloYRedaccion(raw) {
    // Intenta primero el formato más estructurado con comillas
    let tituloMatch = raw.match(/Título:\s*["“](.+?)["”]/i);
    if (!tituloMatch) {
      // Alternativa: sin comillas, hasta el primer salto de línea o punto
      tituloMatch = raw.match(/T[íi]tulo:\s*(.+?)(?:\n|\.|$)/i);
    }
  
    const titulo = tituloMatch?.[1]?.trim() || 'Título no disponible';
  
    // Quitar cualquier línea que contenga "Título: ..." al inicio
    const redaccionFinal = raw.replace(/T[íi]tulo:\s*(["“].+?["”]|.+?)(\n|\.|$)/is, '').trim();
  
    return { titulo, redaccionFinal };
  }

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const postsSinTitulo = await CyberScamPost.find({
      $or: [{ titulo: { $exists: false } }, { titulo: '' }]
    });

    console.log(`🔍 Encontrados ${postsSinTitulo.length} posts sin título...`);

    for (const post of postsSinTitulo) {
      const { titulo, redaccionFinal } = extractTituloYRedaccion(post.redaccion || '');

      post.titulo = titulo;
      post.redaccion = redaccionFinal;

      await post.save();
      console.log(`✅ Actualizado: ${post._id}`);
    }

    console.log('🎉 Todos los posts han sido actualizados');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la ejecución:', err.message);
    process.exit(1);
  }
}

run();
