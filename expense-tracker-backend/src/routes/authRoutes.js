import express from 'express';
import {home,registerUser,loginUser, updatedUserInfo} from '../controllers/authController.js';
const authRoutes=express.Router();

authRoutes.get('/',home);
authRoutes.post('/api/auth/register',registerUser);
authRoutes.post('/api/auth/login',loginUser);
authRoutes.put('/api/auth/updatedUserInfo/:id',updatedUserInfo)

export default authRoutes;