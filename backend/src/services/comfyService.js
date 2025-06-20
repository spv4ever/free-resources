import ComfyConfig from '../models/ComfyConfig.js';
import { encrypt, decrypt } from '../utils/crypto.js';

export const getComfyUrl = async (key = 'flux') => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.COMFY_LOCAL_URL;
  }
  const config = await ComfyConfig.findOne({ key });
  return config?.url ? decrypt(config.url) : process.env.COMFY_PROD_URL;
};

export const setComfyUrl = async (key, newUrl) => {
  const encrypted = encrypt(newUrl);
  return await ComfyConfig.findOneAndUpdate(
    { key },
    { url: encrypted },
    { upsert: true, new: true }
  );
};
