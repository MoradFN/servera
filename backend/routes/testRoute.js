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

router.post("/detachPaymentMethod", async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: "Payment Method ID is required.",
      });
    }

    // Detach payment method from the customer (Stripe will handle it automatically)
    const detachedPaymentMethod = await stripe.paymentMethods.detach(
      paymentMethodId
    );

    res.status(200).json({
      success: true,
      message: "Payment method successfully detached.",
      detachedPaymentMethod,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to detach payment method.",
      error: err.message,
    });
  }
});

router.get("/stripe", async (req, res) => {
  try {
    // Make a simple call to list products
    const products = await stripe.products.list({ limit: 1 });
    res.json({
      success: true,
      data: products.data,
    });
  } catch (error) {
    console.error("Error connecting to Stripe:", error);
    res.status(500).json({
      success: false,
      message: "Failed to connect to Stripe",
      error: error.message,
    });
  }
});

// Create a test customer route
router.post("/create-customer", async (req, res) => {
  try {
    const { email, name } = req.body;
    const customer = await stripe.customers.create({
      email,
      name,
    });
    res.json({ success: true, customer });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({
      success: false,
      message: "Error creating customer",
      error: error.message,
    });
  }
});

export default router;
