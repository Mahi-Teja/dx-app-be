import { MONTHS_LIST } from "../../../constants/variables.js";

export default function aggregateAnalyticsData(txns) {
  const buckets = {
    byCategory: { income: {}, expense: {} },
    byAccount: {},
    byMonth: {},
    daysByMonth: {},
    totals: { income: 0, expense: 0 },
  };

  let highestSpendDay = { amount: 0, date: null };
  let mostActiveDay = { count: 0, date: null };

  const accountCount = {};

  txns.forEach((tx) => {
    const amount = Number(tx.amount) || 0;
    const type = tx.type;
    const d = new Date(tx.occurredAt);

    const month = MONTHS_LIST[d.getMonth()];
    const day = d.getDate();

    buckets.totals[type] += amount;
    const cat = tx?.categoryId?.name || "Uncategorized";
    buckets.byCategory[type][cat] = buckets.byCategory[type][cat] || {
      label: cat,
      net: 0,
    };
    buckets.byCategory[type][cat].net += amount;

    const acc = tx?.accountId?.name || "Unknown";
    buckets.byAccount[acc] = buckets.byAccount[acc] || {
      label: acc,
      income: 0,
      expense: 0,
    };
    buckets.byAccount[acc][type] += amount;
    accountCount[acc] = (accountCount[acc] || 0) + 1;

    if (!buckets.byMonth[month]) {
      buckets.byMonth[month] = {
        label: new Date(d.getFullYear(), d.getMonth(), 1),
        income: 0,
        expense: 0,
        net: 0,
      };
    }
    buckets.byMonth[month][type] += amount;
    buckets.byMonth[month].net = buckets.byMonth[month].income - buckets.byMonth[month].expense;

    buckets.daysByMonth[month] = buckets.daysByMonth[month] || {};
    buckets.daysByMonth[month][day] = buckets.daysByMonth[month][day] || {
      label: d,
      income: 0,
      expense: 0,
      count: 0,
    };

    const dayBucket = buckets.daysByMonth[month][day];
    dayBucket[type] += amount;
    dayBucket.count++;

    if (type === "expense" && dayBucket.expense > highestSpendDay.amount) {
      highestSpendDay = { amount: dayBucket.expense, date: d };
    }

    if (dayBucket.count > mostActiveDay.count) {
      mostActiveDay = { count: dayBucket.count, date: d };
    }
  });

  const expenseCats = Object.entries(buckets.byCategory.expense).sort(
    (a, b) => b[1].net - a[1].net
  );

  const topCategory = expenseCats[0]
    ? {
        name: expenseCats[0][0],
        amount: expenseCats[0][1].net,
        share: Math.round((expenseCats[0][1].net / buckets.totals.expense) * 100),
      }
    : {};

  const leastCategory = expenseCats[expenseCats.length - 1]
    ? {
        name: expenseCats[expenseCats.length - 1][0],
        amount: expenseCats[expenseCats.length - 1][1].net,
      }
    : {};

  const accounts = Object.entries(buckets.byAccount);

  const topSpendAccount = accounts.reduce(
    (a, b) => (b[1].expense > a.amount ? { name: b[0], amount: b[1].expense } : a),
    { name: null, amount: 0 }
  );

  const topIncomeAccount = accounts.reduce(
    (a, b) => (b[1].income > a.amount ? { name: b[0], amount: b[1].income } : a),
    { name: null, amount: 0 }
  );

  const mostUsedAccount = Object.entries(accountCount).reduce(
    (a, b) => (b[1] > a.count ? { name: b[0], count: b[1] } : a),
    { name: null, count: 0 }
  );

  return {
    ...buckets,
    highestSpendDay,
    mostActiveDay,
    topCategory,
    leastCategory,
    topSpendAccount,
    topIncomeAccount,
    mostUsedAccount,
  };
}
