import { check, validationResult } from "express-validator";

export const validateRegisterInput = [
  // Validate and sanitize the name
  check("name").trim().notEmpty().withMessage("Name is required"),

  // Validate and sanitize the slug
  check("slug").trim().notEmpty().withMessage("Slug is required"),

  // Validate and sanitize the email
  check("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Valid email is required"),

  // Validate the password
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  // Custom middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((error) => ({
          field: error.param,
          message: error.msg,
        })),
      });
    }
    next();
  },
];

export const validateLoginInput = [
  check("email").isEmail().withMessage("Valid email is required"),
  check("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
