import pool from "../config/database.js";
import { format } from "date-fns";

//MTTODO BETTER ERROR HANDLING

// Find subscription by restaurant ID
export const findSubscriptionByRestaurantId = async (restaurantId) => {
  const query = `SELECT * FROM subscriptions WHERE restaurant_id = ?`;
  const [results] = await pool.query(query, [restaurantId]);
  return results[0];
};

// Create a new subscription in the database
export const createSubscriptionInDb = async (subscriptionData) => {
  const {
    restaurantId,
    stripeSubscriptionId,
    plan,
    status,
    subscriptionStartDate,
    subscriptionEndDate,
  } = subscriptionData;

  const query = `
    INSERT INTO subscriptions 
    (restaurant_id, stripe_subscription_id, plan, status, subscription_start_date, subscription_end_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  await pool.query(query, [
    restaurantId,
    stripeSubscriptionId,
    plan,
    status,
    subscriptionStartDate,
    subscriptionEndDate,
  ]);
};

// Update subscription in the database //MTTODO:, kan ej va rätt att göra så, update och skapa duplicate i stripe?? if exists? wtf. SEE SERVICE.
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

////MTTODO: CRITICAL! ERROR CHECK - BEST PRACTICE ETC.
/// WEBHOOK EVENT // MTTODO CHECK OM JAG SKA GÖRA ERROR OCH BLOCKERA STRIPE OM DE INTE KAN SÄTTAS IN HÄR
export const updateSubscriptionStatus = async ({
  stripeSubscriptionId,
  status,
  subscriptionStartDate,
  subscriptionEndDate,
}) => {
  const query = `
    UPDATE subscriptions
    SET status = ?, subscription_start_date = ?, subscription_end_date = ?
    WHERE stripe_subscription_id = ?
  `;

  try {
    // Convert Unix timestamps to MySQL datetime format // MTTODO CHECK
    const formattedStartDate = subscriptionStartDate
      ? format(new Date(subscriptionStartDate * 1000), "yyyy-MM-dd HH:mm:ss")
      : null;

    const formattedEndDate = subscriptionEndDate
      ? format(new Date(subscriptionEndDate * 1000), "yyyy-MM-dd HH:mm:ss")
      : null;
    const [result] = await pool.query(query, [
      status,
      formattedStartDate || null,
      formattedEndDate || null,
      stripeSubscriptionId,
    ]);

    console.log("🔍 Query Result:", result);

    if (result.affectedRows === 0) {
      console.error(
        `❌ No Subscription Found in Database: ${stripeSubscriptionId}`
      );
      throw new Error(`No subscription found with ID ${stripeSubscriptionId}`);
    }

    console.log(`✅ Subscription ${stripeSubscriptionId} Updated Successfully`);
  } catch (err) {
    console.error("❌ Database Update Error:", err.message);
    throw err;
  }
};
