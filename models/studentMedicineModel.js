import mongoose from "mongoose";

const studentMedicineSchema = new mongoose.Schema(
  {
    regNumber: {
      type: String,
      required: [true, "Register number is required"],
      uppercase: true,
      trim: true,
      index: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    medicines: [
      {
        medicineName: {
          type: String,
          required: [true, "Medicine name is required"],
          trim: true,
        },
        dosage: {
          type: String,
          required: [true, "Dosage is required"],
        },
        frequency: {
          type: String,
          required: [true, "Frequency is required"],
        },
        timing: {
          type: String,
          required: [true, "Timing is required"],
          enum: ["morning", "night", "both"],
          default: "morning",
        },
      },
    ],
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index --> faster queries
studentMedicineSchema.index({ regNumber: 1, date: -1 });

// formatted date
studentMedicineSchema.virtual("formattedDate").get(function () {
  if (this.date) {
    return new Date(this.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return "";
});

studentMedicineSchema.set("toJSON", { virtuals: true });
studentMedicineSchema.set("toObject", { virtuals: true });

const StudentMedicine = mongoose.model("StudentMedicine", studentMedicineSchema);

export default StudentMedicine;