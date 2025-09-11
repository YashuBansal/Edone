const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ✅ Get all users with "active" depending on if they have products
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const usersWithActive = await Promise.all(
      users.map(async (user) => {
        const productCount = await Product.countDocuments({ userId: user._id });
        return {
          ...user.toObject(),
          isActive: productCount > 0, // active if user has products
        };
      })
    );

    res.json(usersWithActive);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update user role only (no more active toggle)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete user
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
