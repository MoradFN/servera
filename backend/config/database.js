import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 100, // Justera beroende på expekterad trafik, standard är annars 10.
  queueLimit: 0, // queue,(Kö) 0 är unlimited.
});
// Export the pool for use in other modules
export default pool;
