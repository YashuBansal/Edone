import React, { useState, useEffect } from "react";
import "../index.css";
import { HashLink as Link } from "react-router-hash-link";

const ThankYou = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [signupData, setSignupData] = useState({});

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("signupData")) || {};
    setSignupData(savedData);
  }, []);

  const { sponsorId, sponsorName, memberId, userName, email, phone, password } = signupData;
  return (
    <div className="blue-bg-page">
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="box position-relative d-flex justify-content-center align-items-center">
        <div className="login position-absolute d-flex flex-column justify-content-center align-items-center">
          <div className="loginBx thankyouBx position-relative d-flex flex-column align-items-center w-100 px-3">
            <h2 className="text-uppercase fw-semibold mb-0 orange-color ">Thank You</h2>
            <p className="mt-0 text-center">Your Account Created Successfully!</p>
            <ul className="list-unstyled text-light text-center d-flex flex-column py-1 gap-2">
              <li><strong>Sponsor ID:</strong> {sponsorId}</li>
              <li><strong>Sponsor Name:</strong> {sponsorName}</li>
              <li><strong>Member ID:</strong> {memberId}</li>
              <li><strong>User Name:</strong> {userName}</li>
              <li><strong>Email:</strong> {email}</li>
              <li><strong>Phone:</strong> {phone}</li>
              <li><strong>Password:</strong>{" "}
                {showPassword ? password : "•".repeat(password?.length || 6)}
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="signBtn rounded-3 px-2 py-0 btn-outline-warning ms-2"
                  style={{ fontSize: "0.8rem" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button></li>
            </ul>
            <div className="group w-100 d-flex flex-column justify-content-center align-items-center">
              <Link
                to="/"
                className="text-decoration-none orange-color fs-5 fw-semibold"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
export default ThankYou;
