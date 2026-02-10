import { capitalize } from "../../../helpers/capitalize.js";
import { MONTHS_LIST } from "../../../constants/variables.js";

export function getWindowStart(window, now = new Date()) {
  const d = new Date(now);

  switch (window) {
    case "yearly":
      d.setFullYear(d.getFullYear() - 1);
      break;
    case "weekly":
      d.setDate(d.getDate() - 7);
      break;
    default:
      d.setMonth(d.getMonth() - 1);
  }

  d.setHours(0, 0, 0, 0);
  return d;
}

export function percentageChange(current = 0, previous = 0) {
  if (previous === 0 && current > 0) return null;
  if (previous === 0 && current === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function buildComparisons(current, previous) {
  return {
    incomePct: percentageChange(current.totals.income, previous.totals.income),
    expensePct: percentageChange(current.totals.expense, previous.totals.expense),
    netPct: percentageChange(
      current.totals.income - current.totals.expense,
      previous.totals.income - previous.totals.expense
    ),
  };
}

export function buildCharts(window, agg) {
  return {
    trends:
      window === "yearly"
        ? Object.values(agg.byMonth).sort((a, b) => a.label - b.label)
        : Object.values(agg.daysByMonth[MONTHS_LIST[new Date().getMonth()]] || {}),
    categories: {
      income: Object.values(agg.byCategory.income),
      expense: Object.values(agg.byCategory.expense),
    },
    accounts: Object.values(agg.byAccount),
  };
}

export function buildInsights2(agg, comparisons) {
  const insights = { trends: [], categories: [], accounts: [] };

  if (agg.highestSpendDay?.date) {
    insights.trends.push({
      id: "highest-spend-day",
      severity: "warning",
      metric: agg.highestSpendDay.amount,
      title: "Highest spending day",
      message: `You spent ₹${agg.highestSpendDay.amount} on ${agg.highestSpendDay.date.toDateString()}.`,
    });
  }

  insights.trends.push({
    id: "net-comparison",
    severity: comparisons.netPct >= 0 ? "good" : "warning",
    metric: comparisons.netPct,
    title: comparisons.netPct >= 0 ? "Net balance improved" : "Net balance declined",
  });

  if (agg.topCategory?.name) {
    insights.categories.push({
      id: "top-category",
      severity: "warning",
      metric: agg.topCategory.amount,
      title: "Top spending category",
      message: `${capitalize(agg.topCategory.name)} dominates your expenses.`,
    });
  }

  return insights;
}

export function buildInsights(currentAgg, comparisons) {
  /* ===============================
   INSIGHTS (GROUPED)
================================ */
  const insights = {
    trends: [],
    categories: [],
    accounts: [],
  };

  /* ---------- TRENDS ---------- */
  if (currentAgg.highestSpendDay?.date) {
    insights.trends.push({
      id: "highest-spend-day",
      severity: "warning",
      metric: currentAgg.highestSpendDay.amount,
      title: `Highest spending day`,
      message: `Your highest spending occurred on ${currentAgg.highestSpendDay.date.toDateString()}, where you spent ₹${currentAgg.highestSpendDay.amount}. Reviewing expenses from this day may help identify unusual or avoidable costs.`,
    });
  }

  if (currentAgg.mostActiveDay?.date) {
    insights.trends.push({
      id: "most-active-day",
      severity: "info",
      metric: currentAgg.mostActiveDay.count,
      title: `Most active transaction day`,
      message: `You made ${currentAgg.mostActiveDay.count} transactions on ${currentAgg.mostActiveDay.date.toLocaleDateString()}. This could indicate a busy spending day or frequent small expenses.`,
    });
  }

  insights.trends.push({
    id: "net-comparison",
    severity: comparisons.netPct >= 0 ? "good" : "warning",
    metric: comparisons.netPct,
    title: comparisons.netPct >= 0 ? "Net balance improved" : "Net balance declined",
    message:
      comparisons.netPct >= 0
        ? `Your net balance improved by ${comparisons.netPct}% compared to the previous period, indicating better income-to-expense management.`
        : `Your net balance dropped by ${Math.abs(comparisons.netPct)}% compared to the previous period, suggesting expenses may have increased or income decreased.`,
  });

  /* ---------- CATEGORIES ---------- */
  if (currentAgg.topCategory?.name) {
    insights.categories.push({
      id: "top-category",
      severity: "warning",
      metric: currentAgg.topCategory.amount,
      title: `Top spending category`,
      message: `You spent the most on ${capitalize(
        currentAgg.topCategory.name
      )}, with total expenses of ₹${currentAgg.topCategory.amount}. Keeping an eye on this category could help control overall spending.`,
      action: {
        label: "Set category budget",
        intent: "OPEN_BUDGET",
        payload: { category: currentAgg.topCategory.name },
      },
    });

    insights.categories.push({
      id: "category-share",
      severity: "info",
      metric: currentAgg.topCategory.share,
      title: `Category spending concentration`,
      message: `${capitalize(
        currentAgg.topCategory.name
      )} accounts for ${currentAgg.topCategory.share}% of your total expenses. High concentration in one category may impact budget balance.`,
    });
  }

  if (currentAgg.leastCategory?.name) {
    insights.categories.push({
      id: "least-category",
      severity: "info",
      metric: currentAgg.leastCategory.amount,
      title: `Least used category`,
      message: `${capitalize(
        currentAgg.leastCategory.name
      )} had the lowest spend this period, totaling ₹${currentAgg.leastCategory.amount}. This category currently has minimal impact on your expenses.`,
    });
  }

  /* ---------- ACCOUNTS ---------- */
  if (currentAgg.topSpendAccount?.name) {
    insights.accounts.push({
      id: "top-spend-account",
      severity: "warning",
      metric: currentAgg.topSpendAccount.amount,
      title: `Highest spending account`,
      message: `Most of your spending was from the ${capitalize(
        currentAgg.topSpendAccount.name
      )} account, totaling ₹${currentAgg.topSpendAccount.amount}. Reviewing transactions from this account may help optimize cash flow.`,
      action: {
        label: "View account",
        intent: "OPEN_ACCOUNT",
        payload: { account: currentAgg.topSpendAccount.name },
      },
    });
  }

  if (currentAgg.topIncomeAccount?.name) {
    insights.accounts.push({
      id: "top-income-account",
      severity: "good",
      metric: currentAgg.topIncomeAccount.amount,
      title: `Primary income account`,
      message: `${capitalize(
        currentAgg.topIncomeAccount.name
      )} generated the highest income this period, with ₹${currentAgg.topIncomeAccount.amount} credited.`,
    });
  }

  if (currentAgg.mostUsedAccount?.name) {
    insights.accounts.push({
      id: "most-used-account",
      severity: "info",
      metric: currentAgg.mostUsedAccount.count,
      title: `Most frequently used account`,
      message: `You used the ${capitalize(
        currentAgg.mostUsedAccount.name
      )} account for ${currentAgg.mostUsedAccount.count} transactions, making it your most active account this period.`,
    });
  }
  return insights;
}
