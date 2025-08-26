const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get Profile (GET /api/profile/me)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

// Update Profile (PUT /api/profile/update)
router.put('/update', authMiddleware, async (req, res) => {
  const { username, email, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;

    // Handle password change if currentPassword and newPassword are provided
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Add logic for changing password (POST /api/profile/change-password)
router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'New passwords do not match' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error.message);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

module.exports = router;
