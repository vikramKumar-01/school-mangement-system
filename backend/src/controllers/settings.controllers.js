import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { SchoolSettings } from "../models/schoolSettings.models.js";

// Initialize default settings if none exist
const initializeSettings = async () => {
    let settings = await SchoolSettings.findOne();
    if (!settings) {
        settings = await SchoolSettings.create({
            schoolName: "Apex Academy",
            latitude: 28.6139, // Default: New Delhi
            longitude: 77.2090,
            allowedRadius: 100,
            workingHours: 8,
            lateTime: "09:15 AM",
            defaultCheckInTime: "09:00 AM",
            defaultCheckOutTime: "05:00 PM"
        });
    }
    return settings;
};

export const getSettings = asyncHandler(async (req, res) => {
    const settings = await initializeSettings();
    
    return res.status(200).json(
        new ApiResponse(200, settings, "Settings fetched successfully")
    );
});

export const updateSettings = asyncHandler(async (req, res) => {
    const { schoolName, latitude, longitude, allowedRadius, workingHours, lateTime, defaultCheckInTime, defaultCheckOutTime } = req.body;

    let settings = await SchoolSettings.findOne();
    if (!settings) {
        settings = await initializeSettings();
    }

    if (schoolName) settings.schoolName = schoolName;
    if (latitude !== undefined) settings.latitude = Number(latitude);
    if (longitude !== undefined) settings.longitude = Number(longitude);
    if (allowedRadius !== undefined) settings.allowedRadius = Number(allowedRadius);
    if (workingHours !== undefined) settings.workingHours = Number(workingHours);
    if (lateTime) settings.lateTime = lateTime;
    if (defaultCheckInTime) settings.defaultCheckInTime = defaultCheckInTime;
    if (defaultCheckOutTime) settings.defaultCheckOutTime = defaultCheckOutTime;

    await settings.save();

    return res.status(200).json(
        new ApiResponse(200, settings, "Settings updated successfully")
    );
});
