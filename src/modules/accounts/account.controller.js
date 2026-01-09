import { ApiResponse } from "../../helpers/AppResponse.js";
import AppError from "../../helpers/AppError.js";
import { ERROR_CODES } from "../../constants/errorCodes.js";
import * as accountService from "./account.service.js";
import { validateObjectId } from "../../helpers/validateId.js";

/**
 * ---------------------------------------------------
 * Create Account
 * POST /accounts
 * ---------------------------------------------------
 */
export const create = async (req, res) => {
  const {
    name,
    type,
    icon,
    creditLimit,
    billingDay,
    dueInDays,
    initialBalance, // <- IMPORTANT: renamed
    asOf, // <- optional date
  } = req.body;

  if (!name || !type) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Account name and type are required", 400);
  }

  const intent = {
    name: name.trim(),
    type: type.toLowerCase(),
    icon,
    creditLimit,
    billingDay,
    dueInDays,
    initialBalance,
    asOf,
  };

  const account = await accountService.createAccount({
    userId: req.user.id,
    intent,
  });

  res.status(201).json(
    new ApiResponse({
      statusCode: 201,
      data: account,
      message: "Account created successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * List Accounts
 * GET /accounts
 * ---------------------------------------------------
 */
export const list = async (req, res) => {
  const accounts = await accountService.listAccounts({
    userId: req.user.id,
    query: req.query,
  });

  res.status(200).json(
    new ApiResponse({
      data: accounts,
      message: accounts.length ? "Accounts fetched" : "No accounts found",
    })
  );
};

/**
 * ---------------------------------------------------
 * Get Account By ID
 * GET /accounts/:id
 * ---------------------------------------------------
 */
export const getById = async (req, res) => {
  const accountId = req.params.id;
  validateObjectId(accountId, "Invalid account id");

  const account = await accountService.getAccountById({
    userId: req.user.id,
    accountId,
  });

  res.status(200).json(
    new ApiResponse({
      data: account,
      message: "Account fetched successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * Update Account Metadata
 * PUT /accounts/:id
 * ---------------------------------------------------
 */
export const updateMetadata = async (req, res) => {
  const accountId = req.params.id;
  validateObjectId(accountId, "Invalid account id");

  const { name, icon, creditLimit, billingDay, dueInDays } = req.body;

  if (
    name === undefined &&
    icon === undefined &&
    creditLimit === undefined &&
    billingDay === undefined &&
    dueInDays === undefined
  ) {
    throw new AppError(ERROR_CODES.NOTHING_TO_PERFORM, "Nothing to update", 400);
  }

  const patch = { name, icon, creditLimit, billingDay, dueInDays };

  const account = await accountService.updateAccountMetadata({
    userId: req.user.id,
    accountId,
    patch,
  });

  res.status(200).json(
    new ApiResponse({
      data: account,
      message: "Account updated successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * Delete Account (Soft)
 * DELETE /accounts/:id
 * ---------------------------------------------------
 */
export const remove = async (req, res) => {
  const accountId = req.params.id;
  validateObjectId(accountId, "Invalid account id");

  await accountService.archiveAccount({
    userId: req.user.id,
    accountId,
  });

  res.status(200).json(
    new ApiResponse({
      data: null,
      message: "Account archived successfully",
    })
  );
};
