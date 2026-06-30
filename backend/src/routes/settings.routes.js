import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { AuthorizeRole } from "../middlewares/role.middleware.js";
import { getSettings, updateSettings } from "../controllers/settings.controllers.js";

const router = Router();

router.route("/")
    .get(getSettings)
    .put(verifyJWT, AuthorizeRole("admin"), updateSettings);

export default router;
