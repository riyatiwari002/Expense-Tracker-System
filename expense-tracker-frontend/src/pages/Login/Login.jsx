import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import axios from "axios";
import Cookies from "js-cookie";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  //  Handle form submit
  const Login = async (e) => {
    e.preventDefault();

    try {
      const { email, password } = formData;
      
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { email, password }
      );

      const user = response.data.data;

      if (user) {
        // Check if user inactive
        if (user.status === "inactive") {
          alert("Your account is inactive. Please wait for admin approval.");
          return;
        }

        //  Set login and save cookie
        Cookies.set("userInfo", JSON.stringify(response.data), { expires: 1 });
        
        alert(response.data.message);
        // console.log(user);
        

        //  Navigate based on role and status
        if (user.role === "admin" && user.status === "active") {
          navigate("/adminPanel");
        } else if (user.role === "user" && user.status === "active") {
          navigate("/dashboard");
        } else {
          alert("Register first");
          navigate("/");
        }
      } else {
        alert("Email or password is incorrect ");
      }
    } catch (error) {
      console.log("Login error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Login failed ");
    }

    //  Reset form after login attempt
    setFormData({ email: "", password: "" });
  };

  return (
    <div className="register-form">
      <div className="register-card">
        <h2 className="register-title">Login</h2>
        <form onSubmit={Login}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              
            />
          </div>

          <div className="input-group">
            <label htmlFor="pass">Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              id="pass"
              name="password"
              value={formData.password}
              onChange={handleChange}
              
            />
          </div>

          <button type="submit" className="register">
            Login
          </button>

          <p className="login-text">
            <span className="login-link">Don't have an account? </span>
            <Link to="/">Create an account?</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
