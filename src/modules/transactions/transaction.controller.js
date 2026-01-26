import { ApiResponse } from "../../helpers/AppResponse.js";
import AppError from "../../helpers/AppError.js";
import { ERROR_CODES } from "../../constants/errorCodes.js";
import { validateObjectId } from "../../helpers/validateId.js";
import { transactionService } from "./transaction.service.js";

/**
 * ---------------------------------------------------
 * Create Transaction
 * POST /transactions
 * ---------------------------------------------------
 */
export const create = async (req, res) => {
  const {
    type,
    amount,
    direction,
    accountId,
    toAccountId,
    categoryId,
    description,
    note,
    occurredAt,
    timezone,
    clientTxnId,
  } = req.body;

  if (!type || !amount || !direction || !accountId || !timezone) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Missing required fields", 400);
  }

  if (!["debit", "credit"].includes(direction)) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Invalid direction", 400);
  }

  if (!["expense", "income", "transfer", "opening_balance", "adjustment"].includes(type)) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Invalid transaction type", 400);
  }

  if (type === "transfer" && !toAccountId) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "toAccountId required for transfer", 400);
  }

  validateObjectId(accountId, "accountId");
  if (toAccountId) validateObjectId(toAccountId, "toAccountId");
  if (categoryId) validateObjectId(categoryId, "categoryId");

  const intent = {
    type,
    direction,
    amount: Number(amount),
    accountId,
    toAccountId,
    categoryId,
    description,
    note,
    clientTxnId,
    timezone,
    occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
  };
  const transaction = await transactionService.create({
    userId: req.user.id,
    intent,
  });

  res.status(201).json(
    new ApiResponse({
      statusCode: 201,
      data: transaction,
      message: "Transaction created",
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
      statusCode: 200,
      data: transaction,
      message: "Transaction fetched",
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
  const result = await transactionService.list({
    userId: req.user.id,
    query: req.query,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: result,
      message: "Transactions fetched",
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
  const { id } = req.params;
  validateObjectId(id, "transactionId");

  const updated = await transactionService.editOne({
    userId: req.user.id,
    transactionId: id,
    patch: req.body,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: updated,
      message: "Updated successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * Delete One Transaction
 * DELETE /transactions/:id
 * ---------------------------------------------------
 */
export const deleteOne = async (req, res) => {
  const { id } = req.params;
  validateObjectId(id, "transactionId");

  await transactionService.deleteOne({
    userId: req.user.id,
    transactionId: id,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: null,
      message: "Deleted successfully",
    })
  );
};

/**
 * ---------------------------------------------------
 * Delete Many Transactions
 * DELETE /transactions/bulk
 * ---------------------------------------------------
 */
export const deleteMany = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "IDs array required", 400);
  }

  ids.forEach((id) => validateObjectId(id, "transactionId"));

  await transactionService.deleteMany({
    userId: req.user.id,
    transactionIds: ids,
  });

  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      data: null,
      message: "Bulk delete successful",
    })
  );
};
