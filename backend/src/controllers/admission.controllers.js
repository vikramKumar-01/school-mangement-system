import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Admission } from "../models/admission.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

// Submit an admission application (Public)
const submitApplication = asyncHandler(async (req, res) => {
  const fields = req.body || {};

  // Check required basic fields
  const requiredFields = [
    "firstName", "lastName", "dateOfBirth", "gender", "nationality", "religion",
    "category", "fatherFullName", "fatherPhone", "fatherOccupation",
    "fatherQualification", "motherFullName", "motherPhone", "motherOccupation",
    "motherQualification", "currentAddress", "city", "state", "pinCode",
    "country", "emergencyName", "emergencyRelationship", "emergencyPhone",
    "academicSession", "classApplied"
  ];

  for (const field of requiredFields) {
    if (!fields[field] || String(fields[field]).trim() === "") {
      // Remove uploaded file if validation fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw new ApiError(400, `Field '${field}' is required`);
    }
  }

  // Handle student photo upload
  let studentPhotoUrl = "";
  let studentPhotoPublicId = "";

  if (req.file) {
    const uploaded = await uploadOnCloudinary(req.file.path);
    if (uploaded) {
      studentPhotoUrl = uploaded.secure_url;
      studentPhotoPublicId = uploaded.public_id;
    } else {
      // If cloudinary upload fails, write to temp folder url fallback
      studentPhotoUrl = `/temp/${req.file.filename}`;
    }
  }

  const newAdmission = await Admission.create({
    firstName: fields.firstName.trim(),
    middleName: fields.middleName?.trim() || "",
    lastName: fields.lastName.trim(),
    studentPhoto: studentPhotoUrl,
    studentPhotoPublicId: studentPhotoPublicId,
    dateOfBirth: new Date(fields.dateOfBirth),
    gender: fields.gender,
    bloodGroup: fields.bloodGroup?.trim() || "",
    nationality: fields.nationality.trim(),
    religion: fields.religion.trim(),
    category: fields.category,
    aadhaarNumber: fields.aadhaarNumber?.trim() || "",

    fatherFullName: fields.fatherFullName.trim(),
    fatherPhone: fields.fatherPhone.trim(),
    fatherEmail: fields.fatherEmail?.trim() || "",
    fatherOccupation: fields.fatherOccupation.trim(),
    fatherQualification: fields.fatherQualification.trim(),

    motherFullName: fields.motherFullName.trim(),
    motherPhone: fields.motherPhone.trim(),
    motherEmail: fields.motherEmail?.trim() || "",
    motherOccupation: fields.motherOccupation.trim(),
    motherQualification: fields.motherQualification.trim(),

    currentAddress: fields.currentAddress.trim(),
    city: fields.city.trim(),
    state: fields.state.trim(),
    pinCode: fields.pinCode.trim(),
    country: fields.country.trim(),

    emergencyName: fields.emergencyName.trim(),
    emergencyRelationship: fields.emergencyRelationship.trim(),
    emergencyPhone: fields.emergencyPhone.trim(),

    academicSession: fields.academicSession.trim(),
    classApplied: fields.classApplied.trim(),
    admissionType: fields.admissionType || "New Admission"
  });

  return res.status(201).json(
    new ApiResponse(201, newAdmission, "Admission application submitted successfully")
  );
});

// Get all applications (Admin only)
const getAllApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;

  const filter = {};
  if (status && ["pending", "reviewed", "contacted", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { fatherFullName: { $regex: search, $options: "i" } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [applications, totalApplications] = await Promise.all([
    Admission.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Admission.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      applications,
      pagination: {
        totalApplications,
        totalPages: Math.ceil(totalApplications / Number(limit)),
        currentPage: Number(page),
      },
    }, "Applications retrieved successfully")
  );
});

// Update application status (Admin only)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["pending", "reviewed", "contacted", "approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Valid status is required");
  }

  const application = await Admission.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!application) {
    throw new ApiError(404, "Admission application not found");
  }

  return res.status(200).json(
    new ApiResponse(200, application, "Application status updated successfully")
  );
});

export { submitApplication, getAllApplications, updateApplicationStatus };
