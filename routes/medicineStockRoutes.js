import express from "express";
import {
  addMedicine,
  getStock,
  distributeMedicine,
  getDistributionHistory,
  getLowStock,
  getExpiredMedicines,
  deleteMedicine,
} from "../controllers/medicineStockController.js";


const router = express.Router();

// Medicine_Stock_Routes
router.post("/add", addMedicine);                    // Adding new medicine(update quantity)
router.get("/stock", getStock);                      //  all medicines details in stock
router.post("/distribute", distributeMedicine);      // Distribute medicine --> to given students
router.get("/distribution-history", getDistributionHistory); //distribution history
router.get("/low-stock", getLowStock);               //  medicines with low stock
router.get("/expired", getExpiredMedicines);         //  expired medicines
router.delete("/delete/:id", deleteMedicine);        // Delete medicine using  by ID

export default router;