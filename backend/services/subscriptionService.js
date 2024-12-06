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

//MTTODO - CRITICAL: VID ERROR SE STATUS ENUM I DB - kanske inte stämmer äöverens med de som skickas från STRIPE.

//MTTODO: BETTER ERROR HANDLING, and separation of code for createStripeSubscription

/**
 * Creates a new Stripe subscription for the given restaurant and plan.
 *
 * @param {number} restaurantId The ID of the restaurant to create a subscription for.
 * @param {string} planId The ID of the plan to subscribe to.
 *
 * @returns {Promise<{stripeCustomerId: string, stripeSubscriptionId: string, status: string}>}
 *
 * If the restaurant already has a Stripe customer, it will be reused.
 * If the restaurant does not have a Stripe customer, a new one will be created.
 * The function will ensure that there is only one subscription per restaurant-plan pair.
 * The function will return the Stripe customer ID, Stripe subscription ID, and the subscription status directly from Stripe.
 */
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

  // Create the Stripe subscription
  const stripeSubscription = await stripe.subscriptions.create(
    {
      customer: stripeCustomerId,
      items: [{ price: planId }],
      trial_period_days: 7, // Optional: Trial for testing
    },
    {
      idempotencyKey: `subscription_creation_${restaurantId}_${planId}_${Date.now()}`, // Ensure no duplicate subscriptions
    }
  );

  // Store only essential data in the database
  const existingSubscription = await findSubscriptionByRestaurantId(
    restaurantId
  );

  if (existingSubscription) {
    await updateSubscriptionInDb(restaurantId, {
      stripeSubscriptionId: stripeSubscription.id,
      plan: planId,
      status: stripeSubscription.status, // Get status directly from Stripe
    });
  } else {
    await createSubscriptionInDb({
      restaurantId,
      stripeSubscriptionId: stripeSubscription.id,
      plan: planId,
      status: stripeSubscription.status, // Get status directly from Stripe
    });
  }

  return {
    stripeCustomerId,
    stripeSubscriptionId: stripeSubscription.id,
    status: stripeSubscription.status, // Return Stripe's actual subscription status
  };
};
