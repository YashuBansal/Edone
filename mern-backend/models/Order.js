const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: String,
        name: String,
        image: String,
        price: Number,
        quantity: Number,
      },
  ],
  total: Number,
  paymentId: String,
  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Processing",
  },
  address: Object,
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
