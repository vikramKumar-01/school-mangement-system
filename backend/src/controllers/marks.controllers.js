import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Marks } from "../models/marks.models.js";

const recordMarks = asyncHandler(async (req, res) => {
  const { student, subject, marksObtained, maxMarks, examType } = req.body || {};

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
  if (studentId) {
    filter.student = studentId;
  }

  const marks = await Marks.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, marks, "Marks retrieved successfully"));
});

export { recordMarks, getStudentMarks };
