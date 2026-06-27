import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { recordMarks, getStudentMarks } from "../controllers/marks.controllers.js";

const router = Router();
router.use(verifyJWT);

router.route("/")
  .post(recordMarks)
  .get(getStudentMarks);

export default router;
