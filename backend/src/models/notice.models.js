import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["academic", "exam", "event", "general"],
      default: "general",
    },
    author: {
      type: String,
      default: "Principal Office",
    },
  },
  { timestamps: true }
);

export const Notice = mongoose.model("Notice", noticeSchema);
