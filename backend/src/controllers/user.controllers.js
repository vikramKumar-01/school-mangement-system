import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {jwt} from "jsonwebtoken";


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

    if(incomingRefreshToken){
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
 
export { 
    registerUser ,
    loginUser,
    logoutUser, 
    refereshAccessToken,
    getAllUsers
}