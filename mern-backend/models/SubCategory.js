const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: { type: String, enum: ["Clothing", "Footwear"], required: true },
  sizeGroup: { type: String, enum: ["Adults", "Kids"], required: true },
});

module.exports = mongoose.model("SubCategory", SubCategorySchema);