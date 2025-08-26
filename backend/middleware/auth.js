const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      message: 'No authentication token provided',
      error: 'Unauthorized',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };  // Storing decoded information in the request object
    next();  // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('Authentication error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token has expired. Please log in again.',
        error: 'TokenExpired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid authentication token',
        error: 'InvalidToken',
      });
    }

    res.status(500).json({
      message: 'Server error during authentication',
      error: 'InternalServerError',
    });
  }
};
