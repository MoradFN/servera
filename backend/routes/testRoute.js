import express from "express";
import pool from "../config/database.js";
import { getTestData } from "../controllers/testController.js";

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

export default router;
