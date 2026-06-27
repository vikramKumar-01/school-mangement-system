import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createNotice, getNotices } from "../controllers/notice.controllers.js";

const router = Router();
// Read notices is public, create requires JWT
router.route("/").get(getNotices);
router.route("/").post(verifyJWT, createNotice);

export default router;
