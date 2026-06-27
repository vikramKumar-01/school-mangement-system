import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTimetableEntry, getTimetable } from "../controllers/timetable.controllers.js";

const router = Router();
router.use(verifyJWT);

router.route("/")
  .post(createTimetableEntry)
  .get(getTimetable);

export default router;
