const express = require("express");
const Cart = require("../models/Cart");
const router = express.Router();

// Get cart
router.get("/:userId", async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart)
      cart = await Cart.create({ userId: req.params.userId, items: [] });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Add item
router.post("/:userId/add", async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, name, price, discount, image, stock, quantity, selectedColor, selectedSize } = req.body;
    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart)
      cart = await Cart.create({ userId, items: [] });

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId && item.selectedColor === selectedColor && item.selectedSize === selectedSize
    );
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({
        productId,
        name,
        price,
        discount,
        quantity,
        image,
        stock,
        selectedSize,
        selectedColor,
      });
    }
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update qty
router.put("/:userId/update", async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, selectedColor, selectedSize, quantity } = req.body;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (item) => item.productId.toString() === productId && item.selectedColor === selectedColor && item.selectedSize === selectedSize
    );

    if (item) item.quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Remove item
router.post("/:userId/remove/:productId", async (req, res) => {
  try {
    const { productId, selectedColor, selectedSize } = req.body;
    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId || item.selectedColor !== selectedColor || item.selectedSize !== selectedSize
    );
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Clear cart
router.delete("/:userId/clear", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
