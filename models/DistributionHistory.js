import mongoose from "mongoose";

const DistributionHistorySchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      trim: true,
      uppercase: true
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"]
    },
    distributedBy: {
      type: String,
      default: "System Admin"
    },
    distributedTo: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    remainingStock: {
      type: Number,
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

// Index for faster queries
DistributionHistorySchema.index({ medicineName: 1, createdAt: -1 });
DistributionHistorySchema.index({ licenseNumber: 1, createdAt: -1 });

export default mongoose.model("DistributionHistory", DistributionHistorySchema);