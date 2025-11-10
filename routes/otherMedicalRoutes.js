import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs"; 
import { submitOtherMedicalForm, getAllOtherMedicalForms } from "../controllers/otherMedicalController.js";

const router = express.Router();

// Ensure -->  'medical' folder exists 
// ( medical folder --> use for stoer student private medicals)
const medicalDir = path.join(process.cwd(), "medical");
if (!fs.existsSync(medicalDir)) {
  fs.mkdirSync(medicalDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, medicalDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

// Only allow --> medical PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post("/submit", upload.single("file"), submitOtherMedicalForm);
router.get("/all", getAllOtherMedicalForms);

export default router;
