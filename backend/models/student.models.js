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
    adress:{
        type: String
    },
    addmissionDate:{
        type:Date,
        default:Date.now
    }
},{timestamps: true})


export const Student = mongoose.model("Student", studentSchema)