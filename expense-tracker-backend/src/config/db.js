import mongoose from "mongoose";

const connectDB=async()=>{
    try{
        await mongoose.connect("mongodb://localhost:27017/expenseTracker");
        console.log("Database Connected Successfully ✅");

        
    }catch(error)
    {
        console.log("Database Connectioon Failed ❌",error);
    }
}
export default connectDB;
