import AffiliateClick from '../models/AffiliateClick.js';
import AffiliateLink from '../models/AffiliateLink.js';

export const logClick = async (req, res) => {
  try {
    const { linkId, page } = req.body;

    const newClick = new AffiliateClick({
      linkId,
      page,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    await newClick.save();
    res.status(201).json({ message: 'Clic registrado' });
  } catch (error) {
    console.error('Error registrando clic:', error);
    res.status(500).json({ error: 'Error al registrar el clic' });
  }
};

export const getClickStats = async (req, res) => {
  try {
    const clicks = await AffiliateClick.aggregate([
      {
        $group: {
          _id: '$linkId',
          totalClicks: { $sum: 1 },
          firstClick: { $min: '$timestamp' },
          lastClick: { $max: '$timestamp' }
        }
      },
      {
        $lookup: {
          from: 'affiliatelinks',
          localField: '_id',
          foreignField: '_id',
          as: 'linkData'
        }
      },
      { $unwind: '$linkData' },
      { $sort: { totalClicks: -1 } }
    ]);

    res.json(clicks);
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};
