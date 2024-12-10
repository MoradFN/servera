import { processStripeEvent } from "../webhooks/stripeWebhook.js";

export const handleWebhook = async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString("utf8"));
    console.log("Webhook Event Received:", event);

    await processStripeEvent(event); // Delegate to the webhook handler

    res.sendStatus(200); // Acknowledge receipt to Stripe
  } catch (err) {
    console.error("Webhook Handling Error:", err.message);
    res.sendStatus(400); // Respond with 400 if parsing or processing fails
  }
};
