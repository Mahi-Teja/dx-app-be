const calculateSummary = (txns = []) => {
  const summary = {
    income: 0,
    expense: 0,
    balance: 0,
  };

  for (const txn of txns) {
    if (!txn || typeof txn.amount !== "number") continue;

    switch (txn.type) {
      case "income":
        summary.income += txn.amount;
        break;

      case "expense":
        summary.expense += txn.amount;
        break;

      case "transfer":
        // ignore transfers in dashboard math
        break;

      default:
        // unknown type → ignore
        break;
    }
  }

  summary.balance = summary.income - summary.expense;
  return summary;
};

const getIncome = (txns = []) =>
  txns.reduce((sum, t) => (t?.type === "income" ? sum + t.amount : sum), 0);

const getExpense = (txns = []) =>
  txns.reduce((sum, t) => (t?.type === "expense" ? sum + t.amount : sum), 0);

const getBalance = (income, expense) => income - expense;

export { getBalance, getExpense, getIncome, calculateSummary };
