import { check } from "express-validator";
//MTTODO: BETTER VALIDATION
// Validators for registration
export const registerValidationRules = [
  check("name").trim().notEmpty().withMessage("Name is required"),
  check("slug").trim().notEmpty().withMessage("Slug is required"),
  check("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Valid email is required"),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

// Validators for login
export const loginValidationRules = [
  check("email").trim().isEmail().withMessage("Valid email is required"),
  check("password").notEmpty().withMessage("Password is required"),
];
