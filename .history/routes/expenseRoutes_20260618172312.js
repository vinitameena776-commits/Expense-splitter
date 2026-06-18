const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  addExpense,
  getGroupExpenses,
  getGroupBalances,
  getGroupSummary,
  settleExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { getGroupActivity } = require('../controllers/activityController');

router.post('/add', protect, addExpense);
router.get('/group/:groupId', protect, getGroupExpenses);
router.get('/balances/:groupId', protect, getGroupBalances);
router.get('/summary/:groupId', protect, getGroupSummary);
router.get('/activity/:groupId', protect, getGroupActivity);
router.put('/settle/:expenseId', protect, settleExpense);
router.delete('/:expenseId', protect, deleteExpense);

module.exports = router;