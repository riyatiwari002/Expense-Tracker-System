import express, { Router } from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from './routes/categoryRoutes.js';
import transRoutes from './routes/transactionRoutes.js'
import cors from 'cors';
import adminRoutes from "./routes/adminRoutes.js";
const server = express(); 
server.use(express.json());
server.use(cors());

connectDB();

server.use(authRoutes);
server.use(categoryRoutes)
server.use(transRoutes);
server.use(adminRoutes);

export default server;
