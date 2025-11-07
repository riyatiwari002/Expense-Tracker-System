import React, { useState, useEffect } from "react";
import "./Profile.css";
import axios from "axios";
import Cookies from "js-cookie";

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });




  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const rawUser = Cookies.get("userInfo");
  const user = JSON.parse(rawUser);
  console.log(user);
  const userId = user.data._id;
  console.log(userId);


  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      if (!userId) {
        alert("User ID not found! Please login again.");
        return;
      }
      
      

      const updatedUser = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };
     

      await axios.put(`http://localhost:3000/api/auth/updatedUserInfo/${userId}`, updatedUser);

      alert(" Profile updated successfully!");
      setFormData({ ...formData, password: "" });
    } catch (error) {
      alert( error.message);
      
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">👤 My Profile</h2>

        <form onSubmit={updateProfile}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"

            />
          </div>

          <div className="input-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
            />
          </div>

          <button type="submit" className="update-btn">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
