import UniversityMedical from "../models/universityMedicalModel.js";
import StudentMedical from "../models/studentMedicalModel.js";
import StudentMedicine from "../models/studentMedicineModel.js";

/* Add --> new University medical record + create corresponding StudentMedical */
export const addMedicalRecord = async (req, res) => {
  try {
    const { studentName, regNumber, faculty, treatmentDate, pdfFile } = req.body;

    if (!studentName || !regNumber || !faculty || !treatmentDate) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Convert treatmentDate to YYYY-MM-DD string
    const treatmentDateStr = new Date(treatmentDate).toISOString().split("T")[0];

    // Find medicine record for the same date
    const medicineRecord = await StudentMedicine.findOne({
      regNumber: regNumber.toUpperCase(),
      date: treatmentDateStr, // string comparison
    });

    const medicalApproval = medicineRecord ? "Approved" : "Not Approved";

    // Save UniversityMedical record with correct medicalApproval
    const universityRecord = new UniversityMedical({
      studentName,
      regNumber: regNumber.toUpperCase(),
      faculty,
      treatmentDate,
      pdfFile: pdfFile || null,
      medicalApproval,
      doctorApproval: "Pending",
    });
    await universityRecord.save();

    // Create --> corresponding StudentMedical record
    const studentMedical = new StudentMedical({
      studentName,
      regNumber: regNumber.toUpperCase(),
      medicalDate: treatmentDate,
      medicalApproval,
      doctorApproval: "Pending",
      pdfFile: pdfFile || null,
      type: "University",
    });
    await studentMedical.save();

    res.status(201).json({
      message: "University medical request submitted successfully.",
      universityRecord,
      studentMedical,
      medicineFound: !!medicineRecord,
    });
  } catch (error) {
    console.error("Error saving UniversityMedical record:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

/*Get--> all University medical records*/
export const getAllMedicalRecords = async (req, res) => {
  try {
    const records = await UniversityMedical.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/*Get -->  University medical records by registration number*/
export const getMedicalRecordsByRegNumber = async (req, res) => {
  try {
    const { regNumber } = req.params;
    const records = await UniversityMedical.find({
      regNumber: regNumber.toUpperCase(),
    }).sort({ createdAt: -1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ message: "No medical records found for this registration number." });
    }

    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching records by regNumber:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * Update doctor approval for University Medical
 */
export const updateDoctorApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorApproval } = req.body;

    if (!["Yes", "No"].includes(doctorApproval)) {
      return res.status(400).json({ message: "Invalid doctor approval value." });
    }

    const updated = await UniversityMedical.findByIdAndUpdate(
      id,
      { doctorApproval },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Record not found." });

    res.status(200).json({
      message: "Doctor approval updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating doctor approval:", error);
    res.status(500).json({ message: "Server error. Could not update approval." });
  }
};
