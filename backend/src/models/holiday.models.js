import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ["National Holiday", "Festival", "School Holiday", "Emergency Holiday"],
        required: true
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true });

export const Holiday = mongoose.model("Holiday", holidaySchema);
