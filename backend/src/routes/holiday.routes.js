import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { AuthorizeRole } from "../middlewares/role.middleware.js";
import { createHoliday, getAllHolidays, updateHoliday, deleteHoliday } from "../controllers/holiday.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(AuthorizeRole("admin"), createHoliday)
    .get(getAllHolidays); // Open to all authenticated users

router.route("/:id")
    .put(AuthorizeRole("admin"), updateHoliday)
    .delete(AuthorizeRole("admin"), deleteHoliday);

export default router;
