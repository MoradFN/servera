import { verifyToken } from "../utils/tokenUtils.js";
import { createError } from "../utils/errorUtils.js";

export const authenticate = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    return next(createError(401, "Authentication required"));
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return next(createError(401, "Invalid or expired token"));
  }
};
