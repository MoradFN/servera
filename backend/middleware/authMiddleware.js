import { verifyToken } from "../utils/tokenUtils.js";
import { createError } from "../utils/errorUtils.js";

// Authentication Check
// Purpose: Ensure the user is logged in and the token is valid.
export const authenticate = (req, res, next) => {
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

// MTTODO ALL BELOW:
// ???MTTODO: Consider grouping related middleware under an /auth path prefix in the main app, e.g., /auth/register, /auth/login.???

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Not used, example code.
// Purpose: Ensure the logged-in restaurant owner is only accessing or modifying their own resources.
// Middleware Example:
export const verifyOwnership = (req, res, next) => {
  const { id } = req.params;
  if (req.user.id !== parseInt(id, 10)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to access this resource.",
    });
  }
  next();
};
// USAGE: router.post('/api/restaurants/:id/customize', authenticate, verifyOwnership, customizePage);
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
// Usage: Apply this middleware to all authenticated routes:
// router.post('/api/restaurants/:id/menu', authenticate, checkAccountActive, addMenuItem);
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
