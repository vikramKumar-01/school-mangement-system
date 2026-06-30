import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Teacher } from "../models/teacher.models.js";
import { User } from "../models/user.models.js";


const registerTeacher = asyncHandler(async (req, res) => {
    const { name, subject, phone, email, salary, gender } = req.body || {};

    
    if (!name?.trim()) {
        throw new ApiError(400, "Name is required");
    }

    if (!gender || !['Male', 'Female'].includes(gender)) {
        throw new ApiError(400, "Gender must be Male or Female");
    }

    if (!email?.trim()) {
        throw new ApiError(400, "Email is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        throw new ApiError(400, "Invalid email format");
    }

    // Check if email already in use
    const existingEmail = await Teacher.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
        throw new ApiError(409, "Teacher with this email already exists");
    }

    // Check if phone already in use (if provided)
    if (phone?.trim()) {
        const existingPhone = await Teacher.findOne({ phone: phone.trim() });
        if (existingPhone) {
            throw new ApiError(409, "Teacher with this phone number already exists");
        }
    }

    const parsedSalary = salary ? Number(salary) : undefined;
    if (salary !== undefined && (isNaN(parsedSalary) || parsedSalary < 0)) {
        throw new ApiError(400, "Salary must be a positive number");
    }

    // Generate User ID and Password
    const year = new Date().getFullYear();
    const genderCode = gender === 'Male' ? 101 : 102;
    // For unique number, use total teachers + 1
    const count = await Teacher.countDocuments();
    const uniqueNum = (count + 1).toString().padStart(3, '0');
    const generatedUserId = `${year}${genderCode}${uniqueNum}`;

    const firstName = name.trim().split(' ')[0];
    const first4 = firstName.substring(0, 4);
    const capitalizedFirst4 = first4.charAt(0).toUpperCase() + first4.slice(1).toLowerCase();
    const last4 = generatedUserId.slice(-4);
    const generatedPassword = `${capitalizedFirst4}@${last4}`;

    // Create the User first
    const newUser = await User.create({
        fullName: name.trim(),
        userId: generatedUserId,
        email: email.trim().toLowerCase(),
        password: generatedPassword,
        role: "teacher",
        mustChangePassword: true
    });

    const teacher = await Teacher.create({
        name: name.trim(),
        subject: subject?.trim() || undefined,
        gender: gender,
        phone: phone?.trim() || undefined,
        email: email.trim().toLowerCase(),
        salary: parsedSalary,
        user: newUser._id
    });

    const createdTeacher = await Teacher.findById(teacher._id);
    if (!createdTeacher) {
        throw new ApiError(500, "Something went wrong while registering teacher");
    }

    return res.status(201).json(
        new ApiResponse(201, {
            teacher: createdTeacher,
            credentials: {
                userId: generatedUserId,
                password: generatedPassword
            }
        }, "Teacher Registered Successfully")
    );
});

// Get Teacher by ID
const getTeacherById = asyncHandler(async (req, res) => {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
        throw new ApiError(404, "Teacher not found");
    }

    return res.status(200).json(
        new ApiResponse(200, teacher, "Teacher details fetched successfully")
    );
});

// Get all teachers
const getAllTeachers = asyncHandler(async (req, res) => {
    const { search, subject, userId, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (userId) {
        filter.user = userId;
    }

    if (subject) {
        filter.subject = { $regex: subject, $options: "i" };
    }

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const parsedLimit = Number(limit);

    const teachers = await Teacher.find(filter)
        .populate('user', 'userId')
        .skip(skip)
        .limit(parsedLimit)
        .sort({ createdAt: -1 });

    const totalTeachers = await Teacher.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            teachers,
            pagination: {
                totalTeachers,
                totalPages: Math.ceil(totalTeachers / parsedLimit),
                currentPage: Number(page),
                limit: parsedLimit
            }
        }, "All teachers fetched successfully")
    );
});

// Update Teacher
const updateTeacher = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, subject, phone, email, salary, permissions } = req.body || {};

    const existingTeacher = await Teacher.findById(id);
    if (!existingTeacher) {
        throw new ApiError(404, "Teacher not found");
    }

    if (
        name === undefined &&
        subject === undefined &&
        phone === undefined &&
        email === undefined &&
        salary === undefined &&
        permissions === undefined
    ) {
        throw new ApiError(400, "At least one field is required to update");
    }

    if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
            throw new ApiError(400, "Name cannot be empty");
        }
        existingTeacher.name = name.trim();
    }

    if (subject !== undefined) {
        existingTeacher.subject = subject?.trim() || undefined;
    }

    if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== "string" || !emailRegex.test(email.trim())) {
            throw new ApiError(400, "Invalid email format");
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailOwner = await Teacher.findOne({
            email: normalizedEmail,
            _id: { $ne: existingTeacher._id }
        });

        if (emailOwner) {
            throw new ApiError(409, "Email is already in use by another teacher");
        }

        existingTeacher.email = normalizedEmail;
    }

    if (phone !== undefined) {
        if (phone?.trim()) {
            const phoneOwner = await Teacher.findOne({
                phone: phone.trim(),
                _id: { $ne: existingTeacher._id }
            });

            if (phoneOwner) {
                throw new ApiError(409, "Phone number is already in use by another teacher");
            }
            existingTeacher.phone = phone.trim();
        } else {
            existingTeacher.phone = undefined;
        }
    }

    if (salary !== undefined) {
        const parsedSalary = Number(salary);
        if (isNaN(parsedSalary) || parsedSalary < 0) {
            throw new ApiError(400, "Salary must be a positive number");
        }
        existingTeacher.salary = parsedSalary;
    }

    if (permissions !== undefined) {
        existingTeacher.permissions = permissions;
        existingTeacher.markModified('permissions');
    }

    await existingTeacher.save();

    return res.status(200).json(
        new ApiResponse(200, existingTeacher, "Teacher updated successfully")
    );
});

// Delete Teacher
const deleteTeacher = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existingTeacher = await Teacher.findById(id);

    if (!existingTeacher) {
        throw new ApiError(404, "Teacher not found");
    }

    await Teacher.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Teacher deleted successfully")
    );
});

export {
    registerTeacher,
    getTeacherById,
    getAllTeachers,
    updateTeacher,
    deleteTeacher
};
