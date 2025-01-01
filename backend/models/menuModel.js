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

//////////// USPERT FOR /// MENU CAT AND ITEMS / INGREDIENTS, BULK UPDATES.
export const upsertCategories = async (
  connection,
  restaurantId,
  categories
) => {
  // Flatten the tree first or do it recursively

  // 1. Fetch existing categories for the restaurant
  const [rows] = await connection.query(
    "SELECT id, parent_id, name, display_order FROM menu_categories WHERE restaurant_id = ? AND is_active = TRUE",
    [restaurantId]
  );
  const existingById = new Map(rows.map((cat) => [cat.id, cat]));

  // 2. For every category in the new data, upsert
  const categoriesToProcess = flattenCategoryTree(categories); // or do it differently

  // Keep track of which IDs we have updated or inserted
  const updatedOrInsertedIds = new Set();

  for (const cat of categoriesToProcess) {
    if (cat.id && existingById.has(cat.id)) {
      // UPDATE
      await connection.query(
        "UPDATE menu_categories SET parent_id = ?, name = ?, display_order = ? WHERE id = ?",
        [cat.parent_id, cat.name, cat.display_order, cat.id]
      );
      updatedOrInsertedIds.add(cat.id);
    } else {
      // INSERT
      const [result] = await connection.query(
        "INSERT INTO menu_categories (restaurant_id, parent_id, name, display_order) VALUES (?, ?, ?, ?)",
        [restaurantId, cat.parent_id, cat.name, cat.display_order]
      );
      updatedOrInsertedIds.add(result.insertId);
    }
  }

  // 3. Delete or soft-delete categories not in updatedOrInsertedIds
  //    If you'd rather soft-delete, do an UPDATE ... SET is_active = false
  for (const [id] of existingById) {
    if (!updatedOrInsertedIds.has(id)) {
      await connection.query(
        "UPDATE menu_categories SET is_active = false WHERE id = ?",
        [id]
      );
    }
  }
};

function flattenCategoryTree(categoryArray, parentId = null, arr = []) {
  // Recursively flatten { children: [...] }
  for (const cat of categoryArray) {
    arr.push({
      id: cat.id || null,
      parent_id: cat.parent_id ?? parentId,
      name: cat.name,
      display_order: cat.display_order,
      is_active: cat.is_active !== false, // default true if not specified
    });
    if (cat.children && cat.children.length > 0) {
      flattenCategoryTree(cat.children, cat.id, arr);
    }
  }
  return arr;
}

// backend\models\menuModel.js (or a separate file)
export const upsertMenuItems = async (connection, restaurantId, items) => {
  //
  // 1. Fetch existing items for this restaurant.
  //
  const [existingRows] = await connection.query(
    `SELECT id, name, category_id, display_order, standard_price, family_price 
       FROM menu_items 
      WHERE restaurant_id = ? AND is_active = TRUE`,
    [restaurantId]
  );
  const existingItemsMap = new Map(existingRows.map((item) => [item.id, item]));

  //
  // 2. For every item in the new data, upsert (insert or update).
  //
  // Keep track of which IDs we have updated or inserted, so we know which to soft-delete later.
  const updatedOrInsertedItemIds = new Set();

  // We'll handle "insert vs. update" logic below, then handle ingredients.
  for (const item of items) {
    let itemId = item.id || null;

    // If itemId already exists, we do an UPDATE
    if (itemId && existingItemsMap.has(itemId)) {
      await connection.query(
        `UPDATE menu_items
            SET name = ?, 
                category_id = ?, 
                display_order = ?,
                standard_price = ?,
                family_price = ?
          WHERE id = ? AND restaurant_id = ?`,
        [
          item.name,
          item.category_id,
          item.display_order,
          item.standard_price,
          item.family_price,
          itemId,
          restaurantId,
        ]
      );
      updatedOrInsertedItemIds.add(itemId);
    } else {
      // Otherwise, we INSERT a new row
      const [result] = await connection.query(
        `INSERT INTO menu_items 
          (restaurant_id, category_id, name, display_order, standard_price, family_price)
          VALUES (?, ?, ?, ?, ?, ?)`,
        [
          restaurantId,
          item.category_id,
          item.name,
          item.display_order,
          item.standard_price,
          item.family_price,
        ]
      );
      itemId = result.insertId; // capture newly generated ID
      updatedOrInsertedItemIds.add(itemId);
    }

    // Now handle ingredients for this item
    if (Array.isArray(item.ingredients)) {
      await upsertItemIngredients(
        connection,
        restaurantId,
        itemId,
        item.ingredients
      );
    }
  }

  //
  // 3. Soft-delete items not in updatedOrInsertedItemIds
  //
  for (const [existingId] of existingItemsMap) {
    if (!updatedOrInsertedItemIds.has(existingId)) {
      await connection.query(
        `UPDATE menu_items 
            SET is_active = FALSE 
          WHERE id = ? AND restaurant_id = ?`,
        [existingId, restaurantId]
      );
    }
  }
};

