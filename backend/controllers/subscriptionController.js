import { createStripeSubscription } from "../services/subscriptionService.js";
import { sendSuccessResponse } from "../utils/responseUtils.js";
//MTTODO CHECK controller createSubscription.

export const createSubscription = async (req, res, next) => {
  try {
    const { planId, paymentMethodId } = req.body; // Plan ID and Payment Method ID from the frontend
    const restaurantId = req.user.id; // From the JWT payload

    if (!planId || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID and Payment Method ID are required",
      });
    }

    // Call service to create the subscription
    const subscription = await createStripeSubscription(
      restaurantId,
      planId,
      paymentMethodId
    );

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
