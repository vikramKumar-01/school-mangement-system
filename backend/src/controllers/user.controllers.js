import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefereshToken= async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // refresh token save in database 
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return{accessToken, refreshToken}
    } catch (error) {
        console.log("🔥 TOKEN ERROR:", error);
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
    
    console.log("HEADERS:", req.headers);
    console.log("BODY:", req.body);

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
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
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

export { registerUser ,loginUser,logoutUser}