// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, securityQuestion, securityAnswer } = req.body;

    // Validate input
    if (!username || !email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ 
        message: 'Please provide username, email, password, security question, and security answer' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    if (securityAnswer.trim().length < 1) {
      return res.status(400).json({ message: 'Security answer cannot be empty' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] }).maxTimeMS(10000);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create and save the new user (password will be hashed by pre-save middleware)
    const newUser = new User({ 
      username, 
      email, 
      password, 
      securityQuestion, 
      securityAnswer: securityAnswer.trim().toLowerCase() 
    });
    await newUser.save();

    // Generate JWT and return response
    const token = generateToken(newUser._id);
    res.status(201).json({
      token,
      user: { id: newUser._id, username: newUser.username, email: newUser.email },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email }).maxTimeMS(10000);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Verify password using the model method
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT and return response
    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// Update user profile
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update username and email
    if (username) user.username = username;
    if (email) user.email = email;

    // Update password if both current and new passwords are provided
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Delete user account
router.delete('/delete', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
});

// Get security questions list
router.get('/security-questions', (req, res) => {
  const questions = [
    'What is your favorite animal?',
    'What is your favorite flower?',
    'What is your favorite city?',
    'What is your favorite food?',
    'What is your favorite color?',
    'What is your favorite movie?',
    'What is your favorite book?',
    'What is your favorite sport?'
  ];
  res.json({ questions });
});

// Verify user and security question for password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, securityQuestion, securityAnswer } = req.body;

    // Validate input
    if (!email || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ 
        message: 'Please provide email, security question, and security answer' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).maxTimeMS(10000);
    if (!user) {
      return res.status(400).json({ message: 'User not found with this email' });
    }

    // Check if security question matches
    if (user.securityQuestion !== securityQuestion) {
      return res.status(400).json({ message: 'Security question does not match' });
    }

    // Check if security answer matches (case-insensitive)
    if (user.securityAnswer !== securityAnswer.trim().toLowerCase()) {
      return res.status(400).json({ message: 'Security answer is incorrect' });
    }

    // Generate a temporary reset token (valid for 15 minutes)
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'password-reset' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    res.json({
      message: 'Security verification successful',
      resetToken,
      userId: user._id
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset verification' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Validate input
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Please provide reset token and new password' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if token is for password reset
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Find user and update password
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

module.exports = router;
