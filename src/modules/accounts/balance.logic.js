/**
 * A delta represents a balance change for ONE account
 * Example:
 * {
 *   accountId,
 *   amount: +500 | -500
 * }
 */

/* ===================================================
 * AGGREGATE DELTAS (merge by account)
 * =================================================== */
export function aggregateDeltas(deltas = []) {
  const map = new Map();

  for (const { accountId, amount } of deltas) {
    if (!accountId) continue;

    const key = accountId.toString();
    map.set(key, (map.get(key) || 0) + amount);
  }

  return Array.from(map.entries()).map(([accountId, amount]) => ({
    accountId,
    amount,
  }));
}

/* ===================================================
 * APPLY DELTAS (persist to DB)
 * =================================================== */
import Account from "../accounts/account.model.js";

export async function applyDeltas(deltas = []) {
  for (const { accountId, amount } of deltas) {
    if (!amount) continue;

    await Account.updateOne({ _id: accountId, isDeleted: false }, { $inc: { balance: amount } });
  }
}
