import express from "express";
import Appointment from "../models/appointmentsModel.js";
import Joi from "joi";
import { sendSms } from "../services/notifications.js";

const router = express.Router();

//  Predefined holidays
const HOLIDAYS = ["2025-12-25", "2025-10-20", "2025-04-14"];

// Joi validation schema
const schema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  regNumber: Joi.string().alphanum().min(5).max(20).required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  mobile: Joi.string().min(9).max(15).required(),
});

//  Helper functions
const isWeekday = (dateIso) => {
  const [year, month, day] = dateIso.split("-").map(Number);
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6; // not Sat/Sun
};

const parseTime = (timeStr) => {
  const [hh, mm] = timeStr.split(":").map(Number);
  return { hh, mm };
};

const isInWorkingHours = (timeStr) => {
  const { hh, mm } = parseTime(timeStr);
  const minutes = hh * 60 + mm;
  const start = 8 * 60 + 30; // 08:30
  const end = 16 * 60; // 16:00
  return minutes >= start && minutes + 20 <= end;
};

const isLunch = (timeStr) => {
  const { hh } = parseTime(timeStr);
  return hh === 12; // 12:00–12:59
};

//  POST: Create new appointment
router.post("/", async (req, res) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error)
      return res.status(400).json({ ok: false, error: error.details[0].message });

    const { name, regNumber, date, time, mobile } = value;

    // Validation logic
    if (!isWeekday(date))
      return res
        .status(400)
        .json({ ok: false, error: "Doctor not available on weekends" });

    if (HOLIDAYS.includes(date))
      return res
        .status(400)
        .json({ ok: false, error: "Holiday — no appointments available" });

    if (!isInWorkingHours(time))
      return res.status(400).json({
        ok: false,
        error: "Time outside working hours (08:30–16:00)",
      });

    if (isLunch(time))
      return res.status(400).json({
        ok: false,
        error: "Doctor in lunch break (12:00–13:00)",
      });

    // Prevent duplicate bookings for same date/time/regNumber
    const existing = await Appointment.findOne({ regNumber, date, time });
    if (existing)
      return res
        .status(409)
        .json({ ok: false, error: "Appointment slot already booked" });

    //  Save appointment
    const appointment = new Appointment({ name, regNumber, date, time, mobile });
    await appointment.save();

    //  Optional: SMS confirmation
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM
    ) {
      try {
        await sendSms(
          mobile,
          `Hi ${name}, your appointment (${regNumber}) is confirmed for ${date} at ${time}.`
        );
      } catch (smsErr) {
        console.error("SMS sending failed:", smsErr);
      }
    }

    return res.status(201).json({ ok: true, appointment });
  } catch (err) {
    console.error("Appointment creation error:", err);
    return res
      .status(500)
      .json({ ok: false, error: err.message || "Server error" });
  }
});

// GET: Appointments by date
router.get("/by-date/:date", async (req, res) => {
  const { date } = req.params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ ok: false, error: "Invalid date format" });

  try {
    const bookings = await Appointment.find({ date })
      .sort({ time: 1 })
      .lean();
    res.json({ ok: true, bookings });
  } catch (err) {
    console.error("Fetch appointments error:", err);
    res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
});

//  NEW: Check if student has appointment today
router.get("/check/:regNumber", async (req, res) => {
  const { regNumber } = req.params;
  try {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);

    const appointment = await Appointment.findOne({
      regNumber,
      date: dateStr,
    }).lean();

    if (appointment) {
      return res.json({
        ok: true,
        hasAppointment: true,
        appointmentTime: appointment.time,
      });
    } else {
      return res.json({ ok: true, hasAppointment: false });
    }
  } catch (err) {
    console.error("Check appointment error:", err);
    res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
});

export default router;
