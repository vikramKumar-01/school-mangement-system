import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Class } from "../models/class.models.js";
import { Teacher } from "../models/teacher.models.js";
import mongoose from "mongoose";

// Create Class
const createClass = asyncHandler(async (req, res) => {
    if (req.user.role === "teacher") {
        const teacher = await Teacher.findOne({ user: req.user._id });
        if (!teacher || teacher.permissions?.manageClasses !== true) {
            throw new ApiError(403, "You do not have permission to manage classes");
        }
    }

    const { className, section, classTeacher } = req.body || {};

    // check required fields
    if (!className?.trim()) {
        throw new ApiError(400, "Class name is required");
    }

    const cleanClassName = className.trim();
    const cleanSection = section?.trim() || "";

    // Check if class with same name and section already exists
    const existingClass = await Class.findOne({ className: cleanClassName, section: cleanSection });
    if (existingClass) {
        throw new ApiError(409, `Class ${cleanClassName} ${cleanSection} already exists`);
    }

    // Validate class teacher if provided
    if (classTeacher) {
        if (!mongoose.Types.ObjectId.isValid(classTeacher)) {
            throw new ApiError(400, "Invalid Class Teacher ID format");
        }

        const teacherExists = await Teacher.findById(classTeacher);
        if (!teacherExists) {
            throw new ApiError(404, "Class Teacher not found");
        }
    }

    const newClass = await Class.create({
        className: cleanClassName,
        section: cleanSection || undefined,
        classTeacher: classTeacher || undefined
    });

    const createdClass = await Class.findById(newClass._id).populate("classTeacher");
    if (!createdClass) {
        throw new ApiError(500, "Something went wrong while creating class");
    }

    return res.status(201).json(
        new ApiResponse(200, createdClass, "Class Created Successfully")
    );
});

// Get Class by ID
const getClassById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Class ID format");
    }

    const classObj = await Class.findById(id).populate("classTeacher");
    if (!classObj) {
        throw new ApiError(404, "Class not found");
    }

    return res.status(200).json(
        new ApiResponse(200, classObj, "Class details fetched successfully")
    );
});

// Get all classes
const getAllClasses = asyncHandler(async (req, res) => {
    const { className, classTeacher, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (className) {
        filter.className = { $regex: className, $options: "i" };
    }

    if (classTeacher) {
        if (!mongoose.Types.ObjectId.isValid(classTeacher)) {
            throw new ApiError(400, "Invalid Class Teacher ID format");
        }
        filter.classTeacher = classTeacher;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const parsedLimit = Number(limit);

    const classes = await Class.find(filter)
        .populate("classTeacher")
        .skip(skip)
        .limit(parsedLimit)
        .sort({ className: 1, section: 1 });

    const totalClasses = await Class.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            classes,
            pagination: {
                totalClasses,
                totalPages: Math.ceil(totalClasses / parsedLimit),
                currentPage: Number(page),
                limit: parsedLimit
            }
        }, "All classes fetched successfully")
    );
});

// Update Class
const updateClass = asyncHandler(async (req, res) => {
    if (req.user.role === "teacher") {
        const teacher = await Teacher.findOne({ user: req.user._id });
        if (!teacher || teacher.permissions?.manageClasses !== true) {
            throw new ApiError(403, "You do not have permission to manage classes");
        }
    }

    const { id } = req.params;
    const { className, section, classTeacher } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Class ID format");
    }

    const existingClass = await Class.findById(id);
    if (!existingClass) {
        throw new ApiError(404, "Class not found");
    }

    if (className === undefined && section === undefined && classTeacher === undefined) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const newClassName = className !== undefined ? className.trim() : existingClass.className;
    const newSection = section !== undefined ? section.trim() : (existingClass.section || "");

    // Validate duplicate class/section combo
    if (className !== undefined || section !== undefined) {
        if (!newClassName) {
            throw new ApiError(400, "Class name cannot be empty");
        }

        const classConflict = await Class.findOne({
            className: newClassName,
            section: newSection,
            _id: { $ne: existingClass._id }
        });

        if (classConflict) {
            throw new ApiError(409, `Class combo ${newClassName} ${newSection} already exists`);
        }

        existingClass.className = newClassName;
        existingClass.section = newSection || undefined;
    }

    // Validate class teacher if provided
    if (classTeacher !== undefined) {
        if (classTeacher) {
            if (!mongoose.Types.ObjectId.isValid(classTeacher)) {
                throw new ApiError(400, "Invalid Class Teacher ID format");
            }

            const teacherExists = await Teacher.findById(classTeacher);
            if (!teacherExists) {
                throw new ApiError(404, "Class Teacher not found");
            }
            existingClass.classTeacher = classTeacher;
        } else {
            existingClass.classTeacher = undefined;
        }
    }

    await existingClass.save();
    const updatedClass = await Class.findById(existingClass._id).populate("classTeacher");

    return res.status(200).json(
        new ApiResponse(200, updatedClass, "Class updated successfully")
    );
});

// Delete Class
const deleteClass = asyncHandler(async (req, res) => {
    if (req.user.role === "teacher") {
        const teacher = await Teacher.findOne({ user: req.user._id });
        if (!teacher || teacher.permissions?.manageClasses !== true) {
            throw new ApiError(403, "You do not have permission to manage classes");
        }
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Class ID format");
    }

    const existingClass = await Class.findById(id);
    if (!existingClass) {
        throw new ApiError(404, "Class not found");
    }

    await Class.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Class deleted successfully")
    );
});

export {
    createClass,
    getClassById,
    getAllClasses,
    updateClass,
    deleteClass
};
