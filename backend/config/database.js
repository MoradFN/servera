import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

// Create the MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 100, // Standard increased for more traffic
  queueLimit: 0, // Unlimited queueing
});
export async function fetchAllFromTable(tableName) {
  try {
    const [rows] = await pool.query(`SELECT * FROM ${tableName}`);
    return rows;
  } catch (err) {
    throw new Error(`Failed to fetch data from ${tableName}: ${err.message}`);
  }
}

// Async function to test the database connection
export async function testDatabaseConnection() {
  try {
    const [rows] = await pool.query("SELECT * FROM test_table");
    console.log("Database query result:", rows);
  } catch (err) {
    console.error("Error executing query:", err);
  }
}

export default pool;
