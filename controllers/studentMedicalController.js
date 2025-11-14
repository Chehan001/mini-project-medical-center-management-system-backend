import StudentMedical from "../models/studentMedicalModel.js";
import StudentMedicine from "../models/studentMedicineModel.js";

/*
  Add new student medical request
  Handles both "Other" and "University" types.
  Approves medical if a medicine exists for the same date.
 */
export const addStudentMedical = async (req, res) => {
  try {
    const { studentName, regNumber, medicalDate, type, pdfFile } = req.body;

    if (!studentName || !regNumber || !medicalDate || !type) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    // Convert medicalDate to "YYYY-MM-DD" string for comparison
    const dayStr = new Date(medicalDate).toISOString().split("T")[0];

    // Find medicine record for the same date
    const medicineRecord = await StudentMedicine.findOne({
      regNumber: regNumber.toUpperCase(),
      date: dayStr,
    });

    const medicalApproval = medicineRecord ? "Approved" : "Not Approved";

    // Save StudentMedical record
    const newRecord = new StudentMedical({
      studentName,
      regNumber: regNumber.toUpperCase(),
      medicalDate,
      medicalApproval,
      doctorApproval: "Pending",
      pdfFile: pdfFile || null,
      type,
    });

    await newRecord.save();

    res.status(201).json({
      message: "Medical request submitted successfully.",
      data: newRecord,
      medicineFound: !!medicineRecord,
    });
  } catch (error) {
    console.error("Error adding student medical:", error);
    res.status(500).json({
      message: "Server error. Could not add record.",
      error: error.message,
    });
  }
};

/* Get all student medical requests */
export const getAllStudentMedicals = async (req, res) => {
  try {
    const records = await StudentMedical.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not fetch records." });
  }
};

/* Get student medical requests by registration number */
export const getStudentMedicalByRegNo = async (req, res) => {
  try {
    const { regNumber } = req.params;
    const records = await StudentMedical.find({ regNumber: regNumber.toUpperCase() }).sort({ createdAt: -1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ message: "No student medical records found." });
    }

    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not fetch records." });
  }
};

/* Update doctor approval */
export const updateDoctorApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorApproval } = req.body;

    if (!["Yes", "No"].includes(doctorApproval)) {
      return res.status(400).json({ message: "Invalid doctor approval value." });
    }

    const updated = await StudentMedical.findByIdAndUpdate(id, { doctorApproval }, { new: true });

    if (!updated) return res.status(404).json({ message: "Record not found." });

    res.status(200).json({ message: "Doctor approval updated successfully.", data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not update approval." });
  }
};
