require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({});
  console.log("USERS:", users.map(u => ({ username: u.username, streak: u.currentStreak, longest: u.longestStreak, lastActive: u.lastActiveDate, budget: u.monthlyBudget })));
  process.exit();
});
