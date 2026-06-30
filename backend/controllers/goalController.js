const Goal = require('../models/Goal');

const getGoals = async (req, res) => {
  const goals = await Goal.find({ user: req.user._id });
  res.json(goals);
};

const createGoal = async (req, res) => {
  const { title, targetAmount, deadline } = req.body;

  if (!title || !targetAmount) {
    return res.status(400).json({ message: 'Title and target amount are required' });
  }

  const goal = new Goal({
    user: req.user._id,
    title,
    targetAmount,
    deadline,
  });

  const createdGoal = await goal.save();
  res.status(201).json(createdGoal);
};

const updateGoalProgress = async (req, res) => {
  const { currentAmount } = req.body;

  const goal = await Goal.findById(req.params.id);

  if (goal && goal.user.toString() === req.user._id.toString()) {
    goal.currentAmount = currentAmount;
    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } else {
    res.status(404).json({ message: 'Goal not found' });
  }
};

const deleteGoal = async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (goal && goal.user.toString() === req.user._id.toString()) {
    await goal.deleteOne();
    res.json({ message: 'Goal removed' });
  } else {
    res.status(404).json({ message: 'Goal not found' });
  }
};

module.exports = { getGoals, createGoal, updateGoalProgress, deleteGoal };
