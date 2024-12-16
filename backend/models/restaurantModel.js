import pool from "../config/database.js";

// Find a restaurant by its slug used for verifyOwnership in authMiddleware
export const findRestaurantBySlug = async (slug) => {
  const query = `SELECT id, slug FROM restaurants WHERE slug = ? LIMIT 1`;
  const [results] = await pool.query(query, [slug]);
  return results[0]; // Return the restaurant if found
};

//////////////////////////////////////////////////////////////////////////////////

// Find a restaurant by its ID used with  creating a subscription for now.
export const findRestaurantById = async (id) => {
  const query = `SELECT id, name, email, slug, is_active, stripe_customer_id FROM restaurants WHERE id = ?`;
  try {
    const [results] = await pool.query(query, [id]);
    if (results.length === 0) {
      throw new Error("Restaurant not found");
    }
    return results[0]; // Return the restaurant object
  } catch (err) {
    throw new Error(`Error finding restaurant by ID: ${err.message}`);
  }
};

export const updateRestaurantStripeCustomerId = async (
  restaurantId,
  stripeCustomerId
) => {
  const query = `UPDATE restaurants SET stripe_customer_id = ? WHERE id = ?`;
  try {
    const [result] = await pool.query(query, [stripeCustomerId, restaurantId]);
    if (result.affectedRows === 0) {
      throw new Error(
        `No restaurant found with ID ${restaurantId}. Update failed.`
      );
    }
    return result; // Return the result for further use if needed
  } catch (err) {
    throw new Error(
      `Error updating Stripe customer ID in database: ${err.message}`
    );
  }
};

// export const updateRestaurantStripeCustomerId = async (
//   id,
//   stripeCustomerId
// ) => {
//   const query = `UPDATE restaurants SET stripe_customer_id = ? WHERE id = ?`;
//   try {
//     const [result] = await pool.query(query, [stripeCustomerId, id]);
//     return result;
//   } catch (err) {
//     throw new Error(
//       `Error updating restaurant stripe customer ID: ${err.message}`
//     );
//   }
// };
// export const updateRestaurantStripeCustomerId = async (
//   restaurantId,
//   stripeCustomerId
// ) => {
//   const query = `UPDATE restaurants SET stripe_customer_id = ? WHERE id = ?`;
//   try {
//     await pool.query(query, [stripeCustomerId, restaurantId]);
//   } catch (err) {
//     throw new Error(`Error updating Stripe customer ID: ${err.message}`);
//   }
// };

//////////////////////////////////////////////////////////////////////////////////
// For Register
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
// For Register
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

// For Login
export const findRestaurantByEmail = async (email) => {
  const query = `
        SELECT id, name, email, slug, is_active
        FROM restaurants
        WHERE email = ?
      `;
  try {
    const [results] = await pool.query(query, [email]);
    return results[0]; // Return the first result or undefined if not found
  } catch (err) {
    throw new Error(
      `Error finding restaurant by email in restaurantModel.js: ${err.message}`
    );
  }
};
//for login when required.
// Fetch only the password hash for a specific email - password fetched only when needed.
export const findPasswordHashByEmail = async (email) => {
  const query = `SELECT password_hash FROM restaurants WHERE email = ?`;
  try {
    const [results] = await pool.query(query, [email]);
    return results[0]?.password_hash; // Return password_hash or undefined
  } catch (err) {
    throw new Error(
      `Error finding password hash in restaurantModel.js: ${err.message}`
    );
  }
};

// Check if a restaurant is active
// returns 1 for active, 0 for inactive
// For dedicated function that only checks if a restaurant is active
// MTTODO: is_active check will be reused across multiple functionalities (e.g., login, middleware for protecting routes, or account status validation).
export const checkRestaurantSoftTermination = async (id) => {
  const query = `SELECT is_active FROM restaurants WHERE id = ?`;
  try {
    const [results] = await pool.query(query, [id]);
    if (results.length === 0) {
      throw new Error("Restaurant not found");
    }
    return results[0].is_active;
  } catch (err) {
    throw new Error(`Error checking if restaurant is active: ${err.message}`);
  }
};

// Find all active subscribed restaurants för listing i frontend landing page för associated restaurants.
// MTTODO: SE OM JAG SKA TITTA PÅ IS_ACTIVE I RESTAURANTS TABELLEN ELLER IFRPN SUBSCRIOPTIONS STATUS.
// MTTODO: IMPLEMENT LATER: (PAGINATION.), (LÄG IN MER INFO I DATABASEN, ADRESS, TEL NUMMER M.M.)
//MTTODO ERROR CHECK
export const findActiveSubscribedRestaurants = async () => {
  const query = `
    SELECT
      r.name AS restaurant_name,
      r.slug,
      r.short_description
    FROM restaurants r
    INNER JOIN subscriptions s ON r.id = s.restaurant_id
    WHERE s.status = 'active' AND r.is_active = TRUE
  `;

  const [results] = await pool.query(query);
  return results;
};
