import { Router } from "express";
import pool from "../config/database.js"; // Ensure this path is correct

const router = Router();

router.get("/test", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM test_table");
    res.status(200).json(rows); // Send the query result as a JSON response
  } catch (err) {
    next(err); // Pass the error to the middleware
  }
});

export default router;
