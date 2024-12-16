import express from "express";

import { verifyJWT } from "../middleware/authMiddleware.js";
import { findRestaurantById } from "../models/restaurantModel.js";
import {
  getRestaurant,
  getSubscribedRestaurants,
} from "../controllers/restaurantController.js";
const router = express.Router();

//MTTODO: check for redundancy with authRoutes.js and add error handling.
router.get("/restaurantdata", verifyJWT, async (req, res, next) => {
  try {
    const restaurant = await findRestaurantById(req.user.id);

    const userData = {
      name: restaurant.name,
      email: restaurant.email,
      slug: restaurant.slug,
      stripeCustomerId: restaurant.stripe_customer_id,
    };

    res.json({ success: true, data: userData });
  } catch (err) {
    next(err);
  }
});

router.get("/subscribed", getSubscribedRestaurants);

export default router;
