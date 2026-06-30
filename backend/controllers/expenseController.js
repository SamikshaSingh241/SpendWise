const Expense = require('../models/Expense');
const User = require('../models/User');
const { evaluatePersonality } = require('../services/personalityService'); // We will create this next

const getExpenses = async (req, res) => {
  const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
  res.json(expenses);
};

const addExpense = async (req, res) => {
  const { amount, category, description, date } = req.body;

  if (!amount || !category) {
    return res.status(400).json({ message: 'Amount and category are required' });
  }

  const expense = new Expense({
    user: req.user._id,
    amount,
    category,
    description,
    date: date || Date.now(),
  });

  const createdExpense = await expense.save();

  // Streak Evaluation Logic
  const user = await User.findById(req.user._id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysExpenses = await Expense.find({
    user: req.user._id,
    date: { $gte: today, $lt: tomorrow }
  });
  const todaySum = todaysExpenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyLimit = user.monthlyBudget > 0 ? user.monthlyBudget / 30 : Infinity;

  if (todaySum > dailyLimit && dailyLimit !== Infinity) {
    user.currentStreak = 0; // Broken streak
  } else {
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (!lastActive || lastActive.getTime() === yesterday.getTime()) {
      user.currentStreak += 1;
      if (user.currentStreak > user.longestStreak) user.longestStreak = user.currentStreak;
    } else if (lastActive.getTime() < yesterday.getTime()) {
      user.currentStreak = 1;
    }
    // If it's the same day, don't increment, just maintain
  }
  user.lastActiveDate = new Date();
  await user.save();

  // Trigger personality recalculation asynchronously
  evaluatePersonality(req.user._id).catch(err => console.error("Personality Engine Error:", err));

  res.status(201).json(createdExpense);
};

const deleteExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (expense && expense.user.toString() === req.user._id.toString()) {
    await expense.deleteOne();
    // Recalculate
    evaluatePersonality(req.user._id).catch(err => console.error("Personality Engine Error:", err));
    res.json({ message: 'Expense removed' });
  } else {
    res.status(404).json({ message: 'Expense not found' });
  }
};

module.exports = { getExpenses, addExpense, deleteExpense };
