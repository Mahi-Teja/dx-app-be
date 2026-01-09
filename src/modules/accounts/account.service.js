import mongoose from "mongoose";
import { accountQuery } from "./account.query.js";
import { transactionQuery } from "../transactions/transaction.query.js";
import AppError from "../../helpers/AppError.js";
import { ERROR_CODES } from "../../constants/errorCodes.js";

/**
 * ---------------------------------------------------
 * Create Account (Ledger-safe)
 * ---------------------------------------------------
 */
export async function createAccount({ userId, intent }) {
  const { name, type, icon, creditLimit, billingDay, dueInDays, initialBalance, asOf } = intent;

  if (!name || !type) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Name and type are required", 400);
  }

  // prevent duplicate
  const existing = await accountQuery.findOne({
    userId,
    name: name.trim(),
    type,
    isDeleted: false,
  });

  if (existing) {
    throw new AppError(ERROR_CODES.ACCOUNT_ALREADY_EXISTS, "Account already exists", 409);
  }

  const isCreditCard = type === "credit_card";

  // validate credit card metadata
  if (isCreditCard) {
    if (creditLimit == null || billingDay == null || dueInDays == null) {
      throw new AppError(
        ERROR_CODES.INVALID_INPUT,
        "Credit card requires creditLimit, billingDay, dueInDays",
        400
      );
    }
    if (creditLimit <= 0) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Invalid credit limit", 400);
    }
    if (billingDay < 1 || billingDay > 31) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Invalid billing day", 400);
    }
    if (dueInDays <= 0) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Invalid due period", 400);
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create account with ZERO balance (cache)
    const account = await accountQuery.create(
      {
        userId,
        name: name.trim(),
        type,
        icon: icon || "💰",
        creditLimit: isCreditCard ? Number(creditLimit) : undefined,
        billingDay: isCreditCard ? Number(billingDay) : undefined,
        dueInDays: isCreditCard ? Number(dueInDays) : undefined,
        balance: 0, // IMPORTANT: start at zero
      },
      { session }
    );

    // 2. Create opening balance transaction if provided
    const amount = Number(initialBalance || 0);

    if (amount !== 0) {
      const occurredAt = asOf ? new Date(asOf) : new Date();

      // For credit card:
      // Positive initialBalance = user OWES money
      const direction = isCreditCard
        ? amount >= 0
          ? "debit"
          : "credit"
        : amount >= 0
        ? "credit"
        : "debit";

      const absAmount = Math.abs(amount);

      // Create system opening balance transaction
      await transactionQuery.create(
        {
          userId,
          type: "opening_balance",
          categorySlug: "__opening_balance__",
          accountId: account._id,
          direction,
          amount: absAmount,
          occurredAt,
          timezone: "UTC", // or take from client
          isDeleted: false,
        },
        { session }
      );

      // 3. Update cached balance
      const delta = direction === "credit" ? absAmount : -absAmount;

      await accountQuery.updateById(account._id, { $inc: { balance: delta } }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return accountQuery.findById(account._id);
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    throw e;
  }
}

/**
 * ---------------------------------------------------
 * List Accounts
 * ---------------------------------------------------
 */
export async function listAccounts({ userId, query }) {
  const { type, limit = 50, offset = 0 } = query;

  const filter = { userId, isDeleted: false };
  if (type) filter.type = type;
  // TODO: Find transaction with the accountId and type _openingBalance_ and send with the response
  return accountQuery.find(filter, {
    limit: Number(limit),
    offset: Number(offset),
  });
}

/**
 * ---------------------------------------------------
 * Get Account By ID
 * ---------------------------------------------------
 */
export async function getAccountById({ userId, accountId }) {
  const account = await accountQuery.findOne({
    _id: accountId,
    userId,
    isDeleted: false,
  });

  if (!account) {
    throw new AppError(ERROR_CODES.ACCOUNT_NOT_FOUND, "Account not found", 404);
  }

  return account;
}

/**
 * ---------------------------------------------------
 * Update Account Metadata ONLY
 * ---------------------------------------------------
 */
export async function updateAccountMetadata({ userId, accountId, patch }) {
  const account = await accountQuery.findOne({
    _id: accountId,
    userId,
    isDeleted: false,
  });

  if (!account) {
    throw new AppError(ERROR_CODES.ACCOUNT_NOT_FOUND, "Account not found", 404);
  }

  // Hard invariants
  if ("type" in patch) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Account type is immutable", 400);
  }
  if ("balance" in patch) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Balance cannot be modified directly", 400);
  }

  // Credit card rules
  if (account.type === "credit_card") {
    if ("creditLimit" in patch && patch.creditLimit <= 0) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Invalid credit limit", 400);
    }
    if ("billingDay" in patch && (patch.billingDay < 1 || patch.billingDay > 31)) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Invalid billing day", 400);
    }
    if ("dueInDays" in patch && patch.dueInDays <= 0) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Invalid due period", 400);
    }
  } else {
    if ("creditLimit" in patch || "billingDay" in patch || "dueInDays" in patch) {
      throw new AppError(
        ERROR_CODES.INVALID_INPUT,
        "Credit card fields not allowed for this account type",
        400
      );
    }
  }

  return accountQuery.updateById(accountId, {
    ...patch,
    updatedAt: new Date(),
  });
}

/**
 * ---------------------------------------------------
 * Archive Account (Soft Delete)
 * ---------------------------------------------------
 */
export async function archiveAccount({ userId, accountId }) {
  const account = await accountQuery.findOne({
    _id: accountId,
    userId,
    isDeleted: false,
  });

  if (!account) {
    throw new AppError(ERROR_CODES.ACCOUNT_NOT_FOUND, "Account not found", 404);
  }

  // TODO: enforce zero balance or no active transactions

  await accountQuery.softDeleteById(accountId);
}
