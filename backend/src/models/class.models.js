import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    className:{
        type : String,
        required: true,
    },
    section:{
        type: String
    },
    classTeacher:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher"
    }
});

export const Class = mongoose.model("Class", classSchema);