import userModel from "../models/User.js";

const getAllRegisteredUsers = async (req, res) => {
  try {
    const registeredUsers = await userModel.find();
    res.status(200).json({
      status: 200,
      count:registeredUsers.length,
      data: registeredUsers,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      
    });
  }
};

const changeUserStatus=async(req,res)=>{
    try{
        const _id=req.params.id;
        const {status}=req.body;
        const existingUser=await userModel.findById(_id);
       if(!existingUser)
       {
        return res.status(404).json({
            status:404,
            message:"user not found",
        })
       }
       const updatedStatus=await userModel.findByIdAndUpdate(_id,{status},{new:true});
       return res.status(200).json({
        status:200,
        message:"status updated successfully",
        data:updatedStatus,
       })
    }catch(error)
    {
        res.status(500).json({
            status:500,
            message:error.message
        })
    }

}

export { getAllRegisteredUsers,changeUserStatus}
