import express from "express";
import { createPageHandler } from "../controllers/pageController.js";
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

export default router;
