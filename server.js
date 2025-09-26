const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const contactRoutes = require("./routes/contact");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("✅ Server is running! Welcome to SVF Backend ❤️");
});

// API Routes
app.use("/api/contact", contactRoutes);

// MongoDB connection
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("✅ Connected to MongoDB");
    })
    .catch((error) => {
      console.error("❌ MongoDB connection error:", error);
    });
} else {
  console.log("⚠️ No MONGO_URI provided, skipping MongoDB connection");
}

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
