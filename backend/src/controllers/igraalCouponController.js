import IgraalCoupon from '../models/IgraalCoupon.js';
import { processCouponImage } from '../services/uploadAndAnalyzeCoupon.js';

export const uploadAndAnalyzeCoupon = async (req, res) => {
  try {
    const filePath = req.file.path;

    // Procesa la imagen: sube a Cloudinary, analiza con IA y guarda varios cupones
    const newCoupons = await processCouponImage(filePath);

    res.status(201).json({
      message: `${newCoupons.length} cupon(es) creados correctamente`,
      coupons: newCoupons
    });
  } catch (error) {
    console.error('❌ Error en uploadAndAnalyzeCoupon:', error);
    res.status(500).json({ message: error.message || 'Error al subir y analizar la imagen' });
  }
};

export const acceptCoupon = async (req, res) => {
  const { id } = req.params;
  const { title, description, code, url } = req.body;

  try {
    const coupon = await IgraalCoupon.findByIdAndUpdate(
      id,
      { title, description, code, url, status: 'aceptado' },
      { new: true }
    );
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error al aceptar cupón' });
  }
};

export const getPendingCoupons = async (req, res) => {
  try {
    const coupons = await IgraalCoupon.find({ status: 'pendiente' }).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cupones pendientes' });
  }
};

export const rejectCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await IgraalCoupon.findByIdAndUpdate(id, { status: 'rechazado' }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al rechazar cupón' });
  }
};

export const getAcceptedCoupons = async (req, res) => {
  try {
    const acceptedCoupons = await IgraalCoupon.find({ status: 'aceptado' }).sort({ createdAt: -1 });
    res.json(acceptedCoupons);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener cupones aceptados' });
  }
};