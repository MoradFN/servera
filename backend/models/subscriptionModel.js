import pool from "../config/database.js";

// Find subscription by restaurant ID
export const findSubscriptionByRestaurantId = async (restaurantId) => {
  const query = `SELECT * FROM subscriptions WHERE restaurant_id = ?`;
  const [results] = await pool.query(query, [restaurantId]);
  return results[0];
};

// Create a new subscription in the database
export const createSubscriptionInDb = async (subscriptionData) => {
  const { restaurantId, stripeCustomerId, stripeSubscriptionId, plan, status } =
    subscriptionData;
  const query = `
        INSERT INTO subscriptions (restaurant_id, stripe_customer_id, stripe_subscription_id, plan, status)
        VALUES (?, ?, ?, ?, ?)
    `;
  await pool.query(query, [
    restaurantId,
    stripeCustomerId,
    stripeSubscriptionId,
    plan,
    status,
  ]);
};

// Update subscription in the database
export const updateSubscriptionInDb = async (restaurantId, updateData) => {
  const {
    stripeSubscriptionId,
    status,
    subscriptionStartDate,
    subscriptionEndDate,
  } = updateData;
  const query = `
        UPDATE subscriptions
        SET stripe_subscription_id = ?, status = ?, subscription_start_date = ?, subscription_end_date = ?
        WHERE restaurant_id = ?
    `;
  await pool.query(query, [
    stripeSubscriptionId,
    status,
    subscriptionStartDate,
    subscriptionEndDate,
    restaurantId,
  ]);
};
