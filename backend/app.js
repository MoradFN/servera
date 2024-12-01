import express from "express";
import testRoute from "./routes/testRoute.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(express.json());

// Mount routes
app.use("/api", testRoute);

// Centralized error handling
app.use(errorHandler);

export default app;
