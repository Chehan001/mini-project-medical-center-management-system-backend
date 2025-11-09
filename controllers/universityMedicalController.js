import UniversityMedical from "../models/universityMedicalModel.js";

// Add new record
export const addMedicalRecord = async (req, res) => {
  try {
    const { studentName, regNumber, faculty, treatmentDate } = req.body;

    // Details--> validation
    if (!studentName || !regNumber || !faculty || !treatmentDate) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create and save Medical request record
    const newRecord = new UniversityMedical({
      studentName,
      regNumber,
      faculty,
      treatmentDate,
    });

    await newRecord.save();
    res.status(201).json({ message: "Record added successfully", data: newRecord });
  } catch (error) {
    console.error("Error saving record:", error);
    res.status(500).json({ message: "Server error. Could not save data." });
  }
};

// Get --> all records
export const getAllMedicalRecords = async (req, res) => {
  try {
    const records = await UniversityMedical.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching records" });
  }
};
