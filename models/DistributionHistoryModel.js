import mongoose from "mongoose";

const distributionHistorySchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: true,
    },
    quantityDistributed: {
      type: Number,
      required: true,
    },
    distributedTo: {
      type: String, // Student regNumber or ID
      required: true,
    },
    distributedBy: {
      type: String, // Pharmacist or admin username
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const DistributionHistory = mongoose.model("DistributionHistory", distributionHistorySchema);
export default DistributionHistory;
