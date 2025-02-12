import {
  createPage,
  insertSections,
  findPageByName,
  findPageWithSections,
  updateSections,
} from "../models/pageModel.js";
import {
  findIngredientsByMenuItems,
  findMenuCategoriesBySlug,
  findMenuItemsBySlug,
  upsertCategories,
  upsertMenuItems,
} from "../models/menuModel.js";

import { findRestaurantBySlug } from "../models/restaurantModel.js";
import pool from "../config/database.js";

////
// Fetch a page and its sections
export const getPageData = async (slug, pageName) => {
  const pageData = await findPageWithSections(slug, pageName);

  if (!pageData || pageData.length === 0) {
    throw new Error(`Page '${pageName}' not found for restaurant '${slug}'.`);
  }

  return pageData;
};

// Build category tree
function buildCategoryTree(categories) {
  const categoryMap = {};
  const tree = [];

  // Create a map of all categories
  categories.forEach((category) => {
    categoryMap[category.id] = { ...category, children: [] };
  });

  // Build the tree structure
  categories.forEach((category) => {
    if (category.parent_id) {
      categoryMap[category.parent_id].children.push(categoryMap[category.id]);
    } else {
      tree.push(categoryMap[category.id]);
    }
  });

  return tree;
}

// Fetch menu data
export const getMenuPageData = async (slug) => {
  const sections = (await findPageWithSections(slug, "menu")) || [];
  const categories = (await findMenuCategoriesBySlug(slug)) || [];
  const items = (await findMenuItemsBySlug(slug)) || [];

  // Fetch ingredients for menu items
  const itemIds = items.map((item) => item.id);
  const ingredients = await findIngredientsByMenuItems(itemIds);

  // Associate ingredients with menu items
  const itemsWithIngredients = items.map((item) => ({
    ...item,
    ingredients: ingredients
      .filter((ingredient) => ingredient.menu_item_id === item.id)
      .map((ingredient) => ({
        id: ingredient.ingredient_id,
        name: ingredient.ingredient_name,
      })),
  }));

  // Build category tree
  const categoryTree = buildCategoryTree(categories);

  // Format the response structure
  return {
    sections: sections.map((section) => ({
      page_name: "menu",
      section_type: section.section_type,
      content: section.content,
      section_order: section.section_order,
    })),
    categories: categoryTree,
    items: itemsWithIngredients,
  };
};

export const createPageWithSections = async (slug, name, sections) => {
  // Find the restaurant by slug
  const restaurant = await findRestaurantBySlug(slug);
  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const restaurantId = restaurant.id;

  // Check if the page already exists
  const existingPage = await findPageByName(restaurantId, name);
  if (existingPage) {
    throw new Error("Page already exists.");
  }

  // Create the page
  const pageId = await createPage(restaurantId, name);

  // Insert sections if provided
  if (sections && sections.length > 0) {
    await insertSections(pageId, sections);
  }

  return { pageId, sectionsCreated: sections.length || 0 };
};

export const updatePageSections = async (slug, pageName, sections) => {
  // Fetch the restaurant using slug to get the restaurantId
  const restaurant = await findRestaurantBySlug(slug);
  if (!restaurant) {
    throw new Error(`Restaurant '${slug}' not found.`);
  }

  // Fetch the page using restaurantId and pageName and check if it exists
  const page = await findPageByName(restaurant.id, pageName);
  if (!page) {
    throw new Error(`Page '${pageName}' not found for restaurant '${slug}'.`);
  }

  // Update sections
  await updateSections(page.id, sections);

  return { message: "Sections updated successfully." };
};
/// MENU CAT AND ITEMS / INGREDIENTS, BULK UPDATES.
export const updateMenuData = async (slug, categories, items) => {
  const restaurant = await findRestaurantBySlug(slug);
  if (!restaurant) throw new Error(`Restaurant '${slug}' not found.`);

  // Possibly check if a "menu" page record exists or create one
  const page = await findPageByName(restaurant.id, "menu");
  if (!page) throw new Error("Menu page not found for this restaurant.");

  // Start transaction
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update categories
    await upsertCategories(connection, restaurant.id, categories);

    // 2. Update menu items (with ingredients) <--- this doesn't exist yet
    await upsertMenuItems(connection, restaurant.id, items);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  return { message: "Menu data updated successfully." };
};
