import mongoose from "mongoose";

const marksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    examType: {
      type: String,
      required: true,
      default: "Mid-Term", // Mid-Term, Final, Quiz
    },
  },
  { timestamps: true }
);

export const Marks = mongoose.model("Marks", marksSchema);
