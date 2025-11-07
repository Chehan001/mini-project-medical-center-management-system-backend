import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

// Setup 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Models & Routes 
import User from "./models/userModel.js";
import StudentPersonalData from "./models/StudentPersonalDataModel.js";
import StudentPersonalDataRoutes from "./routes/StudentPersonalDataRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import smsRoutes from "./routes/smsRoutes.js";
import appointmentsRoutes from "./routes/appointmentsRoutes.js";
import adminAppointmentRoutes from "./routes/adminAppointmentsRoutes.js";
import entryRoutes from "./routes/entryRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import studentMedicineRoutes from "./routes/studentMedicineRoutes.js";
import medicineStockRoutes from "./routes/medicineStockRoutes.js";

// Middleware 
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root Route 
app.get("/", (req, res) => {
  res.send(" MediCare Backend API is running...");
});

// API Routes 
app.use("/api/user", StudentPersonalDataRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/appointments", adminAppointmentRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/studentMedicine", studentMedicineRoutes);
app.use("/api/medicineStock", medicineStockRoutes);


// Working Hours + Holidays 
const holidays = [
  { date: "2025-10-20", name: "Diwali" },
  { date: "2025-12-25", name: "Christmas" },
  { date: "2025-04-14", name: "New Year" },
];

const WEEKLY_HOURS = {
  Monday: "8:30 AM – 4:30 PM",
  Tuesday: "8:30 AM – 4:30 PM",
  Wednesday: "8:30 AM – 4:30 PM",
  Thursday: "8:30 AM – 4:30 PM",
  Friday: "8:30 AM – 4:30 PM",
  Saturday: "Closed",
  Sunday: "Closed",
};

function getDayName(dateStr) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date(dateStr).getDay()];
}

app.get("/api/hours", (req, res) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const dayName = getDayName(todayStr);
  const holiday = holidays.find((h) => h.date === todayStr);
  const hours = { ...WEEKLY_HOURS };
  if (holiday) hours[dayName] = `${holiday.name} - Hours might differ`;
  res.json({
    date: todayStr,
    today: dayName,
    hours,
    holiday: holiday ? holiday.name : null,
  });
});

// Auto_create_Admin 
const createAdminIfMissing = async () => {
  try {
    const {
      ADMIN_UNIVERSITY_MAIL,
      ADMIN_UNIVERSITY_REG_NUMBER,
      ADMIN_PASSWORD,
      FORCE_RESET,
    } = process.env;

    if (!ADMIN_UNIVERSITY_MAIL || !ADMIN_UNIVERSITY_REG_NUMBER || !ADMIN_PASSWORD) {
      console.warn("Missing admin credentials in .env — skipping admin creation.");
      return;
    }

    const existingAdmin = await User.findOne({
      $or: [
        { university_mail: ADMIN_UNIVERSITY_MAIL.toLowerCase() },
        { university_reg_number: ADMIN_UNIVERSITY_REG_NUMBER.toUpperCase() },
      ],
    });

    if (existingAdmin) {
      if (FORCE_RESET?.toLowerCase() === "true") {
        existingAdmin.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log(" Admin password reset successfully.");
      } else {
        console.log(" Admin already exists — no changes made.");
      }
      return;
    }

    await User.create({
      university_mail: ADMIN_UNIVERSITY_MAIL.toLowerCase(),
      university_reg_number: ADMIN_UNIVERSITY_REG_NUMBER.toUpperCase(),
      password: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "admin",
    });
    console.log(" Admin user created successfully.");
  } catch (err) {
    console.error(" Error creating admin:", err);
  }
};

// MongoDB_Connection 
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log(" MongoDB connected successfully");
    await createAdminIfMissing();
    app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  });