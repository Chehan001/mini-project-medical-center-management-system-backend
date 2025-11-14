import express from "express";
import {
  addMedicalRecord,
  getAllMedicalRecords,
  getMedicalRecordsByRegNumber,
  updateDoctorApproval,
} from "../controllers/universityMedicalController.js";

const router = express.Router();

// Routes
router.post("/", addMedicalRecord);
router.get("/", getAllMedicalRecords);
router.get("/reg/:regNumber", getMedicalRecordsByRegNumber); // use /reg/:regNumber to avoid conflicts
router.put("/:id/doctor-approval", updateDoctorApproval);

export default router;
