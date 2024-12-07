import express from "express";
import pool from "../config/database.js";
import { getTestData } from "../controllers/testController.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyJWT } from "../middleware/authMiddleware.js";
import stripe from "../config/stripe.js";
import { findRestaurantById } from "../models/restaurantModel.js";

dotenv.config();
const router = express.Router();

// Test database connection
router.get("/", getTestData);

// Health check route
router.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ success: true, message: "Server is healthy" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// Test verifyJWT middleware
router.get("/verifyJWT", verifyJWT, (req, res) => {
  res.json({ success: true, message: "JWT verified" });
});

// JWT token route

router.get("/token", (req, res) => {
  const token = jwt.sign(
    { id: 1, email: "test@example.com" }, // Payload
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ token });
});

// Generate PaymentMethod ID for the logged-in user
router.post("/attachPaymentMethod/explicit", async (req, res) => {
  try {
    const { customerId, paymentMethodId } = req.body;

    if (!customerId || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and Payment Method ID are required.",
      });
    }

    // Attach payment method (Stripe will handle it automatically)
    const attachedPaymentMethod = await stripe.paymentMethods.attach(
      paymentMethodId,
      { customer: customerId }
    );

    res.status(200).json({
      success: true,
      message: "Payment method successfully attached.",
      attachedPaymentMethod,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to attach payment method.",
      error: err.message,
    });
  }
});

router.post("/attachPaymentMethod/logged-in", verifyJWT, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    const restaurantId = req.user.id; // Extracted from the JWT payload

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: "Payment Method ID is required.",
      });
    }

    // Fetch the customer's Stripe ID from the database
    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant || !restaurant.stripe_customer_id) {
      return res.status(404).json({
        success: false,
        message: "Customer not found or does not have a Stripe ID.",
      });
    }

    const stripeCustomerId = restaurant.stripe_customer_id;

    // Attach payment method to the customer
    const attachedPaymentMethod = await stripe.paymentMethods.attach(
      paymentMethodId,
      { customer: stripeCustomerId }
    );

    res.status(200).json({
      success: true,
      message: "Payment method successfully attached.",
      attachedPaymentMethod,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to attach payment method.",
      error: err.message,
    });
  }
});

export default router;
