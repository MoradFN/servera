import stripe from "../config/stripe.js";
import {
  findSubscriptionByRestaurantId,
  createSubscriptionInDb,
  updateSubscriptionInDb,
} from "../models/subscriptionModel.js";
import { findRestaurantById } from "../models/restaurantModel.js";

export const createStripeSubscription = async (restaurantId, planId) => {
  // Fetch restaurant details
  const restaurant = await findRestaurantById(restaurantId);
  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  // Check if a subscription already exists for this restaurant
  let existingSubscription = await findSubscriptionByRestaurantId(restaurantId);
  let stripeCustomerId;

  if (!existingSubscription) {
    // Create a new Stripe customer if not already present
    const customer = await stripe.customers.create({
      name: restaurant.name,
      email: restaurant.email,
    });
    stripeCustomerId = customer.id;

    // Save initial subscription record in the database
    await createSubscriptionInDb({
      restaurantId,
      stripeCustomerId,
      stripeSubscriptionId: null, // Will update this after subscription creation
      plan: planId,
      status: "inactive",
    });
  } else {
    // Use existing Stripe customer
    stripeCustomerId = existingSubscription.stripe_customer_id;
  }

  // Create Stripe subscription
  const stripeSubscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: planId }], // Replace with your Stripe price ID
    trial_period_days: 7, // Optional: Specify free trial days
  });

  // Update the subscription in the database
  await updateSubscriptionInDb(restaurantId, {
    stripeSubscriptionId: stripeSubscription.id,
    status: "active",
    subscriptionStartDate: new Date(),
    subscriptionEndDate: stripeSubscription.current_period_end * 1000, // Stripe gives a timestamp in seconds
  });

  return {
    stripeCustomerId,
    stripeSubscriptionId: stripeSubscription.id,
    status: "active",
  };
};
