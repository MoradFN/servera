import { createStripeSubscription } from "../services/subscriptionService.js";
import { sendSuccessResponse } from "../utils/responseUtils.js";
//MTTODO CHECK controller createSubscription.
export const createSubscription = async (req, res, next) => {
  try {
    const { planId } = req.body; // Plan ID from the frontend
    const restaurantId = req.user.id; // From the JWT payload

    if (!planId) {
      return res
        .status(400)
        .json({ success: false, message: "Plan ID is required" });
    }

    // Call service to create the subscription
    const subscription = await createStripeSubscription(restaurantId, planId);

    sendSuccessResponse(
      res,
      "Subscription created successfully",
      subscription,
      201
    );
  } catch (err) {
    next(err);
  }
};
