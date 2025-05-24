import mongoose from 'mongoose';

const spacexLaunchSchema = new mongoose.Schema({
  id: String, // ID original de la API LL2

  name: String,
  net: Date,

  status: {
    id: Number,
    name: String
  },

  image: String,
  webcast: String,

  pad: {
    name: String,
    location: {
      name: String,
      country_code: String
    },
    latitude: Number,
    longitude: Number
  },

  rocket: {
    configuration: {
      full_name: String,
      manufacturer: {
        name: String
      }
    }
  },

  // Aceptamos objeto o datos antiguos
  mission: mongoose.Schema.Types.Mixed,

  launch_service_provider: {
    name: String,
    country_code: String
  },

  // También puede ser null o string en datos antiguos
  spacecraft: mongoose.Schema.Types.Mixed,

  rocketName: String, // Campo legado (opcional, si lo usas en algún frontend actual)

  upcoming: Boolean,
  last_updated: Date

}, { timestamps: true });

// Protección contra recompilación en hot reload
const SpacexLaunch = mongoose.models.SpacexLaunch || mongoose.model('SpacexLaunch', spacexLaunchSchema);
export default SpacexLaunch;
