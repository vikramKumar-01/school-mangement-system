import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required:true
    },
    email : {
        type : String,
        unique : true,
        lowercase: true,
        trim: true,
        index: true,
        required:true
    },
    profileImage:{
        type : String,
    },
    password : {
        type: String,
        required: [true, 'Password is required']
    },
    role:{
        type:String,
        enum: ["admin","teacher","student"],
        default: "admin"
    },
    refreshToken: {
        type: String
    }

},{timestamps: true});

// incrypting password
userSchema.pre("save", async function(){
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10)
})

// checking password
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

// generate token
userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// // Refresh token
userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id: this._id,
           
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema);