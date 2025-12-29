import { ApiResponse } from "../../helpers/AppResponse.js";
import AppError from "../../helpers/AppError.js";
import { ERROR_CODES } from "../../constants/errorCodes.js";
import { validateObjectId } from "../../helpers/validateId.js";
import * as transactionService from "./transaction.service.js";

/**
 * ---------------------------------------------------
 * Create Transaction
 * POST /transactions
 * ---------------------------------------------------
 */
export const create = async (req, res) => {
  const { type, amount, categoryId, accountId, occurredAt = Date.now(), note } = req.body;

  if (!type || amount === undefined || !accountId || !categoryId) {
    throw new AppError(
      ERROR_CODES.INVALID_INPUT,
      "Required fields: type, amount, accountId, categoryId",
      400
    );
  }

  const transaction = await transactionService.create({
    userId: req.user.id,
    data: {
      type,
      amount,
      categoryId,
      accountId,
      occurredAt,
      note,
    },
  });

  res.status(201).json(
    new ApiResponse({
      data: transaction,
      message: "Transaction created successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * Get Transaction By ID
 * GET /transactions/:id
 * ---------------------------------------------------
 */
export const getById = async (req, res) => {
  const transactionId = req.params.id;
  validateObjectId(transactionId, "transactionId");

  const transaction = await transactionService.getById({
    userId: req.user.id,
    transactionId,
  });

  res.status(200).json(
    new ApiResponse({
      data: transaction,
    })
  );
};

/**
 * ---------------------------------------------------
 * List Transactions
 * GET /transactions
 * ---------------------------------------------------
 */
export const list = async (req, res) => {
  const transactions = await transactionService.list({
    userId: req.user.id,
    query: req.query,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: transactions,
      message: transactions.length > 0 ? "Transactions fetched" : "No Transaction found",
    })
  );
};

/**
 * ---------------------------------------------------
 * Update One Transaction
 * PATCH /transactions/:id
 * ---------------------------------------------------
 */
export const updateOne = async (req, res) => {
  const transactionId = req.params.id;
  validateObjectId(transactionId, "transactionId");

  const { amount, categoryId, accountId, occurredAt, note } = req.body;

  if (
    amount === undefined &&
    categoryId === undefined &&
    accountId === undefined &&
    occurredAt === undefined &&
    note === undefined
  ) {
    throw new AppError(ERROR_CODES.NOTHING_TO_PERFORM, "Nothing to update", 400);
  }

  const updateData = {};
  if (amount !== undefined) updateData.amount = amount;
  if (categoryId !== undefined) updateData.categoryId = categoryId;
  if (accountId !== undefined) updateData.accountId = accountId;
  if (occurredAt !== undefined) updateData.occurredAt = occurredAt;
  if (note !== undefined) updateData.note = note;

  const transaction = await transactionService.updateOne({
    userId: req.user.id,
    transactionId,
    data: updateData,
  });

  res.status(200).json(
    new ApiResponse({
      data: transaction,
      message: "Transaction updated successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * Update Many Transactions
 * PATCH /transactions
 * ---------------------------------------------------
 */
export const updateMany = async (req, res) => {
  const { ids, data } = req.body;

  if (!Array.isArray(ids) || ids.length === 0 || !data) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "ids[] and data are required", 400);
  }

  ids.forEach((id) => validateObjectId(id, "transactionId"));

  const result = await transactionService.updateMany({
    userId: req.user.id,
    transactionIds: ids,
    data,
  });

  res.status(200).json(
    new ApiResponse({
      data: result,
      message: "Transactions updated successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * Delete One Transaction (Soft)
 * DELETE /transactions/:id
 * ---------------------------------------------------
 */
export const deleteOne = async (req, res) => {
  const transactionId = req.params.id;
  validateObjectId(transactionId, "transactionId");

  await transactionService.deleteOne({
    userId: req.user.id,
    transactionId,
  });

  res.status(200).json(
    new ApiResponse({
      message: "Transaction deleted successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * Delete Many Transactions (Soft)
 * DELETE /transactions
 * ---------------------------------------------------
 */
export const deleteMany = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "ids[] is required", 400);
  }

  ids.forEach((id) => validateObjectId(id, "transactionId"));

  await transactionService.deleteMany({
    userId: req.user.id,
    transactionIds: ids,
  });

  res.status(200).json(
    new ApiResponse({
      message: "Transactions deleted successfully",
    })
  );
};
