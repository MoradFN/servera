import jwt from "jsonwebtoken";
import { createError } from "./errorUtils.js"; //MTTODO CHECK PATH

export function createToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || "2h",
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw createError(401, "Invalid or expired token.");
  }
}
