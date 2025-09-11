const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Admin = require("../models/Admin");
require("dotenv").config();


const otpStore = {}; 
router.post("/register", async (req, res) => {
  try {
    const { sponsorId, sponsorName, userName, email, phone, password } = req.body;

    if ( !email ) {
      return res.status(400).json({ message: "Email is required to send OTP." });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = {
      sponsorId,
      sponsorName,
      userName,
      email,
      phone,
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
      html: `<h3>Welcome, ${sponsorName}!</h3>
            <p>Your OTP code</p>
            <p>Your OTP for registration is: <b>${otp}</b></p><p>Valid for 5 minutes.</p>`,
    });

    res.status(201).json({ message: "Verification email sent! Please check your inbox." });
    } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/get-sponsor/:sponsorId", async (req, res) => {
  try {
    const { sponsorId } = req.params;
    const sponsor = await User.findOne({ memberId: sponsorId });

    if (!sponsor) {
      return res.status(404).json({ message: "Sponsor not found" });
    }

    res.json({ sponsorName: sponsor.userName }); // or whatever field holds name
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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
    const { email } = req.body;
    const otpData = otpStore[email];

    if (!otpData || !otpData.verified) {
      return res.status(400).json({ message: "Email not verified yet." });
    }

     if (
      !otpData.sponsorId ||
      !otpData.sponsorName ||
      !otpData.phone ||
      !otpData.password ||
      !otpData.userName
    ) {
      return res.status(400).json({ message: "All fields are required to complete signup." });
    }

    const lastUser = await User.findOne({ memberId: { $regex: /^USER\d+/ } })
      .sort({ createdAt: -1 });  // get the latest registered user
    let nextId = "USER1001";

    if (lastUser && lastUser.memberId) {
      const lastNum = parseInt(lastUser.memberId.replace("USER", ""), 10);
      nextId = `USER${lastNum + 1}`;
    }

    const newUser = new User({
      sponsorId: otpData.sponsorId,
      sponsorName: otpData.sponsorName,
      memberId: nextId,
      userName: otpData.userName,
      email: otpData.email,
      phone: otpData.phone,
      password: otpData.password,
      verified: true,
    });

    await newUser.save();
    delete otpStore[email]; // clear temp storage

    res.json({
      message: "Registration complete! You can now log in.",
      memberId: newUser.memberId
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/admin-login", async (req, res) => {
  try {
    const { mainId, password } = req.body;
    const admin = await Admin.findOne({ mainId });
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        userName: admin.userName,
        mainId: admin.mainId
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { memberId, password } = req.body;

    const user = await User.findOne({ memberId });
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
        memberId: user.memberId,
        sponsorId: user.sponsorId,
        sponsorName: user.sponsorName,
        email: user.email,
        role: user.role || "user",
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
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
    const VERCELSUB = process.env.VERCEL_SUB;
    const resetLink = `${VERCELSUB}/reset-password/${token}`;

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

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }, // check token validity
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
