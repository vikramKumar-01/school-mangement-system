import { Router } from "express";
import { loginUser, registerUser,logoutUser,refereshAccessToken, getAllUsers } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { AuthorizeRole } from "../middlewares/role.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "profileImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT ,logoutUser);
router.route("/refresh-token").post(refereshAccessToken)
router.route("/all-users").get(verifyJWT, AuthorizeRole("admin"), getAllUsers)

export default router;