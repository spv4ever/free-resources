import mongoose from 'mongoose';

const igraalDealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  cashback: { type: String, required: true },
  url: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const IgraalDeal = mongoose.model('IgraalDeal', igraalDealSchema);
export default IgraalDeal;
