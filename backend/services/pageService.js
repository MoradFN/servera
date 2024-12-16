// services/pageService.js
import {
  createPage,
  insertSections,
  findPageByName,
} from "../models/pageModel.js";
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
