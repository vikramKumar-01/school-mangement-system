import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { AuthorizeRole } from "../middlewares/role.middleware.js";
import {
    checkIn,
    checkOut,
    getTodayAttendance,
    getHistory,
    getAllAdminAttendance,
    updateAdminAttendance,
    deleteAdminAttendance,
    createAdminAttendance
} from "../controllers/teacherAttendance.controllers.js";

const router = Router();

router.use(verifyJWT);

// Teacher Routes
router.post("/check-in", AuthorizeRole("teacher"), checkIn);
router.post("/check-out", AuthorizeRole("teacher"), checkOut);
router.get("/today", AuthorizeRole("teacher"), getTodayAttendance);
router.get("/history", AuthorizeRole("teacher"), getHistory);

// Admin Routes
router.route("/admin")
    .get(AuthorizeRole("admin"), getAllAdminAttendance)
    .post(AuthorizeRole("admin"), createAdminAttendance);

router.route("/admin/:id")
    .put(AuthorizeRole("admin"), updateAdminAttendance)
    .delete(AuthorizeRole("admin"), deleteAdminAttendance);

export default router;
