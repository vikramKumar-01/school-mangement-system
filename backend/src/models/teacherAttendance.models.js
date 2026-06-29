import mongoose from "mongoose";

const teacherAttendanceSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    distance: {
        type: Number
    },
    status: {
        type: String,
        enum: ["Present", "Late", "Absent", "Half Day", "Holiday", "Weekend"],
        required: true
    },
    workingHours: {
        type: Number
    }
}, { timestamps: true });

export const TeacherAttendance = mongoose.model("TeacherAttendance", teacherAttendanceSchema);
