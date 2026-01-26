import mongoose from "mongoose";
import { transactionQuery } from "./transaction.query.js";
import { accountQuery } from "../accounts/account.query.js";
import { updateBalance } from "../../coreLogic/updateBalance.js";
import AppError from "../../helpers/AppError.js";
import { ERROR_CODES } from "../../constants/errorCodes.js";
import shiftOpeningBalanceIfNeeded from "../../coreLogic/shiftOpeningBalance.js";

/**
 * ---------------------------------------------------
 * Helpers
 * ---------------------------------------------------
 */

function aggregateDeltas(deltas) {
  const map = new Map();

  for (const { accountId, delta } of deltas) {
    const key = String(accountId);
    map.set(key, (map.get(key) || 0) + delta);
  }

  return Array.from(map.entries())
    .filter(([, delta]) => delta !== 0)
    .map(([accountId, delta]) => ({ accountId, delta }));
}
function deltasFromTxn(txn) {
  const deltas = [];

  if (txn.type === "transfer") {
    deltas.push({ accountId: txn.accountId, delta: -txn.amount });
    deltas.push({ accountId: txn.toAccountId, delta: txn.amount });
  } else {
    const sign = txn.direction === "debit" ? -1 : 1;
    deltas.push({ accountId: txn.accountId, delta: sign * txn.amount });
  }

  return deltas;
}

/**
 * ---------------------------------------------------
 * Service
 * ---------------------------------------------------
 */

export const transactionService = {
  async list({ userId, query }) {
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
  },

  async create({ userId, intent }) {
    if (intent.type === "transfer" && String(intent.accountId) === String(intent.toAccountId)) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Cannot transfer to same account", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Idempotency
      if (intent.clientTxnId) {
        const existing = await transactionQuery.findOne(
          { userId, clientTxnId: intent.clientTxnId },
          { session }
        );
        if (existing) return existing;
      }

      await shiftOpeningBalanceIfNeeded({ userId, txn: intent, session });

      const deltas = updateBalance({
        operation: "create",
        before: null,
        after: intent,
      });

      for (const { accountId, delta } of deltas) {
        await accountQuery.updateBalance(accountId, delta, { session });
      }

      const [transaction] = await transactionQuery.create({ ...intent, userId }, { session });

      await session.commitTransaction();
      return transaction;
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  },

  async editOne({ userId, transactionId, patch }) {
    // Forbid illegal edits
    if ("userId" in patch || "clientTxnId" in patch) {
      throw new AppError(ERROR_CODES.INVALID_INPUT, "Illegal field change", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Load old txn
      const before = await transactionQuery
        .findOne({ _id: transactionId, userId, isDeleted: false })
        .session(session);

      if (!before) {
        throw new AppError(ERROR_CODES.TXN_NOT_FOUND, "Transaction not found", 404);
      }

      // 2. Build new txn snapshot
      const afterData = {
        ...before.toObject(),
        ...patch,
        _id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        isDeleted: false,
        replaces: before._id,
        replacedBy: undefined,
      };

      // 3. Reverse old impact
      const reverseDeltas = deltasFromTxn(before).map((d) => ({
        accountId: d.accountId,
        delta: -d.delta,
      }));

      const aggregatedReverse = aggregateDeltas(reverseDeltas);

      for (const { accountId, delta } of aggregatedReverse) {
        await accountQuery.updateBalance(accountId, delta, { session });
      }

      // 4. Mark old as deleted
      before.isDeleted = true;
      await before.save({ session });

      // 5. Create new txn
      const [created] = await transactionQuery.create(afterData, { session });

      // 6. Apply new impact
      const forwardDeltas = aggregateDeltas(deltasFromTxn(created));

      for (const { accountId, delta } of forwardDeltas) {
        await accountQuery.updateBalance(accountId, delta, { session });
      }

      // 7. Link old -> new
      before.replacedBy = created._id;
      await before.save({ session });

      await session.commitTransaction();
      return created;
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  },
  async updateOne({ userId, transactionId, patch }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const before = await transactionQuery
        .findOne({ _id: transactionId, userId, isDeleted: false })
        .session(session);

      if (!before) {
        throw new AppError(ERROR_CODES.TXN_NOT_FOUND, "Transaction not found", 404);
      }

      // Forbid changing money semantics
      // if (
      //   ("direction" in patch && before?.direction !== patch?.direction) ||
      //   ("accountId" in patch && before?.accountId !== patch?.accountId) ||
      //   ("toAccountId" in patch && before?.toAccountId !== patch?.toAccountId) ||
      //   ("type" in patch && before?.type !== patch?.type)
      // ) {
      //   throw new AppError(ERROR_CODES.INVALID_INPUT, "Cannot change money semantics", 400);
      // }

      const after = { ...before.toObject(), ...patch };

      await shiftOpeningBalanceIfNeeded({ userId, txn: before, session });
      await shiftOpeningBalanceIfNeeded({ userId, txn: after, session });

      const deltas = updateBalance({ operation: "update", before, after });

      for (const { accountId, delta } of deltas) {
        await accountQuery.updateBalance(accountId, delta, { session });
      }

      const updated = await transactionQuery.updateById(transactionId, patch, { session });

      await session.commitTransaction();
      return updated;
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  },

  async deleteOne({ userId, transactionId }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const before = await transactionQuery
        .findOne({ _id: transactionId, userId, isDeleted: false })
        .session(session);

      if (!before) {
        throw new AppError(ERROR_CODES.TXN_NOT_FOUND, "Transaction not found", 404);
      }

      await shiftOpeningBalanceIfNeeded({ userId, txn: before, session });

      const deltas = updateBalance({ operation: "delete", before, after: null });

      for (const { accountId, delta } of deltas) {
        await accountQuery.updateBalance(accountId, delta, { session });
      }

      await transactionQuery.softDeleteById(transactionId, { session });

      await session.commitTransaction();
      return { success: true };
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  },
};
