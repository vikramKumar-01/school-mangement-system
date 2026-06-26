import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
    name:{
        type: String,
        required : true,
    },
    subject:{
        type: String,
    },
    phone:{
        type: String,
        unique: true,
    },
    email:{
        type:String,
        required: true,
        unique: true,
        lowercase: true,
    },
    salary:{
        type: Number
    }
},{timestamps: true})

export const Teacher = mongoose.model("Teacher", teacherSchema);