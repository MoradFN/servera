import {
  findRestaurantByEmailOrSlug,
  createRestaurant,
  checkRestaurantSoftTermination,
  findRestaurantByEmail,
  findPasswordHashByEmail,
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
  // Fetch basic restaurant details
  const restaurant = await findRestaurantByEmail(email);
  if (!restaurant) {
    throw createError(401, "Invalid email or password.");
  }
  if (!restaurant.is_active) {
    throw createError(403, "Your account is inactive. Please contact support.");
  }
  // Fetch password hash for the email - security layer, see model.
  const passwordHash = await findPasswordHashByEmail(email);
  if (!passwordHash) {
    throw createError(401, "Invalid email or password.");
  }
  // Validate the password
  const passwordMatch = await comparePassword(password, passwordHash);
  if (!passwordMatch) {
    throw createError(401, "Invalid email or password.");
  }
  // Generate JWT token
  const token = createToken({ id: restaurant.id, slug: restaurant.slug });

  return {
    token,
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
    },
  };
};

//Not used
export const validateActiveRestaurant = async (id) => {
  const isActive = await checkRestaurantSoftTermination(id);
  if (parseInt(isActive, 10) !== 1) {
    //MTTODO NO PARSEINT.
    throw createError(403, "Your account is inactive. Please contact support.");
  }
};
// USAGE
// await validateActiveRestaurant(userId);
