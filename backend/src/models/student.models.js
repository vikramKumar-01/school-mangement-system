import mongoose from "mongoose";
import { type } from "node:os";

const studentSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    class:{
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true,
    },
    rollNumber:{
        type : Number,
        required : true,
        unique : true,
    },
    fatherName:{
        type: String,
    },
    phone:{
        type: String
    },
    address:{
        type: String
    },
    admissionDate:{
        type:Date,
        default:Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{timestamps: true})


export const Student = mongoose.model("Student", studentSchema)