import { accountQuery } from "./account.query.js";
import AppError from "../../helpers/AppError.js";
import { ERROR_CODES } from "../../constants/errorCodes.js";

/**
 * ---------------------------------------------------
 * Create Account
 * ---------------------------------------------------
 */
export async function create({ userId, data }) {
  const {
    name,
    type,
    balance = 0,
    creditLimit,
    billingDay,
    dueInDays,
    icon,
    openingBalance,
  } = data;

  if (!name || !type) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Name and type required", 400);
  }

  const normalizedName = name.toLowerCase();

  // prevent duplicate active accounts
  const existing = await accountQuery.findOne({
    userId,
    name: normalizedName,
    type,
    isDeleted: false,
  });

  if (existing) {
    throw new AppError(ERROR_CODES.ACCOUNT_ALREADY_EXISTS, "Account already exists", 409);
  }
  const isCreditCard = type === "credit_card";
  // credit card invariants
  if (isCreditCard) {
    if (creditLimit === undefined || billingDay === undefined || dueInDays === undefined) {
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
  if (type !== "credit_card") {
    if (openingBalance === undefined) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Need openingBalance", 400);
    }
  }
  const payload = isCreditCard
    ? { creditLimit, billingDay, dueInDays, icon, balance }
    : { balance: openingBalance, openingBalance };
  // for credit cards balance is current outstanding balance, future transactions will adjusted from that
  return accountQuery.create({
    userId,
    name,
    type,
    ...payload,
  });
}

/**
 * ---------------------------------------------------
 * List Accounts
 * ---------------------------------------------------
 */
export async function list({ userId, query }) {
  const { type, limit = 50, offset = 0 } = query;

  const filter = { userId, isDeleted: false };
  if (type) filter.type = type;

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
export async function getById({ userId, accountId }) {
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
 * Update Account
 * ---------------------------------------------------
 */
export async function update({ userId, accountId, data }) {
  const account = await accountQuery.findOne({
    _id: accountId,
    userId,
    isDeleted: false,
  });

  if (!account) {
    throw new AppError(ERROR_CODES.ACCOUNT_NOT_FOUND, "Account not found", 404);
  }

  // immutables
  if ("type" in data) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Account type is immutable", 400);
  }

  if ("balance" in data) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Balance cannot be modified directly", 400);
  }

  if ("name" in data && data.name === "") {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Name cannot be empty", 400);
  }

  if ("icon" in data && data.icon === "") {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Icon cannot be empty", 400);
  }

  // credit card enforcement
  if (account.type === "credit_card") {
    if ("creditLimit" in data && data.creditLimit <= 0) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Invalid credit limit", 400);
    }

    if ("billingDay" in data && (data.billingDay < 1 || data.billingDay > 31)) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Invalid billing day", 400);
    }

    if ("dueInDays" in data && data.dueInDays <= 0) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Invalid due period", 400);
    }
  } else {
    if ("creditLimit" in data || "billingDay" in data || "dueInDays" in data) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Credit card fields not allowed", 400);
    }
  }

  return accountQuery.updateById(accountId, {
    ...data,
    updatedAt: new Date(),
  });
}

/**
 * ---------------------------------------------------
 * Delete Account (Soft)
 * ---------------------------------------------------
 */
export async function remove({ userId, accountId }) {
  const account = await accountQuery.findOne({
    _id: accountId,
    userId,
    isDeleted: false,
  });

  if (!account) {
    throw new AppError(ERROR_CODES.ACCOUNT_NOT_FOUND, "Account not found", 404);
  }

  // IMPORTANT: future check
  // TODO: prevent deletion if account has active transactions

  await accountQuery.softDeleteById(accountId);
}
