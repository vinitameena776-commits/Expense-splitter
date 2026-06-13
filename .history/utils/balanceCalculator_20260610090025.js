const calculateBalances = (expenses, members) => {
  // Initialize balance for each member as 0
  const balances = {};
  members.forEach(memberId => {
    balances[memberId.toString()] = 0;
  });

  // Go through each expense
  expenses.forEach(expense => {
    const paidBy = expense.paidBy.toString();

    // Person who paid gets positive balance
    balances[paidBy] += expense.amount;

    // Each person in split gets negative balance
    expense.splitAmong.forEach(split => {
      const userId = split.userId.toString();
      if (balances[userId] !== undefined) {
        balances[userId] -= split.share;
      }
    });
  });

  return balances;
};

module.exports = calculateBalances;