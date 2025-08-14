const mongoose = require('mongoose');
const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExpenseUsers',
      required: true,
    },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: [
        'Food & Dining',
        'Groceries',
        'Transportation',
        'Rent',
        'Health & Medical',
        'Entertainment',
        'Shopping',
        'Travel',
        'Education',
        'Personal Care',
        'Other',
      ],
      required: true,
    },
    description: { type: String },
    paymentMode: {
      type: String,
      enum: ['Cash', 'UPI', 'Internet Banking', 'Credit Card'],
      require: true,
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
