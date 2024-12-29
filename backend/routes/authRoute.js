import express from "express";
import {
  checkOwnership,
  checkSubscriptionStatus,
  loginRestaurant,
  logout,
  registerRestaurant,
} from "../controllers/authController.js";
import {
  registerValidationRules,
  loginValidationRules,
} from "../validators/authValidators.js";
import { runValidations } from "../middleware/validationMiddleware.js";

import {
  requireActiveSubscription,
  verifyJWT,
  verifyOwnership,
} from "../middleware/authMiddleware.js";
import { checkAuth } from "../controllers/authController.js";

const router = express.Router();

router.post(
  "/register",
  runValidations(registerValidationRules),
  registerRestaurant
);
router.post("/login", runValidations(loginValidationRules), loginRestaurant);
router.post("/logout", logout);

// Protected route to check if logged in
router.get("/is-authenticated", verifyJWT, checkAuth);

// Protected route to check ownership
router.get("/:slug/is-owner", verifyJWT, verifyOwnership, checkOwnership);

// Protected route to check subscription status
router.get(
  "/subscription-status",
  verifyJWT,
  requireActiveSubscription,
  checkSubscriptionStatus
);

export default router;

// MTTODO: Consider grouping related routes under an /auth path prefix in the main app, e.g., /auth/register, /auth/login.
