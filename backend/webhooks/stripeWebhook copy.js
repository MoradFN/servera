import {
  createSubscriptionRecord,
  updateSubscriptionStatus,
} from "../models/subscriptionModel.js";

export const processStripeEvent = async (event) => {
  const { type, data } = event;
  const subscription = data.object;

  switch (type) {
    case "customer.subscription.created":
      console.log(
        `Subscription Created: ${subscription.id} , Body from Subscription created: ${req.body}`
      );
      await createSubscriptionRecord({
        stripeSubscriptionId: subscription.id,
        customerId: subscription.customer,
        planId: subscription.items.data[0].price.id,
        status: subscription.status,
        startDate: subscription.start_date,
        endDate: subscription.current_period_end,
      });
      break;

    case "invoice.payment_succeeded":
      console.log(
        `Payment Succeeded: ${subscription.subscription}  , Body from payment succeded: ${req.body}`
      );
      await updateSubscriptionStatus({
        stripeSubscriptionId: subscription.subscription,
        status: "active",
      });
      break;

    case "invoice.payment_failed":
      console.error(
        `Payment Failed: ${subscription.subscription} , Body from Payment Failed: ${req.body}`
      );
      await updateSubscriptionStatus({
        stripeSubscriptionId: subscription.subscription,
        status: "past_due",
      });
      break;

    default:
      console.log(req.body.type);
      console.log(`Unhandled Event Type: ${type}`);
  }
};
