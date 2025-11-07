import mongoose from "mongoose";

const entryRecordSchema = new mongoose.Schema({
  regNumber: { type: String, required: true },
  entryType: { type: String, enum: ["Appointment", "Emergency"], required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const EntryRecord = mongoose.model("EntryRecord", entryRecordSchema);
export default EntryRecord;
