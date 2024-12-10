// //Example

// import {
//   createSubscriptionRecord,
//   updateSubscriptionStatus,
// } from "../models/subscriptionModel.js";

// export const processSubscriptionCreated = async (subscription) => {
//   await createSubscriptionRecord({
//     stripeSubscriptionId: subscription.id,
//     customerId: subscription.customer,
//     planId: subscription.items.data[0].price.id,
//     status: subscription.status,
//     startDate: subscription.start_date,
//     endDate: subscription.current_period_end,
//   });
// };

// export const processPaymentSucceeded = async (subscription) => {
//   await updateSubscriptionStatus({
//     stripeSubscriptionId: subscription.subscription,
//     status: "active",
//   });
// };

// export const processPaymentFailed = async (subscription) => {
//   await updateSubscriptionStatus({
//     stripeSubscriptionId: subscription.subscription,
//     status: "past_due",
//   });
// };
