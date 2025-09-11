const express = require("express");
const router = express.Router();
// const multer = require("multer");
// const path = require("path");
const Category = require("../models/Category");
const Product = require("../models/Product");
const { upload } = require("../config/cloudinary");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({}).lean();
    res.json(categories);
  } catch (err) { 
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/product", async (req, res) => {
  try {
    const products = await Product.find({ categoryId: req.params.id, isApproved: true })
      .populate("categoryId subcategoryId", "title name");
      if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }
    res.json({products});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add new
router.post("/", protect, adminOnly, upload.single("image"), async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description || !req.file) {
    return res.status(400).json({ message: "All fields required" });
  }
  const newCat = new Category({ title, description, image: req.file.path, userId: req.user._id });
  await newCat.save();
  res.status(201).json(newCat);
});

// Update
router.put("/:id", protect, adminOnly, upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  const updateData = { title, description };
  if (req.file) {
    updateData.image = req.file.path; // New Cloudinary image URL
  }
  const updated = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.json(updated);
});

// Delete
router.delete("/:id", protect, adminOnly, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});



module.exports = router;
