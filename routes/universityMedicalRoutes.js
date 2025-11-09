import express from "express";
import { addMedicalRecord, getAllMedicalRecords } from "../controllers/universityMedicalController.js";

const router = express.Router();

//add new medical record
router.post("/", addMedicalRecord);

// GET --> all medical records
router.get("/", getAllMedicalRecords);

export default router;
