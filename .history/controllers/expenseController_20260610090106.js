const Expense = require('../models/Expense');
const Group = require('../models/Group');
const calculateBalances = require('../utils/balanceCalculator');

// ADD EXPENSE
const addExpense = async (req, res) => {
  try {
    const { groupId, description, amount, splitAmong } = req.body;

    // Verify group exists and user is member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(
      m => m.toString() === req.userId
    );
    if (!isMember) {
      return res.status(403).json({ 
        message: 'You are not a member of this group' 
      });
    }

    // Calculate equal split if not provided
    let splits = splitAmong;
    if (!splits) {
      const shareAmount = amount / group.members.length;
      splits = group.members.map(memberId => ({
        userId: memberId,
        share: parseFloat(shareAmount.toFixed(2)),
        settled: false
      }));
    }

    const expense = await Expense.create({
      groupId,
      description,
      amount,
      paidBy: req.userId,
      splitAmong: splits
    });

    res.status(201).json({
      message: 'Expense added successfully',
      expense
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL EXPENSES OF A GROUP
const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await Expense.find({ groupId })
      .populate('paidBy', 'name email')
      .populate('splitAmong.userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ expenses });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET GROUP BALANCES
const getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('members', 'name email');

    const expenses = await Expense.find({ groupId });

    const balances = calculateBalances(
      expenses, 
      group.members.map(m => m._id)
    );

    // Attach member names to balances
    const balancesWithNames = group.members.map(member => ({
      userId: member._id,
      name: member.name,
      email: member.email,
      balance: balances[member._id.toString()] || 0
    }));

    res.status(200).json({ balances: balancesWithNames });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SETTLE UP
const settleExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ 
        message: 'Expense not found' 
      });
    }

    // Mark current user's split as settled
    const splitIndex = expense.splitAmong.findIndex(
      split => split.userId.toString() === req.userId
    );

    if (splitIndex === -1) {
      return res.status(400).json({ 
        message: 'You are not part of this expense' 
      });
    }

    expense.splitAmong[splitIndex].settled = true;
    await expense.save();

    res.status(200).json({
      message: 'Expense settled successfully',
      expense
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  addExpense, 
  getGroupExpenses, 
  getGroupBalances,
  settleExpense 
};