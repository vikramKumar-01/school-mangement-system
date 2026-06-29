import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Fee } from "../models/fee.models.js";
import { Student } from "../models/student.models.js";
import mongoose from "mongoose";


const createFee = asyncHandler(async (req, res) => {
    const { student: studentId, amount, status, paymentDate } = req.body || {};

    
    if (!studentId) {
        throw new ApiError(400, "Student ID is required");
    }

    if (amount === undefined || amount === null) {
        throw new ApiError(400, "Fee amount is required");
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
        throw new ApiError(400, "Amount must be a positive number");
    }

    
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new ApiError(400, "Invalid Student ID format");
    }

    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
        throw new ApiError(404, "Student not found");
    }

    // Validate status value if provided
    const validStatuses = ["Paid", "Pending"];
    const normalizedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "Pending";
    
    if (status && !validStatuses.includes(normalizedStatus)) {
        throw new ApiError(400, "Status must be 'Paid' or 'Pending'");
    }

    const fee = await Fee.create({
        student: studentId,
        amount: parsedAmount,
        status: normalizedStatus,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined
    });

    const createdFee = await Fee.findById(fee._id).populate("student");
    if (!createdFee) {
        throw new ApiError(500, "Something went wrong while registering fee");
    }

    return res.status(201).json(
        new ApiResponse(200, createdFee, "Fee record created successfully")
    );
});

// Get Fee by ID (Admin or the specific Student)
const getFeeById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Fee ID format");
    }

    const feeObj = await Fee.findById(id).populate("student");
    if (!feeObj) {
        throw new ApiError(404, "Fee record not found");
    }

    // If role is student, they can only view if it is their fee record
    if (req.user.role === "student") {
        const student = await Student.findOne({ name: req.user.fullName });
        if (!student || feeObj.student?._id.toString() !== student._id.toString()) {
            throw new ApiError(403, "You are not authorized to view this fee record");
        }
    }

    return res.status(200).json(
        new ApiResponse(200, feeObj, "Fee details fetched successfully")
    );
});

// Get all fees (Admin sees all; Student sees only their own)
const getAllFees = asyncHandler(async (req, res) => {
    const { status, studentId, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (status) {
        const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        filter.status = normalizedStatus;
    }

    // Role-based filtering
    if (req.user.role === "student") {
        const student = await Student.findOne({ name: req.user.fullName });
        if (!student) {
            // Student record not found, return empty array
            return res.status(200).json(
                new ApiResponse(200, {
                    fees: [],
                    pagination: {
                        totalFees: 0,
                        totalPages: 0,
                        currentPage: Number(page),
                        limit: Number(limit)
                    }
                }, "No fee records found")
            );
        }
        filter.student = student._id;
    } else if (studentId) {
        // Admin filter by specific student
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            throw new ApiError(400, "Invalid Student ID format");
        }
        filter.student = studentId;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const parsedLimit = Number(limit);

    const fees = await Fee.find(filter)
        .populate("student")
        .skip(skip)
        .limit(parsedLimit)
        .sort({ createdAt: -1 });

    const totalFees = await Fee.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            fees,
            pagination: {
                totalFees,
                totalPages: Math.ceil(totalFees / parsedLimit),
                currentPage: Number(page),
                limit: parsedLimit
            }
        }, "Fee records fetched successfully")
    );
});

// Update Fee Record (Admin Only)
const updateFee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, status, paymentDate } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Fee ID format");
    }

    const existingFee = await Fee.findById(id);
    if (!existingFee) {
        throw new ApiError(404, "Fee record not found");
    }

    if (amount === undefined && status === undefined && paymentDate === undefined) {
        throw new ApiError(400, "At least one field is required to update");
    }

    if (amount !== undefined) {
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
            throw new ApiError(400, "Amount must be a positive number");
        }
        existingFee.amount = parsedAmount;
    }

    if (status !== undefined) {
        const validStatuses = ["Paid", "Pending"];
        const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        
        if (!validStatuses.includes(normalizedStatus)) {
            throw new ApiError(400, "Status must be 'Paid' or 'Pending'");
        }
        existingFee.status = normalizedStatus;
    }

    if (paymentDate !== undefined) {
        if (paymentDate) {
            const date = new Date(paymentDate);
            if (isNaN(date.getTime())) {
                throw new ApiError(400, "Invalid payment date format");
            }
            existingFee.paymentDate = date;
        } else {
            existingFee.paymentDate = undefined;
        }
    }

    await existingFee.save();
    const updatedFee = await Fee.findById(existingFee._id).populate("student");

    return res.status(200).json(
        new ApiResponse(200, updatedFee, "Fee record updated successfully")
    );
});

// Delete Fee Record (Admin Only)
const deleteFee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Fee ID format");
    }

    const existingFee = await Fee.findById(id);
    if (!existingFee) {
        throw new ApiError(404, "Fee record not found");
    }

    await Fee.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Fee record deleted successfully")
    );
});

export {
    createFee,
    getFeeById,
    getAllFees,
    updateFee,
    deleteFee
};
