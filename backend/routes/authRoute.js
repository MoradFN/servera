import express from "express";
import {
  loginRestaurant,
  logout,
  registerRestaurant,
} from "../controllers/authController.js";
import {
  registerValidationRules,
  loginValidationRules,
} from "../validators/authValidators.js";
import { runValidations } from "../middleware/validationMiddleware.js";
const router = express.Router();

router.post(
  "/register",
  runValidations(registerValidationRules),
  registerRestaurant
);
router.post("/login", runValidations(loginValidationRules), loginRestaurant);
router.post("/logout", logout);

export default router;

// MTTODO: Consider grouping related routes under an /auth path prefix in the main app, e.g., /auth/register, /auth/login.
