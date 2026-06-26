import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { AuthorizeRole } from "../middlewares/role.middleware.js";
import {
    registerStudent,
    getStudentById,
    getAllStudents,
    updateStudent,
    deleteStudent
} from "../controllers/student.controllers.js";

const router = Router();

// All student routes require authentication
router.use(verifyJWT);

router.route("/")
    .post(AuthorizeRole("admin", "teacher"), registerStudent)
    .get(getAllStudents);

router.route("/:id")
    .get(getStudentById)
    .put(AuthorizeRole("admin", "teacher"), updateStudent)
    .delete(AuthorizeRole("admin"), deleteStudent);

export default router;
