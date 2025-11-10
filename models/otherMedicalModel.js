import mongoose from "mongoose";

const otherMedicalSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    regNumber: { type: String, required: true, uppercase: true },
    faculty: { type: String, required: true },
    location: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorRegID: { type: String, required: true },
    treatmentDate: { type: Date, required: true },
    file: { type: String }, 
  },
  { timestamps: true }
);

const OtherMedical = mongoose.model("OtherMedical", otherMedicalSchema);

export default OtherMedical;
