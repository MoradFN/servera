// controllers/pageController.js
import { createPageWithSections } from "../services/pageService.js";
import { findPageWithSections } from "../models/pageModel.js";
import {
  findMenuCategoriesBySlug,
  findMenuItemsBySlug,
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

export const fetchMenuPageHandler = async (req, res) => {
  const { slug } = req.params;

  try {
    // Fetch menu page sections
    const pageData = await findPageWithSections(slug, "menu");

    // Fetch menu categories and items
    const categories = await findMenuCategoriesBySlug(slug);
    const items = await findMenuItemsBySlug(slug);

    // Combine all data
    const menuData = {
      sections: pageData || [],
      categories: categories || [],
      items: items || [],
    };

    res.status(200).json({ success: true, data: menuData });
  } catch (error) {
    console.error("Error fetching menu page:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching the menu page.",
    });
  }
};
