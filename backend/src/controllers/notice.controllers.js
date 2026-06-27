import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notice } from "../models/notice.models.js";

const createNotice = asyncHandler(async (req, res) => {
  const { title, content, category, author } = req.body || {};

  if (!title?.trim() || !content?.trim()) {
    throw new ApiError(400, "Title and content are required");
  }

  const notice = await Notice.create({
    title: title.trim(),
    content: content.trim(),
    category: category || "general",
    author: author?.trim() || "Principal Office",
  });

  return res.status(201).json(new ApiResponse(201, notice, "Notice posted successfully"));
});

const getNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, notices, "Notices retrieved successfully"));
});

export { createNotice, getNotices };
