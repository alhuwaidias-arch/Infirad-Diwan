// Authentication & Authorization Middleware
const jwt = require('jsonwebtoken');
const { query } = require('../database/connection');

/**
 * Authenticate user with JWT token
 */
async function authenticate(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const result = await query(
      `SELECT user_id, email, full_name, role, status 
       FROM users 
       WHERE user_id = $1`,
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      });
    }
    
    const user = result.rows[0];
    
    // Map user_id to id for consistency in the application
    user.id = user.user_id;
    
    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Account is deactivated'
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.error('JWT Error:', error.message);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.error('Token Expired:', error.message);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired'
      });
    }
    
    console.error('Authentication error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Authorize user based on roles
 * @param {Array} allowedRoles - Array of allowed role names
 */
function authorize(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
}

/**
 * Optional authentication - doesn't fail if no token
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await query(
      `SELECT user_id, email, full_name, role, status 
       FROM users 
       WHERE user_id = $1 AND status = 'active'`,
      [decoded.userId]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      user.id = user.user_id;  // Map for consistency
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
}

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
