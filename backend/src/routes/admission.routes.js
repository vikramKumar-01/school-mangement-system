import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { AuthorizeRole } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  submitApplication,
  getAllApplications,
  updateApplicationStatus,
} from "../controllers/admission.controllers.js";

const router = Router();

// POST — Public submission of admission applications (multipart/form-data for photo file)
router.route("/").post(upload.single("studentPhoto"), submitApplication);

// GET — Protected admin endpoint to fetch applications list
router.route("/").get(verifyJWT, AuthorizeRole("admin"), getAllApplications);

// PATCH — Protected admin endpoint to update status
router.route("/:id/status").patch(verifyJWT, AuthorizeRole("admin"), updateApplicationStatus);

export default router;
