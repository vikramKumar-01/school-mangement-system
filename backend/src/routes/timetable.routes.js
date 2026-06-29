import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTimetableEntry, getTimetable, updateTimetableEntry, deleteTimetableEntry } from "../controllers/timetable.controllers.js";

const router = Router();
router.use(verifyJWT);

router.route("/")
  .post(createTimetableEntry)
  .get(getTimetable);

router.route("/:id")
  .put(updateTimetableEntry)
  .delete(deleteTimetableEntry);

export default router;
