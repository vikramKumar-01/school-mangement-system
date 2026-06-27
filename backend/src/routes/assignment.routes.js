import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAssignment, getAssignments } from "../controllers/assignment.controllers.js";

const router = Router();
router.use(verifyJWT);

router.route("/")
  .post(createAssignment)
  .get(getAssignments);

export default router;
