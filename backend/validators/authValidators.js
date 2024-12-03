import { check, validationResult } from "express-validator";
import { handleValidationErrors } from "../middleware/errorHandler.js";
//MTTODO: BETTER VALIDATION
export const validateRegisterInput = [
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
  handleValidationErrors,
];

export const validateLoginInput = [
  check("email").trim().isEmail().withMessage("Valid email is required"),
  check("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];
