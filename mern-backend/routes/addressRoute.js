const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// Add a new address 
router.post("/add", async (req, res) => {
  const { userId, address } = req.body;

  try {
    const user = await Customer.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses.push(address);
    await user.save();

    res.status(200).json({ message: "Address added", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const user = await Customer.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/:userId/:addressId", async (req, res) => {
  const { userId, addressId } = req.params;

  try {
    const user = await Customer.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    await user.save();
    res.json({ message: "Address deleted successfully", addresses: user.addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
