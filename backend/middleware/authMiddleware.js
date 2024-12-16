import { verifyToken } from "../utils/tokenUtils.js";
import { createError } from "../utils/errorUtils.js";
import { findRestaurantBySlug } from "../models/restaurantModel.js";
import { findSubscriptionByRestaurantId } from "../models/subscriptionModel.js";

// MTTODO ALL BELOW:
// ???MTTODO: Consider grouping related middleware under an /auth path prefix in the main app, e.g., /auth/register, /auth/login.???

// Authentication Check
// Purpose: Ensure the user is logged in and the token is valid.
export const verifyJWT = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    return next(createError(401, "Authentication required"));
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return next(createError(401, "Invalid or expired token"));
  }
};
//
// Purpose: Ensure the logged-in restaurant owner is only accessing or modifying their own resources.
export const verifyOwnership = async (req, res, next) => {
  const { slug } = req.params; // Extract restaurant slug from the URL
  const userId = req.user.id; // Extract logged-in user ID from JWT

  try {
    // Find the restaurant by its slug
    const restaurant = await findRestaurantBySlug(slug);

    // Verify if the logged-in user is the owner
    if (!restaurant || restaurant.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not the owner of this restaurant.",
      });
    }

    req.restaurant = restaurant; // Attach restaurant info for further use
    next(); // Proceed if ownership is validated
  } catch (error) {
    console.error("Ownership validation failed:", error);
    res.status(500).json({
      success: false,
      message: "Server error while verifying ownership.",
    });
  }
};

export const requireActiveSubscription = async (req, res, next) => {
  const restaurantId = req.user.id; // From JWT
  try {
    const subscription = await findSubscriptionByRestaurantId(restaurantId);

    if (!subscription || subscription.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Active subscription required to access this resource.",
      });
    }

    req.subscription = subscription; // Attach subscription info if needed
    next(); // Allow access
  } catch (error) {
    console.error("Subscription check failed:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Soft Deletion or Inactive Accounts
// Purpose: Prevent access for accounts marked as inactive.
// Middleware Example:
export const checkAccountActive = (req, res, next) => {
  if (!req.user.is_active) {
    return res.status(403).json({
      success: false,
      message: "Your account is inactive. Please contact support.",
    });
  }
  next();
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 6. Public Access
// Purpose: Allow unauthenticated access to public-facing pages (e.g., /restaurantSlug).
// Implementation: No authentication or ownership check is required for these routes, but you must ensure data isolation (fetching only public data tied to the slug):
// router.get('/:slug/home', getPublicHomePage);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Example Combined Usage
// For a customization route:
// router.post(
//   '/api/restaurants/:id/customize',
//   authenticate,               // Ensure user is logged in
//   checkAccountActive,         // Ensure account is active
//   verifyOwnership,            // Ensure user owns the resource
//   requireActiveSubscription,  // Ensure subscription is active
//   customizePage               // Controller for customization
// );
