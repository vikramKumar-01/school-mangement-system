import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Marks } from "../models/marks.models.js";
import { Teacher } from "../models/teacher.models.js";
import { Student } from "../models/student.models.js";

const recordMarks = asyncHandler(async (req, res) => {
  const { student, subject, marksObtained, maxMarks, examType } = req.body || {};

  // If role is teacher, check if they have permission to log exam marks
  if (req.user.role === "teacher") {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher || teacher.permissions?.logMarks !== true) {
      throw new ApiError(403, "You do not have permission to record assessment scores");
    }
  }

  if (!student || !subject?.trim() || marksObtained === undefined || !maxMarks) {
    throw new ApiError(400, "Student ID, subject, marks, and max marks are required");
  }

  const marksRecord = await Marks.create({
    student,
    subject: subject.trim(),
    marksObtained: Number(marksObtained),
    maxMarks: Number(maxMarks),
    examType: examType || "Mid-Term",
  });

  return res.status(201).json(new ApiResponse(201, marksRecord, "Marks recorded successfully"));
});

const getStudentMarks = asyncHandler(async (req, res) => {
  const { studentId } = req.query;
  const filter = {};

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
      return res.status(200).json(
        new ApiResponse(200, [], "No marks records found")
      );
    }
    filter.student = student._id;
  } else if (studentId) {
    filter.student = studentId;
  }

  const marks = await Marks.find(filter)
    .populate("student", "name rollNumber class")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, marks, "Marks retrieved successfully"));
});

export { recordMarks, getStudentMarks };
