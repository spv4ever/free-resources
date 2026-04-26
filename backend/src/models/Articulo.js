import mongoose from 'mongoose';

const articuloSchema = new mongoose.Schema(
  {
    codigo: { type: Number, unique: true, index: true },
    categoria: { type: String, required: true, trim: true },
    precioCoste: { type: Number, required: true, min: 0 },
    precioCosteMayorista: { type: Number, required: true, min: 0 },
    pvp: { type: Number, required: true, min: 0 },
    pvpMayorista: { type: Number, required: true, min: 0 },
    costeProtectora: { type: Number, required: true, min: 0 },
    pvpProtectora: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

articuloSchema.pre('validate', async function assignSequentialCode(next) {
  if (!this.isNew || this.codigo) return next();

  const Articulo = this.constructor;
  const lastArticulo = await Articulo.findOne({}, { codigo: 1 }).sort({ codigo: -1 }).lean();
  this.codigo = (lastArticulo?.codigo || 0) + 1;
  next();
});

export default mongoose.models.Articulo || mongoose.model('Articulo', articuloSchema);
