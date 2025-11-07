import express from 'express';
import Medicine from '../models/medicineModel.js';

const router = express.Router();

// Get all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving medicines',
      error: error.message
    });
  }
});

// Get single medicine by ID
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error('Error fetching medicine:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving medicine',
      error: error.message
    });
  }
});

// Create new medicine
router.post('/', async (req, res) => {
  try {
    const { name, category, quantity, expiryDate, supplier, price, description, batchNumber } = req.body;

    // Validation
    if (!name || !category || quantity === undefined || !expiryDate || !supplier || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const medicine = new Medicine({
      name,
      category,
      quantity,
      expiryDate,
      supplier,
      price,
      description,
      batchNumber
    });

    const savedMedicine = await medicine.save();

    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      data: savedMedicine
    });
  } catch (error) {
    console.error('Error creating medicine:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding medicine',
      error: error.message
    });
  }
});

// Update medicine
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMedicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: updatedMedicine
    });
  } catch (error) {
    console.error('Error updating medicine:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating medicine',
      error: error.message
    });
  }
});

// Delete medicine
router.delete('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      message: 'Medicine deleted successfully',
      data: medicine
    });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting medicine',
      error: error.message
    });
  }
});

// Get low stock medicines (quantity < 10)
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const lowStockMedicines = await Medicine.find({ quantity: { $lt: 10 } })
      .sort({ quantity: 1 });

    res.json({
      success: true,
      count: lowStockMedicines.length,
      data: lowStockMedicines
    });
  } catch (error) {
    console.error('Error fetching low stock medicines:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving low stock medicines',
      error: error.message
    });
  }
});

// Get expired or expiring soon medicines
router.get('/alerts/expiring', async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expiringMedicines = await Medicine.find({
      expiryDate: { $lte: thirtyDaysFromNow }
    }).sort({ expiryDate: 1 });

    res.json({
      success: true,
      count: expiringMedicines.length,
      data: expiringMedicines
    });
  } catch (error) {
    console.error('Error fetching expiring medicines:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving expiring medicines',
      error: error.message
    });
  }
});

// Search medicines
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { supplier: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);

    res.json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    console.error('Error searching medicines:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching medicines',
      error: error.message
    });
  }
});

export default router;