import React, { useEffect, useState } from "react";
import "./Categories.css";
import { FaTrashAlt, FaPlusCircle } from "react-icons/fa";
import axios from "axios";
import Cookies from 'js-cookie'

const Categories = () => {

  const [formData, setFormdata] = useState({
    name: "",
  });
  const [allCategory, setAllCategory] = useState([]);

  //  Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormdata({ ...formData, [name]: value });
  };

  // Add Category Function
  const addCategory = async (e) => {
    e.preventDefault();

    const userinfo = Cookies.get("userInfo");
    console.log("Raw cookie data:", userinfo);

    try {
      const user = JSON.parse(userinfo);
      console.log("Parsed user info:", user);
      
        
      const newCategory = {
        name: formData.name.toLowerCase(),
        createdBy: user.role==="admin"? "admin" : user.data._id
      };

      const response = await axios.post("http://localhost:3000/addcategory", newCategory);

      setAllCategory([...allCategory, formData.name]);
      setFormdata({ name: "" });
      alert("✅ New category added successfully!");

    } catch (error) {
      console.error("Add category error:", error.response?.data || error.message);
      alert(error.response?.data?.message || " Category addition failed");
    }
  };

  const getAllCategory = async () => {
    // e.preventDefault();
    try {
      const rawUser=Cookies.get("userInfo");
      if(!rawUser)
      {
         return alert("login first");
      }
      const user=JSON.parse(rawUser);
      const response = await axios.get("http://localhost:3000/getAllCategory");
      const allCat = Array.isArray(response.data.data) ? response.data.data : [];
      let filteredCategory=[];
      if(user.data.role==="admin")
      {
           filteredCategory=allCat;
      }
      else{
        filteredCategory=allCat.filter((cat)=>
          cat.createdBy===user.data._id || cat.createdBy==="admin"
        )
      }
      // console.log(allCat);
      setAllCategory(filteredCategory)
    } catch (error) {
      console.error(error.message);
      alert("error to getting data");

    }
  }

  useEffect(() => {
     console.log(allCategory);
    getAllCategory();

  }, []);


  const deleteCategory = async (index) => {

    try {

      const catId = allCategory[index]?._id;
      console.log(catId);

      if (!catId) {
        alert("category id not found.");
        return;
      }

      const response = await axios.delete(`http://localhost:3000/deleteCategory/${catId}`)
      setAllCategory(allCategory.filter((category) => category._id !== catId));
      alert(" category deleted succssfully");
    } catch (error) {
      error.response?.data?.message || "something went wrong while deleted category";
    }
  }



  return (
    <div className="categories-page">
      <h1 className="cat-title"> Manage Categories</h1>
      <p className="cat-subtitle">Add or Delete your custom categories easily.</p>

      {/* Add Category Form */}
      <div className="add-category">
        <input
          type="text"
          name="name"
          placeholder="Enter new category..."
          value={formData.name}
          onChange={handleChange}
        />
        <button onClick={addCategory}>

          <FaPlusCircle /> Add

        </button>
      </div>

      {/* Category List */}
      <div className="categories-list">
        {allCategory.map((category, index) => (
          <div className="category-card" key={index}>
            <span className="category-name">{category.name}</span>
            <div className="cat-actions">

              <button className="delete" onClick={() => deleteCategory(index)}>
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
