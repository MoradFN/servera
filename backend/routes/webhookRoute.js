import express from "express";
import { handleStripeWebhook } from "../controllers/webhookController.js";
// import { handlePaypalWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// Stripe Webhook Route
router.post(
  "/stripe",
  express.raw({ type: "application/json" }), // Stripe requires raw payload
  handleStripeWebhook
);

//EXEMPEL:
// PayPal Webhook Route (expects parsed JSON)
// router.post(
//   "/paypal",
//   express.json(), // Standard JSON payload
//   handlePaypalWebhook
// );

// router.post(
//   "/stripe",
//   express.raw({ type: "application/json" }),
//   (req, res) => {
//     try {
//       const event = JSON.parse(req.body.toString("utf8"));
//       console.log("Webhook Event Received:", event);

//       res.sendStatus(200);
//     } catch (err) {
//       console.error("Failed to parse webhook event:", err.message);
//       res.sendStatus(400);
//     }
//   }
// );

export default router;
