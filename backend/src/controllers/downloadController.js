// controllers/downloadController.js
import { procesarDescarga } from '../services/descargaService.js';
import User from '../models/User.js';
import { guardarHistorial } from '../services/historialService.js';
import DownloadHistory from '../models/DownloadHistory.js';
import fs from 'fs';
import path from 'path';

export const handleDescarga = async (req, res) => {
  const { url, formato } = req.body;

  if (!url || !formato) {
    return res.status(400).json({ message: 'Faltan datos: url o formato no definidos' });
  }

  try {
    const resultados = await procesarDescarga(url, formato);

    if (!resultados || !resultados.length) {
      return res.status(500).json({ message: 'Error al procesar el enlace' });
    }

    if (req.user) {
      const user = await User.findById(req.user._id);

      if (user.role !== 'admin' && user.role !== 'pro') {
        user.descargasHoy += 1;
        user.ultimoUsoDescargas = new Date();
        await user.save();
      }

      // Guardar en historial cada archivo
      for (const resultado of resultados) {
        await guardarHistorial(user._id, {
          platform: resultado.platform,
          title: resultado.metadata.title,
          webpage_url: resultado.metadata.webpage_url,
          filename: resultado.filename,
          format: formato,
          thumbnail: resultado.metadata.thumbnail,
          duration: resultado.metadata.duration
        });
      }

      console.log(`🧾 Historial guardado (${resultados.length}) para ${user.email}`);
    } else {
      console.log(`🧾 Descarga anónima de ${resultados.length} archivo(s)`);
    }

    return res.json({
      archivos: resultados.map(r => ({
        filename: r.filename,
        platform: r.platform,
        info: r.metadata
      }))
    });

  } catch (error) {
    console.error('Error al descargar:', error);
    return res.status(500).json({ message: 'Ocurrió un error al descargar el contenido' });
  }
};

export const getHistorialUsuario = async (req, res) => {
  try {
    // console.log('🔎 Consultando historial de:', req.user?.email);
    const historial = await DownloadHistory.find({ user: req.user._id })
      .sort({ downloadedAt: -1 })
      .limit(100);

    res.json(historial);
  } catch (error) {
    console.error('❌ Error al obtener historial:', error);
    res.status(500).json({ message: 'Error al obtener el historial de descargas.' });
  }
};
