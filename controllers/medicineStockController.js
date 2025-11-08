import MedicineStock from "../models/medicineStockModel.js";
import DistributionHistory from "../models/DistributionHistoryModel.js";

// Add_new_medicine/update_existing_stock
export const addMedicine = async (req, res) => {
  try {
    const { name, quantity, manufacturingDate, expiryDate, licenseNumber } = req.body;

    // Validate_input
    if (!name || !quantity || !manufacturingDate || !expiryDate || !licenseNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }

    const mfgDate = new Date(manufacturingDate);
    const expDate = new Date(expiryDate);
    if (isNaN(mfgDate.getTime()) || isNaN(expDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    if (expDate <= mfgDate) {
      return res.status(400).json({ message: "Expiry date must be after manufacturing date" });
    }

    const trimmedLicense = licenseNumber.trim().toUpperCase();

    // Check -- > medicinealready exists by license number
    const existing = await MedicineStock.findOne({ licenseNumber: trimmedLicense });
    if (existing) {
      existing.quantity += parsedQuantity;
      existing.updatedAt = new Date();
      if (expDate > existing.expiryDate) existing.expiryDate = expDate;
      await existing.save();

      return res.status(200).json({
        message: `Stock updated successfully. Added ${parsedQuantity} units. Total: ${existing.quantity}`,
        medicine: existing
      });
    }

    // Add new medicine entry
    const newMedicine = await MedicineStock.create({
      name: name.trim(),
      quantity: parsedQuantity,
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      licenseNumber: trimmedLicense,
    });

    return res.status(201).json({
      message: "New medicine added successfully",
      medicine: newMedicine
    });
  } catch (err) {
    console.error(" Error adding medicine:", err);
    return res.status(500).json({
      message: "Failed to add medicine. Please try again.",
      error: err.message
    });
  }
};

// Get all medicines in stock
export const getStock = async (req, res) => {
  try {
    const meds = await MedicineStock.find().sort({ updatedAt: -1 }).lean();
    return res.status(200).json(meds);
  } catch (err) {
    console.error(" Error fetching stock:", err);
    return res.status(500).json({ message: "Failed to fetch stock", error: err.message });
  }
};

// Distribute medicine (reduce quantity)
export const distributeMedicine = async (req, res) => {
  try {
    const { medicineName, quantity } = req.body;

    if (!medicineName || !quantity) {
      return res.status(400).json({ message: "Medicine name and quantity are required" });
    }

    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }

    const medicine = await MedicineStock.findOne({
      name: { $regex: new RegExp(`^${medicineName.trim()}$`, "i") },
    });

    if (!medicine) {
      return res.status(404).json({ message: `Medicine "${medicineName}" not found in stock` });
    }

    if (medicine.quantity < parsedQuantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${medicine.quantity}, Requested: ${parsedQuantity}`,
      });
    }

    medicine.quantity -= parsedQuantity;
    medicine.updatedAt = new Date();
    await medicine.save();

    await DistributionHistory.create({
      medicineName: medicine.name,
      medicineId: medicine._id,
      quantityDistributed: parsedQuantity,
      remainingStock: medicine.quantity,
      distributedAt: new Date(),
    });

    return res.status(200).json({
      message: `Successfully distributed ${parsedQuantity} units of ${medicine.name}. Remaining stock: ${medicine.quantity}`,
      medicine,
    });
  } catch (err) {
    console.error(" Error distributing medicine:", err);
    return res.status(500).json({
      message: "Server error while distributing medicine",
      error: err.message
    });
  }
};

// Get distribution history
export const getDistributionHistory = async (req, res) => {
  try {
    const history = await DistributionHistory.find()
      .sort({ distributedAt: -1 })
      .limit(100)
      .lean();
    return res.status(200).json(history);
  } catch (err) {
    console.error(" Error fetching distribution history:", err);
    return res.status(500).json({ message: "Failed to fetch distribution history", error: err.message });
  }
};

// Get low stock medicines (<10 units)
export const getLowStock = async (req, res) => {
  try {
    const lowStockMeds = await MedicineStock.find({ quantity: { $lt: 10 } })
      .sort({ quantity: 1 })
      .lean();
    return res.status(200).json(lowStockMeds);
  } catch (err) {
    console.error(" Error fetching low stock:", err);
    return res.status(500).json({ message: "Failed to fetch low stock medicines", error: err.message });
  }
};


// Get expired medicines
export const getExpiredMedicines = async (req, res) => {
  try {
    const today = new Date();
    const expiredMeds = await MedicineStock.find({ expiryDate: { $lt: today } })
      .sort({ expiryDate: 1 })
      .lean();
    return res.status(200).json(expiredMeds);
  } catch (err) {
    console.error(" Error fetching expired medicines:", err);
    return res.status(500).json({ message: "Failed to fetch expired medicines", error: err.message });
  }
};

// Delete a medicine by ID
export const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await MedicineStock.findByIdAndDelete(id);

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    return res.status(200).json({ message: `Medicine "${medicine.name}" deleted successfully` });
  } catch (err) {
    console.error(" Error deleting medicine:", err);
    return res.status(500).json({ message: "Server error while deleting medicine", error: err.message });
  }
};
