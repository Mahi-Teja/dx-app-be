import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { userQuery } from "../users/user.query.js";
import { ERROR_CODES } from "../../constants/errorCodes.js";
import env from "../../config/env.js";
import AppError from "../../helpers/AppError.js";

/**
 * ---------------------------------------------------
 * Register User
 * ---------------------------------------------------
 */
export async function register({ username, email, password }) {
  if (!username || !email || !password) {
    throw new AppError(
      ERROR_CODES.INVALID_INPUT,
      "Username, email and password are required",
      400
    );
  }

  const existingUser = await userQuery.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new AppError(
      ERROR_CODES.USER_ALREADY_EXISTS,
      "User already exists",
      409
    );
  }

  const passwordHash = await bcrypt.hash(password, env.SECURITY.BCRYPT_ROUNDS);

  const user = await userQuery.create({
    username,
    email,
    passwordHash,
    isActive: true,
  });

  // Never return password hash
  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}

/**
 * ---------------------------------------------------
 * Login User
 * ---------------------------------------------------
 */

export async function login({ email, password }) {
  if (!email || !password) {
    throw new AppError(
      ERROR_CODES.INVALID_INPUT,
      "Email and password are required",
      400
    );
  }

  const user = await userQuery.findOne(
    { email, isActive: true },
    "+passwordHash"
  );

  if (!user) {
    throw new AppError(
      ERROR_CODES.INVALID_CREDENTIALS,
      "Invalid email or password",
      401
    );
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new AppError(
      ERROR_CODES.INVALID_CREDENTIALS,
      "Invalid email or password",
      401
    );
  }

  const accessToken = jwt.sign({ sub: user.id }, env.AUTH.JWT_SECRET, {
    expiresIn: env.AUTH.JWT_EXPIRES_IN,
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
    accessToken,
  };
}
