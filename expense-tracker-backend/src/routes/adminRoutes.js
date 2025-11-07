import express from 'express';
import { getAllRegisteredUsers,changeUserStatus } from '../controllers/adminController.js';

const adminRoutes=express.Router();
adminRoutes.get("/api/admin/users",getAllRegisteredUsers);
adminRoutes.put("/api/admin/user/:id/status",changeUserStatus)



export default adminRoutes;