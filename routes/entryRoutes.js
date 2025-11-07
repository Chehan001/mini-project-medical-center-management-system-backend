import express from "express";
import EntryRecord from "../models/entryRecordModel.js";

const router = express.Router();

// Record a new entry
router.post("/", async (req, res) => {
  try {
    const { regNumber, entryType } = req.body;

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0];

    const newEntry = new EntryRecord({
      regNumber,
      entryType,
      date,
      time,
    });

    await newEntry.save();
    res.status(201).json({ ok: true, data: newEntry });
  } catch (err) {
    console.error("Error recording entry:", err);
    res.status(500).json({ ok: false, error: "Failed to record entry" });
  }
});

// Get all entries (for admin view)
router.get("/", async (req, res) => {
  try {
    const records = await EntryRecord.find().sort({ createdAt: -1 });
    res.status(200).json({ ok: true, data: records });
  } catch (err) {
    console.error("Error fetching entries:", err);
    res.status(500).json({ ok: false, error: "Failed to fetch entries" });
  }
});

export default router;
