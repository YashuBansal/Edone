const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// ✅ Get all orders for a specific user
router.post("/", async (req, res) => {
  try {
     const { userId, items, total, paymentId, address } = req.body;
    const order = await Order.create({
      userId,
      items,
      total,
      paymentId,
      address,
      status: "Processing",
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to create order" });
  }
});


router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.put("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // prevent double cancel
    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    order.status = "Cancelled"; // ✅ update status
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    console.error("❌ Cancel Order Error:", err);
    res.status(500).json({ message: "Failed to cancel order" });
  }
});

// router.delete("/:orderId", async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     await Order.findByIdAndDelete(orderId);
//     res.json({ message: "Order deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to delete order" });
//   }
// });

module.exports = router;
