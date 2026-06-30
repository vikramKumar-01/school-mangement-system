import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Attendance } from "../models/attendance.models.js";
import { Student } from "../models/student.models.js";
import mongoose from "mongoose";

// Create Attendance Record (Admin & Teacher Only)
const createAttendance = asyncHandler(async (req, res) => {
    const { student: studentId, date, status } = req.body || {};

    // check required fields
    if (!studentId) {
        throw new ApiError(400, "Student ID is required");
    }

    if (!status?.trim()) {
        throw new ApiError(400, "Attendance status is required");
    }

    // Validate student exists
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new ApiError(400, "Invalid Student ID format");
    }

    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
        throw new ApiError(404, "Student not found");
    }

    // Validate status value
    const validStatuses = ["Present", "Absent", "Holiday"];
    const normalizedStatus = status.trim().charAt(0).toUpperCase() + status.trim().slice(1).toLowerCase();

    if (!validStatuses.includes(normalizedStatus)) {
        throw new ApiError(400, "Status must be 'Present', 'Absent', or 'Holiday'");
    }

    const parsedDate = date ? new Date(date) : new Date();
    if (isNaN(parsedDate.getTime())) {
        throw new ApiError(400, "Invalid date format");
    }

    // Optional: Avoid duplicate attendance for the same student on the same day (ignoring hours/mins)
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const duplicateRecord = await Attendance.findOne({
        student: studentId,
        date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (duplicateRecord) {
        throw new ApiError(409, "Attendance record for this student on this date already exists");
    }

    const attendance = await Attendance.create({
        student: studentId,
        date: parsedDate,
        status: normalizedStatus
    });

    const createdAttendance = await Attendance.findById(attendance._id).populate("student");
    if (!createdAttendance) {
        throw new ApiError(500, "Something went wrong while registering attendance");
    }

    return res.status(201).json(
        new ApiResponse(200, createdAttendance, "Attendance logged successfully")
    );
});

// Get Attendance Record by ID (Admin/Teacher, or the specific Student/Parent)
const getAttendanceById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Attendance ID format");
    }

    const attendanceObj = await Attendance.findById(id).populate("student");
    if (!attendanceObj) {
        throw new ApiError(404, "Attendance record not found");
    }

    // If role is student or parent, restrict access to their own attendance records
    if (req.user.role === "student" || req.user.role === "parent") {
        let student;
        if (req.user.role === "student") {
            student = await Student.findOne({ user: req.user._id });
            if (!student) {
                student = await Student.findOne({ name: req.user.fullName });
            }
        } else if (req.user.role === "parent") {
            student = await Student.findOne({ fatherName: req.user.fullName });
            if (!student) {
                student = await Student.findOne({ user: req.user._id });
            }
        }

        if (!student || attendanceObj.student?._id.toString() !== student._id.toString()) {
            throw new ApiError(403, "You are not authorized to view this attendance record");
        }
    }

    return res.status(200).json(
        new ApiResponse(200, attendanceObj, "Attendance details fetched successfully")
    );
});

// Get all attendance records (Admin/Teacher sees all; Student/Parent sees only their own)
const getAllAttendance = asyncHandler(async (req, res) => {
    const { status, studentId, date, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (status) {
        const normalizedStatus = status.trim().charAt(0).toUpperCase() + status.trim().slice(1).toLowerCase();
        filter.status = normalizedStatus;
    }

    if (date) {
        const queryDate = new Date(date);
        if (isNaN(queryDate.getTime())) {
            throw new ApiError(400, "Invalid query date format");
        }
        const start = new Date(queryDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(queryDate);
        end.setHours(23, 59, 59, 999);
        filter.date = { $gte: start, $lte: end };
    }

    // Role-based filtering
    if (req.user.role === "student" || req.user.role === "parent") {
        let student;
        if (req.user.role === "student") {
            student = await Student.findOne({ user: req.user._id });
            if (!student) {
                student = await Student.findOne({ name: req.user.fullName });
            }
        } else if (req.user.role === "parent") {
            student = await Student.findOne({ fatherName: req.user.fullName });
            if (!student) {
                student = await Student.findOne({ user: req.user._id });
            }
        }

        if (!student) {
            // Student record not found, return empty list
            return res.status(200).json(
                new ApiResponse(200, {
                    attendance: [],
                    pagination: {
                        totalAttendance: 0,
                        totalPages: 0,
                        currentPage: Number(page),
                        limit: Number(limit)
                    }
                }, "No attendance records found")
            );
        }
        filter.student = student._id;
    } else if (studentId) {
        // Admin or Teacher filter by specific student
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            throw new ApiError(400, "Invalid Student ID format");
        }
        filter.student = studentId;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const parsedLimit = Number(limit);

    const attendance = await Attendance.find(filter)
        .populate("student")
        .skip(skip)
        .limit(parsedLimit)
        .sort({ date: -1 });

    const totalAttendance = await Attendance.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            attendance,
            pagination: {
                totalAttendance,
                totalPages: Math.ceil(totalAttendance / parsedLimit),
                currentPage: Number(page),
                limit: parsedLimit
            }
        }, "Attendance records fetched successfully")
    );
});

// Update Attendance Record (Admin & Teacher Only)
const updateAttendance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, date } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Attendance ID format");
    }

    const existingAttendance = await Attendance.findById(id);
    if (!existingAttendance) {
        throw new ApiError(404, "Attendance record not found");
    }

    if (status === undefined && date === undefined) {
        throw new ApiError(400, "At least one field is required to update");
    }

    if (status !== undefined) {
        if (!status?.trim()) {
            throw new ApiError(400, "Status cannot be empty");
        }

        const validStatuses = ["Present", "Absent", "Holiday"];
        const normalizedStatus = status.trim().charAt(0).toUpperCase() + status.trim().slice(1).toLowerCase();

        if (!validStatuses.includes(normalizedStatus)) {
            throw new ApiError(400, "Status must be 'Present', 'Absent', or 'Holiday'");
        }
        existingAttendance.status = normalizedStatus;
    }

    if (date !== undefined) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            throw new ApiError(400, "Invalid date format");
        }
        existingAttendance.date = parsedDate;
    }

    await existingAttendance.save();
    const updatedAttendance = await Attendance.findById(existingAttendance._id).populate("student");

    return res.status(200).json(
        new ApiResponse(200, updatedAttendance, "Attendance record updated successfully")
    );
});

// Delete Attendance Record (Admin & Teacher Only)
const deleteAttendance = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Attendance ID format");
    }

    const existingAttendance = await Attendance.findById(id);
    if (!existingAttendance) {
        throw new ApiError(404, "Attendance record not found");
    }

    await Attendance.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Attendance record deleted successfully")
    );
});

export {
    createAttendance,
    getAttendanceById,
    getAllAttendance,
    updateAttendance,
    deleteAttendance
};
