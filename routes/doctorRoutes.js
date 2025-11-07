import express from "express";
import StudentPersonalData from "../models/StudentPersonalDataModel.js";

const router = express.Router();

//Get student details --> registration_number
router.get("/student/:regNumber", async (req, res) => {
  try {
    if (!req.params.regNumber) {
      return res.status(400).json({
        success: false,
        message: "Registration number is required",
      });
    }

    const regNumber = req.params.regNumber.trim().toUpperCase();

    // Find_student_in_database
    const student = await StudentPersonalData.findOne({ regNumber });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with regNumber "${regNumber}" not found in the database`,
      });
    }

    // Return_student_data
    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving student data",
      error: error.message,
    });
  }
});

// Get_all_students_for_doctor_view 
router.get("/students", async (req, res) => {
  try {
    const students = await StudentPersonalData.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving student list",
      error: error.message,
    });
  }
});

export default router;
