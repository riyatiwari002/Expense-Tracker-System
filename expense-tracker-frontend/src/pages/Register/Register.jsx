import React from 'react';
import './Register.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormdata] = useState({
    name: "",
    email: "",
    password: ""
  })
  const [users, setUsers] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // console.log(name,value);

    setFormdata({
      ...formData,
      [name]: value
    })
  }

  const register = async (e) => {
    e.preventDefault();

    try {
      const { name, email, password } = formData;
      if (/\s/.test(password)) {
        alert('password should not contain space')
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return;
      }
      const newUser = {
        name,
        email,
        password
      };

      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        newUser
      );

      setUsers([...users, formData]);

      alert("Registered successfully ✅");

      setFormdata({ name: "", email: "", password: "" });

    } catch (error) {
      console.error("registration error", error.response?.data || error.message);
      alert(error.response?.data?.message || "registration failed");
    }
  };

  return (
    <div className="register-form">
      <div className="register-card">
        <h2 className="register-title">
          Register here
        </h2>
        <form onSubmit={register}>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input type="text" placeholder="Enter name" id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="text" placeholder="Enter email" id="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" placeholder="Enter password" id="password" name="password" value={formData.password} onChange={handleChange} />
          </div>
          <button type="submit" className='register'>Register</button>
          <p className="login-text">
            Already have an account? <span className="login-link"><Link to='/login'>Login here</Link></span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
