const Expense = require('../models/Expense');
const PersonalityProfile = require('../models/PersonalityProfile');

const evaluatePersonality = async (userId) => {
  // Get expenses from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const expenses = await Expense.find({
    user: userId,
    date: { $gte: thirtyDaysAgo },
  });

  if (!expenses || expenses.length === 0) {
    return;
  }

  let totalAmount = 0;
  const categoryTotals = {
    Savings: 0,
    Investment: 0,
    Shopping: 0,
    Travel: 0,
    Food: 0,
    Bills: 0,
    Other: 0,
  };

  expenses.forEach(exp => {
    totalAmount += exp.amount;
    if (categoryTotals[exp.category] !== undefined) {
      categoryTotals[exp.category] += exp.amount;
    } else {
      categoryTotals['Other'] += exp.amount;
    }
  });

  if (totalAmount === 0) return;

  // Simple rule-based logic
  // Saver: High savings, low shopping/travel
  // Spender: High shopping, high travel, high food
  // Investor: High investments
  // Balanced: Moderate across the board

  const savingsRatio = categoryTotals['Savings'] / totalAmount;
  const investmentRatio = categoryTotals['Investment'] / totalAmount;
  const spendingRatio = (categoryTotals['Shopping'] + categoryTotals['Travel'] + categoryTotals['Food']) / totalAmount;

  let saverScore = savingsRatio * 100;
  let investorScore = investmentRatio * 100;
  let spenderScore = spendingRatio * 100;

  // Determine primary type
  let type = 'Balanced';
  if (spenderScore > 50) {
    type = 'Spender';
  } else if (investorScore > 30) {
    type = 'Investor';
  } else if (saverScore > 30) {
    type = 'Saver';
  }

  const profile = await PersonalityProfile.findOne({ user: userId });
  if (profile) {
    profile.type = type;
    profile.scores = { saverScore, spenderScore, investorScore };
    profile.lastUpdated = Date.now();
    await profile.save();
  } else {
    await PersonalityProfile.create({
      user: userId,
      type,
      scores: { saverScore, spenderScore, investorScore },
    });
  }
};

module.exports = { evaluatePersonality };
