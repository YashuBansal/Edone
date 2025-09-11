const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

// Add product
router.post("/", protect, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, stock, price, discount, categoryId, subcategoryId } = req.body;
    const features = Array.isArray(req.body.features)
      ? req.body.features
      : req.body.features
      ? [req.body.features]
      : [];
    const sizes = req.body.sizes ? JSON.parse(req.body.sizes) : [];
    const colors = req.body.colors ? JSON.parse(req.body.colors) : [];
    const images = req.files.map((f) => f.path);

    const product = new Product({ title,
      description,
      stock,
      price,
      discount: discount || 0,
      categoryId,
      subcategoryId,
      sizes,
      colors,
      features,
      images,
      userId: req.user._id,
    });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Invalid product data" });
  }
});

// Approve or unapprove a product (admin only)
router.put("/approve/:id", protect, adminOnly, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.isApproved = !product.isApproved;
  await product.save();

  res.json({
    message: `Product ${product.isApproved ? "approved" : "unapproved"}`,
    product,
  });
});

// Update product
router.put("/:id", protect, upload.array("images", 5), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    if (
      req.user.role !== "admin" &&
      product.userId.toString() !== req.user._id.toString()
    )
      return res.status(403).json({ message: "Not authorized" });

    const features = Array.isArray(req.body.features)
      ? req.body.features
      : req.body.features
      ? [req.body.features]
      : [];
    const sizes = req.body.sizes ? JSON.parse(req.body.sizes) : [];
    const colors = req.body.colors ? JSON.parse(req.body.colors) : [];
    const images = req.files.length ? req.files.map((f) => f.path) : product.images;
    
    product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, features, sizes, colors, images },
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete product
router.delete("/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Public - get approved products only
router.get("/approved/public", async (req, res) => {
  try {
    const products = await Product.find({ isApproved: true })
      .populate("categoryId subcategoryId userId", "title userName email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/approved/public/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isApproved: true,
    }).populate("categoryId subcategoryId userId", "title userName email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all products (admin sees all, user sees own)
router.get("/", protect, async (req, res) => {
  try {
    const products =
      req.user.role === "admin"
        ? await Product.find().populate("categoryId subcategoryId userId", "title userName email")
        : await Product.find({ userId: req.user._id }).populate(
            "categoryId subcategoryId userId",
            "title userName email"
          );
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
