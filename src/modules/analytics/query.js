import { transactionQuery } from "../transactions/transaction.query.js";

export const fetchTransactions = async (filters) => {
  return transactionQuery.findManyAnalytics(filters);
};
