const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Food', 'Travel', 'Shopping', 'Bills', 'Investment', 'Savings', 'Other'],
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
