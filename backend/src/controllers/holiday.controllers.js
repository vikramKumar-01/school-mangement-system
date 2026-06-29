import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Holiday } from "../models/holiday.models.js";

// Add Holiday (Admin)
export const createHoliday = asyncHandler(async (req, res) => {
    const { name, date, type, description } = req.body;

    if (!name || !date || !type) {
        throw new ApiError(400, "Name, date, and type are required");
    }

    const existingHoliday = await Holiday.findOne({ date: new Date(date) });
    if (existingHoliday) {
        throw new ApiError(409, "A holiday already exists for this date");
    }

    const holiday = await Holiday.create({
        name,
        date: new Date(date),
        type,
        description
    });

    return res.status(201).json(
        new ApiResponse(201, holiday, "Holiday created successfully")
    );
});

// Get All Holidays
export const getAllHolidays = asyncHandler(async (req, res) => {
    const holidays = await Holiday.find().sort({ date: 1 });
    
    return res.status(200).json(
        new ApiResponse(200, holidays, "Holidays fetched successfully")
    );
});

// Update Holiday (Admin)
export const updateHoliday = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, date, type, description } = req.body;

    const holiday = await Holiday.findById(id);
    if (!holiday) {
        throw new ApiError(404, "Holiday not found");
    }

    if (date) {
        const existingHoliday = await Holiday.findOne({ 
            date: new Date(date), 
            _id: { $ne: id } 
        });
        if (existingHoliday) {
            throw new ApiError(409, "A holiday already exists for this date");
        }
        holiday.date = new Date(date);
    }

    if (name) holiday.name = name;
    if (type) holiday.type = type;
    if (description !== undefined) holiday.description = description;

    await holiday.save();

    return res.status(200).json(
        new ApiResponse(200, holiday, "Holiday updated successfully")
    );
});

// Delete Holiday (Admin)
export const deleteHoliday = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const holiday = await Holiday.findByIdAndDelete(id);
    if (!holiday) {
        throw new ApiError(404, "Holiday not found");
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Holiday deleted successfully")
    );
});
