import mongoose, { Mongoose } from "mongoose";
import { timeStamp } from "node:console";

const userSchema = new Mongoose.Schema({
    name:{
        type: String
    },
    email : {
        type : String,
        unique : true,
    },
    password : String,
    role:{
        type:String,
        enum: ["admin","teacher","student"],
        default: "admin"
    }

},{timeStamp: true});

export const User = mongoose.model("User", userSchema);