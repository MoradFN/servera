import pool from "../config/database.js";
import { sendSuccessResponse } from "../utils/responseUtils.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { registerRestaurant as registerService } from "../services/authService.js";

export const registerRestaurant = async (req, res, next) => {
  try {
    const { name, slug, email, password } = req.body;

    const restaurant = await registerService({ name, slug, email, password });

    sendSuccessResponse(res, "Restaurant registered successfully", {
      restaurant,
    });
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
};

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Query database for user
    const query = `
        SELECT id, name, email, slug, password_hash, is_active 
        FROM restaurants 
        WHERE email = ?
      `;
    const [rows] = await pool.query(query, [email]);

    // Check if user exists
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact support.",
      });
    }

    // Check if password matches
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Create a JWT
    const token = jwt.sign(
      {
        id: user.id,
        slug: user.slug, // Include slug to identify restaurant for customization
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || "2h" }
    );

    // Suggest storing token in an HTTP-only cookie
    res.cookie("authToken", token, {
      httpOnly: true, // Prevent JavaScript access
      secure: process.env.NODE_ENV === "production", // Use secure flag in production
      sameSite: "lax", // Mitigate CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Login successful",
      restaurant: {
        id: user.id,
        name: user.name,
        slug: user.slug,
      },
    });
  } catch (err) {
    next(err); // Pass error to centralized error handler
  }
}

export async function logout(req, res, next) {
  try {
    // Clear the authToken cookie
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      sameSite: "lax", // Mitigate CSRF attacks
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (err) {
    next(err); // Pass error to centralized error handler
  }
}

export default { registerRestaurant, login, logout };
