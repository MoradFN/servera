import express from "express";
import testRoute from "./routes/testRoute.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(express.json());

// Mount routes
app.use("/api", testRoute);

// Catch-all for 404 errors
app.use((req, res, next) => {
  const err = new Error("API not found");
  err.status = 404;
  next(err); // Pass to the error handler
});

// Centralized error handling
app.use(errorHandler);

export default app;
