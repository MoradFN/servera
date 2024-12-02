import pool from "../config/database.js";

export const findRestaurantByEmailOrSlug = async (email, slug) => {
  const query = `SELECT email, slug FROM restaurants WHERE email = ? OR slug = ?`;
  const [results] = await pool.query(query, [email, slug]);
  return results;
};

export const createRestaurant = async (name, slug, email, hashedPassword) => {
  const query = `
    INSERT INTO restaurants (name, slug, email, password_hash)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await pool.query(query, [name, slug, email, hashedPassword]);
  return result.insertId;
};
