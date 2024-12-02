import express from "express";
import {
  login,
  logout,
  registerRestaurant,
} from "../controllers/authController.js";
import { validateRegisterInput } from "../validators/authValidators.js";
const router = express.Router();

router.post("/register", validateRegisterInput, registerRestaurant);
router.post("/login", login);
router.post("/logout", logout);

export default router;
