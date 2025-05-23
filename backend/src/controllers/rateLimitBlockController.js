import RateLimitBlock from '../models/RateLimitBlock.js';

export const getRateLimitBlocks = async (req, res) => {
  try {
    const { page = 1, limit = 50, ip } = req.query;

    const query = {};
    if (ip) query.ip = { $regex: ip, $options: 'i' };

    const total = await RateLimitBlock.countDocuments(query);
    const results = await RateLimitBlock.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ total, page: Number(page), limit: Number(limit), results });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener bloqueos 429', error: err.message });
  }
};
