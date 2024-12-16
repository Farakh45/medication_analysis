import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Import js-cookie to manage cookies
import { useAuth } from "./AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Header = () => {
  const navigate = useNavigate(); // Hook to navigate to different pages
  const { logout } = useAuth();


  const handleLogout = () => {
    // Remove token from cookies
    Cookies.remove("auth_token");
    logout();
     navigate("/login");
     toast.success("Logged out!");
  };

  return (
    <header className="flex justify-between items-center bg-gray-800 text-white p-4">
      {/* App Name */}
      <h1 className="text-2xl font-bold">Medication Data Analysis</h1>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
      <ToastContainer />
    </header>
  );
};

export default Header;
