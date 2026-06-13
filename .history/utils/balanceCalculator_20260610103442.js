// Simple balance calculator
const calculateBalances = (expenses, members) => {
  const balances = {};
  members.forEach(memberId => {
    balances[memberId.toString()] = 0;
  });

  expenses.forEach(expense => {
    const paidBy = expense.paidBy.toString();
    balances[paidBy] += expense.amount;
    expense.splitAmong.forEach(split => {
      const userId = split.userId.toString();
      if (balances[userId] !== undefined) {
        balances[userId] -= split.share;
      }
    });
  });

  return balances;
};

// GREEDY SETTLEMENT ALGORITHM
// Finds minimum transactions to settle all debts
const calculateMinSettlements = (balances) => {
  const settlements = [];

  // Separate into creditors (positive) and debtors (negative)
  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([userId, balance]) => {
    if (balance > 0.01) {
      creditors.push({ userId, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ userId, amount: -balance });
    }
  });

  // Sort both arrays descending
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  // Greedy matching
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const settlementAmount = Math.min(
      creditor.amount,
      debtor.amount
    );

    settlements.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: parseFloat(settlementAmount.toFixed(2))
    });

    creditor.amount -= settlementAmount;
    debtor.amount -= settlementAmount;

    if (creditor.amount < 0.01) i++;
    if (debtor.amount < 0.01) j++;
  }

  return settlements;
};

module.exports = { calculateBalances, calculateMinSettlements };