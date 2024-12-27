import pool from "../config/database.js";

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
