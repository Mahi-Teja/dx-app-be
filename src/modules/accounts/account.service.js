import { ERROR_CODES } from "../../constants/errorCodes.js";
import AppError from "../../helpers/AppError.js";
import { validateObjectId } from "../../helpers/validateId.js";
import { accountQuery } from "./account.query.js";

/**
 * ---------------------------------------------------
 * Create Account
 * ---------------------------------------------------
 */

export async function create({
  userId,
  name,
  type,
  balance = 0,
  creditLimit,
  billingDay,
  dueInDays,
  icon,
}) {
  if (!name || !type) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Account name and type are required", 400);
  }

  // 🔒 Check duplicate ACTIVE account per user + name + type
  const existing = await accountQuery.findOne({
    userId,
    name: name.toLowerCase(),
    type,
    isDeleted: false,
  });

  if (existing) {
    throw new AppError(ERROR_CODES.ACCOUNT_ALREADY_EXISTS, "Account already exists", 409);
  }

  // 🔒 Credit card specific validation
  if (type === "credit_card") {
    if (creditLimit === undefined || billingDay === undefined || dueInDays === undefined) {
      throw new AppError(
        ERROR_CODES.INVALID_INPUT,
        "Credit card accounts require creditLimit, billingDay and dueInDays",
        400
      );
    }
  }

  return accountQuery.create({
    userId,
    name,
    type,
    balance,
    creditLimit,
    billingDay,
    dueInDays,
    icon,
  });
}

/**
 * ---------------------------------------------------
 * List Accounts
 * ---------------------------------------------------
 */
export async function list({ userId, query }) {
  const { type, limit = 50, offset = 0 } = query;

  const filter = {
    userId,
    isDeleted: false,
  };

  if (type) filter.type = type;

  return accountQuery.find(filter, {
    limit: Number(limit),
    offset: Number(offset),
  });
}

export async function getById({ userId, accountId }) {
  const filter = {
    _id: accountId,
    userId,
    isDeleted: false,
  };

  return accountQuery.findOne(filter);
}

/**
 *
 *  UPDATE Accounts
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

  // 🚫 Reject empty strings
  if ("name" in data && data.name === "") {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Account name cannot be empty", 400);
  }

  if ("icon" in data && data.icon === "") {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Account icon cannot be empty", 400);
  }

  // 🚫 Immutable fields
  if ("type" in data && data.type !== account.type) {
    throw new AppError(ERROR_CODES.INVALID_INPUT, "Account type cannot be changed", 400);
  }

  if ("balance" in data) {
    throw new AppError(
      ERROR_CODES.INVALID_INPUT,
      "Account balance cannot be updated directly",
      400
    );
  }

  // 🔒 Credit card–specific rules (ONLY if fields are present)
  if (account.type === "credit_card") {
    if ("creditLimit" in data && data.creditLimit <= 0) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Credit limit must be greater than zero", 400);
    }

    if ("billingDay" in data && (data.billingDay < 1 || data.billingDay > 31)) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Billing day must be between 1 and 31", 400);
    }

    if ("dueInDays" in data && data.dueInDays < 0) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Due period must be a positive number", 400);
    }
  }
  // 🚫 Reject credit-card-only fields for non-credit accounts
  if (account.type !== "credit_card") {
    if (
      "creditLimit" in data ||
      "billingDay" in data ||
      "dueInDays" in data ||
      "openingBalance" in data
    ) {
      throw new AppError(
        ERROR_CODES.INVALID_INPUT,
        "Credit card fields are not allowed for this account type",
        400
      );
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

  await accountQuery.softDeleteById(accountId);
}
