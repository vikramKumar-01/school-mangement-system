import mongoose from "mongoose" ;
const feeSchema = new mongoose.Schema({
    student:{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },
    amount:{
        type : Number,
    },
    status:{
        type : String,
        enum: ["Paid", "Pending"],
        default: pending
    },
    paymentDate:{
        type : Date 
    }
});

export const Fee = mongoose.model("Fee", feeSchema);