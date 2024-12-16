import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import illustration from "./assets/illustration.png";
import { useAuth } from "./AuthContext";
import Cookies from "js-cookie";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login } = useAuth(); // Context function to update auth state
  const navigate = useNavigate(); // Used to redirect after successful login

  const token = Cookies.get("auth_token");

  useEffect(() => {
    if (token) {
      navigate("/dashboard"); // Redirect to dashboard if user is already logged in
    }
  }, [token, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );
      

      if (response.data.status) {
        const token = response.data.token;

        Cookies.set("auth_token", token, { expires: 1 });
        login(response.data.user); // Update auth state with user data
        navigate("/dashboard");
        toast.success("Login successful!");
 
      } else {
        toast.error(response.data.error || "Invalid credentials.");
      }
    } catch (error) {
      // Enhanced error handling
      const errorMessage = error.response?.data?.message || "Login failed!";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col md:flex-row shadow-lg bg-white rounded-lg overflow-hidden max-w-4xl w-full">
        {/* Left Section */}
        <div className="hidden md:block w-1/2">
          <img
            src={illustration}
            alt="Login illustration"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Right Section */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Login
            </button>

            <div className="mt-4 text-center">
              <p className="text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-500 hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
