import { updateBalance } from "../../coreLogic/updateBalance.js";
import { ERROR_CODES } from "../../constants/errorCodes.js";
import AppError from "../../helpers/AppError.js";
import { accountQuery } from "../accounts/account.query.js";
import { categoryQuery } from "../categories/category.query.js";
import { transactionQuery } from "./transaction.query.js";

/* ---------------------------------------------------
 * Internal helpers
 * --------------------------------------------------- */

function aggregateDeltas(deltas = []) {
  const map = new Map();

  for (const { accountId, delta } of deltas) {
    map.set(accountId, (map.get(accountId) || 0) + delta);
  }

  return Array.from(map.entries()).map(([accountId, delta]) => ({
    accountId,
    delta,
  }));
}

async function applyDeltas(deltas = []) {
  console.log(deltas);

  for (const { accountId, delta } of deltas) {
    await accountQuery.updateBalance(accountId, delta);
  }
}

/* ---------------------------------------------------
 * Create Transaction
 * --------------------------------------------------- */
export async function create({ userId, data }) {
  const { type, amount, accountId, categoryId, occurredAt, note } = data;

  if (!type || amount === undefined || amount <= 0 || !accountId) {
    throw new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      "type, amount (>0) and accountId are required",
      400
    );
  }

  // 1️⃣ Fetch dependencies
  const [account, category] = await Promise.all([
    accountQuery.findOne({ _id: accountId, userId, isDeleted: false }),
    categoryId ? categoryQuery.findOne({ _id: categoryId, userId, isDeleted: false }) : null,
  ]);

  if (!account) {
    throw new AppError(ERROR_CODES.ACCOUNT_NOT_FOUND, "Account not found", 404);
  }

  if (categoryId && !category) {
    throw new AppError(ERROR_CODES.CATEGORY_NOT_FOUND, "Category not found", 404);
  }

  if (category && category.type !== type) {
    throw new AppError(
      ERROR_CODES.INVALID_INPUT,
      "Category type does not match transaction type",
      400
    );
  }

  // 2️⃣ Compute balance deltas
  const deltas = updateBalance({
    operation: "create",
    before: null,
    after: { ...data, accountType: account.type },
  });

  // 3️⃣ Apply deltas
  await applyDeltas(aggregateDeltas(deltas));

  // 4️⃣ Persist transaction
  return transactionQuery.create({
    userId,
    type,
    amount,
    accountId,
    categoryId,
    occurredAt,
    note,
  });
}

/* ---------------------------------------------------
 * List Transactions
 * --------------------------------------------------- */
export async function list({ userId, query }) {
  const { limit = 50, offset = 0, type, accountId, categoryId, startDate, endDate } = query;

  const filter = { userId, isDeleted: false };

  if (type) filter.type = type;
  if (accountId) filter.accountId = accountId;
  if (categoryId) filter.categoryId = categoryId;

  if (startDate || endDate) {
    filter.occurredAt = {};
    if (startDate) filter.occurredAt.$gte = new Date(startDate);
    if (endDate) filter.occurredAt.$lte = new Date(endDate);
  }

  return transactionQuery.find(filter, {
    limit: Number(limit),
    offset: Number(offset),
  });
}

/* ---------------------------------------------------
 * Get Transaction By ID
 * --------------------------------------------------- */
export async function getById({ userId, transactionId }) {
  const transaction = await transactionQuery.findOne({
    _id: transactionId,
    userId,
    isDeleted: false,
  });

  if (!transaction) {
    throw new AppError(ERROR_CODES.TXN_NOT_FOUND, "Transaction not found", 404);
  }

  return transaction;
}

/* ---------------------------------------------------
 * Update One Transaction
 * --------------------------------------------------- */
export async function updateOne({ userId, transactionId, data }) {
  const before = await transactionQuery.findOne({
    _id: transactionId,
    userId,
    isDeleted: false,
  });

  if (!before) {
    throw new AppError(ERROR_CODES.TXN_NOT_FOUND, "Transaction not found", 404);
  }

  const allowedUpdates = {};

  if ("amount" in data) {
    if (data.amount <= 0) {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Amount must be > 0", 400);
    }
    allowedUpdates.amount = data.amount;
  }

  if ("categoryId" in data) allowedUpdates.categoryId = data.categoryId;
  if ("accountId" in data) allowedUpdates.accountId = data.accountId;
  if ("occurredAt" in data) allowedUpdates.occurredAt = data.occurredAt;
  if ("note" in data) allowedUpdates.note = data.note;

  if (Object.keys(allowedUpdates).length === 0) {
    throw new AppError(ERROR_CODES.NOTHING_TO_PERFORM, "Nothing to update", 400);
  }

  // fetch new account if accountId changed
  let account = null;
  if (allowedUpdates.accountId) {
    account = await accountQuery.findOne({
      _id: allowedUpdates.accountId,
      userId,
      isDeleted: false,
    });

    if (!account) {
      throw new AppError(ERROR_CODES.ACCOUNT_NOT_FOUND, "Account not found", 404);
    }
  }

  const after = {
    ...before.toObject(),
    ...allowedUpdates,
    accountType: account?.type,
  };

  // compute and apply deltas
  const deltas = updateBalance({
    operation: "update",
    before,
    after,
  });

  await applyDeltas(aggregateDeltas(deltas));

  return transactionQuery.updateById(transactionId, {
    ...allowedUpdates,
    updatedAt: new Date(),
  });
}

/* ---------------------------------------------------
 * Update Many Transactions
 * --------------------------------------------------- */
export async function updateMany({ userId, transactionIds, data }) {
  if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "transactionIds[] required", 400);
  }

  const transactions = await transactionQuery.find({
    _id: { $in: transactionIds },
    userId,
    isDeleted: false,
  });

  if (!transactions.length) return { modifiedCount: 0 };

  let allDeltas = [];

  for (const before of transactions) {
    const after = { ...before.toObject(), ...data };
    allDeltas.push(
      ...updateBalance({
        operation: "update",
        before,
        after,
      })
    );
  }

  await applyDeltas(aggregateDeltas(allDeltas));

  return transactionQuery.updateMany(
    { _id: { $in: transactionIds }, userId, isDeleted: false },
    { ...data, updatedAt: new Date() }
  );
}

/* ---------------------------------------------------
 * Delete One Transaction
 * --------------------------------------------------- */
export async function deleteOne({ userId, transactionId }) {
  const before = await transactionQuery.findOne({
    _id: transactionId,
    userId,
    isDeleted: false,
  });

  if (!before) {
    throw new AppError(ERROR_CODES.TXN_NOT_FOUND, "Transaction not found", 404);
  }

  const deltas = updateBalance({
    operation: "delete",
    before,
    after: null,
  });

  await applyDeltas(aggregateDeltas(deltas));

  await transactionQuery.softDeleteById(transactionId);
}

/* ---------------------------------------------------
 * Delete Many Transactions
 * --------------------------------------------------- */
export async function deleteMany({ userId, transactionIds }) {
  if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "transactionIds[] required", 400);
  }

  const transactions = await transactionQuery.find({
    _id: { $in: transactionIds },
    userId,
    isDeleted: false,
  });

  let allDeltas = [];

  for (const txn of transactions) {
    allDeltas.push(
      ...updateBalance({
        operation: "delete",
        before: txn,
        after: null,
      })
    );
  }

  await applyDeltas(aggregateDeltas(allDeltas));

  await transactionQuery.updateMany(
    { _id: { $in: transactionIds }, userId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() }
  );
}
