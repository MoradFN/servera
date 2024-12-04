//Not used.
// 1. Subscription Status Check
// Purpose: Ensure the restaurant owner has an active subscription for premium features.
// Middleware Example:
export const requireActiveSubscription = (req, res, next) => {
  if (req.user.subscription_status !== "active") {
    return res.status(403).json({
      success: false,
      message: "Active subscription required to access this resource.",
    });
  }
  next();
};
// USAGE: router.post('/api/restaurants/:id/customize', authenticate, requireActiveSubscription, customizePage);
