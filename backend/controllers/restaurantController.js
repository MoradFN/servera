import { findActiveSubscribedRestaurants } from "../models/restaurantModel.js";

export const getRestaurant = async (req, res) => {};

export const getSubscribedRestaurants = async (req, res) => {
  try {
    const restaurants = await findActiveSubscribedRestaurants();

    res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (err) {
    console.error("Error fetching subscribed restaurants:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscribed restaurants.",
    });
  }
};
