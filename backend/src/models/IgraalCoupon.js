import mongoose from 'mongoose';

const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;

const igraalCouponSchema = new mongoose.Schema({
  title: { type: String, required: false },
  description: { type: String, required: false },
  code: { type: String, required: false },
  url: { type: String, required: true }, // Tu URL de afiliado
  sourceUrl: {
    type: String,
    validate: {
      validator: function (v) {
        return !v || urlRegex.test(v); // permite vacío o URL válida
      },
      message: props => `'${props.value}' no es una URL válida.`
    }
  },
  imageUrl: { type: String, required: false },
  status: { type: String, enum: ['pendiente', 'aceptado', 'rechazado'], default: 'pendiente' },
  createdAt: { type: Date, default: Date.now }
});

const IgraalCoupon = mongoose.model('IgraalCoupon', igraalCouponSchema);
export default IgraalCoupon;
