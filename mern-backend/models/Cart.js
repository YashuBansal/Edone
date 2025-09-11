const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, min: 0, max: 100, default: 0 },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  stock: { type: Number, min: 0 },
  sizes: { type: [String], default: [] },
  colors: { type: [String], default: [] },
  selectedColor: { type: String, default: "" },
  selectedSize: { type: String, default: "" },
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [cartItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Cart", cartSchema);
