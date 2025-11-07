import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import StudentPersonalData from "../models/StudentPersonalDataModel.js";

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// File upload rules
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error("Only JPEG/PNG images are allowed"));
  },
});

//Save_new_student_registration (only if not already exists)
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { regNumber } = req.body;
    if (!regNumber)
      return res.status(400).json({ message: "Registration number required" });

    const existing = await StudentPersonalData.findOne({ regNumber });
    if (existing)
      return res
        .status(400)
        .json({ message: "Record already exists for this student" });

    const doc = { ...req.body };
    if (req.file) doc.photo = `/uploads/${req.file.filename}`;

    const registration = new StudentPersonalData(doc);
    await registration.save();

    res.status(201).json(registration);
  } catch (err) {
    console.error("Error saving student data:", err);
    res.status(500).json({ message: err.message });
  }
});

// get_all_student_records
router.get("/", async (req, res) => {
  try {
    const records = await StudentPersonalData.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get_student_by_registration_number
router.get("/:regNumber", async (req, res) => {
  try {
    const record = await StudentPersonalData.findOne({
      regNumber: req.params.regNumber,
    });
    if (!record)
      return res.status(404).json({ message: "No record found for this student" });
    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
