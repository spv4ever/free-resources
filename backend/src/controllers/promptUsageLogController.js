// controllers/promptUsageLogController.js
import PromptUsageLog from '../models/PromptUsageLog.js';

// ➕ Registrar uso de prompt
export const logPromptUsage = async (req, res) => {
  try {
    const { userId, promptId, packId, platform, fromUI = true } = req.body;

    const usage = new PromptUsageLog({
      user: userId,
      prompt: promptId,
      pack: packId,
      platform,
      fromUI
    });

    await usage.save();
    res.status(201).json(usage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📚 Obtener historial de uso de un usuario
export const getUserPromptUsage = async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await PromptUsageLog.find({ user: userId }).sort({ usedAt: -1 }).populate('prompt pack');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
