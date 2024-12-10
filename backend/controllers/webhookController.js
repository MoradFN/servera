import { webhookEvents } from "../webhooks/stripeWebhook.js";

export const stripeWebhookController = async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString("utf8"));
    console.log("Webhook Event Received:", event);

    await webhookEvents(event); // Delegate to the webhookEvents

    res.sendStatus(200); // Acknowledge receipt to Stripe
  } catch (err) {
    console.error("Webhook Handling Error:", err.message);
    res.sendStatus(400); // Respond with 400 if parsing or processing fails
  }
};
