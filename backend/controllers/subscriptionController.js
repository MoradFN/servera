import { createStripeSubscription } from "../services/subscriptionService.js";
import { sendSuccessResponse } from "../utils/responseUtils.js";

export const createSubscription = async (req, res, next) => {
  try {
    const { planId } = req.body; // Plan ID from the frontend
    const restaurantId = req.user.id; // From the JWT payload

    // Create subscription and save details in the database
    const subscription = await createStripeSubscription(restaurantId, planId);

    sendSuccessResponse(res, "Subscription created successfully", subscription);
  } catch (err) {
    next(err);
  }
};
