const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Search users by username
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ 
        message: 'Search query must be at least 2 characters long' 
      });
    }

    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.user.id } // Exclude current user
    })
    .select('username email profilePicture')
    .limit(20);

    res.json(users);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
});

// Send friend request
router.post('/request/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const targetUser = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (currentUser.friends.includes(userId)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Check if request already sent
    if (currentUser.friendRequests.sent.includes(userId)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if request already received from this user
    if (currentUser.friendRequests.received.includes(userId)) {
      return res.status(400).json({ message: 'This user has already sent you a friend request' });
    }

    // Add to sent requests for current user
    currentUser.friendRequests.sent.push(userId);
    await currentUser.save();

    // Add to received requests for target user
    targetUser.friendRequests.received.push(currentUserId);
    await targetUser.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Error sending friend request' });
  }
});

// Accept friend request
router.post('/accept/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const requestUser = await User.findById(userId);

    if (!requestUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if friend request exists
    if (!currentUser.friendRequests.received.includes(userId)) {
      return res.status(400).json({ message: 'No friend request from this user' });
    }

    // Add to friends list for both users
    currentUser.friends.push(userId);
    requestUser.friends.push(currentUserId);

    // Remove from friend requests
    currentUser.friendRequests.received = currentUser.friendRequests.received.filter(
      id => id.toString() !== userId
    );
    requestUser.friendRequests.sent = requestUser.friendRequests.sent.filter(
      id => id.toString() !== currentUserId
    );

    await currentUser.save();
    await requestUser.save();

    res.json({ message: 'Friend request accepted successfully' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Error accepting friend request' });
  }
});

// Reject friend request
router.post('/reject/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const requestUser = await User.findById(userId);

    if (!requestUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from friend requests
    currentUser.friendRequests.received = currentUser.friendRequests.received.filter(
      id => id.toString() !== userId
    );
    requestUser.friendRequests.sent = requestUser.friendRequests.sent.filter(
      id => id.toString() !== currentUserId
    );

    await currentUser.save();
    await requestUser.save();

    res.json({ message: 'Friend request rejected successfully' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Error rejecting friend request' });
  }
});

// Get friends list
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'username email profilePicture');

    res.json(user.friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Error fetching friends list' });
  }
});

// Get friend requests
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friendRequests.sent', 'username email profilePicture')
      .populate('friendRequests.received', 'username email profilePicture');

    res.json({
      sent: user.friendRequests.sent,
      received: user.friendRequests.received
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Error fetching friend requests' });
  }
});

// Remove friend
router.delete('/remove/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const friendUser = await User.findById(userId);

    if (!friendUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from friends list for both users
    currentUser.friends = currentUser.friends.filter(
      id => id.toString() !== userId
    );
    friendUser.friends = friendUser.friends.filter(
      id => id.toString() !== currentUserId
    );

    await currentUser.save();
    await friendUser.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Error removing friend' });
  }
});

// Get friend's public watchlist
router.get('/:userId/watchlist', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user.id);

    // Check if users are friends
    if (!currentUser.friends.includes(userId)) {
      return res.status(403).json({ message: 'You can only view watchlists of your friends' });
    }

    const Watchlist = require('../models/Watchlist');
    const watchlist = await Watchlist.findOne({ 
      user: userId, 
      type: 'public' 
    }).populate({
      path: 'movies.movie',
      select: 'title tmdbId posterPath overview releaseDate genres voteAverage'
    }).populate('user', 'username');

    if (!watchlist) {
      return res.json({ movies: [], user: null });
    }

    res.json(watchlist);
  } catch (error) {
    console.error('Get friend watchlist error:', error);
    res.status(500).json({ message: 'Error fetching friend\'s watchlist' });
  }
});

module.exports = router;