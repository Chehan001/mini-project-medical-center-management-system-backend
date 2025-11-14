import express from "express";
import {
  addStudentMedical,
  getAllStudentMedicals,
  getStudentMedicalByRegNo,
  updateDoctorApproval,
} from "../controllers/studentMedicalController.js";

const router = express.Router();

// Add --> new student medical request
router.post("/", addStudentMedical);

// Get -->  all student medical requests
router.get("/", getAllStudentMedicals);

// Get --> student medical requests by regNumber
router.get("/:regNumber", getStudentMedicalByRegNo);

// Update --> doctor approval
router.put("/:id/doctor-approval", updateDoctorApproval);

export default router;
