// src/keikoprompts/controllers/duplicateController.js
import mongoose from 'mongoose';
import KeikoPrompt from '../models/KeikoPrompt.js';
import KeikoPromptPack from '../models/KeikoPromptPack.js';

export async function listDuplicates(req, res, next) {
  try {
    const agg = await KeikoPrompt.aggregate([
      {
        $group: {
          _id: { packId: '$packId', prompt: '$prompt' },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gt: 1 } } },
      {
        $group: {
          _id: '$_id.packId',
          duplicates: { $sum: { $subtract: ['$count', 1] } }
        }
      }
    ]);

    const results = await Promise.all(agg.map(async ({ _id: packId, duplicates }) => {
      const pack = await KeikoPromptPack.findById(packId).lean().select('title');
      return {
        packId,
        title: pack ? pack.title : '—',
        duplicates
      };
    }));

    res.json(results);
  } catch (err) {
    next(err);
  }
}

// src/keikoprompts/controllers/duplicateController.js
export async function getDuplicateDetails(req, res, next) {
  try {
    const { packId } = req.params;
    const groups = await KeikoPrompt.aggregate([
      { $match: { packId: new mongoose.Types.ObjectId(packId) } },
      {
        $group: {
          _id: '$prompt',
          docs: {
            $push: {
              _id: '$_id',
              scene: '$scene',
              prompt: '$prompt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    // Aplana todos los docs en un solo array:
    const flat = groups.flatMap(g => g.docs);
    res.json(flat);
  } catch (err) {
    next(err);
  }
}

export async function deleteDuplicates(req, res, next) {
  try {
    const { packIds, deleteAll } = req.body;
    if (!Array.isArray(packIds)) {
      return res.status(400).json({ error: 'packIds debe ser un array' });
    }

    let totalDeleted = 0;
    for (const packId of packIds) {
      const groups = await KeikoPrompt.aggregate([
        { $match: { packId: new mongoose.Types.ObjectId(packId) } },
        {
          $group: {
            _id: '$prompt',
            docs: { $push: '$_id' }
          }
        }
      ]);

      for (const { docs } of groups) {
        if (docs.length > 1) {
          const toRemove = deleteAll ? docs : docs.slice(1);
          const { deletedCount } = await KeikoPrompt.deleteMany({ _id: { $in: toRemove } });
          totalDeleted += deletedCount;
        }
      }
    }

    res.json({ deletedCount: totalDeleted });
  } catch (err) {
    next(err);
  }
}
