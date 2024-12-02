import express from "express";

import testRoute from "./routes/testRoute.js";
import authRoute from "./routes/authRoute.js";
import restaurantRoute from "./routes/restaurantRoute.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/restaurants", restaurantRoute);

app.use("/api/test", testRoute);

// Catch-all for 404 errors
app.use((req, res, next) => {
  const err = new Error("API not found");
  err.status = 404;
  next(err); // Pass to the error handler
});

// Centralized error handling
app.use(errorHandler);

export default app;
