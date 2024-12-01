import app from "./app.js";
import pool from "./config/database.js";

const PORT = process.env.PORT;

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}/`);
});

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Closing server and database pool (SIGTERM)...");
  server.close(() => {
    pool.end().then(() => {
      console.log("Database pool closed");
      process.exit(0);
    });
  });
});

// process.on("SIGTERM", shutdownHandler);
// process.on("SIGINT", shutdownHandler);
