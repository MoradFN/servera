import express from "express";
import {
  loginRestaurant,
  logout,
  registerRestaurant,
} from "../controllers/authController.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../validators/authValidators.js";
const router = express.Router();

router.post("/register", validateRegisterInput, registerRestaurant);
router.post("/login", validateLoginInput, loginRestaurant);
router.post("/logout", logout);

export default router;

// MTTODO: Consider grouping related routes under an /auth path prefix in the main app, e.g., /auth/register, /auth/login.
