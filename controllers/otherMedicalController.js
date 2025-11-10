import OtherMedical from "../models/otherMedicalModel.js";
import path from "path";
import fs from "fs";

export const submitOtherMedicalForm = async (req, res) => {
  try {
    const { studentName, regNumber, faculty, location, doctorName, doctorRegID, treatmentDate } = req.body;

    // Validation
    if (!studentName || !regNumber || !faculty || !location || !doctorName || !doctorRegID || !treatmentDate) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    // File path
    let filePath = "";
    if (req.file) {
      filePath = `/medical/${req.file.filename}`;
    }

    const newRecord = new OtherMedical({
      studentName,
      regNumber,
      faculty,
      location,
      doctorName,
      doctorRegID,
      treatmentDate,
      file: filePath,
    });

    await newRecord.save();
    res.status(201).json({ message: "Form submitted successfully!", data: newRecord });
  } catch (error) {
    console.error("Error submitting other medical form:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const getAllOtherMedicalForms = async (req, res) => {
  try {
    const records = await OtherMedical.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching forms" });
  }
};
