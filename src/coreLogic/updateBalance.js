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
 * @property {string} [directon]
 */

/**
 * @typedef {Object} BalanceDelta
 * @property {string} accountId
 * @property {number} delta
 */

/**
 * Compute balance deltas for a single transaction
 */
/**
 * direction-based, pure, trivial
 */

function computeImpact(txn) {
  if (!txn || txn.amount <= 0) return [];

  const delta = txn.direction === "credit" ? +txn.amount : -txn.amount;

  if (txn.type === "transfer") {
    if (!txn.toAccountId || String(txn.accountId) === String(txn.toAccountId)) {
      return [];
    }

    return [
      { accountId: txn.accountId, delta: -txn.amount }, // source loses
      { accountId: txn.toAccountId, delta: +txn.amount }, // dest gains
    ];
  }

  return [
    {
      accountId: txn.accountId,
      delta,
    },
  ];
}

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
        delta: -delta,
      }));
      break;
    }

    case "update": {
      const beforeImpact = computeImpact(before);
      const afterImpact = computeImpact(after);

      const net = new Map();

      for (const { accountId, delta } of beforeImpact) {
        net.set(String(accountId), (net.get(String(accountId)) || 0) - delta);
      }

      for (const { accountId, delta } of afterImpact) {
        net.set(String(accountId), (net.get(String(accountId)) || 0) + delta);
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
