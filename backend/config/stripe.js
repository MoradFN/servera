import Stripe from "stripe";

// Load Stripe API configuration
const apiKey = process.env.STRIPE_SECRET_KEY;
const apiVersion =
  process.env.STRIPE_API_VERSION ||
  (() => {
    console.warn(
      "STRIPE_API_VERSION is not set. Defaulting to '2024-09-30.acacia'."
    );
    return "2024-09-30.acacia";
  })();

// Validate environment variables
if (!apiKey) {
  throw new Error(
    "Stripe API key (STRIPE_SECRET_KEY) is missing from environment variables."
  );
}

// Initialize Stripe
const stripe = new Stripe(apiKey, {
  apiVersion,
});

// Log initialization (only in non-production environments)
if (process.env.NODE_ENV !== "production") {
  console.log("Stripe initialized with API version:", apiVersion);
}

export default stripe;
