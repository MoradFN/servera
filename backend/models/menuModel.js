import pool from "../config/database.js";

// // // Query for Menu
export const findMenuBySlug = async (slug) => {
  const query = `
    SELECT
      c.name AS category_name,
      c.display_order AS category_order,
      mi.name AS item_name,
      mi.standard_price,
      mi.family_price,
      mi.display_order AS item_order
    FROM menu_categories c
    INNER JOIN menu_items mi ON c.id = mi.category_id
    INNER JOIN restaurants r ON c.restaurant_id = r.id
    WHERE r.slug = ?
      AND c.is_active = TRUE
      AND mi.is_active = TRUE
    ORDER BY c.display_order, mi.display_order
  `;

  const [results] = await pool.query(query, [slug]);
  return results.length > 0 ? results : null;
};

// export const findMenuBySlug = async (slug) => {
//   const query = `
//     SELECT
//       mc.name AS category_name, mi.name AS item_name,
//       mi.standard_price, mi.family_price, mi.cooking_time
//     FROM menu_categories mc
//     JOIN menu_items mi ON mc.id = mi.category_id
//     JOIN restaurants r ON r.id = mc.restaurant_id
//     WHERE r.slug = ? AND mc.is_active = TRUE AND mi.is_active = TRUE
//     ORDER BY mc.display_order, mi.display_order;
//   `;
//   const [results] = await pool.query(query, [slug]);
//   return results.length > 0 ? results : null;
// };

// Fetch categories
export const findMenuCategoriesBySlug = async (slug) => {
  const query = `
      SELECT mc.id, mc.name, mc.display_order
      FROM menu_categories mc
      JOIN restaurants r ON mc.restaurant_id = r.id
      WHERE r.slug = ? AND mc.is_active = TRUE
      ORDER BY mc.display_order;
    `;
  const [results] = await pool.query(query, [slug]);
  return results;
};

// Fetch items
export const findMenuItemsBySlug = async (slug) => {
  const query = `
      SELECT mi.id, mi.name, mi.standard_price, mi.family_price, mi.category_id
      FROM menu_items mi
      JOIN restaurants r ON mi.restaurant_id = r.id
      WHERE r.slug = ? AND mi.is_active = TRUE
      ORDER BY mi.display_order;
    `;
  const [results] = await pool.query(query, [slug]);
  return results;
};
