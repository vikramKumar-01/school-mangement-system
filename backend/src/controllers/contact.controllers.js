import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Contact } from "../models/contact.models.js";

// POST /api/v1/contact  — Public: Submit a contact inquiry
const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  // Validate required fields
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    throw new ApiError(400, "All fields (name, email, subject, message) are required");
  }

  if (message.trim().length < 10) {
    throw new ApiError(400, "Message must be at least 10 characters");
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  const inquiry = await Contact.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
  });

  if (!inquiry) {
    throw new ApiError(500, "Failed to save contact inquiry");
  }

  return res.status(201).json(
    new ApiResponse(201, inquiry, "Thank you! Your message has been received. We will get back to you soon.")
  );
});

// GET /api/v1/contact  — Protected (admin only): Get all inquiries
const getAllContacts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const filter = {};
  if (status && ["new", "read", "replied"].includes(status)) {
    filter.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [contacts, totalContacts] = await Promise.all([
    Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Contact.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      contacts,
      pagination: {
        totalContacts,
        totalPages: Math.ceil(totalContacts / Number(limit)),
        currentPage: Number(page),
      },
    }, "Contact inquiries retrieved successfully")
  );
});

// PATCH /api/v1/contact/:id/status  — Protected (admin only): Update inquiry status
const updateContactStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["new", "read", "replied"].includes(status)) {
    throw new ApiError(400, "Valid status (new, read, replied) is required");
  }

  const contact = await Contact.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!contact) {
    throw new ApiError(404, "Contact inquiry not found");
  }

  return res.status(200).json(
    new ApiResponse(200, contact, "Contact status updated successfully")
  );
});

export { submitContact, getAllContacts, updateContactStatus };
