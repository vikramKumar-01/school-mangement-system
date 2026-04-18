import { Router } from "express";
import { loginUser, registerUser,logoutUser,refereshAccessToken, changePassword, getAllUsers, updateUser, deleteUser, getCurrentUser } from "../controllers/user.controllers.js";
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
router.put("/change-password", verifyJWT, changePassword)
router.route("/all-users").get(verifyJWT, AuthorizeRole("admin"), getAllUsers)
router.route("/user-profile").get(verifyJWT, getCurrentUser)
router.route("/update/:id").put(verifyJWT, upload.single("profileImage"), updateUser)
router.route("/delete/:id").delete(verifyJWT, deleteUser)

export default router;
