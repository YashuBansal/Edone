const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");


// Initialize Razorpay instance
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create an order
router.post("/order", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: currency || "INR",
      receipt: "order_rcptid_" + Math.floor(Math.random() * 10000),
    };

    const order = await instance.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to create order" });
  }
});

router.post("/verify", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({message :"Error verifying payment", err : error});
  }
});

module.exports = router;
