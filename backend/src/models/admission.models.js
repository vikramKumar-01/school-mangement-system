import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
  {
    // Student Details
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    studentPhoto: {
      type: String, // Cloudinary URL
    },
    studentPhotoPublicId: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required"],
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      required: [true, "Nationality is required"],
      default: "Indian",
      trim: true,
    },
    religion: {
      type: String,
      required: [true, "Religion is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["General", "OBC", "SC", "ST", "EWS"],
      required: [true, "Category is required"],
    },
    aadhaarNumber: {
      type: String,
      trim: true,
    },

    // Parent Details
    fatherFullName: {
      type: String,
      required: [true, "Father's full name is required"],
      trim: true,
    },
    fatherPhone: {
      type: String,
      required: [true, "Father's mobile number is required"],
      trim: true,
    },
    fatherEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    fatherOccupation: {
      type: String,
      required: [true, "Father's occupation is required"],
      trim: true,
    },
    fatherQualification: {
      type: String,
      required: [true, "Father's qualification is required"],
      trim: true,
    },

    motherFullName: {
      type: String,
      required: [true, "Mother's full name is required"],
      trim: true,
    },
    motherPhone: {
      type: String,
      required: [true, "Mother's mobile number is required"],
      trim: true,
    },
    motherEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    motherOccupation: {
      type: String,
      required: [true, "Mother's occupation is required"],
      trim: true,
    },
    motherQualification: {
      type: String,
      required: [true, "Mother's qualification is required"],
      trim: true,
    },

    // Address
    currentAddress: {
      type: String,
      required: [true, "Current address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    pinCode: {
      type: String,
      required: [true, "PIN Code is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      default: "India",
      trim: true,
    },

    // Emergency Contact
    emergencyName: {
      type: String,
      required: [true, "Emergency contact name is required"],
      trim: true,
    },
    emergencyRelationship: {
      type: String,
      required: [true, "Relationship is required"],
      trim: true,
    },
    emergencyPhone: {
      type: String,
      required: [true, "Emergency mobile number is required"],
      trim: true,
    },

    // Admission Details
    academicSession: {
      type: String,
      required: [true, "Academic session is required"],
      trim: true,
    },
    classApplied: {
      type: String,
      required: [true, "Class applying for is required"],
      trim: true,
    },
    admissionType: {
      type: String,
      default: "New Admission",
      required: true,
    },

    // Application Status
    status: {
      type: String,
      enum: ["pending", "reviewed", "contacted", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Admission = mongoose.model("Admission", admissionSchema);
