export const stripeEvents = async (event) => {
  const { type, data } = event;
  const eventData = data.object; // Correct variable usage

  switch (type) {
    case "customer.subscription.created":
      console.log("📬 EVENT: customer.subscription.created");
      console.log(`✅ Subscription Created: ${eventData.id}`);
      // FÖR ATT UPDATERA RESTEN AV TABELLEN VID SKAPANDE AV SUBSCRIPTION?, SOM TID OSV.
      // console.log("EVENT DATA:", eventData);
      break;

    case "customer.subscription.updated":
      console.log("📬 EVENT: customer.subscription.updated");
      console.log(`🔄 Subscription Updated: ${eventData.id}`);
      console.log(`🟢 New Status: ${eventData.status}`);

      // Update database directly based on subscription's current status
      // await updateSubscriptionStatus({
      //   stripeSubscriptionId: eventData.id,
      //   status: eventData.status, // Directly from Stripe
      // });

      console.log(
        `✅ Database Updated: Subscription ${eventData.id}, Status: ${eventData.status}`
      );
      break;

    // case "invoice.payment_succeeded":
    //   console.log("📬 EVENT: invoice.payment_succeeded");
    //   console.log(`💳 Payment Succeeded: ${eventData.id}`);
    //   console.log(`🔗 Subscription: ${eventData.subscription}`);
    //   console.log(`📄 Billing Reason: ${eventData.billing_reason}`);
    //   // console.log("EVENT DATA: ", eventData);

    //   if (eventData.billing_reason === "subscription_cycle") {
    //     console.log("♻️ Recurring Payment Succeeded:", eventData.subscription);
    //   } else if (eventData.billing_reason === "subscription_create") {
    //     console.log(
    //       "📦 Manual Subscription Payment Succeeded:",
    //       eventData.subscription
    //     );
    //   }

    //   break;

    case "invoice.payment_failed":
      console.error("❌ EVENT: invoice.payment_failed");
      console.error(
        `❌ Payment Failed for Subscription: ${eventData.subscription}`
      );
      console.error("❌ EVENT DATA:", eventData);
      break;

    default:
    // console.warn(`⚠️ Unhandled Event Type: ${type}`);
    // console.warn("⚠️ UNHANDLED EVENT DATA:", eventData);
  }
};
