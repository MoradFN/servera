import express from "express";

import dotenv from "dotenv";

import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middleware/errorHandler.js";
//
import testRoute from "./routes/testRoute.js";
import authRoute from "./routes/authRoute.js";
import restaurantRoute from "./routes/restaurantRoute.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";

dotenv.config();
//
const app = express();

// Environment-specific configurations för cors, anslutning mellan frontend och backend.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"]; // Default to localhost if not set

console.log("Allowed Origins:", allowedOrigins); // Log for debugging

// HÄMTA ALLOWED ORIGINS FRÅN ENV.
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // no clutter in prod mode.
      if (process.env.NODE_ENV === "development") {
        console.error(`CORS Error: Origin ${origin} is not allowed`); // DEBUG ORIGIN, VAR DEN FAILAR.
      }
      callback(new Error("Not allowed by CORS")); // Generic error message for the client.
    }
  },
  credentials: true,
};

// Middlewares
app.use(express.json());
app.use(cors(corsOptions)); // MTTODO: CORS middleware
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/restaurants", restaurantRoute);
app.use("/api/subscriptions ", subscriptionRoutes);

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
