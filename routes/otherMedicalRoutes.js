import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import OtherMedical from "../models/otherMedicalModel.js";
import {
  submitOtherMedicalForm,
  getAllOtherMedicalForms,
  updateDoctorApproval
} from "../controllers/otherMedicalController.js";

const router = express.Router();

// Ensure 'medical' folder exists
const medicalDir = path.join(process.cwd(), "medical");
if (!fs.existsSync(medicalDir)) fs.mkdirSync(medicalDir, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, medicalDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed!"), false);
};

const upload = multer({ storage, fileFilter });

// Routes
router.post("/submit", upload.single("file"), submitOtherMedicalForm);
router.get("/all", getAllOtherMedicalForms);
router.get("/reg/:regNumber", async (req, res) => {
  try {
    const { regNumber } = req.params;
    const records = await OtherMedical.find({ regNumber: regNumber.toUpperCase() })
      .sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching medical forms by regNumber:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});
router.put("/:id/doctor-approval", updateDoctorApproval);

export default router;
