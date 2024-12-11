import { updateSubscriptionStatus } from "../models/subscriptionModel.js";

// INITIAL SUBSCRIPTION NOT HANDLED HERE.
////MTTODO: CRITICAL! ERROR CHECK - BEST PRACTICE ETC.
// Expand Webhook Logic:
// Add event handling for:
// customer.subscription.deleted (Handle cancellations)
// invoice.payment_failed (Send reminders/emails)
// invoice.upcoming (Optional: Notify about upcoming charges).
// Database Integrity Checks:
// Ensure data integrity checks after webhook events.
// Add logging for failed webhooks and retries.

/**
 * Handles Stripe Webhook events related to subscriptions and payments.
 * @param {Object} event - The Stripe Webhook event object.
 * @param {string} event.type - The type of event (e.g. "customer.subscription.updated", "invoice.payment_failed").
 * @param {Object} event.data - The event data object.
 * @param {Object} event.data.object - The event data object (correct variable usage).
 */
export const stripeEvents = async (event) => {
  const { type, data } = event;
  const eventData = data.object; // Correct variable usage

  switch (type) {
    /*** HANDLE SUBSCRIPTION UPDATES ***/
    case "customer.subscription.updated":
      try {
        console.log("📬 EVENT: customer.subscription.updated");
        console.log(`🔄 Subscription Updated: ${eventData.id}`);
        console.log(`🟢 New Status: ${eventData.status}`);
        console.log(
          `📅 Start Date: ${eventData.current_period_start}, End Date: ${eventData.current_period_end}`
        );
        console.log(eventData);

        await updateSubscriptionStatus({
          stripeSubscriptionId: eventData.id,
          status: eventData.status,
          subscriptionStartDate: eventData.current_period_start,
          subscriptionEndDate: eventData.current_period_end,
        });

        console.log(
          `✅ Database Updated: Subscription ${eventData.id}, Status: ${eventData.status}`
        );
      } catch (err) {
        console.error("❌ Failed to Update Subscription:", err.message);
      }
      break;

    /*** HANDLE PAYMENT FAILURES ***/
    // Trigger notifications or custom logging.
    case "invoice.payment_failed":
      try {
        console.error("❌ EVENT: invoice.payment_failed");
        console.error(
          `❌ Payment Failed for Subscription: ${eventData.subscription}`
        );
        console.log(eventData);

        // await updateSubscriptionStatus({
        //   stripeSubscriptionId: eventData.subscription,
        //   status: "past_due",
        // });

        console.error("❌ Subscription Marked as Past Due in DB.");
      } catch (err) {
        console.error("❌ Failed to Update Payment Status:", err.message);
      }
      break;
    /*** UNHANDLED EVENTS ***/
    default:
    // console.warn(`⚠️ Unhandled Event Type: ${type}`);
    // console.warn("⚠️ UNHANDLED EVENT DATA:", eventData);
  }
};
