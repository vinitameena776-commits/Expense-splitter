const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  addExpense,
  getGroupExpenses,
  getGroupBalances,
  settleExpense
} = require('../controllers/expenseController');

router.post('/add', protect, addExpense);
router.get('/group/:groupId', protect, getGroupExpenses);
router.get('/balances/:groupId', protect, getGroupBalances);
router.put('/settle/:expenseId', protect, settleExpense);

module.exports = router;