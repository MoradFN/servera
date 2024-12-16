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
