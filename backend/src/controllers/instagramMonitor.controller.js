import ImagenGenerada from '../models/ImagenGenerada.js';

const IG_ACCOUNT_ALIAS = process.env.IG_ACCOUNT_ALIAS || 'keikodevfree';

export async function getIGMonitorSummary(req, res) {
  try {
    const today0 = new Date(); today0.setHours(0,0,0,0);
    const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000);

    const [publishableCount, publishedTotal, publishedToday, published7d, eligibleForReel] = await Promise.all([
      ImagenGenerada.countDocuments({
        publishable: true,
        finalUrl: { $exists: true, $ne: '' },
        $nor: [{ publications: { $elemMatch: { platform: 'instagram', account: IG_ACCOUNT_ALIAS } } }]
      }),
      ImagenGenerada.countDocuments({
        publications: { $elemMatch: { platform: 'instagram', account: IG_ACCOUNT_ALIAS } }
      }),
      ImagenGenerada.countDocuments({
        publications: {
          $elemMatch: {
            platform: 'instagram',
            account: IG_ACCOUNT_ALIAS,
            postedAt: { $gte: today0 }
          }
        }
      }),
      ImagenGenerada.countDocuments({
        publications: {
          $elemMatch: {
            platform: 'instagram',
            account: IG_ACCOUNT_ALIAS,
            postedAt: { $gte: sevenDaysAgo }
          }
        }
      }),
      // elegibles para Reel: como mínimo 2 publishable sin publicar
      ImagenGenerada.countDocuments({
        publishable: true,
        finalUrl: { $exists: true, $ne: '' },
        $nor: [{ publications: { $elemMatch: { platform: 'instagram', account: IG_ACCOUNT_ALIAS } } }]
      }).then(n => (n >= 2 ? n : 0))
    ]);

    const scheduler = {
      enabled: process.env.IG_SCHEDULER_ENABLED === 'true',
      mode: (process.env.IG_SCHEDULER_MODE || 'jitter'),
      windowStart: process.env.IG_WINDOW_START || '12:00',
      windowEnd: process.env.IG_WINDOW_END || '20:30',
    };

    res.json({
      account: IG_ACCOUNT_ALIAS,
      scheduler,
      counts: { publishable: publishableCount, publishedTotal, publishedToday, published7d, eligibleForReel }
    });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'error summary' });
  }
}

export async function getIGRecent(req, res) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '15', 10), 1), 50);

    // Flatten por publicación para ordenar por postedAt
    const pipeline = [
      { $match: { publications: { $elemMatch: { platform: 'instagram', account: IG_ACCOUNT_ALIAS } } } },
      { $unwind: '$publications' },
      { $match: { 'publications.platform': 'instagram', 'publications.account': IG_ACCOUNT_ALIAS } },
      { $sort: { 'publications.postedAt': -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          filename: 1,
          finalUrl: 1,
          postedAt: '$publications.postedAt',
          postId: '$publications.postId'
        }
      }
    ];

    const rows = await ImagenGenerada.aggregate(pipeline).exec();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e?.message || 'error recent' });
  }
}

export async function getIGEligible(req, res) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '30', 10), 1), 100);
    const imgs = await ImagenGenerada.find({
      publishable: true,
      finalUrl: { $exists: true, $ne: '' },
      $nor: [{ publications: { $elemMatch: { platform: 'instagram', account: IG_ACCOUNT_ALIAS } } }]
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(imgs.map(i => ({
      _id: i._id,
      finalUrl: i.finalUrl,
      createdAt: i.createdAt
    })));
  } catch (e) {
    res.status(500).json({ error: e?.message || 'error eligible' });
  }
}
