// controllers/pageController.js
import {
  createPageWithSections,
  getMenuPageData,
  getPageData,
  updatePageSections,
} from "../services/pageService.js";

export const fetchPageHandler = async (req, res) => {
  const { slug } = req.params;
  const pageName = req.path.split("/").pop(); // Extracts 'home' or 'about'

  try {
    const pageData = await getPageData(slug, pageName);

    res.status(200).json({
      success: true,
      data: pageData,
    });
  } catch (error) {
    console.error("Error fetching page:", error.message);
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const fetchMenuPageHandler = async (req, res) => {
  const { slug } = req.params;

  try {
    const menuData = await getMenuPageData(slug);

    res.status(200).json({
      success: true,
      data: menuData,
    });
  } catch (error) {
    console.error("Error fetching menu page:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching the menu page.",
    });
  }
};
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

export const updatePageSectionsHandler = async (req, res) => {
  const { slug, pageName } = req.params;
  const { sections } = req.body;

  try {
    if (!sections || !Array.isArray(sections)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid sections data." });
    }

    const result = await updatePageSections(slug, pageName, sections);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error("Error updating sections:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
