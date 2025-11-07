import mongoose from "mongoose";

const DistributionHistorySchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true, trim: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "MedicineStock", required: true },
    quantityDistributed: { type: Number, required: true, min: 1 },
    remainingStock: { type: Number, required: true, min: 0 },
    distributedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("DistributionHistory", DistributionHistorySchema);