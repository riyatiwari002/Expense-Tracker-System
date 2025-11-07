import categoryModel from "../models/Category.js";

//  Add Category
const addcategory = async (req, res) => {
  try {
    const { name, createdBy } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({
        status: 400,
        message: "All fields are required",
      });
    }

    const existingCategory = await categoryModel.findOne({ name:name.toLowerCase(),
      createdBy:createdBy
     });
    if (existingCategory) {
      return res.status(409).json({
        status: 409,
        message: "Category already exists",
      });
    }

    const newCategory = await categoryModel.create({ name:name.toLowerCase(), createdBy });

    res.status(201).json({
      status: 201,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};


//  Get All Categories
 const getAllCategory = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.status(200).json({
      status: 200,
      message: "All categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

//  Delete Category
 const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ status: 404, message: "Category not found" });
    }
    res.status(200).json({ status: 200, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

export {addcategory,getAllCategory,deleteCategory};