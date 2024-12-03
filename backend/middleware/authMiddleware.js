import { verifyToken } from "../utils/tokenUtils.js";
import { createError } from "../utils/errorUtils.js";

export const authenticate = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return next(createError(401, "No token provided."));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach decoded token data to the request
    next();
  } catch (err) {
    next(err);
  }
};
