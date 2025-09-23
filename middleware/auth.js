const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'sampark-jyoti-secret-key-2024';

// Middleware to verify JWT token (supports both user and agent tokens)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Handle agent tokens (with agentId)
    if (decoded.agentId) {
      // For agent tokens, create a mock user object with agent data
      req.user = {
        id: decoded.agentId,
        email: decoded.email,
        roles: ['agent'],
        primaryRole: 'agent',
        isAgent: true,
        permissions: decoded.permissions || {}
      };
      return next();
    }
    
    // Handle regular user tokens (with userId)
    if (decoded.userId) {
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token. User not found.'
        });
      }

      req.user = user;
      return next();
    }

    // If neither agentId nor userId is present
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token format.'
    });
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }

  // Check if user has admin role or is an agent
  const adminRoles = ['admin', 'agent', 'super_admin'];
  const hasAdminRole = req.user.roles.some(role => adminRoles.includes(role));
  
  if (!hasAdminRole) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

// Middleware to check if user is agent (can create worker profiles)
const requireAgent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }

  // Check if user has agent role or higher, or if it's an agent token
  const agentRoles = ['agent', 'admin', 'super_admin'];
  const hasAgentRole = req.user.roles && req.user.roles.some(role => agentRoles.includes(role));
  const isAgentToken = req.user.isAgent === true;
  
  if (!hasAgentRole && !isAgentToken) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Agent privileges required.'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAgent
};







