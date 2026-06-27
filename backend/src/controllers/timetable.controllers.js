import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Timetable } from "../models/timetable.models.js";

const createTimetableEntry = asyncHandler(async (req, res) => {
  const { classId, subject, day, timeStart, timeEnd, room } = req.body || {};

  if (!classId || !subject?.trim() || !day || !timeStart || !timeEnd || !room?.trim()) {
    throw new ApiError(400, "All timetable fields are required");
  }

  const entry = await Timetable.create({
    classId,
    subject: subject.trim(),
    day,
    timeStart,
    timeEnd,
    room: room.trim(),
  });

  return res.status(201).json(new ApiResponse(201, entry, "Timetable entry created successfully"));
});

const getTimetable = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const filter = {};
  if (classId) {
    filter.classId = classId;
  }

  const entries = await Timetable.find(filter).sort({ day: 1, timeStart: 1 });
  return res.status(200).json(new ApiResponse(200, entries, "Timetable retrieved successfully"));
});

export { createTimetableEntry, getTimetable };
