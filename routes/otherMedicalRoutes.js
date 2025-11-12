import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import OtherMedical from "../models/otherMedicalModel.js";
import { submitOtherMedicalForm, getAllOtherMedicalForms } from "../controllers/otherMedicalController.js";

const router = express.Router();

// Ensure 'medical' folder exists (for storing student medical PDFs)
const medicalDir = path.join(process.cwd(), "medical");
if (!fs.existsSync(medicalDir)) {
  fs.mkdirSync(medicalDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, medicalDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

// Only allow PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Routes

// Submit a new medical form with PDF
router.post("/submit", upload.single("file"), submitOtherMedicalForm);

// Get all medical forms
router.get("/all", getAllOtherMedicalForms);

// Get --> medical forms by student's regNumber
router.get("/:regNumber", async (req, res) => {
  try {
    const { regNumber } = req.params;

    // Fetch records matching regNumber (case-insensitive)
    const records = await OtherMedical.find({ regNumber: regNumber.toUpperCase() }).sort({ createdAt: -1 });

    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching medical forms by regNumber:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

export default router;
