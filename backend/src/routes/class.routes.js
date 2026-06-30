import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { AuthorizeRole } from "../middlewares/role.middleware.js";
import {
    createClass,
    getClassById,
    getAllClasses,
    updateClass,
    deleteClass
} from "../controllers/class.controllers.js";

const router = Router();

// All class routes require authentication
router.use(verifyJWT);

router.route("/")
    .post(AuthorizeRole("admin", "teacher"), createClass)
    .get(getAllClasses);

router.route("/:id")
    .get(getClassById)
    .put(AuthorizeRole("admin", "teacher"), updateClass)
    .delete(AuthorizeRole("admin", "teacher"), deleteClass);

export default router;
