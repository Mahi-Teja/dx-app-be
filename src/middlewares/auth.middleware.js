import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { ERROR_CODES } from "../constants/errorCodes.js";
import { getAuthToken } from "../helpers/getAuthToken.js";
import AppError from "../helpers/AppError.js";

/**
 * source: "cookie" | "header" | "both"
 */
export const authMiddleware =
  (source = "both") =>
  (req, res, next) => {
    const token = getAuthToken(req, source);

    if (!token) {
      throw new AppError(
        ERROR_CODES.AUTH_REQUIRED,
        "Authentication required",
        401
      );
    }

    try {
      const payload = jwt.verify(token, env.AUTH.JWT_SECRET);

      req.user = {
        id: payload.sub,
        email: payload.email,
      };

      next();
    } catch {
      throw new AppError(
        ERROR_CODES.INVALID_TOKEN,
        "Invalid or expired token",
        401
      );
    }
  };
