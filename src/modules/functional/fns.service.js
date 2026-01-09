import mongoose from "mongoose";
import Transaction from "../transactions/transaction.model.js";

/**
 * PRODUCTION-GRADE DATE RANGE HELPER
 */
const getDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);

  const end = endDate ? new Date(endDate) : new Date(startDate);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
};

export const getDashboard = async ({ userId, startDate, endDate, accountId }) => {
  const { start, end } = getDateRange(startDate, endDate);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const matchFilter = {
    userId: userObjectId,
    isDeleted: false,
    occurredAt: { $gte: start, $lte: end },
  };

  if (accountId) matchFilter.accountId = new mongoose.Types.ObjectId(accountId);

  const [results] = await Transaction.aggregate([
    { $match: matchFilter },
    {
      $facet: {
        summary: [{ $group: { _id: "$type", total: { $sum: "$amount" } } }],
        recentTransactions: [
          { $sort: { occurredAt: -1 } }, // Use occurredAt for chronological sorting
          { $limit: 10 },
          {
            $project: {
              amount: 1,
              type: 1,
              categoryId: 1,
              accountId: 1,
              occurredAt: 1, // Must match your frontend selector
              description: 1,
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const summary = { income: 0, expense: 0, balance: 0 };
  results.summary.forEach((item) => {
    if (item._id === "income") summary.income = item.total;
    if (item._id === "expense") summary.expense = item.total;
  });
  summary.balance = summary.income - summary.expense;

  // Returning the exact structure your Frontend expects
  return {
    meta: {
      range: { from: start.toISOString().split("T")[0], to: end.toISOString().split("T")[0] },
      currency: "INR",
      generatedAt: new Date(),
    },
    summary,
    activity: {
      today: {
        count: results.totalCount[0]?.count || 0,
        transactions: results.recentTransactions,
      },
    },
  };
};
