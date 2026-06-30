const User = require('../models/User');
const PersonalityProfile = require('../models/PersonalityProfile');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  if (user) {
    await PersonalityProfile.create({ user: user._id });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // In production, this should be true for HTTPS
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      token: accessToken,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      token: accessToken,
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.monthlyBudget = req.body.monthlyBudget !== undefined ? req.body.monthlyBudget : user.monthlyBudget;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      monthlyBudget: updatedUser.monthlyBudget,
      currentStreak: updatedUser.currentStreak,
      longestStreak: updatedUser.longestStreak,
      token: generateAccessToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      token: generateAccessToken(user._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user._id);
    res.json({ token: accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

const logoutUser = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== token);
        await user.save();
      }
    } catch (error) {
      // Token might be invalid or expired, just clear the cookie
    }
  }
  
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  
  res.json({ message: 'Logged out successfully' });
};

module.exports = { registerUser, authUser, updateProfile, getUserProfile, refreshToken, logoutUser };
