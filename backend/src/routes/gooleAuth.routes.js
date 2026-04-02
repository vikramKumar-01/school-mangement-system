import { Router } from "express";
import passport from "../config/passport.js";
import { googleCallback, googleAuthSuccess } from "../controllers/google.auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Step 1 — Frontend hits this → redirects user to Google's login page
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })
);

// Step 2 — Google redirects back here after user approves
router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
    }),
    googleCallback
);

// Step 3 — Optional: get current user via cookie (protected)
router.get("/google/me", verifyJWT, googleAuthSuccess);

export default router;