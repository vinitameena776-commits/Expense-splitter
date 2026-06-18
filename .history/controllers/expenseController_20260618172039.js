const { logActivity } = require('./activityController');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const {
  calculateBalances,
  calculateMinSettlements
} = require('../utils/balanceCalculator');
const sendResponse = require('../utils/apiResponse');

// ADD EXPENSE — now supports equal, exact, percentage splits
const addExpense = async (req, res) => {
  try {
    const {
      groupId,
      description,
      amount,
      category,
      notes,
      splitType,
      customSplits
    } = req.body;

    if (!groupId) {
      return sendResponse(res, 400, 'Group ID is required');
    }
    if (!description || description.trim() === '') {
      return sendResponse(res, 400, 'Description is required');
    }
    if (!amount || amount <= 0) {
      return sendResponse(res, 400,
        'Amount must be greater than 0');
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return sendResponse(res, 404, 'Group not found');
    }

    const isMember = group.members.some(
      m => m.toString() === req.userId
    );
    if (!isMember) {
      return sendResponse(res, 403,
        'You are not a member of this group');
    }

    const type = splitType || 'equal';
    let splits = [];

    if (type === 'equal') {
      // Equal split among all members
      const shareAmount = amount / group.members.length;
      splits = group.members.map(memberId => ({
        userId: memberId,
        share: parseFloat(shareAmount.toFixed(2)),
        percentage: null,
        settled: false
      }));

    } else if (type === 'exact') {
      // User provides exact amount per person
      if (!customSplits || customSplits.length === 0) {
        return sendResponse(res, 400,
          'Custom splits are required for exact split type');
      }

      const totalSplit = customSplits.reduce(
        (sum, s) => sum + s.amount, 0
      );

      if (Math.abs(totalSplit - amount) > 0.5) {
        return sendResponse(res, 400,
          `Split amounts (₹${totalSplit}) must add up to total amount (₹${amount})`);
      }

      splits = customSplits.map(s => ({
        userId: s.userId,
        share: parseFloat(s.amount.toFixed(2)),
        percentage: null,
        settled: false
      }));

    } else if (type === 'percentage') {
      // User provides percentage per person
      if (!customSplits || customSplits.length === 0) {
        return sendResponse(res, 400,
          'Custom splits are required for percentage split type');
      }

      const totalPercentage = customSplits.reduce(
        (sum, s) => sum + s.percentage, 0
      );

      if (Math.abs(totalPercentage - 100) > 0.5) {
        return sendResponse(res, 400,
          `Percentages must add up to 100% (currently ${totalPercentage}%)`);
      }

      splits = customSplits.map(s => ({
        userId: s.userId,
        share: parseFloat(((s.percentage / 100) * amount).toFixed(2)),
        percentage: s.percentage,
        settled: false
      }));
    }

    const expense = await Expense.create({
      await logActivity(
      groupId,
      req.userId,
      'expense_added',
      `added expense "${description}" of ₹${amount}`
    );
      groupId,
      description: description.trim(),
      amount,
      category: category || 'other',
      splitType: type,
      notes: notes || '',
      paidBy: req.userId,
      splitAmong: splits
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email')
      .populate('splitAmong.userId', 'name email');

    sendResponse(res, 201, 'Expense added successfully', {
      expense: populatedExpense
    });

  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

// GET ALL EXPENSES OF A GROUP — with search and filter
const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { category, search } = req.query;

    let query = { groupId };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const expenses = await Expense.find(query)
      .populate('paidBy', 'name email')
      .populate('splitAmong.userId', 'name email')
      .sort({ createdAt: -1 });

    const totalAmount = expenses.reduce(
      (sum, exp) => sum + exp.amount, 0
    );

    sendResponse(res, 200, 'Expenses fetched successfully', {
      expenses,
      summary: {
        totalExpenses: expenses.length,
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    });

  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

// GET GROUP BALANCES + MINIMUM SETTLEMENTS
const getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('members', 'name email');

    if (!group) {
      return sendResponse(res, 404, 'Group not found');
    }

    const expenses = await Expense.find({ groupId });

    const balances = calculateBalances(
      expenses,
      group.members.map(m => m._id)
    );

    const balancesWithNames = group.members.map(member => ({
      userId: member._id,
      name: member.name,
      email: member.email,
      balance: parseFloat(
        (balances[member._id.toString()] || 0).toFixed(2)
      )
    }));

    const settlements = calculateMinSettlements(balances);

    const settlementsWithNames = settlements.map(s => {
      const fromMember = group.members.find(
        m => m._id.toString() === s.from
      );
      const toMember = group.members.find(
        m => m._id.toString() === s.to
      );
      return {
        from: fromMember?.name || s.from,
        to: toMember?.name || s.to,
        amount: s.amount
      };
    });

    sendResponse(res, 200, 'Balances fetched successfully', {
      balances: balancesWithNames,
      settlements: settlementsWithNames
    });

  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

// GET GROUP SUMMARY STATS
const getGroupSummary = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('members', 'name email');

    if (!group) {
      return sendResponse(res, 404, 'Group not found');
    }

    const expenses = await Expense.find({ groupId })
      .populate('paidBy', 'name email');

    const totalSpent = expenses.reduce(
      (sum, exp) => sum + exp.amount, 0
    );

    // Spending by category
    const categoryBreakdown = {};
    expenses.forEach(exp => {
      categoryBreakdown[exp.category] =
        (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    // Spending by person (who paid how much)
    const perPersonSpending = {};
    group.members.forEach(member => {
      perPersonSpending[member._id.toString()] = {
        name: member.name,
        totalPaid: 0
      };
    });
    expenses.forEach(exp => {
      const id = exp.paidBy._id.toString();
      if (perPersonSpending[id]) {
        perPersonSpending[id].totalPaid += exp.amount;
      }
    });

    sendResponse(res, 200, 'Summary fetched successfully', {
      summary: {
        totalExpenses: expenses.length,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        averagePerExpense: expenses.length > 0
          ? parseFloat((totalSpent / expenses.length).toFixed(2))
          : 0,
        categoryBreakdown,
        perPersonSpending: Object.values(perPersonSpending)
      }
    });

  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

// SETTLE EXPENSE
const settleExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return sendResponse(res, 404, 'Expense not found');
    }

    const splitIndex = expense.splitAmong.findIndex(
      split => split.userId.toString() === req.userId
    );

    if (splitIndex === -1) {
      return sendResponse(res, 400,
        'You are not part of this expense');
    }

    expense.splitAmong[splitIndex].settled = true;
    await expense.save();

    sendResponse(res, 200, 'Expense settled successfully', {
      expense
    });

  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

// DELETE EXPENSE
const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return sendResponse(res, 404, 'Expense not found');
    }

    if (expense.paidBy.toString() !== req.userId) {
      return sendResponse(res, 403,
        'Only the person who added this expense can delete it');
    }

    
    await Expense.findByIdAndDelete(expenseId);

    sendResponse(res, 200, 'Expense deleted successfully');

  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

module.exports = {
  addExpense,
  getGroupExpenses,
  getGroupBalances,
  getGroupSummary,
  settleExpense,
  deleteExpense
};