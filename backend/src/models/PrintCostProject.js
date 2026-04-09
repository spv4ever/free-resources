import mongoose from 'mongoose';

const filamentLineSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    weightGrams: { type: Number, required: true, min: 0 },
    costPerKg: { type: Number, required: true, min: 0 },
    extraCost: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const otherCostSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: '' },
    cost: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const printCostProjectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    notes: { type: String, trim: true, default: '', maxlength: 3000 },
    pricingMode: {
      type: String,
      enum: ['mayorista', 'minorista', 'llaveros', 'otros'],
      required: true,
      default: 'minorista',
    },
    customProfitPercent: { type: Number, min: 0, default: 0 },
    roundUpFinalPrice: { type: Boolean, default: true },
    config: {
      filaments: { type: [filamentLineSchema], default: [] },
      filamentWastePercent: { type: Number, min: 0, default: 0 },
      electricity: {
        powerWatts: { type: Number, min: 0, default: 0 },
        printHours: { type: Number, min: 0, default: 0 },
        pricePerKwh: { type: Number, min: 0, default: 0 },
      },
      machineWear: {
        machineCost: { type: Number, min: 0, default: 0 },
        usefulLifeHours: { type: Number, min: 0, default: 0 },
        maintenanceCostPerHour: { type: Number, min: 0, default: 0 },
      },
      labor: {
        setupHours: { type: Number, min: 0, default: 0 },
        postProcessHours: { type: Number, min: 0, default: 0 },
        costPerHour: { type: Number, min: 0, default: 0 },
      },
      packagingCost: { type: Number, min: 0, default: 0 },
      shippingCost: { type: Number, min: 0, default: 0 },
      platformFeePercent: { type: Number, min: 0, default: 0 },
      failureRatePercent: { type: Number, min: 0, default: 0 },
      otherCosts: { type: [otherCostSchema], default: [] },
    },
    summary: {
      filamentCost: { type: Number, min: 0, default: 0 },
      electricityCost: { type: Number, min: 0, default: 0 },
      machineWearCost: { type: Number, min: 0, default: 0 },
      laborCost: { type: Number, min: 0, default: 0 },
      baseCost: { type: Number, min: 0, default: 0 },
      overheadCost: { type: Number, min: 0, default: 0 },
      subtotal: { type: Number, min: 0, default: 0 },
      profitMultiplier: { type: Number, min: 1, default: 1 },
      profitPercentApplied: { type: Number, min: 0, default: 0 },
      profitAmount: { type: Number, default: 0 },
      finalPrice: { type: Number, default: 0 },
      finalPriceRounded: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.PrintCostProject || mongoose.model('PrintCostProject', printCostProjectSchema);
