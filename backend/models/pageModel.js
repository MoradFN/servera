// models/pageModel.js
import pool from "../config/database.js";

// Create a page in the database
export const createPage = async (restaurantId, name) => {
  const query = `INSERT INTO pages (restaurant_id, name) VALUES (?, ?)`;
  try {
    const [result] = await pool.query(query, [restaurantId, name]);
    return result.insertId; // Return new page ID
  } catch (err) {
    throw new Error(`Error creating page: ${err.message}`);
  }
};

// Insert sections into the database
export const insertSections = async (pageId, sections) => {
  const query = `
    INSERT INTO sections (page_id, section_order, section_type, content) 
    VALUES ?`;
  const sectionData = sections.map((section) => [
    pageId,
    section.section_order,
    section.section_type,
    section.content,
  ]);

  try {
    await pool.query(query, [sectionData]);
  } catch (err) {
    throw new Error(`Error inserting sections: ${err.message}`);
  }
};

// Find a page by restaurant ID and page name
export const findPageByName = async (restaurantId, pageName) => {
  const query = `SELECT * FROM pages WHERE restaurant_id = ? AND name = ? LIMIT 1`;
  try {
    const [results] = await pool.query(query, [restaurantId, pageName]);
    return results[0];
  } catch (err) {
    throw new Error(`Error finding page: ${err.message}`);
  }
};

// Query for Home and About pages
export const findPageWithSections = async (slug, pageName) => {
  const query = `
    SELECT 
      p.name AS page_name,
      s.section_type, 
      s.content, 
      s.section_order 
    FROM pages p
    INNER JOIN sections s ON p.id = s.page_id
    INNER JOIN restaurants r ON p.restaurant_id = r.id
    WHERE r.slug = ? AND p.name = ? 
      AND p.is_active = TRUE AND s.is_active = TRUE
    ORDER BY s.section_order
  `;

  const [results] = await pool.query(query, [slug, pageName]);
  return results.length > 0 ? results : null;
};

// // Query for Menu
// export const findMenuBySlug = async (slug) => {
//   const query = `
//     SELECT
//       c.name AS category_name,
//       c.display_order AS category_order,
//       mi.name AS item_name,
//       mi.standard_price,
//       mi.family_price,
//       mi.display_order AS item_order
//     FROM menu_categories c
//     INNER JOIN menu_items mi ON c.id = mi.category_id
//     INNER JOIN restaurants r ON c.restaurant_id = r.id
//     WHERE r.slug = ?
//       AND c.is_active = TRUE
//       AND mi.is_active = TRUE
//     ORDER BY c.display_order, mi.display_order
//   `;

//   const [results] = await pool.query(query, [slug]);
//   return results.length > 0 ? results : null;
// };
