
import mongoose from 'mongoose';

const spacexLaunchSchema = new mongoose.Schema({
  id: String,
  name: String,
  rocketName: String,
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
      name: String
    }
  },
  upcoming: Boolean,  
  last_updated: Date
}, { timestamps: true });

const SpacexLaunch = mongoose.model('SpacexLaunch', spacexLaunchSchema);
export default SpacexLaunch;
