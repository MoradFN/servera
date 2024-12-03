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
router.post("/login", loginRestaurant);
router.post("/logout", logout);

export default router;
