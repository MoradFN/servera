import bcrypt from "bcrypt";
import {
  findRestaurantByEmailOrSlug,
  createRestaurant,
} from "../models/restaurantModel.js";
import { hashPassword } from "../utils/passwordUtils.js";
import { createError } from "../utils/errorUtils.js";

export const registerRestaurant = async ({ name, slug, email, password }) => {
  // Check for existing email or slug
  const conflicts = await findRestaurantByEmailOrSlug(email, slug);

  const conflictMessages = [];
  if (conflicts.some((row) => row.email === email)) {
    conflictMessages.push("Email already exists");
  }
  if (conflicts.some((row) => row.slug === slug)) {
    conflictMessages.push("Slug already exists");
  }

  if (conflictMessages.length > 0) {
    throw createError(409, conflictMessages.join(", "));
  }

  // Hash password using utility function
  const hashedPassword = await hashPassword(password);

  // Insert into database
  const restaurantId = await createRestaurant(
    name,
    slug,
    email,
    hashedPassword
  );

  return { id: restaurantId, name, slug, email };
};
