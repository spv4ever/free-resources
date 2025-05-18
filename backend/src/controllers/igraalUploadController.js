// controllers/igraalUploadController.js
import { uploadAndAnalyzeCoupon } from '../services/uploadAndAnalyzeCoupon.js';

export const handleCouponUpload = async (req, res) => {
  try {
    const filePath = req.file.path;
    const newCoupon = await uploadAndAnalyzeCoupon(filePath);
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
