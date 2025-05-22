import SuspiciousAccess from '../models/SuspiciousAccess.js';

export const getSuspiciousAccesses = async (req, res) => {
  try {
    const { page = 1, limit = 50, ip, path } = req.query;

    const query = {};
    if (ip) query.ip = { $regex: ip, $options: 'i' };
    if (path) query.path = { $regex: path, $options: 'i' };

    const total = await SuspiciousAccess.countDocuments(query);
    const results = await SuspiciousAccess.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ total, page: Number(page), limit: Number(limit), results });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener registros sospechosos', error: err.message });
  }
};
