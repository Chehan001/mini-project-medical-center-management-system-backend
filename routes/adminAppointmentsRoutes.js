import express from 'express';
import Appointment from '../models/appointmentsModel.js'; // Make sure this points to your main appointments model

const router = express.Router();

// GET_all_appointments_for_admin
router.get('/', async (req, res) => {
  try {
    // Fetch all appointments from MongoDB, sorted by newest first
    const appointments = await Appointment.find().sort({ createdAt: -1 }).lean();

    // Return as JSON
    res.status(200).json({ ok: true, data: appointments });
  } catch (err) {
    console.error('Error fetching admin appointments:', err);

    // Return consistent error format
    res.status(500).json({ ok: false, error: 'Failed to fetch appointments' });
  }
});

export default router;
