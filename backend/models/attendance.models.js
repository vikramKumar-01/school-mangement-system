import mongoose from "mongoose";
import { type } from "node:os";

const attendanceSchema = new mongoose.Schema({
    student: {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Student"
    },
    date: {
        type: Date,
        default: Date.now
    },
    status:{
        type: String,
        enum: ["Present","Absent","Holiday"],
        required: true
    }
});

export const Attendance = mongoose.model("Attendance", attendanceSchema);