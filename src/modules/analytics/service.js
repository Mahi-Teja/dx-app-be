import mongoose from "mongoose";
import * as analyticsQuery from "./query.js";
import { buildCharts, buildComparisons, buildInsights, getWindowStart } from "./helpers/helpers.js";
import aggregateAnalyticsData from "./helpers/aggregator.js";

export const getAnalytics = async ({ userId, window }) => {
  const baseFilter = {
    userId: new mongoose.Types.ObjectId(userId),
    isDeleted: { $ne: true },
    type: { $nin: ["opening_balance", "transfer"] },
  };

  /* -------- CURRENT WINDOW -------- */
  const currentStart = getWindowStart(window);
  const now = new Date();

  /* -------- PREVIOUS WINDOW -------- */
  const prevStart = getWindowStart(window, currentStart);

  const [currentTxns, prevTxns] = await Promise.all([
    analyticsQuery.fetchTransactions({
      ...baseFilter,
      occurredAt: { $gte: currentStart, $lte: now },
    }),
    analyticsQuery.fetchTransactions({
      ...baseFilter,
      occurredAt: { $gte: prevStart, $lt: currentStart },
    }),
  ]);

  const currentAgg = aggregateAnalyticsData(currentTxns);
  const prevAgg = aggregateAnalyticsData(prevTxns);

  const comparisons = buildComparisons(currentAgg, prevAgg);
  const insights = buildInsights(currentAgg, comparisons);

  const charts = buildCharts(window, currentAgg);
  return {
    window,
    charts,
    summary: {
      income: currentAgg.totals.income,
      expense: currentAgg.totals.expense,
      net: currentAgg.totals.income - currentAgg.totals.expense,
    },
    insights,
    comparisons,
  };
};
