import { updateSubscriptionStatus } from "../models/subscriptionModel.js";
////MTTODO: CRITICAL! ERROR CHECK - BEST PRACTICE ETC.
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
    case "invoice.payment_failed":
      try {
        console.error("❌ EVENT: invoice.payment_failed");
        console.error(
          `❌ Payment Failed for Subscription: ${eventData.subscription}`
        );

        await updateSubscriptionStatus({
          stripeSubscriptionId: eventData.subscription,
          status: "past_due",
        });

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
