import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { AuthorizeRole } from "../middlewares/role.middleware.js";
import {
    registerTeacher,
    getTeacherById,
    getAllTeachers,
    updateTeacher,
    deleteTeacher
} from "../controllers/teacher.controllers.js";

const router = Router();

// All teacher routes require authentication
router.use(verifyJWT);

router.route("/")
    .post(AuthorizeRole("admin"), registerTeacher)
    .get(getAllTeachers);

router.route("/:id")
    .get(getTeacherById)
    .put(AuthorizeRole("admin"), updateTeacher)
    .delete(AuthorizeRole("admin"), deleteTeacher);

export default router;
