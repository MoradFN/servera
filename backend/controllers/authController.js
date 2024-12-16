import { sendSuccessResponse } from "../utils/responseUtils.js";
import {
  loginRestaurantService,
  registerRestaurantService,
} from "../services/authService.js";
import {
  setAuthTokenCookie,
  clearAuthTokenCookie,
} from "../utils/cookieUtils.js";

export const registerRestaurant = async (req, res, next) => {
  try {
    const { name, slug, email, password } = req.body;

    const restaurant = await registerRestaurantService({
      name,
      slug,
      email,
      password,
    });

    sendSuccessResponse(
      res,
      "Restaurant registered successfully",
      { restaurant },
      201
    );
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
};

export const loginRestaurant = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, restaurant } = await loginRestaurantService({
      email,
      password,
    });
    setAuthTokenCookie(res, token);
    sendSuccessResponse(res, "Login successful", { restaurant });
  } catch (err) {
    next(err);
  }
};

export async function logout(req, res, next) {
  try {
    clearAuthTokenCookie(res);

    sendSuccessResponse(res, "Logout successful");
  } catch (err) {
    next(err);
  }
}

export const checkAuth = (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

export default { registerRestaurant, loginRestaurant, logout };
