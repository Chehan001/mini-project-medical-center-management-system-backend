import mongoose from "mongoose";

const studentMedicalSchema = new mongoose.Schema(
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
      uppercase: true,
    },
    medicalDate: {
      type: Date,
      required: true,
    },
    medicalApproval: {
      type: String,
      enum: ["Approved", "Not Approved", "Pending"],
      default: "Pending",
    },
    doctorApproval: {
      type: String,
      enum: ["Yes", "No", "Pending"],
      default: "Pending",
    },
    pdfFile: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["University", "Other"],
      required: true,
    },
  },
  { timestamps: true }
);

const StudentMedical = mongoose.model("StudentMedical", studentMedicalSchema);
export default StudentMedical;
