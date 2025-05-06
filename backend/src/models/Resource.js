import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const resourceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  fileType: { type: String, required: true }, // Tipo de archivo comprimido, por ejemplo: 'application/zip'
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: { type: [String] }, // Etiquetas para facilitar la búsqueda
  price: { type: Number, default: 0 }, // Precio del recurso, si se va a vender
  uploadDate: { type: Date, default: Date.now },
  preview: { type: String }, // URL a la imagen de vista previa
  fileUrl: { type: String, required: true }, // URL externa al archivo comprimido
  fileSize: { type: Number, required: true }, // Tamaño del archivo comprimido en bytes
  license: { type: String, enum: ['free', 'premium'], default: 'free' }, // Licencia del recurso
});

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
