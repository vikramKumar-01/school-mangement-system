import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
    name:{
        type: String,
        required : true,
    },
    subject:{
        type: String,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true,
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
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{timestamps: true})

export const Teacher = mongoose.model("Teacher", teacherSchema);