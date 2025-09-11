import React, { useState } from "react";
import "../index.css";
import { HashLink as Link } from "react-router-hash-link";
const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}/auth`;

const ForgotPass = () => {
  const [isActive, setIsActive] = useState(false);
  const handleFocus = () => setIsActive(true);
  const handleBlur = () => {
    setTimeout(() => {
      if (!document.activeElement.closest(".box")) {
        setIsActive(false);
      }
    }, 100);
  };

  const [form, setForm] = useState({ sponsorId: "", email: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.sponsorId || !form.email) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }), // backend only needs email
      });

      const data = await res.json();
      if (res.ok) {
        alert("Reset link sent! Check your email.");
        setForm({ sponsorId: "", email: "" });
      } else {
        alert(data.message || "Error sending email");
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
        <div
          className={`box position-relative d-flex justify-content-center align-items-center ${
            isActive ? "active" : ""
          }`}
        >
          <div className="login position-absolute d-flex flex-column justify-content-center align-items-center">
            <div className="loginBx position-relative d-flex flex-column align-items-center gap-3 w-100 px-3">
              <h2 className="text-uppercase fw-semibold">
                <i className="fa-solid fa-right-to-bracket orange-color pb-2"></i>{" "}
                Forgot Pass
              </h2>
              <input
                type="text"
                name="sponsorId"
                placeholder="Sponsor Id"
                value={form.sponsorId}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
                required
              />
              <input
                type="submit"
                value="Submit"
                className="text-dark bg-white border-none fw-semibold cursor-pointer"
              />
              <div className="group w-100 d-flex flex-column flex-sm-row justify-content-sm-between align-items-center">
                <Link
                  to="/"
                  className="text-white text-decoration-none fw-semibold"
                >
                  Login
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

export default ForgotPass;
