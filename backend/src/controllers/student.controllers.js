import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Student } from "../models/student.models.js";


const registerStudent = asyncHandler(async (req, res) => {
    const { name, class: className, rollNumber, fatherName, phone, address, admissionDate } = req.body || {};

    // check required fields
    if (!name?.trim() || !className?.trim() || !rollNumber) {
        throw new ApiError(400, "Name, class, and roll number are required");
    }

    const rollNum = Number(rollNumber);
    if (isNaN(rollNum) || !Number.isInteger(rollNum) || rollNum <= 0) {
        throw new ApiError(400, "Roll number must be a positive integer");
    }

    const existedStudent = await Student.findOne({ rollNumber: rollNum });
    if (existedStudent) {
        throw new ApiError(409, "Student with this roll number already exists");
    }

    const student = await Student.create({
        name: name.trim(),
        class: className.trim(),
        rollNumber: rollNum,
        fatherName: fatherName?.trim() || undefined,
        phone: phone?.trim() || undefined,
        address: address?.trim() || undefined,
        admissionDate: admissionDate ? new Date(admissionDate) : undefined
    });

    const createdStudent = await Student.findById(student._id);
    if (!createdStudent) {
        throw new ApiError(500, "Something went wrong while registering student");
    }

    return res.status(201).json(
        new ApiResponse(200, createdStudent, "Student Registered Successfully")
    );
});

// Get Student by ID
const getStudentById = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    return res.status(200).json(
        new ApiResponse(200, student, "Student details fetched successfully")
    );
});

// Get all students
const getAllStudents = asyncHandler(async (req, res) => {
    const { search, class: className, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (className) {
        filter.class = className;
    }

    if (search) {
        const searchConditions = [
            { name: { $regex: search, $options: "i" } }
        ];

        if (!isNaN(search)) {
            searchConditions.push({ rollNumber: Number(search) });
        }

        filter.$or = searchConditions;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const parsedLimit = Number(limit);

    const students = await Student.find(filter)
        .skip(skip)
        .limit(parsedLimit)
        .sort({ createdAt: -1 });

    const totalStudents = await Student.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            students,
            pagination: {
                totalStudents,
                totalPages: Math.ceil(totalStudents / parsedLimit),
                currentPage: Number(page),
                limit: parsedLimit
            }
        }, "All students fetched successfully")
    );
});

// Update Student
const updateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, class: className, rollNumber, fatherName, phone, address, admissionDate } = req.body || {};

    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
        throw new ApiError(404, "Student not found");
    }

    if (
        name === undefined &&
        className === undefined &&
        rollNumber === undefined &&
        fatherName === undefined &&
        phone === undefined &&
        address === undefined &&
        admissionDate === undefined
    ) {
        throw new ApiError(400, "At least one field is required to update");
    }

    if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
            throw new ApiError(400, "Name cannot be empty");
        }
        existingStudent.name = name.trim();
    }

    if (className !== undefined) {
        if (typeof className !== "string" || !className.trim()) {
            throw new ApiError(400, "Class cannot be empty");
        }
        existingStudent.class = className.trim();
    }

    if (rollNumber !== undefined) {
        const rollNum = Number(rollNumber);
        if (isNaN(rollNum) || !Number.isInteger(rollNum) || rollNum <= 0) {
            throw new ApiError(400, "Roll number must be a positive integer");
        }

        const rollOwner = await Student.findOne({
            rollNumber: rollNum,
            _id: { $ne: existingStudent._id }
        });

        if (rollOwner) {
            throw new ApiError(409, "Roll number is already in use by another student");
        }

        existingStudent.rollNumber = rollNum;
    }

    if (fatherName !== undefined) {
        existingStudent.fatherName = fatherName?.trim() || undefined;
    }

    if (phone !== undefined) {
        existingStudent.phone = phone?.trim() || undefined;
    }

    if (address !== undefined) {
        existingStudent.address = address?.trim() || undefined;
    }

    if (admissionDate !== undefined) {
        const date = new Date(admissionDate);
        if (isNaN(date.getTime())) {
            throw new ApiError(400, "Invalid admission date format");
        }
        existingStudent.admissionDate = date;
    }

    await existingStudent.save();

    return res.status(200).json(
        new ApiResponse(200, existingStudent, "Student updated successfully")
    );
});

// Delete Student
const deleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existingStudent = await Student.findById(id);

    if (!existingStudent) {
        throw new ApiError(404, "Student not found");
    }

    await Student.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Student deleted successfully")
    );
});

export {
    registerStudent,
    getStudentById,
    getAllStudents,
    updateStudent,
    deleteStudent
};
