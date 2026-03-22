import mongoose from 'mongoose';

const buildSlug = (value = '') =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 90);

const filamentSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    material: { type: String, required: true, trim: true },
    colorName: { type: String, required: true, trim: true },
    colorHex: { type: String, trim: true, default: '' },
    finish: { type: String, trim: true, default: '' },
    diameter: { type: Number, default: 1.75 },
    spoolWeightKg: { type: Number, default: 1 },
    nozzleTempMin: { type: Number },
    nozzleTempMax: { type: Number },
    bedTempMin: { type: Number },
    bedTempMax: { type: Number },
    printSpeed: { type: String, trim: true, default: '' },
    imageUrl: { type: String, trim: true, default: '' },
    spoolImageUrl: { type: String, trim: true, default: '' },
    amazonUrl: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

filamentSchema.pre('validate', function preValidate(next) {
  const base = [this.brand, this.name, this.colorName].filter(Boolean).join(' ');
  if (!this.slug || this.isModified('brand') || this.isModified('name') || this.isModified('colorName')) {
    this.slug = buildSlug(base);
  }
  next();
});

filamentSchema.pre('save', async function ensureUniqueSlug(next) {
  if (!this.slug) return next();
  const Filament = this.constructor;
  const baseSlug = this.slug;
  let slug = baseSlug;
  let counter = 1;

  while (
    await Filament.exists({
      slug,
      _id: { $ne: this._id },
    })
  ) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  this.slug = slug;
  next();
});

export default mongoose.models.Filament || mongoose.model('Filament', filamentSchema);
