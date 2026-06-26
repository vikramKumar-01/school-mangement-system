import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { AuthorizeRole } from "../middlewares/role.middleware.js";
import {
    createAttendance,
    getAttendanceById,
    getAllAttendance,
    updateAttendance,
    deleteAttendance
} from "../controllers/attendance.controllers.js";

const router = Router();

// All attendance routes require authentication
router.use(verifyJWT);

router.route("/")
    .post(AuthorizeRole("admin", "teacher"), createAttendance)
    .get(AuthorizeRole("admin", "teacher", "student", "parent"), getAllAttendance);

router.route("/:id")
    .get(AuthorizeRole("admin", "teacher", "student", "parent"), getAttendanceById)
    .put(AuthorizeRole("admin", "teacher"), updateAttendance)
    .delete(AuthorizeRole("admin", "teacher"), deleteAttendance);

export default router;
