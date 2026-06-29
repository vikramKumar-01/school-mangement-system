import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { TeacherAttendance } from "../models/teacherAttendance.models.js";
import { Teacher } from "../models/teacher.models.js";
import { SchoolSettings } from "../models/schoolSettings.models.js";
import { Holiday } from "../models/holiday.models.js";
import { calculateDistance } from "../utils/haversine.js";
import moment from "moment";

// Helper to get Teacher by User
const getTeacherByUser = async (user) => {
    // Attempt to match teacher by email
    let teacher = await Teacher.findOne({ email: user.email });
    
    // Fallback: Attempt to match by name if email doesn't match
    if (!teacher) {
        teacher = await Teacher.findOne({ 
            name: { $regex: new RegExp(`^${user.fullName}$`, "i") } 
        });
    }

    if (!teacher) {
        throw new ApiError(404, "Teacher profile not found for this user. Ensure your email or name matches exactly.");
    }
    return teacher;
};

// Check-In
export const checkIn = asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        throw new ApiError(400, "Latitude and Longitude are required for attendance");
    }

    const teacher = await getTeacherByUser(req.user);

    // 1. Check if today is a Holiday or Weekend
    const today = moment().startOf('day');
    const dayOfWeek = today.day();
    
    if (dayOfWeek === 0) {
        throw new ApiError(403, "Attendance cannot be marked on weekends (Sunday)");
    }

    const holiday = await Holiday.findOne({
        date: {
            $gte: today.toDate(),
            $lte: moment(today).endOf('day').toDate()
        }
    });

    if (holiday) {
        throw new ApiError(403, `Today is a holiday: ${holiday.name}. Attendance is disabled.`);
    }

    // 2. Check Geolocation
    let settings = await SchoolSettings.findOne();
    if (!settings) {
        throw new ApiError(500, "School settings not configured");
    }

    const distance = calculateDistance(latitude, longitude, settings.latitude, settings.longitude);
    
    if (distance > settings.allowedRadius) {
        throw new ApiError(403, `You are ${Math.round(distance)}m away from the school. You must be inside the ${settings.allowedRadius}m premises.`);
    }

    // 3. Check if already checked in today
    const existingAttendance = await TeacherAttendance.findOne({
        teacher: teacher._id,
        date: {
            $gte: today.toDate(),
            $lte: moment(today).endOf('day').toDate()
        }
    });

    if (existingAttendance) {
        throw new ApiError(400, "You have already checked in today");
    }

    // 4. Calculate Status (Present or Late)
    const checkInMoment = moment();
    const lateTimeMoment = moment(settings.lateTime, "hh:mm A");
    // Ensure lateTimeMoment is today
    lateTimeMoment.year(checkInMoment.year()).month(checkInMoment.month()).date(checkInMoment.date());

    const status = checkInMoment.isAfter(lateTimeMoment) ? "Late" : "Present";

    const attendance = await TeacherAttendance.create({
        teacher: teacher._id,
        date: today.toDate(),
        checkInTime: checkInMoment.toDate(),
        latitude,
        longitude,
        distance,
        status
    });

    return res.status(201).json(
        new ApiResponse(201, attendance, "Checked In Successfully")
    );
});

// Check-Out
export const checkOut = asyncHandler(async (req, res) => {
    const teacher = await getTeacherByUser(req.user);
    const today = moment().startOf('day');

    const attendance = await TeacherAttendance.findOne({
        teacher: teacher._id,
        date: {
            $gte: today.toDate(),
            $lte: moment(today).endOf('day').toDate()
        }
    });

    if (!attendance) {
        throw new ApiError(400, "You have not checked in today");
    }

    if (attendance.checkOutTime) {
        throw new ApiError(400, "You have already checked out today");
    }

    const checkOutMoment = moment();
    attendance.checkOutTime = checkOutMoment.toDate();

    // Calculate working hours
    const checkInMoment = moment(attendance.checkInTime);
    const duration = moment.duration(checkOutMoment.diff(checkInMoment));
    attendance.workingHours = Number(duration.asHours().toFixed(2));

    await attendance.save();

    return res.status(200).json(
        new ApiResponse(200, attendance, "Checked Out Successfully")
    );
});

