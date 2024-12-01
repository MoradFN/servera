import express from "express";
import dotenv from "dotenv";
import testRoute from "./routes/testRoute.js"; // Import your route module

dotenv.config();

const app = express();
const port = 8081;

// Middleware for parsing JSON
app.use(express.json());

// Mount your routes
app.use("/api", testRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Internal Server Error", message: err.message });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
