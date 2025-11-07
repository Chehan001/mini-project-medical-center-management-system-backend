import mongoose from 'mongoose';

//  Appointment_schema (name + regNumber)
const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  regNumber: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  mobile: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Prevent_duplicate_slot_bookings (same date+time)
appointmentSchema.index({ date: 1, time: 1 }, { unique: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
