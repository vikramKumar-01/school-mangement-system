import mongoose from "mongoose";

const schoolSettingsSchema = new mongoose.Schema({
    schoolName: {
        type: String,
        required: true,
        default: "Apex Academy"
    },
    latitude: {
        type: Number,
        required: true,
        default: 0
    },
    longitude: {
        type: Number,
        required: true,
        default: 0
    },
    allowedRadius: {
        type: Number,
        required: true,
        default: 100 // in meters
    },
    workingHours: {
        type: Number,
        required: true,
        default: 8 // minimum hours for full day
    },
    lateTime: {
        type: String,
        required: true,
        default: "09:15 AM"
    },
    defaultCheckInTime: {
        type: String,
        required: true,
        default: "09:00 AM"
    },
    defaultCheckOutTime: {
        type: String,
        required: true,
        default: "05:00 PM"
    }
}, { timestamps: true });

export const SchoolSettings = mongoose.model("SchoolSettings", schoolSettingsSchema);
