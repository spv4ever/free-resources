// services/historialService.js
import DownloadHistory from '../models/DownloadHistory.js';

export const guardarHistorial = async (userId, data = {}) => {
  try {
    const {
      platform,
      title,
      webpage_url,
      filename,
      format,
      thumbnail,
      duration
    } = data;

    // // ⬇️ Añade esto aquí
    // console.log('📝 Datos que se intentan guardar:', {
    //   user: userId,
    //   platform,
    //   title,
    //   url: webpage_url,
    //   filename,
    //   format,
    //   thumbnail,
    //   duration
    // });

    const entrada = new DownloadHistory({
      user: userId,
      platform,
      title,
      url: webpage_url,
      filename,
      format,
      thumbnail,
      duration
    });

    await entrada.save();
  } catch (error) {
    console.error('Error al guardar historial de descarga:', error);
  }
};
