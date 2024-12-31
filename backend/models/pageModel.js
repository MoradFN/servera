import pool from "../config/database.js";
/// FIND
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

// PAGE INSERT
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

// PAGE UPDATE
// Soft delete a page MTTODO
// export const deletePage = async (pageId) => {
//   const query = `UPDATE pages SET is_active = FALSE, updated_at = NOW() WHERE id = ?`;
//   try {
//     const [result] = await pool.query(query, [pageId]);
//     if (result.affectedRows === 0) {
//       throw new Error("Page not found.");
//     }
//     return result;
//   } catch (err) {
//     throw new Error(`Error deleting page: ${err.message}`);
//   }
// };

// SECTIONS UPDATE DELETE INSERT FOR SPECIFIC PAGE.
export const updateSections = async (pageId, sections) => {
  const selectQuery = `SELECT id, section_order, section_type, content FROM sections WHERE page_id = ?`;
  const insertQuery = `
    INSERT INTO sections (page_id, section_order, section_type, content) 
    VALUES (?, ?, ?, ?)`;
  const updateQuery = `
    UPDATE sections 
    SET section_order = ?, section_type = ?, content = ? 
    WHERE id = ?`;
  const deleteQuery = `DELETE FROM sections WHERE id = ?`;

  try {
    // Fetch existing sections from the database
    const [existingSections] = await pool.query(selectQuery, [pageId]);

    // Map existing sections by `id` for easy comparison
    const existingMap = new Map(existingSections.map((sec) => [sec.id, sec]));

    // Prepare changes
    const sectionsToInsert = [];
    const sectionsToUpdate = [];
    const sectionsToDelete = new Set(existingMap.keys()); // Start with all existing section IDs

    for (const section of sections) {
      if (section.id && existingMap.has(section.id)) {
        // Section exists, check if it needs updating
        const existing = existingMap.get(section.id);
        if (
          section.section_order !== existing.section_order ||
          section.section_type !== existing.section_type ||
          section.content !== existing.content
        ) {
          sectionsToUpdate.push(section);
        }
        sectionsToDelete.delete(section.id); // Mark as not to be deleted
      } else {
        // Section is new and needs to be inserted
        sectionsToInsert.push(section);
      }
    }

    // Perform inserts
    for (const section of sectionsToInsert) {
      await pool.query(insertQuery, [
        pageId,
        section.section_order,
        section.section_type,
        section.content,
      ]);
    }

    // Perform updates
    for (const section of sectionsToUpdate) {
      await pool.query(updateQuery, [
        section.section_order,
        section.section_type,
        section.content,
        section.id,
      ]);
    }

    // Perform deletions
    for (const id of sectionsToDelete) {
      await pool.query(deleteQuery, [id]);
    }
  } catch (err) {
    throw new Error(`Error updating sections: ${err.message}`);
  }
};
