import express from "express";
import { createPageHandler } from "../controllers/pageController.js";
import { fetchPageHandler } from "../controllers/pageController.js";
import { fetchMenuPageHandler } from "../controllers/pageController.js";
import {
  verifyJWT,
  verifyOwnership,
  requireActiveSubscription,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Correct Route Definition
router.post(
  "/:slug",
  verifyJWT,
  verifyOwnership,
  requireActiveSubscription,
  createPageHandler
);

router.get("/:slug/home", fetchPageHandler);
router.get("/:slug/about", fetchPageHandler);
// router.get("/:slug/menu", fetchPageHandler);
router.get("/:slug/menu", fetchMenuPageHandler);

export default router;
