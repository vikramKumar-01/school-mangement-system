import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
};

// ─── Helper (same as user.controller.js) ─────────────────────────────────────

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken  = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

// ─── Called by Passport after Google redirects back ──────────────────────────

const googleCallback = asyncHandler(async (req, res) => {
    // req.user is set by Passport after successful Google auth
    if (!req.user) {
        throw new ApiError(401, "Google authentication failed");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(req.user._id);

    // Redirect to frontend with tokens in query params
    // Frontend should store these and drop them from the URL immediately
    const redirectURL = `${process.env.CLIENT_URL}/auth/google/success?accessToken=${accessToken}&refreshToken=${refreshToken}`;

    return res
        .status(200)
        .cookie("accessToken",  accessToken,  cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .redirect(redirectURL);
});

// ─── Optional: API route to get user after OAuth (if using cookies) ───────────

const googleAuthSuccess = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Google login successful"));
});

export { googleCallback, googleAuthSuccess };