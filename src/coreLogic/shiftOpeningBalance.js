import { transactionQuery } from "../modules/transactions/transaction.query.js";
import { updateBalance } from "./updateBalance.js";

/**
 * Shift opening balance checkpoint if txn is backdated
 */
async function shiftOpeningBalanceIfNeeded({ userId, txn, session }) {
  if (!txn || !txn.accountId || !txn.occurredAt) return;

  const opening = await transactionQuery.findOpeningBalanceTxn(
    { userId, accountId: txn.accountId },
    { session }
  );

  if (!opening) return;

  const txnDate = new Date(txn.occurredAt);
  const openingDate = new Date(opening.occurredAt);

  if (txnDate >= openingDate) return;

  const impact = updateBalance({
    operation: "create",
    before: null,
    after: txn,
  });

  const selfImpact = impact.find((d) => String(d.accountId) === String(txn.accountId));

  if (!selfImpact) return;

  const shift = -selfImpact.delta;

  let signedOpening = opening.direction === "credit" ? opening.amount : -opening.amount;

  signedOpening += shift;

  const newDirection = signedOpening >= 0 ? "credit" : "debit";
  const newAmount = Math.abs(signedOpening);

  await transactionQuery.updateById(
    opening._id,
    {
      direction: newDirection,
      amount: newAmount,
    },
    { session }
  );
}

export default shiftOpeningBalanceIfNeeded;
