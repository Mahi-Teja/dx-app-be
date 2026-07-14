import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import crypto from "crypto";

import { userQuery } from "../user/user.query.js";
import { ERROR_CODES } from "../../constants/errorCodes.js";
import env from "../../config/env.js";
import AppError from "../../helpers/AppError.js";
import { generateUniqueUsername, normalizeUsername } from "../../helpers/generateUsername.js";
import { verifyGoogleIdToken } from "../../utility/googleAuth.js";

/* =====================================================
 * Zod Schemas (HARD SECURITY GATE)
 * ===================================================== */

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(12)
    .regex(/^[a-zA-Z0-9_]+$/),

  email: z.string().trim().email(),

  password: z
    .string()
    .min(8, "use password between 8 and 24 characters")
    .max(24, "Password too long "),
});

const loginSchema = z
  .object({
    username: z.string().trim().optional(),
    email: z.email().optional(),
    password: z.string().min(1),
  })
  .refine((data) => data.username || data.email, "Email or username is required");

const passwordSchema = z
  .string()
  .min(8, "use password between 8 and 24 characters")
  .max(24, "Password too long ");

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

const verifyResetSchema = z.object({
  token: z.string().min(1),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
const googleSchema = z.object({
  idToken: z.string().min(10),
});

/* =====================================================
 * Google Authentication
 * ===================================================== */
export async function googleAuthentication(idToken) {
  const parsed = googleSchema.safeParse({ idToken });
  if (!parsed.success) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Invalid Google token", 400);
  }

  const payload = await verifyGoogleIdToken(idToken);

  const { email, name, picture, email_verified } = payload;

  if (!email_verified) {
    throw new AppError(ERROR_CODES.EMAIL_NOT_VERIFIED, "Email not verified", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  let user = await userQuery.findOne({ email: normalizedEmail, isActive: true });

  // User exists but with different provider
  if (user && user.authProvider !== "google") {
    throw new AppError(
      ERROR_CODES.AUTH_PROVIDER_MISMATCH,
      `Account exists with ${user.authProvider}. Please use that login method.`,
      409
    );
  }

  // New Google user → register
  if (!user) {
    const baseUsername = normalizeUsername(normalizedEmail.split("@")[0] || name);
    const username = await generateUniqueUsername(baseUsername);

    user = await userQuery.create({
      email: normalizedEmail,
      name,
      username,
      avatar: picture,
      authProvider: "google",
      isActive: true,
    });
  }

  const accessToken = jwt.sign({ sub: user._id, email: user.email }, env.AUTH.JWT_SECRET, {
    expiresIn: env.AUTH.JWT_EXPIRES_IN,
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

/* =====================================================
 * Register User
 * ===================================================== */
export async function register(payload) {
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, parsed.error.issues[0].message, 400);
  }

  let { username, email, password } = parsed.data;

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await userQuery.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (existingUser) {
    throw new AppError(ERROR_CODES.USER_ALREADY_EXISTS, "User already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, env.SECURITY.BCRYPT_ROUNDS);

  const user = await userQuery.create({
    username: normalizedUsername,
    email: normalizedEmail,
    password: passwordHash,
    authProvider: "password",
    isActive: true,
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  };
}

/* =====================================================
 * Login User
 * ===================================================== */
export async function login(payload) {
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, parsed.error.issues[0].message, 400);
  }

  let { username, email, password } = parsed.data;

  const query = {};

  if (email) query.email = email.trim().toLowerCase();
  if (username) query.username = username.trim().toLowerCase();

  const user = await userQuery.findOne({ ...query, isActive: true }, "+password");

  if (!user) {
    throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, "Invalid email or password", 401);
  }

  if (user.authProvider !== "password") {
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

export async function forgotPassword(payload) {
  const parsed = forgotPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, parsed.error.issues[0].message, 400);
  }

  const email = parsed.data.email.trim().toLowerCase();

  const user = await userQuery.findOne({
    email,
    isActive: true,
    isDeleted: false,
  });

  // Never reveal account existence
  if (!user || user.authProvider !== "password") {
    return null;
  }

  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  await userQuery.updateByIdWoValidators(user._id, {
    passwordResetToken: hashedToken,
    passwordResetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
  });

  return {
    token,
    user,
  };
}

export async function verifyResetPassword(payload) {
  const parsed = verifyResetSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError(ERROR_CODES.INVALID_TOKEN, "Invalid reset token", 400);
  }

  const hashedToken = crypto.createHash("sha256").update(parsed.data.token).digest("hex");

  const user = await userQuery.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiry: {
      $gt: new Date(),
    },
    isActive: true,
    isDeleted: false,
  });

  return !!user;
}
export async function resetPassword(payload) {
  const parsed = resetPasswordSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, parsed.error.issues[0].message, 400);
  }

  const { token, newPassword } = parsed.data;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await userQuery.findOne(
    {
      passwordResetToken: hashedToken,
      passwordResetTokenExpiry: {
        $gt: new Date(),
      },
      isActive: true,
      isDeleted: false,
    },
    "+password"
  );

  if (!user) {
    throw new AppError(ERROR_CODES.INVALID_TOKEN, "Reset link has expired or is invalid.", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, Number(env.SECURITY.BCRYPT_ROUNDS));

  user.password = hashedPassword;
  user.passwordChangedAt = new Date();

  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiry = undefined;

  await user.save();
  return {
    success: true,
  };
}

export async function clearResetToken(userId) {
  if (!userId) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "User ID is required", 400);
  }

  return await userQuery.updateById(userId, {
    $unset: {
      passwordResetToken: 1,
      passwordResetTokenExpiry: 1,
    },
  });
}
