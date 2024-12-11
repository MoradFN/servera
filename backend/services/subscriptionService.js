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
 * Creates a Stripe subscription for a specified restaurant and plan.
 *
 * This function checks if the restaurant already has a Stripe customer ID.
 * If not, it creates a new Stripe customer and updates the restaurant's
 * record in the database with the newly created Stripe customer ID.
 *
 * If a payment method ID is provided, it attaches the payment method
 * to the Stripe customer and sets it as the default. If not provided,
 * it uses the existing default payment method for the customer.
 *
 * Subsequently, a Stripe subscription is created for the customer
 * with the specified plan, using idempotency keys to prevent duplicates.
 * The subscription details are then updated or created in the local database.
 *
 * @param {string} restaurantId - The ID of the restaurant.
 * @param {string} planId - The ID of the subscription plan.
 * @param {string} [paymentMethodId] - The ID of the payment method to attach and set as default.
 * @returns {Promise<Object>} - An object containing the Stripe customer ID, subscription ID, and subscription status.
 * @throws {Error} - Throws an error if the restaurant is not found, or if no default payment method exists when not provided.
 */
export const createStripeSubscription = async (
  restaurantId,
  planId,
  paymentMethodId
) => {
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
        idempotencyKey: `customer_creation_${restaurantId}`, // Ensure no duplicate customers /// MTTODO:Skapade problem när jag tog bort endast customer_id från databasen? om inte testa -> FIX --> annars validera i stripe om användaren finns?
      }
    );
    stripeCustomerId = customer.id;

    // Save the Stripe customer ID in the database
    await updateRestaurantStripeCustomerId(restaurantId, stripeCustomerId);
  }

  // Attach and set payment method if provided
  if (paymentMethodId) {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    console.log(
      `Provided payment method ${paymentMethodId} was attached and set as default.`
    ); //MTTODO: remove
  } else {
    // BELOW IS DEBUG - REMOVE LATER
    // Fetch the default payment method for the customer
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    const defaultPaymentMethod =
      customer.invoice_settings.default_payment_method;

    console.log(
      `No payment method provided. Using default payment method: ${defaultPaymentMethod}`
    );

    if (!defaultPaymentMethod) {
      throw new Error("No default payment method exists for this customer.");
    }
  }
  //ABOVE IS DEBUG - remove later

  // Create the Stripe subscription
  const stripeSubscription = await stripe.subscriptions.create(
    {
      customer: stripeCustomerId,
      items: [{ price: planId }],
    },
    {
      idempotencyKey: `subscription_creation_${restaurantId}_${planId}_${Date.now()}`, // Ensure no duplicate subscriptions
    }
  );

  // console.log("Stripe Subscription Created:", stripeSubscription);

  // Update or create subscription in the database

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
