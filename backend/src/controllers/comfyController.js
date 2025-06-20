import { getComfyUrl, setComfyUrl } from '../services/comfyService.js';

export const getComfyUrlController = async (req, res) => {
  try {
    const url = await getComfyUrl(req.params.key);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const setComfyUrlController = async (req, res) => {
  try {
    const updated = await setComfyUrl(req.params.key, req.body.url);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
