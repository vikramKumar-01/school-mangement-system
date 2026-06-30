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
    },
    permissions: {
        markAttendance: { type: Boolean, default: true },
        addStudent: { type: Boolean, default: false },
        editStudent: { type: Boolean, default: false },
        manageClasses: { type: Boolean, default: false },
        createAssignment: { type: Boolean, default: true },
        logMarks: { type: Boolean, default: true },
        postNotice: { type: Boolean, default: true },
        academicProgress: { type: Boolean, default: true }
    }
},{timestamps: true})

export const Teacher = mongoose.model("Teacher", teacherSchema);