import pool from "../config/database.js";

export const findMenuCategoriesBySlug = async (slug) => {
  const query = `
    SELECT mc.id, mc.name, mc.display_order, mc.parent_id
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

export const findIngredientsByMenuItems = async (menuItemIds) => {
  if (menuItemIds.length === 0) return [];

  const query = `
    SELECT 
      r.menu_item_id, 
      i.id AS ingredient_id, 
      i.name AS ingredient_name 
    FROM r_menu_item_ingredients r
    JOIN ingredients i ON r.ingredient_id = i.id
    WHERE r.menu_item_id IN (?)
  `;

  const [results] = await pool.query(query, [menuItemIds]);
  return results;
};
