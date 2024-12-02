import express from "express";
import { getRestaurant } from "../controllers/restaurantController.js";
const router = express.Router();

router.get("/restaurant/:restaurantId", getRestaurant);

export default router;
