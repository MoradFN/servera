import express from "express";
import { createPageHandler } from "../controllers/pageController.js";
import { verifyJWT, verifyOwnership } from "../middleware/authMiddleware.js";

const router = express.Router();

// Correct Route Definition
router.post("/:slug", verifyJWT, verifyOwnership, createPageHandler);

export default router;
