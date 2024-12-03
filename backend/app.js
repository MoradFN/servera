import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middleware/errorHandler.js";

import testRoute from "./routes/testRoute.js";
import authRoute from "./routes/authRoute.js";
import restaurantRoute from "./routes/restaurantRoute.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());

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
