export const handleStripeWebhook = (req, res) => {
  try {
    const event = JSON.parse(req.body.toString("utf8"));
    console.log("Stripe Webhook Event Received:", event);

    // Respond with success to Stripe
    res.sendStatus(200);
  } catch (err) {
    console.error("Failed to parse Stripe webhook event:", err.message);
    res.sendStatus(400); // Respond with 400 on failure
  }
};
