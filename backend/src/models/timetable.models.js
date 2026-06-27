import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    timeStart: {
      type: String, // e.g. "09:00 AM"
      required: true,
    },
    timeEnd: {
      type: String, // e.g. "10:00 AM"
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Timetable = mongoose.model("Timetable", timetableSchema);
