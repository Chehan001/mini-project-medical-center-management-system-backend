import StudentMedicine from "../models/studentMedicineModel.js";
import User from "../models/userModel.js"; // <-- Use users table for student verification

// Add_medicine_record
export const addMedicine = async (req, res) => {
  try {
    const { regNumber, date, time, medicines } = req.body;

    // Basic_validation
    if (!regNumber || !date || !time || !medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All fields are required including at least one medicine",
      });
    }

    // Validate_register_number_format
    const regNumberPattern = /^[A-Z0-9\/]+$/;
    if (!regNumberPattern.test(regNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid register number format",
      });
    }

    //  Check --> student exists in Users collection
    const studentExists = await User.findOne({
      university_reg_number: regNumber.toUpperCase(),
    });

    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: `Student with register number ${regNumber} not found`,
      });
    }

    // Validate each medicine entry
    for (let i = 0; i < medicines.length; i++) {
      const { medicineName, dosage, frequency, timing } = medicines[i];

      if (!medicineName || !dosage || !frequency || !timing) {
        return res.status(400).json({
          success: false,
          message: `Medicine ${i + 1}: All fields are required`,
        });
      }

      if (!["morning", "night", "both"].includes(timing)) {
        return res.status(400).json({
          success: false,
          message: `Medicine ${i + 1}: Invalid timing value`,
        });
      }

      if (parseInt(dosage) <= 0) {
        return res.status(400).json({
          success: false,
          message: `Medicine ${i + 1}: Dosage must be greater than 0`,
        });
      }

      if (parseInt(frequency) <= 0) {
        return res.status(400).json({
          success: false,
          message: `Medicine ${i + 1}: Frequency must be greater than 0`,
        });
      }
    }

    // Create -->  new medicine record
    const newMedicineRecord = new StudentMedicine({
      regNumber: regNumber.toUpperCase(),
      date,
      time,
      medicines: medicines.map((med) => ({
        medicineName: med.medicineName.trim(),
        dosage: med.dosage.toString(),
        frequency: med.frequency.toString(),
        timing: med.timing,
      })),
      prescribedBy: req.user?._id, 
    });

    await newMedicineRecord.save();

    return res.status(201).json({
      success: true,
      message: "Medicine record added successfully",
      data: newMedicineRecord,
    });
  } catch (error) {
    console.error("Error adding medicine:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add medicine record",
      error: error.message,
    });
  }
};

// Get all medicine records for a student
export const getMedicinesByRegNumber = async (req, res) => {
  try {
    const { regNumber } = req.params;

    if (!regNumber) {
      return res.status(400).json({
        success: false,
        message: "Register number is required",
      });
    }

    const medicines = await StudentMedicine.find({
      regNumber: regNumber.toUpperCase(),
    })
      .sort({ date: -1, time: -1 })
      .populate("prescribedBy", "university_mail university_reg_number");

    return res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    console.error("Error fetching medicines:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicine records",
      error: error.message,
    });
  }
};

// Get all medicine records (admin/doctor)
export const getAllMedicines = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, regNumber } = req.query;

    const query = {};
    if (status) query.status = status;
    if (regNumber) query.regNumber = regNumber.toUpperCase();

    const medicines = await StudentMedicine.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("prescribedBy", "university_mail university_reg_number");

    const count = await StudentMedicine.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: medicines,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalRecords: count,
    });
  } catch (error) {
    console.error("Error fetching all medicines:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicine records",
      error: error.message,
    });
  }
};

// Get single medicine record by ID
export const getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await StudentMedicine.findById(id).populate(
      "prescribedBy",
      "university_mail university_reg_number"
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine record not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    console.error("Error fetching medicine:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicine record",
      error: error.message,
    });
  }
};

// Update medicine record status
export const updateMedicineStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const medicine = await StudentMedicine.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Medicine status updated successfully",
      data: medicine,
    });
  } catch (error) {
    console.error("Error updating medicine status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update medicine status",
      error: error.message,
    });
  }
};

// Delete medicine record
export const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const medicine = await StudentMedicine.findByIdAndDelete(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Medicine record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting medicine:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete medicine record",
      error: error.message,
    });
  }
};
