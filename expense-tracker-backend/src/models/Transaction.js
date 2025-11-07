import mongoose from "mongoose";

const transactionSchema= new mongoose.Schema({
    userId:
    {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    type:
    {
        type:String,
        enum:["income","expense"],
    },
    category:
    {
        type:String,
        required:true,
    },
    amount:
    {
        type:Number,
        required:true,
    },
    description:
    {
        type:String,
        required:true,
    },
    date:
    {
        type:Date,
        default:Date.now
    },
},
{timestamps:true}
)

const transactionModel=mongoose.model("transaction",transactionSchema);
export default transactionModel;