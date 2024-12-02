import express from "express";
import {
  login,
  logout,
  registerRestaurant,
} from "../controllers/authController.js";
const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", registerRestaurant);

export default router;
