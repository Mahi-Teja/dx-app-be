import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { userQuery } from "../user/user.query.js";
import { ERROR_CODES } from "../../constants/errorCodes.js";
import env from "../../config/env.js";
import AppError from "../../helpers/AppError.js";
import { generateUniqueUsername, normalizeUsername } from "../../helpers/generateUsername.js";
import { verifyGoogleIdToken } from "../../utility/googleAuth.js";

/**
 * ---------------------------------------------------
 * Google  Auth
 * ---------------------------------------------------
 */
export async function googleAuthentication(idToken) {
  const payload = await verifyGoogleIdToken(idToken);

  const { email, name, picture, email_verified } = payload;

  if (!email_verified) {
    throw new AppError(ERROR_CODES.EMAIL_NOT_VERIFIED, "Email not verified", 400);
  }

  let user = await userQuery.findOne({ email, isActive: true });

  // User exists but signed up using another method
  if (user && user.authProvider !== "google") {
    throw new AppError(
      ERROR_CODES.AUTH_PROVIDER_MISMATCH,
      `Account exists with ${user.authProvider}. Please use that login method.`,
      409
    );
  }

  // New Google user → register
  if (!user) {
    const baseUsername = normalizeUsername(email.split("@")[0] || name);

    const username = await generateUniqueUsername(baseUsername);

    user = await userQuery.create({
      email,
      name,
      username,
      avatar: picture,
      authProvider: "google",
      isActive: true,
    });
  }

  // Existing Google user → login
  const accessToken = jwt.sign({ sub: user._id, email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
    accessToken,
  };
}

/**
 * ---------------------------------------------------
 * Register User
 * ---------------------------------------------------
 */
export async function register({ username, email, password }) {
  if (!username || !email || !password) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Username, email and password are required", 400);
  }

  const existingUser = await userQuery.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new AppError(ERROR_CODES.USER_ALREADY_EXISTS, "User already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, env.SECURITY.BCRYPT_ROUNDS);

  const user = await userQuery.create({
    username,
    email,
    password: passwordHash,
    authProvider: "password",
    isActive: true,
  });

  // Never return password hash
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  };
}

/**
 * ---------------------------------------------------
 * Login User
 * ---------------------------------------------------
 */

export async function login({ username, email, password }) {
  if ((!username && !email) || !password) {
    throw new AppError(
      ERROR_CODES.INVALID_INPUT,
      "Email or Username and password are required",
      400
    );
  }

  const user = await userQuery.findOne(
    { $or: [{ email }, { username }], isActive: true },
    "+password"
  );
  if (!user) {
    throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, "Invalid email or password", 401);
  }
  if (user && user.authProvider !== "password") {
    throw new AppError(
      ERROR_CODES.AUTH_PROVIDER_MISMATCH,
      `Account exists with ${user.authProvider}. Please use that login method.`,
      409
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, "Invalid email or password", 401);
  }

  const accessToken = jwt.sign({ sub: user._id, email: user.email }, env.AUTH.JWT_SECRET, {
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
