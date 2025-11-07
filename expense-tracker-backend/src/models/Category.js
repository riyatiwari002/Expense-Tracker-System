import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    default:'expense',
  },
  createdBy: {
    type:mongoose.Schema.Types.Mixed,
  },
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);
