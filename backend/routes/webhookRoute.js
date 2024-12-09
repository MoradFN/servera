import express from "express";
import Stripe from "stripe";

const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  (req, res) => {
    try {
      // Parse raw buffer to JSON
      const event = JSON.parse(req.body.toString("utf8"));
      console.log("Webhook Event Received:", event);

      // Respond with 200 to Stripe
      res.sendStatus(200);
    } catch (err) {
      console.error("Failed to parse webhook payload:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// router.post("/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);

export default router;
