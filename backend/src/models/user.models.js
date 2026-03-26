import mongoose, { Mongoose } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { type } from "node:os";

const userSchema = new Mongoose.Schema({
    name:{
        type: String
    },
    email : {
        type : String,
        unique : true,
        lowercase: true,
        trim: true,
        index: true
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
    }

},{timeStamp: true});

// incrypting password
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10)
    next()
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

// Refresh token
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