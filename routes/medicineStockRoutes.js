import express from "express";
import {
  addMedicine,
  getStock,
  distributeMedicine,
  getDistributionHistory,
  getLowStock,
  getExpiredMedicines,
  deleteMedicine
} from "../controllers/medicineController.js";

const router = express.Router();

// Medicine Stock Routes
router.post("/add", addMedicine);                    // Add new medicine or update quantity
router.get("/stock", getStock);                      // Get all medicines in stock
router.post("/distribute", distributeMedicine);      // Distribute medicine (reduce quantity)
router.get("/distribution-history", getDistributionHistory); // Get distribution history
router.get("/low-stock", getLowStock);               // Get medicines with low stock
router.get("/expired", getExpiredMedicines);         // Get expired medicines
router.delete("/delete/:id", deleteMedicine);        // Delete medicine by ID

export default router;