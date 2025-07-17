import fs from 'fs';
import path from 'path';

const TEMP_DIR = path.resolve('temp', 'downloads'); // ajusta si usas otra ruta

export const listarArchivosTemporales = (req, res) => {
  fs.readdir(TEMP_DIR, (err, archivos) => {
    if (err) {
      return res.status(500).json({ message: 'No se pudo acceder a la carpeta temporal' });
    }

    const datos = archivos.map((archivo) => {
      const filePath = path.join(TEMP_DIR, archivo);
      const { size, mtime } = fs.statSync(filePath);
      return {
        nombre: archivo,
        tamaño: (size / (1024 * 1024)).toFixed(2) + ' MB',
        modificado: mtime
      };
    });

    res.json(datos);
  });
};

export const eliminarArchivosTemporales = (req, res) => {
  fs.readdir(TEMP_DIR, (err, archivos) => {
    if (err) {
      return res.status(500).json({ message: 'Error al acceder a la carpeta temporal' });
    }

    archivos.forEach((archivo) => {
      const filePath = path.join(TEMP_DIR, archivo);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.warn(`⚠️ No se pudo borrar ${archivo}:`, err.message);
        }
      });
    });

    res.json({ message: `🧹 Se han eliminado ${archivos.length} archivos temporales.` });
  });
};
