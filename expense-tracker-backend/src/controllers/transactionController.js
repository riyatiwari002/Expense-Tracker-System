import transactionModel from "../models/Transaction.js";

const addTransaction = async (req, res) => {
  try {
    const { userId, type, category, amount, description, date } = req.body;

    if (!type || !category || !amount || !userId || !date || !description) {
      return res.status(400).json({
        success: false,
        message: "type, category & amount are required",
      });
    }

    const newTransaction = new transactionModel({
      userId,
      type,
      category,
      amount,
      description,
      date: date || new Date(),
    });

    await newTransaction.save();

    res.status(201).json({
      success: true,
      message: "Transaction successfully added!",
      data: newTransaction,
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllTransaction=async(req,res)=>{
  try{
    const transaction=await transactionModel.find();
    res.status(200).json({
      status:200,
      message:"all transaction feteched successfully",
      data:transaction
    })
  }catch(error)
  {
    res.status(500).json({
      status:500,
      message:error.message
    })
  }
}

const updateTransaction=async(req,res)=>{
   try{
     const _id=req.params.id;
     const{category,amount}=req.body;
       if(!category || !amount)
       {
        return res.status(401).json({
          status:401,
          message:"category & amount are required"
        })
       }
     const exitingTransaction=await transactionModel.findById(_id)
     if(!exitingTransaction)
     {
      return res.status(404).json({
        status:404,
        message:"transaction not found"
      });
     }
     const updateTrans=await transactionModel.findByIdAndUpdate(_id,
      {category,amount},
      {new:true}
     );
     res.status(200).json({
      status:200,
      message:"Transaction updated successfully",
      data:updateTrans
     })

   }catch(error)
   {
      res.status(500).json({
        status:500,
        message:error.message
      })
   }
}

const deleteTransaction=async(req,res)=>{
 try{
  const _id=req.params.id;
  const existingTransaction=await transactionModel.findById(_id);
  if(!existingTransaction)
  {
    res.status(404).json({
      status:404,
      message:"transaction id not found",

    })
  }
  const deleteTrans=await transactionModel.findByIdAndDelete(_id);
  return res.status(200).json({
    status:200,
    message:"transaction deleted successfully",
    data:deleteTrans
  })
 }catch(error)
 {
    res.status(500).json({
      status:500,
      message:error.message
    })
 }
}

export { addTransaction,getAllTransaction,updateTransaction,deleteTransaction};
