import express from "express";
import {
  getRestaurant,
  getSubscribedRestaurants,
} from "../controllers/restaurantController.js";
const router = express.Router();

router.get("/restaurant/:restaurantId", getRestaurant);

router.get("/subscribed", getSubscribedRestaurants);

export default router;
