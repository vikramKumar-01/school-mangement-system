import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { AuthorizeRole } from "../middlewares/role.middleware.js";
import {
    createFee,
    getFeeById,
    getAllFees,
    updateFee,
    deleteFee
} from "../controllers/fee.controllers.js";

const router = Router();

// All fee routes require authentication
router.use(verifyJWT);

router.route("/")
    .post(AuthorizeRole("admin"), createFee)
    .get(AuthorizeRole("admin", "student"), getAllFees);

router.route("/:id")
    .get(AuthorizeRole("admin", "student"), getFeeById)
    .put(AuthorizeRole("admin"), updateFee)
    .delete(AuthorizeRole("admin"), deleteFee);

export default router;
