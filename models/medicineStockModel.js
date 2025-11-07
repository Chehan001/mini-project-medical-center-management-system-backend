import mongoose from "mongoose";

const MedicineStockSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    manufacturingDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    licenseNumber: { type: String, required: true, trim: true, unique: true, uppercase: true },
  },
  { timestamps: true }
);

export default mongoose.model("MedicineStock", MedicineStockSchema);
