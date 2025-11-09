// models/Schedule.js
import mongoose from 'mongoose';
const DaySchema = new mongoose.Schema({ enabled:Boolean, time:String }, { _id:false });
const WeeklySchema = new mongoose.Schema({
  mon:{type:DaySchema, default:{}}, tue:{type:DaySchema, default:{}}, wed:{type:DaySchema, default:{}},
  thu:{type:DaySchema, default:{}}, fri:{type:DaySchema, default:{}}, sat:{type:DaySchema, default:{}},
  sun:{type:DaySchema, default:{}},
}, { _id:false });

const ScheduleSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref:'InstagramAccount', required:true },
  post: { type: WeeklySchema, default:{} },
  carousel: { type: WeeklySchema, default:{} },
  reel: { type: WeeklySchema, default:{} },
  source: { type: String, default: 'weekly' } // por si en el futuro añades más orígenes
}, { timestamps:true, collection:'schedules' });

ScheduleSchema.index({ accountId:1 }, { unique:true });
export default mongoose.model('Schedule', ScheduleSchema);
