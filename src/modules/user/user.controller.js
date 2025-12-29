import { ERROR_CODES } from "../../constants/errorCodes.js";
import AppError from "../../helpers/AppError.js";
import { ApiResponse } from "../../helpers/AppResponse.js";
import * as userServices from "./user.service.js";

/**
 * ---------------------------------------------------
 * Create User
 * POST /users
 * ---------------------------------------------------
 */
export const create = async (req, res) => {
  const user = await userServices.create(req.body);

  res.status(201).json(
    new ApiResponse({
      statusCode: 201,
      data: user,
      message: "User created successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * Get Current User
 * GET /users/me
 * ---------------------------------------------------
 */
export const getById = async (req, res) => {
  const user = await userServices.getById({
    userId: req.user.id,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: user,
      message: "User fetched successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * Update User (avatar only)
 * PUT /users/me
 * ---------------------------------------------------
 */
export const update = async (req, res) => {
  const { avatar } = req.body;

  if (!avatar) {
    throw new AppError(ERROR_CODES.NOTHING_TO_PERFORM, "No data provided for update", 400);
  }

  const user = await userServices.update({
    userId: req.user.id,
    data: { avatar },
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: user,
      message: "User updated successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * Update Password
 * PUT /users/me/password
 * ---------------------------------------------------
 */
export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new AppError(
      ERROR_CODES.INVALID_INPUT,
      "Old password and new password are required",
      400
    );
  }

  const user = await userServices.updatePassword({
    userId: req.user.id,
    oldPassword,
    newPassword,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: user,
      message: "Password updated successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * Delete User (Soft delete)
 * DELETE /users/me
 * ---------------------------------------------------
 */
export const remove = async (req, res) => {
  await userServices.remove({
    userId: req.user.id,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: null,
      message: "User deleted successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * List Users (Admin only)
 * GET /users
 * ---------------------------------------------------
 */
export const list = async (req, res) => {
  const users = await userServices.list({
    query: req.query,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: users,
      message: "Users fetched successfully",
    })
  );
};
