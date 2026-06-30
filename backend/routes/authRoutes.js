const express = require('express');
const router = express.Router();
const { registerUser, authUser, updateProfile, getUserProfile, refreshToken, logoutUser } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.put('/profile', protect, updateProfile);
router.get('/profile', protect, getUserProfile);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);

module.exports = router;
