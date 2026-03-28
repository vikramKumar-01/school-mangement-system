import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req, res)=>{
    const {fullName, email ,password}=req.body

    if(
        [fullName, email,password].some((field)=>
            field?.trim() ==""
        )
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({ email });

    if (existedUser) {
        throw new ApiError(409, "user already exist")
    }
    const profileImageLocalpath = req.files?.profileImage[0].path;

    const profileImage = await uploadOnCloudinary(profileImageLocalpath);

    const user = await User.create({
        fullName,
        profileImage: profileImage?.url||"",
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password"
    )

    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user Registered Successfully")
    )
})

export {registerUser}