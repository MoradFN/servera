// controllers/pageController.js
import { createPageWithSections } from "../services/pageService.js";
import { findPageWithSections } from "../models/pageModel.js";
import {
  findMenuCategoriesBySlug,
  findMenuItemsBySlug,
  findIngredientsByMenuItems,
} from "../models/menuModel.js";

export const createPageHandler = async (req, res) => {
  const { slug } = req.params;
  const { name, sections } = req.body;

  try {
    const { pageId, sectionsCreated } = await createPageWithSections(
      slug,
      name,
      sections
    );

    res.status(201).json({
      success: true,
      message: "Page created successfully.",
      data: {
        page_id: pageId,
        sections_created: sectionsCreated,
      },
    });
  } catch (error) {
    console.error("Error creating page:", error.message);
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const fetchPageHandler = async (req, res) => {
  const { slug } = req.params;
  const pageName = req.path.split("/").pop(); // Extracts 'home' or 'about'

  try {
    const pageData = await findPageWithSections(slug, pageName);

    if (!pageData || pageData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Page '${pageName}' not found for restaurant '${slug}'.`,
      });
    }

    res.json({
      success: true,
      data: pageData,
    });
  } catch (error) {
    console.error("Error fetching page:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching the page.",
    });
  }
};

// UTILITY!!
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

export const fetchMenuPageHandler = async (req, res) => {
  const { slug } = req.params;

  try {
    // Fetch menu sections, categories, and items
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
    const menuData = {
      sections: sections.map((section) => ({
        page_name: "menu",
        section_type: section.section_type,
        content: section.content,
        section_order: section.section_order,
      })),
      categories: categoryTree,
      items: itemsWithIngredients,
    };

    res.status(200).json({
      success: true,
      data: menuData,
    });
  } catch (error) {
    console.error("Error fetching menu page:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching the menu page.",
    });
  }
};
