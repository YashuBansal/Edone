import React, { useEffect, useRef, useState } from "react";
import "../index.css";
import { HashLink as Link } from "react-router-hash-link";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/build/css/intlTelInput.css";
import "intl-tel-input/utils";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}/auth`;

const UserSignUp = () => {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  const [sponsorLocked, setSponsorLocked] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loadingSign, setLoadingSign] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    sponsorId: "",
    sponsorName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const phoneInputRef = useRef(null);
  const itiRef = useRef(null);

  useEffect(() => {
    const fetchSponsorName = async () => {
      if (!form.sponsorId) {
        setForm((prev) => ({ ...prev, sponsorName: "" }));
        setSponsorLocked(false);
        return;
      }

      try {
        const res = await fetch(`${API}/get-sponsor/${form.sponsorId}`);
        const data = await res.json();

        if (res.ok) {
          setForm((prev) => ({
            ...prev,
            sponsorName: data.sponsorName,
          }));
          setSponsorLocked(true);
          setMessage("");
        } else {
          setForm((prev) => ({
            ...prev,
            sponsorName: "", // clear if not found
          }));
          setSponsorLocked(false);
          setMessage(data.message || "Sponsor not found.");
        }
      } catch {
        setMessage("Error fetching sponsor.");
      }
    };

    fetchSponsorName();
  }, [form.sponsorId]);

  useEffect(() => {
    let timer;
    if (otpSent && !canResend && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setCanResend(true);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [otpSent, canResend, resendTimer]);

  useEffect(() => {
    if (phoneInputRef.current) {
      itiRef.current = intlTelInput(phoneInputRef.current, {
        initialCountry: "in",
        separateDialCode: true,
        utilsScript:
          "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
      });
    }
    return () => itiRef.current?.destroy();
  }, []);

  const handleFocus = () => setIsActive(true);
  const handleBlur = () => {
    setTimeout(() => {
      if (!document.activeElement.closest(".box")) {
        setIsActive(false);
      }
    }, 100);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendOtp = async () => {
    const phone = phoneInputRef.current?.value.replace(/\D/g, "") || "";
    setMessage("");
    setLoadingOtp(true);

    if (!form.email) {
      setMessage("Email is required before sending OTP.");
      setLoadingOtp(false);
      return;
    }

    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsorId: form.sponsorId,
          sponsorName: form.sponsorName,
          userName: form.userName,
          email: form.email,
          phone,
          password: form.password,
        }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) setOtpSent(true);
      setCanResend(false);
      setResendTimer(30);
    } catch {
      setMessage("Server error, please try again.");
    } finally {
      setLoadingOtp(false);
    }
  };

  const finalSignup = async () => {
    const phone = phoneInputRef.current?.value.replace(/\D/g, "") || "";
    setLoadingSign(true);
    setMessage("");

    if (
      !form.sponsorId ||
      !form.sponsorName ||
      !phone ||
      !form.password ||
      !form.confirmPassword ||
      !form.userName ||
      !form.email
    ) {
      setMessage("All fields are required to complete signup.");
      setLoadingSign(false);
      return;
    }

    if (!otp) {
      setMessage("Verify Your Email First");
      setLoadingSign(false);
      return;
    }

    if (!form.password || form.password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setLoadingSign(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      setLoadingSign(false);
      return;
    }

    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "OTP verification failed.");
        setLoadingSign(false);
        return;
      }
      setOtpVerified(true);
      setOtpSent(false);
      setMessage(data.message);

      const res2 = await fetch(`${API}/finalize-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data2 = await res2.json();

      if (!res2.ok) {
        setMessage(data2.message || "Signup failed.");
        setLoadingSign(false);
        return;
      }

      const { memberId } = data2;
      const signupData = {
        sponsorId: form.sponsorId,
        sponsorName: form.sponsorName,
        userName: form.userName,
        memberId,
        email: form.email,
        phone,
        password: form.password,
      };
      localStorage.setItem("signupData", JSON.stringify(signupData));
      navigate("/thankyou");
    } catch {
      setMessage("Server error, please try again.");
    } finally {
      setLoadingSign(false);
    }
  };

  return (
    <div className="blue-bg-page">
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div
          className={`box position-relative d-flex justify-content-center align-items-center ${
            isActive ? "active" : ""
          }`}
        >
          <div className="login position-absolute d-flex flex-column justify-content-center align-items-center">
            <div className="SignUpBx position-relative d-flex flex-column align-items-center gap-3 px-3 w-100">
              <h2 className="text-uppercase fw-semibold">
                <i className="fa-solid fa-right-to-bracket orange-color pb-2"></i>{" "}
                Sign Up
              </h2>

              {/* Sponsor Fields */}
              <div className="d-flex align-items-center gap-2">
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
                  type="text"
                  name="sponsorName"
                  placeholder="Sponsor Name"
                  value={form.sponsorName}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  required
                  readOnly={sponsorLocked}
                />
              </div>

              <input
                type="text"
                name="userName"
                placeholder="User Name"
                value={form.userName}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
                required
              />

              {/* Email + Verify */}
              <div className="d-flex align-items-center w-100 gap-2">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className=""
                  value={form.email}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  disabled={otpVerified}
                  required
                />
                {!otpSent && !otpVerified && (
                  <button
                    type="button"
                    className="signBtn w-50"
                    onClick={sendOtp}
                    disabled={loadingOtp}
                  >
                    {loadingOtp ? "Sending..." : "Verify Email"}
                  </button>
                )}
                {otpSent && !otpVerified && (
                  <button
                    type="button"
                    className="signBtn w-50"
                    onClick={sendOtp}
                    disabled={!canResend || loadingOtp}
                  >
                    {loadingOtp
                      ? "Sending..."
                      : canResend
                      ? "Resend"
                      : `Resend in ${resendTimer}s`}
                  </button>
                )}
              </div>
              <div className="d-flex align-items-center gap-2 w-100">
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={otp}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className="d-flex align-items-center gap-2 phone-input-wrapper w-100">
                <input
                  type="tel"
                  ref={phoneInputRef}
                  name="phone"
                  maxLength={10}
                  placeholder="Enter phone number"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  required
                />
              </div>

              {/* Passwords */}
              <div className="d-flex align-items-center gap-2">
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
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-check Password"
                  value={form.confirmPassword}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Submit (only for visual, actual signup is OTP verify) */}
              <input
                type="submit"
                className="text-dark bg-white border-none fw-semibold cursor-pointer"
                onClick={finalSignup}
                disabled={loadingSign}
                value={loadingSign ? "Sending..." : "Sign Up"}
              />

              <div>
                <span style={{ color: "#00000a" }}>&nbsp;</span>
                {message && <span className="text-light small">{message}</span>}
              </div>

              {/* Links */}
              <div className="group w-100 d-flex flex-column flex-sm-row justify-content-sm-between align-items-center">
                <Link
                  to="/forgot-password"
                  className="text-white text-decoration-none"
                >
                  Forgot Password
                </Link>
                <Link
                  to="/"
                  className="text-decoration-none orange-color fw-semibold"
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

export default UserSignUp;
