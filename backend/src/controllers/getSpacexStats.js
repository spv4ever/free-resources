
import SpacexLaunch from '../models/SpacexLaunch.js';

export async function getSpacexStats(req, res) {
  try {
    const stats = await SpacexLaunch.aggregate([
      { $match: { upcoming: false } },
      {
        $group: {
          _id: {
            year: { $year: "$net" },
            rocket: "$rocketName",
            status: "$status.name"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1 } }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Error generating stats' });
  }
}
