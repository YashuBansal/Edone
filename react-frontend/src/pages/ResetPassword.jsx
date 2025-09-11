import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}/auth`;

const ResetPass = () => {
  const [isActive, setIsActive] = useState(false);
    const handleFocus = () => setIsActive(true);
    const handleBlur = () => {
      setTimeout(() => {
        if (!document.activeElement.closest(".box")) {
          setIsActive(false);
        }
      }, 100);
    };

  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API}/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Password reset successfully! You can now log in.");
        setTimeout(() => {
        navigate("/");
        }, 2000);
      } else {
        alert(data.message || "Reset failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="blue-bg-page">
    <form
      onSubmit={handleSubmit}
      className="container d-flex justify-content-center align-items-center vh-100"
    >
      <div className={`box position-relative d-flex justify-content-center align-items-center ${isActive ? "active" : ""}`}>
        <div className="login position-absolute d-flex flex-column justify-content-center align-items-center">
          <div className="loginBx position-relative d-flex flex-column align-items-center gap-3 w-100 px-3">
            <h2 className="text-uppercase fw-semibold">
              <i className="fa-solid fa-right-to-bracket orange-color pb-4"></i>{" "}
              Reset Pass
            </h2>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mb-4"
              required
            />
            <input
              type="submit"
              value="Reset Password"
              className="text-dark bg-white border-none fw-semibold cursor-pointer"
            />
          </div>
        </div>
      </div>
    </form>
    </div>
  );
};
export default ResetPass;
