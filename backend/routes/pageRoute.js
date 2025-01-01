import express from "express";
import {
  createPageHandler,
  updateMenuDataHandler,
} from "../controllers/pageController.js";
import { fetchPageHandler } from "../controllers/pageController.js";
import { fetchMenuPageHandler } from "../controllers/pageController.js";
import { updatePageSectionsHandler } from "../controllers/pageController.js";
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

router.put(
  "/:slug/:pageName/sections",
  verifyJWT,
  verifyOwnership,
  requireActiveSubscription,
  updatePageSectionsHandler
);

router.put(
  "/:slug/menu",
  verifyJWT,
  verifyOwnership,
  requireActiveSubscription,
  updateMenuDataHandler
);

router.get("/:slug/home", fetchPageHandler);
router.get("/:slug/about", fetchPageHandler);
router.get("/:slug/menu", fetchMenuPageHandler);

// router.get("/:slug/menu", fetchPageHandler);
export default router;
