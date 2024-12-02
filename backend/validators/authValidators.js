import { check, validationResult } from "express-validator";

export const validateRegisterInput = [
  check("name").notEmpty().withMessage("Name is required"),
  check("slug").notEmpty().withMessage("Slug is required"),
  check("email").isEmail().withMessage("Valid email is required"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
