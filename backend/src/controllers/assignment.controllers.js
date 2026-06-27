import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Assignment } from "../models/assignment.models.js";

const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, classId, dueDate, fileUrl } = req.body || {};

  if (!title?.trim() || !classId || !dueDate) {
    throw new ApiError(400, "Title, class ID, and due date are required");
  }

  const assignment = await Assignment.create({
    title: title.trim(),
    description: description?.trim() || "",
    classId,
    dueDate: new Date(dueDate),
    fileUrl: fileUrl?.trim() || "",
  });

  return res.status(201).json(new ApiResponse(201, assignment, "Assignment created successfully"));
});

const getAssignments = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const filter = {};
  if (classId) {
    filter.classId = classId;
  }

  const assignments = await Assignment.find(filter).sort({ dueDate: 1 });
  return res.status(200).json(new ApiResponse(200, assignments, "Assignments retrieved successfully"));
});

export { createAssignment, getAssignments };
