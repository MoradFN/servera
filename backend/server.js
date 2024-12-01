import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 3001;

// Create the MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 100, // Standard increased for more traffic
  queueLimit: 0, // Unlimited queueing
});

// Async function to test the database connection
async function testDatabaseConnection() {
  try {
    const [rows] = await pool.query("SELECT * FROM test_table");
    console.log("Database query result:", rows);
  } catch (err) {
    console.error("Error executing query:", err);
  }
}

// Test the database connection on server startup
testDatabaseConnection();

// Express route for testing
app.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM test_table");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default pool;
