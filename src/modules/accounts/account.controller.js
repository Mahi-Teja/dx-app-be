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
  const { name, type, balance, creditLimit, billingDay, dueInDays, icon, openingBalance } =
    req.body;

  // intent validation
  if (!name || !type) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Account name and type are required", 400);
  }

  const payload = {
    name: name.trim(),
    type: type.toLowerCase(),
  };

  if (balance !== undefined) payload.balance = balance;
  if (icon !== undefined) payload.icon = icon;
  if (creditLimit !== undefined) payload.creditLimit = creditLimit;
  if (billingDay !== undefined) payload.billingDay = billingDay;
  if (dueInDays !== undefined) payload.dueInDays = dueInDays;
  if (openingBalance !== undefined) payload.openingBalance = openingBalance;

  const account = await accountService.create({
    userId: req.user.id,
    data: payload,
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
  const accounts = await accountService.list({
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

  const account = await accountService.getById({
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
 * Update Account
 * PATCH /accounts/:id
 * ---------------------------------------------------
 */
export const update = async (req, res) => {
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

  const data = {};
  if (name !== undefined) data.name = name;
  if (icon !== undefined) data.icon = icon;
  if (creditLimit !== undefined) data.creditLimit = creditLimit;
  if (billingDay !== undefined) data.billingDay = billingDay;
  if (dueInDays !== undefined) data.dueInDays = dueInDays;

  const account = await accountService.update({
    userId: req.user.id,
    accountId,
    data,
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

  await accountService.remove({
    userId: req.user.id,
    accountId,
  });

  res.status(200).json(
    new ApiResponse({
      data: null,
      message: "Account deleted successfully",
    })
  );
};
