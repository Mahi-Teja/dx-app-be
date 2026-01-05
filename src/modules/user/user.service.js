import bcrypt from "bcrypt";
import { userQuery } from "./user.query.js";
import { ERROR_CODES } from "../../constants/errorCodes.js";
import AppError from "../../helpers/AppError.js";
import env from "../../config/env.js";

/**
 * ---------------------------------------------------
 * Create User
 * ---------------------------------------------------
 */
export async function create(data) {
  const { username, email, password, dob, gender, avatar } = data;

  if (!username || !email || !password) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Username, email and password are required", 400);
  }

  const existingUser = await userQuery.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new AppError(ERROR_CODES.USER_ALREADY_EXISTS, "User already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await userQuery.create({
    username,
    email,
    password: passwordHash,
    gender,
    dob,
    avatar,
    isActive: true,
  });
  return {
    userId: user._id,
    email: user.email,
    username: user.username,
    gender: user.gender,
    dob: user.dob,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}

/**
 * ---------------------------------------------------
 * Get User By ID
 * ---------------------------------------------------
 */
export async function getById({ userId }) {
  const user = await userQuery.findById(userId, "-password");

  if (!user || !user.isActive) {
    throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
  }

  return user;
}

/**
 * ---------------------------------------------------
 * Get User By Email (Auth)
 * ---------------------------------------------------
 */
export async function getByEmail({ email }) {
  return userQuery.findOne({ email, isActive: true });
}

/**
 * ---------------------------------------------------
 * Update User Profile
 * ---------------------------------------------------
 */
export async function update({ userId, data }) {
  const user = await userQuery.findById(userId);

  if (!user) {
    throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
  }

  return userQuery.updateById(userId, {
    ...data,
    updatedAt: new Date(),
  });
}

/**
 * ---------------------------------------------------
 * Update User Password
 * ---------------------------------------------------
 */
export async function updatePassword({ userId, oldPassword, newPassword }) {
  const user = await userQuery.findById(userId);

  if (!user) {
    throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Wrong pasword", 404);
  }
  const newPwd = await bcrypt.hash(newPassword, env.SECURITY.BCRYPT_ROUNDS);

  return userQuery.updateById(userId, {
    password: newPwd,
    updatedAt: new Date(),
  });
}

/**
 * ---------------------------------------------------
 * Soft delete User
 * ---------------------------------------------------
 */
export async function remove({ userId }) {
  const user = await userQuery.findById(userId);

  if (!user) {
    throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
  }

  return userQuery.softDeleteById(userId);
}
/**
 * ---------------------------------------------------
 * Disable User
 * ---------------------------------------------------
 */
export async function disable({ userId }) {
  const user = await userQuery.findById(userId);

  if (!user) {
    throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
  }

  return userQuery.updateById(userId, {
    isActive: false,
    disabledAt: new Date(),
  });
}
