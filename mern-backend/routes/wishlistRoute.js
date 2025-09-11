const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// ✅ Get user's wishlist
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    let wishlist = await Wishlist.findOne({ userId }).populate("products.productId");
    if (!wishlist) wishlist = { products: [] };
    res.json({ products: wishlist.products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
});

// ✅ Add product to wishlist
router.post("/add", async (req, res) => {
  try {
    const { userId, productId } = req.body;
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) wishlist = new Wishlist({ userId, products: [] });

    const exists = wishlist.products.some(
      (p) => p.productId.toString() === productId
    );
    if (!exists) wishlist.products.push({ productId });

    await wishlist.save();
    res.json({ message: "Added to wishlist", products: wishlist.products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
});

// ✅ Remove product from wishlist
router.delete("/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter(
      (p) => p.productId.toString() !== productId
    );
    await wishlist.save();
    res.json({ message: "Removed from wishlist", products: wishlist.products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove from wishlist" });
  }
});

module.exports = router;
