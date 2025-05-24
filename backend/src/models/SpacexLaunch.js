import mongoose from 'mongoose';

const timelineItemSchema = new mongoose.Schema({
  type: {
    id: Number,
    abbrev: String,
    description: String
  },
  relative_time: String
}, { _id: false }); // <- esto evita que se generen _id si no los necesitas

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

  vidURLs: [
    {
      url: String,
      title: String,
      source: String,
      feature_image: String
    }
  ],

  mission_patches: [
    {
      name: String,
      image_url: String
    }
  ],

  updates: [
    {
      comment: String,
      info_url: String,
      created_by: String,
      created_on: Date,
      profile_image: String
    }
  ],

  timeline: [timelineItemSchema],
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
  isEnriched: { type: Boolean, default: false },

  mission: mongoose.Schema.Types.Mixed,
  launch_service_provider: {
    name: String,
    country_code: String
  },

  spacecraft: mongoose.Schema.Types.Mixed,
  rocketName: String,

  upcoming: Boolean,
  last_updated: Date

}, { timestamps: true });

const SpacexLaunch = mongoose.models.SpacexLaunch || mongoose.model('SpacexLaunch', spacexLaunchSchema);
export default SpacexLaunch;
