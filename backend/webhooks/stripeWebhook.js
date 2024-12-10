export const stripeEvents = async (event) => {
  const { type, data } = event;
  const eventData = data.object; // Correct variable usage

  switch (type) {
    case "customer.subscription.created":
      console.log(`Subscription Created: ${eventData.id}`);
      console.log("EVENT DATA: customer.subscription.created", eventData);
      break;

    case "customer.subscription.updated":
      console.log(`Subscription Updated: ${eventData.id}`);
      console.log("EVENT DATA: customer.subscription.updated", eventData);
      break;

    case "invoice.payment_succeeded":
      console.log(
        `Payment Succeeded for Subscription: ${eventData.subscription}`
      );
      console.log("EVENT DATA: invoice.payment_succeeded", eventData);
      break;

    case "invoice.payment_failed":
      console.error(
        `Payment Failed for Subscription: ${eventData.subscription}`
      );
      console.error("EVENT DATA: invoice.payment_failed", eventData);
      break;

    default:
      console.log(`(WEBHOOK DEFAULT): Unhandled Event Type: ${type}`);
      console.log("(WEBHOOK DEFAULT): UNHANDELED EVENT DATA:", eventData);
  }
};
