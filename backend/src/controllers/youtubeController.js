import YoutubeUploadLog from '../models/youtubeUploadLogModel.js';

export const getYoutubeUploadHistory = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const uploads = await YoutubeUploadLog.find({ userId })
      .sort({ uploadDate: -1 })
      .select('videoId channelId uploadDate') // solo lo necesario

    res.json({ uploads });
  } catch (error) {
    console.error('Error al obtener el historial de subidas:', error);
    res.status(500).json({ error: 'Error al obtener historial de subidas' });
  }
};

export const getRemainingUploads = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  const limits = { free: 1, pro: 3, admin: Infinity };
  const maxAllowed = limits[role] ?? 0;

  if (maxAllowed === Infinity) {
    return res.json({ remaining: '∞' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uploadsToday = await YoutubeUploadLog.countDocuments({
    userId,
    uploadDate: { $gte: today }
  });

  const remaining = Math.max(0, maxAllowed - uploadsToday);

  res.json({ remaining });
};