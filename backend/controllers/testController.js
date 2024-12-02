import pool from "../config/database.js";

// Controller function to fetch test data
export async function getTestData(req, res, next) {
  try {
    const [rows] = await pool.query("SELECT * FROM restaurants");
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err); // Pass error to centralized error handler
  }
}
