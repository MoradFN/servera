import app from "./app.js";
import pool from "./config/database.js";

const PORT = process.env.PORT;

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}/`);
});

// Define the reusable shutdownHandler
async function shutdownHandler() {
  console.log("Closing server and database pool...");
  server.close(() => {
    pool
      .end()
      .then(() => {
        console.log("Database pool closed");
        process.exit(0); // Exit with success
      })
      .catch((err) => {
        console.error("Error closing database pool:", err);
        process.exit(1); // Exit with failure
      });
  });
}

// Handle graceful shutdown for multiple signals
process.on("SIGTERM", shutdownHandler); // For termination (e.g., Kubernetes)
process.on("SIGINT", shutdownHandler); // For Ctrl+C (manual stop)
