const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Customer = require("../models/Customer");
require("dotenv").config();
const otpStore = {};

router.post("/send-otp", async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if ( !email ) {
      return res.status(400).json({ message: "Email is required to send OTP." });
    }

    const exists = await Customer.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = {
      userName,
      email,
      password: hashedPassword,
      otp,
      expires: Date.now() + 5 * 60 * 1000,
      verified: false
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email",
      html: `<h3>Welcome, ${userName}!</h3>
            <p>Your OTP code</p>
            <p>Your OTP for registration is: <b>${otp}</b></p><p>Valid for 5 minutes.</p>`,
    });

    res.status(201).json({ message: "Verification email sent! Please check your inbox." });
    } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpData = otpStore[email];

    if (!otpData) return res.status(400).json({ message: "OTP expired or invalid." });
    if (otpData.otp !== otp) return res.status(400).json({ message: "Invalid OTP." });
    if (otpData.expires < Date.now()) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired." });
    }
    otpData.verified = true;
    res.json({ message: "Email verified!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/finalize-signup", async (req, res) => {
  try {
    const { email, userName, password } = req.body;
    const otpData = otpStore[email];

    if (!otpData || !otpData.verified) {
      return res.status(400).json({ message: "Email not verified yet." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Customer({
      userName: userName || otpData.userName,
      email: otpData.email,
      password: hashedPassword || otpData.password,
      verified: true,
    });

    await newUser.save();
    delete otpStore[email];

    res.json({
      message: "Registration complete! You can now log in.",
      userId: newUser._id
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Customer.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role || "user" }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        verified: user.verified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Customer.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 1000 * 60 * 15; // valid for 15 minutes
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const VERCELUSER = process.env.VERCEL_USER;
    const resetLink = `${VERCELUSER}/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      html: `<p>Click below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link expires in 15 minutes.</p>`,
    });

    res.json({ message: "Password reset email sent!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Reset Password (when user submits new password)
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await Customer.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;