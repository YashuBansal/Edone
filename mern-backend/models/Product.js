const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    features: { type: [String], default: [] },
    stock: { type: Number, default: 0 },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    onSale: { type: Boolean, default: false },
    images: [{ type: String }],
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
