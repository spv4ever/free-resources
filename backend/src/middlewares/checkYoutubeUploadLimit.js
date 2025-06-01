// middlewares/checkYoutubeUploadLimit.js

import YoutubeUploadLog from '../models/youtubeUploadLogModel.js';

const checkYoutubeUploadLimit = async (req, res, next) => {
  try {
    const { user } = req;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uploadsToday = await YoutubeUploadLog.countDocuments({
      userId: user.id,
      uploadDate: { $gte: today }
    });

    const limits = { free: 1, pro: 3, admin: Infinity };
    const maxAllowed = limits[user.role] || 0;

    if (uploadsToday >= maxAllowed) {
      return res.status(429).json({
        error: `Has alcanzado tu límite diario de subidas (${maxAllowed}).`
      });
    }

    next();
  } catch (error) {
    console.error('Error en el middleware de límite de subidas:', error);
    res.status(500).json({ error: 'Error interno de control de límite de subidas.' });
  }
};

export default checkYoutubeUploadLimit;
