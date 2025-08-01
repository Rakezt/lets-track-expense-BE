const express = require('express');
const router = express.Router();
const Expense = require('../models/expenses');
const auth = require('../middleware/auth');
const { analyzeExpenses } = require('../controllers/expensesControllers');

router.get('/', auth, async (req, res) => {
  const { sort = 'date', order = 'desc', page = 1, limit = 10 } = req.query;

  const sortField = sort;
  const sortOrder = order === 'asc' ? 1 : -1;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = { user: req.userId };

  const [expenses, total] = await Promise.all([
    Expense.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit)),
    Expense.countDocuments(query),
  ]);

  res.json({
    data: expenses,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  });
});

router.post('/', auth, async (req, res) => {
  const { amount, category, description, date } = req.body;
  const newExpense = await Expense.create({
    user: req.userId,
    amount,
    category,
    description,
    date,
  });
  res.json(newExpense);
});

router.put('/:id', auth, async (req, res) => {
  const expense = await Expense.findByIdAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true }
  );
  res.json(expense);
});

router.delete('/:id', auth, async (req, res) => {
  const expense = await Expense.findOneAndDelete({
    _id: req.params.id,
    user: req.userId,
  });
  res.json({ expense });
});

router.post('/ai/analyze', auth, analyzeExpenses);

module.exports = router;
