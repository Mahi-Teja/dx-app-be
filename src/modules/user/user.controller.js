import { ERROR_CODES } from "../../constants/errorCodes.js";
import AppError from "../../helpers/AppError.js";
import { ApiResponse } from "../../helpers/AppResponse.js";
import * as userServices from "./user.service.js";

/**
 * ---------------------------------------------------
 * Create Transaction
 * POST /transactions
 * ---------------------------------------------------
 */
export const create = async (req, res, next) => {
  try {
    const user = await userServices.create(req.body);

    res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        data: user,
        message: "User created successfully",
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * ---------------------------------------------------
 * Get User By ID
 * GET /users/:id
 * ---------------------------------------------------
 */
export const getById = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

/**
 * ---------------------------------------------------
 * Update User
 * PUT /users/:id
 * ---------------------------------------------------
 */
export const update = async (req, res, next) => {
  try {
    const { avatar, username, email } = req.body;
    if (!avatar && !username && !email) {
      throw new AppError(
        ERROR_CODES.NOTHING_TO_PERFORM,
        "No data provided for update",
        400
      );
    }
    if (username) {
      throw new AppError(
        ERROR_CODES.NOTHING_TO_PERFORM,
        "Username cannot be updated",
        400
      );
    }
    if (email) {
      throw new AppError(
        ERROR_CODES.NOTHING_TO_PERFORM,
        "Email cannot be updated",
        400
      );
    }
    const user = await userServices.update({
      userId: req.user.id,
      data: { avatar },
    });

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        data: user,
        message: "User Updated successfully",
      })
    );
  } catch (error) {
    next(error);
  }
};
export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Need Both fields", 404);
    }
    //TODO:  validate Password length > 8 and other factors
    const user = await userServices.updatePassword({
      userId: req.user.id,
      oldPassword,
      newPassword,
    });

    res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        data: user,
        message: "User Updated successfully",
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * ---------------------------------------------------
 * Delete User (Soft Delete)
 * DELETE /users/:id
 * ---------------------------------------------------
 */
export const remove = async (req, res, next) => {
  try {
    await userServices.remove({
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

//For ADMIN:
/**
 * ---------------------------------------------------
 * List Users
 * GET /users
 * ---------------------------------------------------
 */
export const list = async (req, res, next) => {
  try {
    const users = await userServices.list({
      userId: req.user.id,
      query: req.query,
    });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
