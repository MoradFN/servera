import {
  findRestaurantByEmailOrSlug,
  createRestaurant,
} from "../models/restaurantModel.js";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { createError } from "../utils/errorUtils.js";
import { createToken } from "../utils/tokenUtils.js";

export const registerRestaurantService = async ({
  name,
  slug,
  email,
  password,
}) => {
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

export const loginRestaurantService = async ({ email, password }) => {
  const [user] = await findRestaurantByEmailOrSlug(email, null);

  if (!user) {
    throw createError(401, "Invalid email or password.");
  }
  if (!user.is_active) {
    throw createError(403, "Your account is inactive. Please contact support.");
  }

  const passwordMatch = await comparePassword(password, user.password_hash);
  if (!passwordMatch) {
    throw createError(401, "Invalid email or password.");
  }

  const token = createToken({ id: user.id, slug: user.slug });

  return { token, user: { id: user.id, name: user.name, slug: user.slug } };
};
