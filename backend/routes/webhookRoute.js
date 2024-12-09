import express from "express";
import Stripe from "stripe";

const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  (req, res) => {
    try {
      const event = JSON.parse(req.body.toString("utf8"));
      console.log("Webhook Event Received:", event);

      res.sendStatus(200);
    } catch (err) {
      console.error("Failed to parse webhook event:", err.message);
      res.sendStatus(400);
    }
  }
);

export default router;
