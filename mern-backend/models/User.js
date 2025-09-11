const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  sponsorId: { type: String, required: true },
  sponsorName: { type: String, required: true },
  userName: { type: String, required: true },
  memberId: { type: String, unique: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  verified: { type: Boolean, default: false },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "sub-admin", "admin"], default: "user" },
  
  resetToken: String,
  resetTokenExpires: Date,
  
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);