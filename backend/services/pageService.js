// services/pageService.js
import {
  createPage,
  insertSections,
  findPageByName,
  findPageWithSections,
} from "../models/pageModel.js";
import {
  findIngredientsByMenuItems,
  findMenuCategoriesBySlug,
  findMenuItemsBySlug,
} from "../models/menuModel.js";

import { findRestaurantBySlug } from "../models/restaurantModel.js";

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
