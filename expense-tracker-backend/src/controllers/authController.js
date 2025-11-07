import usersModel from "../models/User.js";
import bcrypt from 'bcrypt';

const home = (req, res) => {
  res.write("home page");
  res.end();
};

const registerUser = async (req, res) => {
  try {
    const saltRound=12;
    const { name, email, password,role } = req.body;
  
    
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 400,
        message: "please fill all the fields",
      });
    }
    const exitUser = await usersModel.findOne({ email });
    if (exitUser) {
      return res.status(409).json({
        status: 409,
        message: "email already exist",
      });
    }

    const hasedPassword=await bcrypt.hash(password,saltRound);
    const newUser = new usersModel({
      name,
      email,
      password:hasedPassword,
      role
    });
 
    await newUser.save();
    res.status(201).json({
      status: 201,
      message: " user registered successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password} = req.body;
 
    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: "Please provide email & password",
      });
    }

    //  Check User Exists
    const user = await usersModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }
    
    //  Password Match
    const isMatch=await bcrypt.compare(password,user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        message: "Incorrect password",
      });
    }
     
    
   const userData={
      _id:user._id,
      name:user.name,
      email:user.email,
      password:user.password,
      role:user.role,
      status:user.status,
    }
    //  Success Response
    return res.status(200).json({
      status: 200,
      message: "login successfully",
      data: userData,
    });

  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
    });
  }
};

const updatedUserInfo=async(req,res)=>{
try{
   const _id=req.params.id;
   const {name,email,password}=req.body;

    if(!name || !email || !password)
    {
      res.status(401).json({
        status:401,
        message:"all fields are required"
      })
    }
   const existingUser=await usersModel.findById(_id);
   if(!existingUser)
   {
    return res.status(404).json({
      status:404,
      message:"user not found",
    })
   }
  
  let hashedPassword=existingUser.password;
  if(password && password.trim()!=="")
  {
    const saltRound=12;
    hashedPassword=await bcrypt.hash(password,saltRound);
  }
   const updatedUserInfo=await usersModel.findByIdAndUpdate(_id,{name,email,password:hashedPassword},{new:true})
   res.status(200).json({
    status:200,
    message:"user information updated succesfully",
    data:updatedUserInfo
   })
}catch(error)
    {
        res.status(500).json({
            status:500,
            message:error.message
        })
    }
}



export { home, registerUser, loginUser,updatedUserInfo };
