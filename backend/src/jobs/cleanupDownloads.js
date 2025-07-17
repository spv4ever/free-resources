import fs from 'fs';
import path from 'path';

const TEMP_DIR = path.resolve('temp', 'downloads'); // o ajusta si es otra ruta

export const limpiarDescargasTemporales = () => {
  fs.readdir(TEMP_DIR, (err, archivos) => {
    if (err) {
      return console.error('❌ Error leyendo carpeta de descargas temporales:', err);
    }

    archivos.forEach((archivo) => {
      const filePath = path.join(TEMP_DIR, archivo);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          return console.warn(`⚠️ No se pudo acceder a ${archivo}:`, err.message);
        }

        const ahora = Date.now();
        const edadMs = ahora - stats.mtimeMs;

        const LIMITE_MS = 1000 * 60 * 60 * 6; // 6 horas

        if (edadMs > LIMITE_MS) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.warn(`⚠️ No se pudo borrar ${archivo}:`, err.message);
            } else {
              console.log(`🗑️ Archivo eliminado: ${archivo}`);
            }
          });
        }
      });
    });
  });
};
