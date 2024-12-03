import pool from "../config/database.js";

// Find a restaurant by email or slug from the database
export const findRestaurantByEmailOrSlug = async (email, slug) => {
  const query = `SELECT email, slug FROM restaurants WHERE email = ? OR slug = ?`;
  try {
    const [results] = await pool.query(query, [email, slug]);
    return results;
  } catch (err) {
    throw new Error(
      `Error finding restaurant by email or slug in restaurantModel.js/findRestaurantByEmailOrSlug ${err.message}`
    );
  }
};

// Create a new restaurant in the database
export const createRestaurant = async (name, slug, email, hashedPassword) => {
  const query = `
      INSERT INTO restaurants (name, slug, email, password_hash)
      VALUES (?, ?, ?, ?)
    `;
  try {
    const [result] = await pool.query(query, [
      name,
      slug,
      email,
      hashedPassword,
    ]);
    return result.insertId;
  } catch (err) {
    throw new Error(
      `Error creating restaurant in restaurantModel.js/createRestaurant: ${err.message}`
    );
  }
};
