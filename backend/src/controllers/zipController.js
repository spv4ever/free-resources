// controllers/zipController.js
import path from 'path';
import fs from 'fs';

const CARPETA_TEMP = path.resolve('temp/downloads');

export const servirArchivoTemporal = (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(CARPETA_TEMP, filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ message: 'Archivo no encontrado o expirado.' });
  }

  res.download(filepath, filename, (err) => {
    if (err) {
      console.error('Error al enviar archivo:', err);
    } else {
      // Eliminar archivo tras la descarga
      fs.unlink(filepath, (err) => {
        if (err) console.error('Error al eliminar archivo:', err);
      });
    }
  });
};
