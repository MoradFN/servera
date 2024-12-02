import pool from "../config/database.js";
import bcrypt from "bcrypt";

export async function registerRestaurant(req, res, next) {
  try {
    const { name, slug, email, password } = req.body;

    // Validate input
    if (!name || !slug || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, slug, email, password) are required",
      });
    }

    // Check if email or slug already exists
    const conflictQuery = `
        SELECT email, slug FROM restaurants WHERE email = ? OR slug = ?
      `;
    const [conflicts] = await pool.query(conflictQuery, [email, slug]);

    const conflictMessages = [];
    if (conflicts.some((row) => row.email === email)) {
      conflictMessages.push("Email already exists");
    }
    if (conflicts.some((row) => row.slug === slug)) {
      conflictMessages.push("Slug already exists");
    }

    if (conflictMessages.length > 0) {
      return res.status(409).json({
        success: false,
        message: conflictMessages.join(" , "), // Combine messages
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Insert into database
    const insertQuery = `
        INSERT INTO restaurants (name, slug, email, password_hash)
        VALUES (?, ?, ?, ?)
      `;
    const [result] = await pool.query(insertQuery, [
      name,
      slug,
      email,
      hashedPassword,
    ]);

    // Return success response
    res.status(201).json({
      success: true,
      message: "Restaurant registered successfully",
      restaurantId: result.insertId,
    });
  } catch (err) {
    next(err); // Pass errors to centralized error handler
  }
}

// export const registerRestaurant = async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ success: false, errors: errors.array() });
//   }

//   const { name, email, password } = req.body;

//   try {
//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Generate slug (you can use a slugify library if needed)
//     const slug = name.toLowerCase().replace(/\s+/g, "-");

//     // Insert into database
//     const [result] = await pool.query(
//       `INSERT INTO restaurants (name, slug, email, password_hash) VALUES (?, ?, ?, ?)`,
//       [name, slug, email, hashedPassword]
//     );

//     // Generate JWT
//     const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.status(201).json({
//       success: true,
//       message: "Restaurant registered successfully",
//       token,
//     });
//   } catch (err) {
//     if (err.code === "ER_DUP_ENTRY") {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email or slug already exists" });
//     }
//     next(err);
//   }
// };

export const login = () => {};

export const logout = () => {};

export default { registerRestaurant, login, logout };
