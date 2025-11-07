import express from "express";
import {
  addMedicine,
  getMedicinesByRegNumber,
  getAllMedicines,
  getMedicineById,
  updateMedicineStatus,
  deleteMedicine,
} from "../controllers/studentMedicineController.js";

const router = express.Router();

// Add new medicine record
router.post("/add-medicine", addMedicine);

//Get all medicine records for a specific student
router.get("/student/:regNumber", getMedicinesByRegNumber);

// Get all medicine records (with pagination and filters)
router.get("/all", getAllMedicines);

// Get single medicine record by ID
router.get("/:id", getMedicineById);

// Update medicine record status
router.put("/:id/status", updateMedicineStatus);

// Delete medicine record
router.delete("/:id", deleteMedicine);

export default router;