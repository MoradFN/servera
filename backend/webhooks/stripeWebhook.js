export const webhookEvents = async (event) => {
  const { type, data } = event;
  const subscription = data.object;

  switch (type) {
    case "customer.subscription.created":
      console.log(
        `Subscription Created: ${subscription.id} , Body from Subscription created: ${req.body}`
      );
      break;
    case "invoice.payment_succeeded":
      console.log(
        `Payment Succeeded: ${subscription.subscription}  , Body from payment succeded: ${req.body}`
      );
      break;
    case "invoice.payment_failed":
      console.error(
        `Payment Failed: ${subscription.subscription} , Body from Payment Failed: ${req.body}`
      );
      break;
    default:
      console.log(req.body.type);
      console.log(`Unhandled Event Type: ${type}`);
  }
};
