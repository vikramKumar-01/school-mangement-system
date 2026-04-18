import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { cloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const generateAccessAndRefereshToken= async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        // refresh token save in database 
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return{accessToken, refreshToken}
    } catch (error) {
        console.log(" TOKEN ERROR:", error);
        throw new ApiError(500, "something went wrong while generating referesh and access token",);
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, role } = req.body

    // check required
    if (
        [fullName, email, password, role].some((field) =>
            field?.trim() == ""
        )
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new ApiError(409, "user already exist")
    }
    const profileImageLocalpath = req.files?.profileImage?.[0]?.path;

    let profileImage = "";

    if (profileImageLocalpath) {
        const uploaded = await uploadOnCloudinary(profileImageLocalpath);
        profileImage = uploaded?.url || "";
    }
    const user = await User.create({
        fullName,
        profileImage: profileImage,
        email,
        password,
        role
    })

    const createdUser = await User.findById(user._id).select(
        "-password"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user Registered Successfully")
    )
})

const loginUser = asyncHandler(async (req, res)=>{
    
    const {email, password} = req.body ||{}  ;
    if(!email){
        throw new ApiError(400, "Email is required")
    }

    // if you have two option email, username then use it 
    /*
    const user= await User.findOne({
        $or: [{username}, {email}]
    }) */

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse (
            200,
            {
                user: loggedInUser, 
                accessToken,
                refreshToken
            },
            "User Logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        { returnDocument: 'after' }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

const refereshAccessToken = asyncHandler(async(req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used");
        }
    
        const option = {
            httpOnly: true,
            secure: true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshToken(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", newRefreshToken, option)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }

})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body || {};

    if (!oldPassword?.trim() || !newPassword?.trim()) {
        throw new ApiError(400, "Old password and new password are required");
    }

    if (oldPassword === newPassword) {
        throw new ApiError(400, "New password must be different from old password");
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
        throw new ApiError(400, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

// get user profile
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "current user fetched successfully")
    )
})


// Get all users (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
    const { role, status, page = 1, limit = 10 } = req.query;

    // Build filter dynamically
    const filter = {};
    if (role)   filter.role = role;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
        .select("-password -refreshToken")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: Number(page),
                limit: Number(limit)
            }
        }, "All users fetched successfully")
    );
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fullName, email, role } = req.body || {};
    const newProfileImagePath = req.file?.path;

    const existingUser = await User.findById(id);
    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }

    const isAdmin = req.user?.role === "admin";
    const isOwner = req.user?._id?.toString() === existingUser._id.toString();

    if (!isAdmin && !isOwner) {
        throw new ApiError(403, "You are not allowed to update this user");
    }

    // empty update check
    if (
        fullName === undefined &&
        email === undefined &&
        role === undefined &&
        !newProfileImagePath
    ) {
        throw new ApiError(400, "At least one field is required to update");
    }

    // email update
    if (email !== undefined) {
        if (typeof email !== "string") {
            throw new ApiError(400, "Email must be a string");
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            throw new ApiError(400, "Email cannot be empty");
        }

        const emailOwner = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: existingUser._id }
        });

        if (emailOwner) {
            throw new ApiError(409, "Email is already in use");
        }

        existingUser.email = normalizedEmail;
    }

    // name update
    if (fullName !== undefined) {
        if (typeof fullName !== "string") {
            throw new ApiError(400, "Full name must be a string");
        }

        const trimmedFullName = fullName.trim();

        if (!trimmedFullName) {
            throw new ApiError(400, "Full name cannot be empty");
        }

        existingUser.fullName = trimmedFullName;
    }

    // role update
    if (role !== undefined) {
        const allowedRoles = ["admin", "teacher", "student", "parent"];

        if (typeof role !== "string") {
            throw new ApiError(400, "Role must be a string");
        }

        if (!allowedRoles.includes(role)) {
            throw new ApiError(400, "Invalid role");
        }

        if (!isAdmin) {
            throw new ApiError(403, "Only admin can update user role");
        }

        existingUser.role = role;
    }

    if (newProfileImagePath) {
        const uploadedProfileImage = await uploadOnCloudinary(newProfileImagePath);

        if (!uploadedProfileImage?.url || !uploadedProfileImage?.public_id) {
            throw new ApiError(500, "Failed to upload profile image");
        }

        if (existingUser.profileImageId) {
            await cloudinary.uploader.destroy(existingUser.profileImageId);
        }

        existingUser.profileImage = uploadedProfileImage.url;
        existingUser.profileImageId = uploadedProfileImage.public_id;
    }

    await existingUser.save();

    existingUser.password = undefined;
    existingUser.refreshToken = undefined;

    return res.status(200).json(
        new ApiResponse(200, existingUser, "User updated successfully")
    );
});

const deleteUser = asyncHandler(async (req, res) => {
    if (req.user?.role !== "admin") {
        throw new ApiError(403, "Only admin can delete users");
    }

    const { id } = req.params;
    const existingUser = await User.findById(id);

    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "User deleted successfully")
    );
});
 
export { 
    registerUser ,
    loginUser,
    logoutUser, 
    refereshAccessToken,
    changePassword,
    getAllUsers,
    updateUser,
    deleteUser,
    getCurrentUser
}
