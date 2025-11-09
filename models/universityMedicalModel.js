import mongoose from "mongoose";

const universityMedicalSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    regNumber: {
      type: String,
      required: true,
      trim: true,
      unique: false, 
    },
    faculty: {
      type: String,
      required: true,
    },
    treatmentDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const UniversityMedical = mongoose.model("UniversityMedical", universityMedicalSchema);

export default UniversityMedical;
