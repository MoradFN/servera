import express from "express";
import pool from "../config/database.js";
import { getTestData } from "../controllers/testController.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyJWT } from "../middleware/authMiddleware.js";

dotenv.config();
const router = express.Router();

// Test database connection
router.get("/", getTestData);

// Health check route
router.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ success: true, message: "Server is healthy" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// Test verifyJWT middleware
router.get("/verifyJWT", verifyJWT, (req, res) => {
  res.json({ success: true, message: "JWT verified" });
});

// JWT token route

router.get("/token", (req, res) => {
  const token = jwt.sign(
    { id: 1, email: "test@example.com" }, // Payload
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ token });
});

export default router;
