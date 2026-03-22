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

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, trim: true, default: '' },
    caption: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const model3DSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    shortDescription: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    makerworldUrl: { type: String, trim: true, default: '' },
    type: {
      type: String,
      enum: ['llavero', 'iman', 'diseno-especial', 'funcional', 'decoracion', 'organizacion', 'gadget', 'accesorio', 'otro'],
      default: 'otro',
    },
    material: {
      type: String,
      enum: ['PLA', 'PLA+', 'PETG', 'ABS', 'ASA', 'TPU', 'RESINA', 'OTRO'],
      default: 'PLA',
    },
    sizeLabel: { type: String, trim: true, default: '' },
    dimensions: { type: String, trim: true, default: '' },
    colorsCount: { type: Number, default: 1, min: 0 },
    printTime: { type: String, trim: true, default: '' },
    weightGrams: { type: Number, min: 0 },
    difficulty: {
      type: String,
      enum: ['baja', 'media', 'alta'],
      default: 'baja',
    },
    mainImageUrl: { type: String, trim: true, default: '' },
    secondaryImages: { type: [imageSchema], default: [] },
    tags: { type: [String], default: [] },
    notes: { type: String, trim: true, default: '' },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

model3DSchema.pre('validate', function preValidate(next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = buildSlug(this.title);
  }
  if (Array.isArray(this.tags)) {
    this.tags = this.tags.map((tag) => tag.trim()).filter(Boolean);
  }
  if (Array.isArray(this.secondaryImages)) {
    this.secondaryImages = this.secondaryImages.filter((image) => image?.url);
  }
  next();
});

model3DSchema.pre('save', async function ensureUniqueSlug(next) {
  if (!this.slug) return next();
  const Model3D = this.constructor;
  const baseSlug = this.slug;
  let slug = baseSlug;
  let counter = 1;

  while (
    await Model3D.exists({
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

export default mongoose.models.Model3D || mongoose.model('Model3D', model3DSchema);