// Get Today's Attendance
export const getTodayAttendance = asyncHandler(async (req, res) => {
    const teacher = await getTeacherByUser(req.user);
    const today = moment().startOf('day');

    const attendance = await TeacherAttendance.findOne({
        teacher: teacher._id,
        date: {
            $gte: today.toDate(),
            $lte: moment(today).endOf('day').toDate()
        }
    });

    return res.status(200).json(
        new ApiResponse(200, attendance || null, "Today's attendance fetched")
    );
});

// Get History (For Teacher)
export const getHistory = asyncHandler(async (req, res) => {
    const teacher = await getTeacherByUser(req.user);
    const { page = 1, limit = 10, month } = req.query;

    const filter = { teacher: teacher._id };

    if (month) {
        const startOfMonth = moment(month, "YYYY-MM").startOf('month');
        const endOfMonth = moment(month, "YYYY-MM").endOf('month');
        filter.date = {
            $gte: startOfMonth.toDate(),
            $lte: endOfMonth.toDate()
        };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const parsedLimit = Number(limit);

    const history = await TeacherAttendance.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parsedLimit);

    const totalRecords = await TeacherAttendance.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            history,
            pagination: {
                totalRecords,
                totalPages: Math.ceil(totalRecords / parsedLimit),
                currentPage: Number(page),
                limit: parsedLimit
            }
        }, "Attendance history fetched")
    );
});

// Admin: Get All Teacher Attendance
export const getAllAdminAttendance = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, date, teacherId } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (teacherId) filter.teacher = teacherId;
    if (date) {
        const queryDate = moment(date).startOf('day');
        filter.date = {
            $gte: queryDate.toDate(),
            $lte: moment(queryDate).endOf('day').toDate()
        };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const parsedLimit = Number(limit);

    const records = await TeacherAttendance.find(filter)
        .populate("teacher", "name email subject")
        .sort({ date: -1 })
        .skip(skip)
        .limit(parsedLimit);

    const totalRecords = await TeacherAttendance.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            records,
            pagination: {
                totalRecords,
                totalPages: Math.ceil(totalRecords / parsedLimit),
                currentPage: Number(page),
                limit: parsedLimit
            }
        }, "Admin attendance records fetched")
    );
});

// Admin: Update Attendance
export const updateAdminAttendance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, checkInTime, checkOutTime } = req.body;

    const attendance = await TeacherAttendance.findById(id);
    if (!attendance) {
        throw new ApiError(404, "Attendance record not found");
    }

    if (status) attendance.status = status;
    
    if (checkInTime) {
        attendance.checkInTime = new Date(checkInTime);
    }
    
    if (checkOutTime) {
        attendance.checkOutTime = new Date(checkOutTime);
    }

    if (attendance.checkInTime && attendance.checkOutTime) {
        const mStart = moment(attendance.checkInTime);
        const mEnd = moment(attendance.checkOutTime);
        const duration = moment.duration(mEnd.diff(mStart));
        attendance.workingHours = Number(duration.asHours().toFixed(2));
    }

    await attendance.save();

    return res.status(200).json(
        new ApiResponse(200, attendance, "Attendance updated successfully")
    );
});

// Admin: Delete Attendance
export const deleteAdminAttendance = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const attendance = await TeacherAttendance.findByIdAndDelete(id);
    if (!attendance) {
        throw new ApiError(404, "Attendance record not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Attendance record deleted successfully")
    );
});

// Admin: Create Attendance
export const createAdminAttendance = asyncHandler(async (req, res) => {
    const { teacher, date, status, checkInTime, checkOutTime, workingHours } = req.body;

    if (!teacher || !date || !status) {
        throw new ApiError(400, "Teacher, date, and status are required");
    }

    const attendanceDate = moment(date).startOf('day').toDate();

    // Check if record already exists for this date
    const existingRecord = await TeacherAttendance.findOne({
        teacher,
        date: {
            $gte: attendanceDate,
            $lte: moment(attendanceDate).endOf('day').toDate()
        }
    });

    if (existingRecord) {
        throw new ApiError(400, "Attendance record already exists for this teacher on this date");
    }

    const newRecord = await TeacherAttendance.create({
        teacher,
        date: attendanceDate,
        status,
        checkInTime: checkInTime || null,
        checkOutTime: checkOutTime || null,
        workingHours: workingHours || null
    });

    return res.status(201).json(
        new ApiResponse(201, newRecord, "Attendance record created successfully")
    );
});
