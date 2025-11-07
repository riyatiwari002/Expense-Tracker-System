import express from "express";
import {
  addcategory,
  getAllCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const categoryRoutes = express.Router();

categoryRoutes.post("/addcategory", addcategory);
categoryRoutes.get("/getAllCategory", getAllCategory);
categoryRoutes.delete("/deleteCategory/:id", deleteCategory);

export default categoryRoutes;
