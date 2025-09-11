import React, { useState } from "react";
import "../index.css";
import { HashLink as Link } from "react-router-hash-link";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}/auth`; 

const UserLogin = () => {
  const [isActive, setIsActive] = useState(false);
  const handleFocus = () => setIsActive(true);
  const handleBlur = () => {
    setTimeout(() => {
      if (!document.activeElement.closest(".box")) {
        setIsActive(false);
      }
    }, 100);
  };

  const navigate = useNavigate();
  const [form, setForm] = useState({ memberId: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.memberId || !form.password) {
      alert("All fields are required");
      return;
    }

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // Save JWT token & user info in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");

        alert("Login successful");
        navigate("/dashboard");
      } else {
        if (data.message === "User not found") {
          alert("User not found. Redirecting to Sign Up...");
          navigate("/signup");
        } else {
          alert(data.message || "Login failed");
        }
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="blue-bg-page">
      <form
        onSubmit={handleSubmit}
        className="container d-flex justify-content-center align-items-center vh-100 "
      >
        <div
          className={`box position-relative d-flex justify-content-center align-items-center ${
            isActive ? "active" : ""
          }`}
        >
          <div className="login position-absolute d-flex flex-column justify-content-center align-items-center">
            <div className="loginBx position-relative d-flex flex-column align-items-center gap-3 w-100 px-3">
              <h2 className="text-uppercase fw-semibold">
                <i className="fa-solid fa-right-to-bracket orange-color pb-2"></i>{" "}
                Login
              </h2>
              <input
                type="text"
                name="memberId"
                placeholder="Member ID"
                value={form.memberId}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
                required
              />
              <input
                type="submit"
                value="Sign in"
                className="text-dark bg-white border-none fw-semibold cursor-pointer"
              />
              <div className="group w-100 d-flex flex-column flex-sm-row justify-content-sm-between align-items-center">
                <Link
                  to="/forgot-password"
                  className="text-white text-decoration-none"
                >
                  Forgot Password
                </Link>
                <Link
                  to="/signup"
                  className="text-decoration-none orange-color fw-semibold"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserLogin;
