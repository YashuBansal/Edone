const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();
const Admin = require("./models/Admin");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://edone-admin.vercel.app",
  "https://edone-tau.vercel.app",
];

// Middleware

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));


// const createAdmin = async () => {
//   const adminEmail = process.env.EMAIL_USER;
//   const existingAdmin = await Admin.findOne({ email: adminEmail });

//   if (!existingAdmin) {
//     const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10); // change password
//     await Admin.create({
//       uesrName: "Company",
//       mainId: "ADMIN",
//       email: adminEmail,
//       password: hashedPassword,  
//       role: "admin"
//     });
//     console.log("✅ Admin account created");
//   } else {
//     console.log("✅ Admin account already exists");
//   }
// };
// createAdmin();

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/authcustom", require("./routes/authRoute"));
app.use("/api/categories", require("./routes/categoryRoute"));
app.use("/api/subcategories", require("./routes/subCategoryRoute"));
app.use("/api/product", require("./routes/productRoute"));
app.use("/api/adminusers", require("./routes/userRoute"))
app.use("/api/orders", require("./routes/orderRoute"));
app.use("/api/cart", require("./routes/cartRoute"));
app.use("/api/address", require("./routes/addressRoute"));
app.use("/api/wishlist", require("./routes/wishlistRoute"));
app.use("/api/payment", require("./routes/paymentRoute"));


// Test route
app.get("/", (req, res) => res.send("Backend is running..."));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
