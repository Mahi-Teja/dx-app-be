import mongoose from "mongoose";
import { ERROR_CODES } from "../../constants/errorCodes.js";
import AppError from "../../helpers/AppError.js";
import { ApiResponse } from "../../helpers/AppResponse.js";
import * as accountService from "./account.service.js";
import { validateObjectId } from "../../helpers/validateId.js";

// TODO " test Api routes"

/**
 * POST /accounts
 */

export const create = async (req, res) => {
  const { name, type, balance, creditLimit, dueInDays, billingDay, icon } = req.body;

  const account = await accountService.create({
    userId: req.user.id,
    name,
    type: type.toLowerCase(),
    balance,
    creditLimit,
    dueInDays,
    billingDay,
    icon,
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
 * GET /accounts
 */
export const list = async (req, res) => {
  const accounts = await accountService.list({
    userId: req.user.id,
    query: req.query,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: accounts,
      message: accounts.length > 0 ? "Accounts fetched" : "No Accounts found",
    })
  );
};
/**
 * GET /accounts
 */
export const getById = async (req, res) => {
  const accountId = req.params.id;
  validateObjectId(accountId, "invalid account Id");

  const accounts = await accountService.getById({
    userId: req.user.id,
    accountId,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: accounts,
      message: accounts ? "Fetched Account succesfully" : "No Accounst Found",
    })
  );
};

/**
 * PUT /accounts/:id
 */
export const update = async (req, res) => {
  const { name, icon, creditLimit, dueInDays, billingDay, openingBalance } = req.body;
  const accountId = req.params.id;
  validateObjectId(accountId, "invalid account Id");
  // intent check
  if (
    name === undefined &&
    icon === undefined &&
    creditLimit === undefined &&
    dueInDays === undefined &&
    billingDay === undefined &&
    openingBalance === undefined
  ) {
    throw new AppError(ERROR_CODES.NOTHING_TO_PERFORM, "Nothing to update", 400);
  }

  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (icon !== undefined) updateData.icon = icon;
  if (creditLimit !== undefined) updateData.creditLimit = creditLimit;
  if (dueInDays !== undefined) updateData.dueInDays = dueInDays;
  if (billingDay !== undefined) updateData.billingDay = billingDay;
  if (openingBalance !== undefined) updateData.openingBalance = openingBalance;

  const account = await accountService.update({
    userId: req.user.id,
    accountId,
    data: updateData,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: account,
      message: "Account updated successfully",
    })
  );
};

/**
 * DELETE /accounts/:id
 */
export const remove = async (req, res) => {
  const accountId = req.params.id;
  validateObjectId(accountId, "invalid account Id");

  await accountService.remove({
    userId: req.user.id,
    accountId,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: null,
      message: "Account deleted successfully",
    })
  );
};