/**
 * Upserts (creates or links) ingredients for a single menu item.
 * - Checks if each ingredient exists by ID or name (depending on your preference).
 * - Inserts any new ingredients into `ingredients`.
 * - Manages `r_menu_item_ingredients` links (create or remove).
 */
async function upsertItemIngredients(
  connection,
  restaurantId,
  menuItemId,
  ingredients
) {
  //
  // 1. Fetch existing links for this item from r_menu_item_ingredients
  //
  const [existingLinks] = await connection.query(
    `SELECT r.id, r.ingredient_id, i.name as ingredient_name
       FROM r_menu_item_ingredients r
       JOIN ingredients i ON r.ingredient_id = i.id
      WHERE r.menu_item_id = ?`,
    [menuItemId]
  );
  const existingLinksMap = new Map(
    existingLinks.map((link) => [link.ingredient_id, link])
  );

  //
  // 2. We'll keep track of all ingredient_ids we link now, so we know which to remove
  //
  const linkedIngredientIds = new Set();

  //
  // 3. For each requested ingredient in the new data, ensure it exists in `ingredients`,
  //    then link in `r_menu_item_ingredients`.
  //
  for (const ingredient of ingredients) {
    let ingredientId = ingredient.id || null;
    let ingredientName = ingredient.name.trim();

    // If we have an id, we could trust it, or we might want to do a sanity check
    // that it belongs to the same restaurant. If no id or we do find by name:
    if (!ingredientId) {
      // 3a. Check if an ingredient with the same name already exists for this restaurant
      const [foundRows] = await connection.query(
        `SELECT id, name
           FROM ingredients
          WHERE restaurant_id = ?
            AND LOWER(name) = LOWER(?)`,
        [restaurantId, ingredientName]
      );
      if (foundRows.length > 0) {
        // Use existing
        ingredientId = foundRows[0].id;
      } else {
        // 3b. Insert a new ingredient
        const [insertResult] = await connection.query(
          `INSERT INTO ingredients (restaurant_id, name) VALUES (?, ?)`,
          [restaurantId, ingredientName]
        );
        ingredientId = insertResult.insertId;
      }
    }

    // Now we have an ingredientId. Link it to the menu item if not already linked.
    if (!existingLinksMap.has(ingredientId)) {
      // 3c. Create new link in r_menu_item_ingredients
      await connection.query(
        `INSERT INTO r_menu_item_ingredients (menu_item_id, ingredient_id)
         VALUES (?, ?)`,
        [menuItemId, ingredientId]
      );
    }

    linkedIngredientIds.add(ingredientId);
  }

  //
  // 4. Remove any existing links not present in the new data
  //
  for (const [existingIngredientId, link] of existingLinksMap) {
    if (!linkedIngredientIds.has(existingIngredientId)) {
      // Delete link row
      await connection.query(
        `DELETE FROM r_menu_item_ingredients WHERE id = ?`,
        [link.id]
      );
    }
  }
}
