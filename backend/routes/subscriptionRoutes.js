import express from "express";
import { createSubscription } from "../controllers/subscriptionController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to create a subscription (protected by JWT middleware)
router.post("/subscribe", verifyJWT, createSubscription);

export default router;
