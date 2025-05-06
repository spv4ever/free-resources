import mongoose from 'mongoose';

const resourceLibrarySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      default: '/images/default_image.png'
    },
    downloadUrl: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true // Esto crea automáticamente createdAt y updatedAt
  }
);

const ResourceLibrary = mongoose.model('ResourceLibrary', resourceLibrarySchema);

export default ResourceLibrary;
