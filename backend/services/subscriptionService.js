import stripe from "../config/stripe.js";
import {
  findSubscriptionByRestaurantId,
  createSubscriptionInDb,
  updateSubscriptionInDb,
} from "../models/subscriptionModel.js";
import { findRestaurantById } from "../models/restaurantModel.js";
import { updateRestaurantStripeCustomerId } from "../models/restaurantModel.js";

// Uses idempotency keys when creating Stripe customers and subscriptions:
// For customers: idempotencyKey: customer_creation_<restaurantId>.
// For subscriptions: idempotencyKey: subscription_creation_<restaurantId>_<planId>.
// Benefit:
// Prevents duplicate Stripe customers or subscriptions, even if the request is retried.

// FUTURE IMPLEMENTATIONS:
// Webhook Flow:
// Listen to subscription-related events like:
// customer.subscription.created
// customer.subscription.updated
// customer.subscription.deleted
// Update subscriptions table with the details from Stripe’s payload.
// TRIAL WAS ONLY FOR TEST PURPOSES
// Minimal Database Updates
// Only store values you need for internal application logic, like restaurant_id, stripe_customer_id, and stripe_subscription_id.
// Query Stripe dynamically for other fields, such as status, plan, or trial dates.

export const createStripeSubscription = async (restaurantId, planId) => {
  // Fetch restaurant details
  const restaurant = await findRestaurantById(restaurantId);
  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  let stripeCustomerId;

  // Check if the restaurant already has a Stripe customer
  if (restaurant.stripe_customer_id) {
    stripeCustomerId = restaurant.stripe_customer_id;
  } else {
    // Create a new Stripe customer
    const customer = await stripe.customers.create(
      {
        name: restaurant.name,
        email: restaurant.email,
      },
      {
        idempotencyKey: `customer_creation_${restaurantId}`, // Ensure no duplicate customers
      }
    );
    stripeCustomerId = customer.id;

    // Save the Stripe customer ID in the database
    await updateRestaurantStripeCustomerId(restaurantId, stripeCustomerId);
  }

  // Check for an existing subscription for the restaurant
  const existingSubscription = await findSubscriptionByRestaurantId(
    restaurantId
  );

  // Generate a unique idempotency key for subscription creation
  const idempotencyKey = `subscription_creation_${restaurantId}_${planId}_${Date.now()}`;

  // Create the Stripe subscription (with trial)
  const stripeSubscription = await stripe.subscriptions.create(
    {
      customer: stripeCustomerId,
      items: [{ price: planId }],
      trial_period_days: 7, // Temporary trial period for testing
    },
    {
      idempotencyKey, // Use the dynamically generated idempotency key
    }
  );

  // Decide whether to create or update the subscription in the database
  if (existingSubscription) {
    // Update the existing subscription record
    await updateSubscriptionInDb(restaurantId, {
      stripeSubscriptionId: stripeSubscription.id,
      plan: planId,
      status: "trial", // Update status to trial
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });
  } else {
    // Create a new subscription record
    await createSubscriptionInDb({
      restaurantId,
      stripeSubscriptionId: stripeSubscription.id,
      plan: planId,
      status: "trial", // Set initial status to trial
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });
  }

  return {
    stripeCustomerId,
    stripeSubscriptionId: stripeSubscription.id,
    status: "trial",
  };
};
