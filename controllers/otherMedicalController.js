import OtherMedical from "../models/otherMedicalModel.js";
import StudentMedical from "../models/studentMedicalModel.js";
import StudentMedicine from "../models/studentMedicineModel.js";

export const submitOtherMedicalForm = async (req, res) => {
  try {
    const { studentName, regNumber, faculty, location, doctorName, doctorRegID, treatmentDate } = req.body;

    if (!studentName || !regNumber || !faculty || !location || !doctorName || !doctorRegID || !treatmentDate) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    let filePath = "";
    if (req.file) filePath = `/medical/${req.file.filename}`;

    // Compare StudentMedicine dates
    const dayStart = new Date(treatmentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(treatmentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const medicineRecord = await StudentMedicine.findOne({
      regNumber: regNumber.toUpperCase(),
      date: { $gte: dayStart, $lte: dayEnd },
    });

    const medicalApproval = medicineRecord ? "Approved" : "Not Approved";

    const newRecord = new OtherMedical({
      studentName,
      regNumber: regNumber.toUpperCase(),
      faculty,
      location,
      doctorName,
      doctorRegID,
      treatmentDate,
      file: filePath,
      medicalApproval,
      doctorApproval: "Pending",
    });

    await newRecord.save();

    // Create corresponding StudentMedical
    const studentMedical = new StudentMedical({
      studentName,
      regNumber: regNumber.toUpperCase(),
      medicalDate: treatmentDate,
      medicalApproval,
      doctorApproval: "Pending",
      pdfFile: filePath,
      type: "Other",
    });

    await studentMedical.save();

    res.status(201).json({
      message: "Other medical form submitted successfully.",
      data: newRecord,
      medicineFound: !!medicineRecord,
      studentMedical,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const getAllOtherMedicalForms = async (req, res) => {
  try {
    const records = await OtherMedical.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching forms." });
  }
};

export const updateDoctorApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorApproval } = req.body;

    if (!["Yes", "No"].includes(doctorApproval)) {
      return res.status(400).json({ message: "Invalid doctor approval value." });
    }

    const updated = await OtherMedical.findByIdAndUpdate(id, { doctorApproval }, { new: true });

    if (!updated) return res.status(404).json({ message: "Record not found." });

    res.status(200).json({ message: "Doctor approval updated successfully.", data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Could not update approval." });
  }
};
