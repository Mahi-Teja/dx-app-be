/**
 * updateBalance.js
 *
 * Pure business logic for translating a transaction change
 * into account balance deltas.
 *
 * ---------------------------------------------------------
 * Rules:
 * - Transactions are the source of truth
 * - Balances are projections
 * - This function NEVER mutates state
 * - Same input => same output
 */

/**
 * @typedef {Object} Transaction
 * @property {string} type - expense | income | transfer
 * @property {number} amount
 * @property {string} accountId
 * @property {string} [toAccountId]
 * @property {string} [accountType] - optional (e.g. credit_card)
 */

/**
 * @typedef {Object} BalanceDelta
 * @property {string} accountId
 * @property {number} delta
 */

/**
 * Compute balance deltas for a single transaction
 */
function computeImpact(txn) {
  if (!txn) return [];

  const { type, amount, accountId, toAccountId, accountType } = txn;

  if (amount <= 0) return [];

  const isCreditCard = accountType === "credit_card";

  switch (type) {
    case "expense": {
      return [
        {
          accountId,
          delta: isCreditCard ? +amount : -amount,
        },
      ];
    }

    case "income": {
      return [
        {
          accountId,
          delta: isCreditCard ? -amount : +amount,
        },
      ];
    }

    case "transfer": {
      if (!toAccountId || accountId === toAccountId) return [];

      return [
        { accountId, delta: -amount },
        { accountId: toAccountId, delta: +amount },
      ];
    }

    default:
      return [];
  }
}

/**
 * Public API
 *
 * @param {Object} params
 * @param {"create"|"update"|"delete"} params.operation
 * @param {Transaction|null} params.before
 * @param {Transaction|null} params.after
 *
 * @returns {BalanceDelta[]}
 */
export function updateBalance({ operation, before, after }) {
  let deltas = [];

  switch (operation) {
    case "create": {
      deltas = computeImpact(after);
      break;
    }

    case "delete": {
      deltas = computeImpact(before).map(({ accountId, delta }) => ({
        accountId,
        delta: -delta, // reverse
      }));
      break;
    }

    case "update": {
      const beforeImpact = computeImpact(before);
      const afterImpact = computeImpact(after);

      const net = new Map();

      for (const { accountId, delta } of beforeImpact) {
        net.set(accountId, (net.get(accountId) || 0) - delta);
      }

      for (const { accountId, delta } of afterImpact) {
        net.set(accountId, (net.get(accountId) || 0) + delta);
      }

      deltas = Array.from(net.entries())
        .filter(([, delta]) => delta !== 0)
        .map(([accountId, delta]) => ({ accountId, delta }));

      break;
    }

    default:
      deltas = [];
  }

  return deltas;
}
