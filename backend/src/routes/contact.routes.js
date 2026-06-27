import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { AuthorizeRole } from "../middlewares/role.middleware.js";
import {
  submitContact,
  getAllContacts,
  updateContactStatus,
} from "../controllers/contact.controllers.js";

const router = Router();

// POST — Public (no auth): submit a contact form
// GET  — Protected (admin only): get all contact inquiries
router
  .route("/")
  .post(submitContact)
  .get(verifyJWT, AuthorizeRole("admin"), getAllContacts);

// PATCH — Protected (admin only): update inquiry status
router
  .route("/:id/status")
  .patch(verifyJWT, AuthorizeRole("admin"), updateContactStatus);

export default router;

