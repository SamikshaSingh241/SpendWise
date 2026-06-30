const Expense = require('../models/Expense');
const mongoose = require('mongoose');
const PersonalityProfile = require('../models/PersonalityProfile');

const getDistribution = async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const distribution = await Expense.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
        date: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' }
      }
    }
  ]);

  res.json(distribution);
};

const getPersonalityInsight = async (req, res) => {
  const profile = await PersonalityProfile.findOne({ user: req.user._id });
  if (profile) {
    res.json(profile);
  } else {
    res.status(404).json({ message: 'Profile not found' });
  }
};

const getTrends = async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const trends = await Expense.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
        date: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedTrends = trends.map(t => ({
    month: `${monthNames[t._id.month - 1]} ${t._id.year}`,
    total: t.total
  }));

  res.json(formattedTrends);
};

const getSuggestions = async (req, res) => {
  const profile = await PersonalityProfile.findOne({ user: req.user._id });
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const distribution = await Expense.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.user._id), date: { $gte: thirtyDaysAgo } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } }
  ]);

  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  const suggestions = [];
  const topCategory = distribution.length > 0 ? distribution[0]._id : 'N/A';
  const topAmount = distribution.length > 0 ? distribution[0].total : 0;

  if (profile.type === 'Spender') {
    suggestions.push(`As a Spender, your top category is ${topCategory}. Consider setting a strict weekly limit to save up to ${(topAmount * 0.15).toFixed(2)} this month.`);
    suggestions.push(`Automate 10% of your paycheck directly into savings before you have a chance to spend it.`);
    suggestions.push(`Implement the "24-Hour Rule" for non-essential purchases to reduce impulse buying.`);
  } else if (profile.type === 'Saver') {
    suggestions.push(`You're doing great! Your top category is ${topCategory}. However, consider investing some of your surplus to combat inflation.`);
    suggestions.push(`Look into high-yield savings accounts or index funds to maximize your idle cash.`);
    suggestions.push(`Don't forget to allocate a small "guilt-free" budget to reward yourself for your discipline.`);
  } else if (profile.type === 'Investor') {
    suggestions.push(`Your investments are growing, but keep an eye on your liquid cash reserves.`);
    suggestions.push(`Rebalance your portfolio quarterly. Ensure you're not over-leveraged in high-risk assets.`);
    suggestions.push(`Your top expense is ${topCategory}. Could any of that be redirected to tax-advantaged accounts?`);
  } else {
    suggestions.push(`You have a Balanced profile. Your highest spend is ${topCategory}. Keep tracking to maintain this harmony.`);
    suggestions.push(`Consider setting up a 50/30/20 budget framework to structure your finances even better.`);
    suggestions.push(`Review your subscriptions and recurring bills. Small recurring expenses add up quickly.`);
  }

  res.json({ type: profile.type, suggestions });
};

const getPrediction = async (req, res) => {
  const today = new Date();
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const currentMonthExpenses = await Expense.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.user._id), date: { $gte: startOfMonth } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } }
  ]);
  
  const currentMonthTotal = currentMonthExpenses.reduce((sum, cat) => sum + cat.total, 0);
  
  const daysPassed = today.getDate() || 1;
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const projectedCurrentMonth = (currentMonthTotal / daysPassed) * daysInMonth;

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);
  
  const pastExpenses = await Expense.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.user._id), date: { $gte: ninetyDaysAgo, $lt: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const pastTotal = pastExpenses.length > 0 ? pastExpenses[0].total : 0;
  const historicalAverage = pastTotal / 3;

  let predictedTotal = 0;
  if (historicalAverage === 0) {
    predictedTotal = projectedCurrentMonth;
  } else if (currentMonthTotal === 0) {
    predictedTotal = historicalAverage;
  } else {
    predictedTotal = (projectedCurrentMonth * 0.6) + (historicalAverage * 0.4);
  }

  // Persona Modifier: Adjust prediction based on user habits
  const profile = await PersonalityProfile.findOne({ user: req.user._id });
  if (profile) {
    if (profile.type === 'Spender') predictedTotal *= 1.06; // Predicts a 6% increase due to spending habits
    if (profile.type === 'Saver') predictedTotal *= 0.94; // Predicts a 6% decrease due to saving habits
    if (profile.type === 'Investor') predictedTotal *= 0.97; // Small decrease, assuming funds diverted to investments
    if (profile.type === 'Balanced') predictedTotal *= 1.02; // Standard inflation adjustment
  }

  let topCategory = 'N/A';
  let maxCatAmount = 0;
  currentMonthExpenses.forEach(cat => {
    if (cat.total > maxCatAmount) {
      maxCatAmount = cat.total;
      topCategory = cat._id;
    }
  });

  const tips = [];
  if (topCategory === 'Food') {
    tips.push(`Food costs are pacing high. Try meal prepping on Sundays to reduce dining out.`);
    tips.push(`Use cash envelopes for groceries so you don't overspend on impulse snacks.`);
  } else if (topCategory === 'Shopping') {
    tips.push(`Shopping is your highest predicted cost. Implement a '48-hour wait rule' before buying non-essentials.`);
    tips.push(`Unsubscribe from promotional emails that trigger impulse purchases.`);
  } else if (topCategory === 'Travel') {
    tips.push(`Travel costs are adding up. Look into public transit passes or carpooling.`);
    tips.push(`Book tickets at least 3 weeks in advance to secure the best rates.`);
  } else if (topCategory === 'Bills') {
    tips.push(`Review your recurring bills. Are there any streaming services you haven't used this month?`);
    tips.push(`Call your internet or insurance providers to negotiate a lower rate.`);
  } else {
    tips.push(`Your highest predicted cost is ${topCategory}. Track these specific expenses closely.`);
    tips.push(`Challenge yourself to a 'No-Spend Weekend' to offset this category's cost next month.`);
  }

  res.json({
    predictedTotal,
    topCategory,
    tips
  });
};

module.exports = { getDistribution, getPersonalityInsight, getTrends, getSuggestions, getPrediction };
