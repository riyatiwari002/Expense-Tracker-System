import React from "react";
import "./Navbar.css";
import Cookies from "js-cookie";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import logo from '../../assets/logo.png';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current page is login or register
  const isLoginPage =
    location.pathname === "/login" || location.pathname === "/";

  // Logout handler
  const handleLogout = () => {
  const userInfo = Cookies.get("userInfo");
  console.log(userInfo)
  if (userInfo) {
    Cookies.remove("userInfo", { path: "/" });
    console.log(" User logged out successfully");
    navigate("/login");
  } else {
    console.warn(" No user session found to log out!");
    navigate("/login"); 
  }
};

  return (
    <div className="navbar">
      {/* Logo */}
        <div className="logo">
        <img src={logo} alt="logo" />
        <span>SmartSpender</span>
      </div>

      {/* Show only when NOT on login/register page */}
      {!isLoginPage && (
        <>
          {/* Links */}
          <div className="links">
            <ul>
               <li
                className={
                  location.pathname === "/dashboard" ? "active" : ""
                }
              >
                <Link to="/dashboard">Dashboard</Link>
              </li>

              <li
                className={
                  location.pathname === "/category" ? "active" : ""
                }
              >
                <Link to="/category">Categories</Link>
              </li>
              <li
                className={
                  location.pathname === "/reports" ? "active" : ""
                }
              >
                <Link to="/reports">Reports</Link>
              </li>
             
              <li
                className={
                  location.pathname === "/transaction" ? "active" : ""
                }
              >
                <Link to="/transaction">Transactions</Link>
              </li>
            </ul>
          </div>
          {/* Logout Button */}
          <div className="btns">
            <button className="login" onClick={handleLogout}>
              Logout
            </button>
          <p> <Link to="/profile"> <CgProfile className="profile" /></Link></p>

          </div>

        </>
      )}

      {/* Show Login + Register only on login/register page */}
      {isLoginPage && (
        <div className="links">
         <ul>
           <li className={location.pathname === "/" ? "active" : ""}>
                <Link to="/">Register</Link>
              </li>
              <li className={location.pathname === "/login" ? "active" : ""}>
                <Link to="/login">Login</Link>
              </li>
         </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;