import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { StudyMaterial } from "../models/studymaterial.models.js";

const uploadStudyMaterial = asyncHandler(async (req, res) => {
  const { title, subject, classId, fileUrl } = req.body || {};

  if (!title?.trim() || !subject?.trim() || !classId) {
    throw new ApiError(400, "Title, subject, and class ID are required");
  }

  const material = await StudyMaterial.create({
    title: title.trim(),
    subject: subject.trim(),
    classId,
    fileUrl: fileUrl?.trim() || "",
  });

  return res.status(201).json(new ApiResponse(201, material, "Study material uploaded successfully"));
});

const getStudyMaterials = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const filter = {};
  if (classId) {
    filter.classId = classId;
  }

  const materials = await StudyMaterial.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, materials, "Study materials retrieved successfully"));
});

export { uploadStudyMaterial, getStudyMaterials };
