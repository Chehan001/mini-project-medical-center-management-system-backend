import express from "express";
import UniversityMedical from "../models/universityMedicalModel.js";
import { addMedicalRecord, getAllMedicalRecords } from "../controllers/universityMedicalController.js";

const router = express.Router();

//  Add --> new medical record
router.post("/", addMedicalRecord);

//  Get -->  all medical records
router.get("/", getAllMedicalRecords);

//  Get --> records by student's registration number
router.get("/:regNumber", async (req, res) => {
  try {
    const { regNumber } = req.params;

    // Fetch --> records that match the student's regNumber 
    const records = await UniversityMedical.find({
      regNumber: regNumber.toUpperCase(),
    }).sort({ createdAt: -1 });

    // If no records found
    if (!records || records.length === 0) {
      return res.status(404).json({ message: "No medical records found for this registration number." });
    }

    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching university medical records:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

export default router;
