import mongoose from "mongoose";

const StudentPersonalDataSchema = new mongoose.Schema(
  {
    // Basic_Info
    name: { type: String, required: true },
    address: String,
    faculty: String,
    course: String,
    regNumber: { type: String, required: true, unique: true, uppercase: true },
    dob: String,
    weight: String,
    height: String,
    bloodGroup: String,
    photo: String,

    // Medical_Data
    teethHealthy: String,
    heartDisease: String,
    cardiacEnlargement: String,
    heartSounds: String,
    bp: String,
    lungsHistory: String,
    lungsAbnormalities: String,
    enlargementOfLiverSpleen: String,
    historyOfPepticUlcer: String,
    kidneysPalpable: String,
    otherAbnormalities: String,
    historyOfConvulsions: String,
    historyOfPoliomyelitis: String,
    visionR: String,
    visionL: String,
    visionWR: String,
    visionWL: String,
    colorVision: String,
    hearingDefectPresent: String,
    hearingDefectPast: String,
    speechDefect: String,
    operation: String,
    operations: String,
    deformities: String,
    evidenceOfHernia: String,
    immunity: String,
    xray: String,
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);


StudentPersonalDataSchema.index({ regNumber: 1 });

const StudentPersonalData = mongoose.model(
  "StudentPersonalData",
  StudentPersonalDataSchema
);

export default StudentPersonalData;
