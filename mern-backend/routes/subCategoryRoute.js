const express = require("express");
const router = express.Router();
const SubCategory = require("../models/SubCategory");
const { upload } = require("../config/cloudinary");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Get all subcategories
router.get("/", async (req, res) => {
  try {
    const subcategories = await SubCategory.find().populate("category", "title");
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subcategories", error });
  }
});

// Add new subcategory
router.post("/", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const { category, title, description, type, sizeGroup } = req.body;

    if (!category || !title || !description || !type || !sizeGroup || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const subCat = new SubCategory({
      category,
      title,
      description,
      type,
      sizeGroup,
      image: req.file.path,
      userId: req.user._id,
    });

    await subCat.save();
    res.status(201).json(subCat);
  } catch (error) {
    res.status(500).json({ message: "Failed to create subcategory", error });
  }
});

// Update subcategory
router.put("/:id", protect, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const { category, title, description, type, sizeGroup } = req.body;

    const existingSub = await SubCategory.findById(req.params.id);
    if (!existingSub) return res.status(404).json({ message: "Subcategory not found" });

    const updated = await SubCategory.findByIdAndUpdate(
      req.params.id,
      {
        category,
        title,
        description,
        type,
        sizeGroup,
        image: req.file ? req.file.path : existingSub.image, // keep old image if no new upload
      },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update subcategory", error });
  }
});

// Delete subcategory
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await SubCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete subcategory", error });
  }
});

module.exports = router;
