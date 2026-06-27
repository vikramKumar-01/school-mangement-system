import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const StudyMaterial = mongoose.model("StudyMaterial", studyMaterialSchema);
