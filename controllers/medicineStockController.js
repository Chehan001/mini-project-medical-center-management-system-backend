import Medicine from "../models/MedicineStock.js";

export const addMedicine = async (req, res) => {
  try {
    const { name, quantity, manufacturingDate, expiryDate, licenseNumber } = req.body;

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

    const existing = await Medicine.findOne({ licenseNumber: trimmedLicense });
    if (existing) {
      existing.quantity += parsedQuantity;
      existing.updatedAt = new Date();
      if (expDate > existing.expiryDate) existing.expiryDate = expDate;
      await existing.save();
      return res.status(200).json({ message: `Stock updated! Added ${parsedQuantity} units`, medicine: existing });
    }

    const newMed = await Medicine.create({
      name: name.trim(),
      quantity: parsedQuantity,
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      licenseNumber: trimmedLicense,
    });

    res.status(201).json({ message: "New medicine added successfully", medicine: newMed });
  } catch (err) {
    console.error("Error adding medicine:", err);
    res.status(500).json({ message: "Server error while adding medicine", error: err.message });
  }
};

export const getStock = async (req, res) => {
  try {
    const meds = await Medicine.find().sort({ updatedAt: -1 }).lean();
    res.status(200).json(meds);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stock", error: err.message });
  }
};
