export const stripeEvents = async (event) => {
  const { type, data } = event;
  const subscription = data.object;

  switch (type) {
    case "customer.subscription.created":
      //   console.log(`Subscription Created: ${subscription.id}`);
      break;
    case "invoice.payment_succeeded":
      //   console.log(`Payment Succeeded: ${subscription.subscription}`);
      break;
    case "invoice.payment_failed":
      //   console.error(`Payment Failed: ${subscription.subscription}`);
      break;
    default:
      console.log(type);
    //   console.log(`Unhandled Event Type: ${type}`);
  }
};
