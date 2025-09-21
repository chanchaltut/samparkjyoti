const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'sampark-jyoti-secret-key-2024';

// User Registration with multiple roles
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      roles, 
      primaryRole,
      location,
      languages,
      preferredLanguage,
      labourProfile,
      employerProfile,
      farmerProfile,
      buyerProfile
    } = req.body;

    // Validate roles
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one role is required'
      });
    }

    if (!primaryRole || !roles.includes(primaryRole)) {
      return res.status(400).json({
        status: 'error',
        message: 'Primary role must be one of the selected roles'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      roles,
      primaryRole,
      location,
      languages: languages || ['english'],
      preferredLanguage: preferredLanguage || 'english',
      labourProfile: roles.includes('labour') ? labourProfile : undefined,
      employerProfile: roles.includes('employer') ? employerProfile : undefined,
      farmerProfile: roles.includes('farmer') ? farmerProfile : undefined,
      buyerProfile: roles.includes('buyer') ? buyerProfile : undefined
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        roles: user.roles,
        primaryRole: user.primaryRole 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          primaryRole: user.primaryRole,
          location: user.location,
          languages: user.languages,
          preferredLanguage: user.preferredLanguage
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: error.message
    });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        roles: user.roles,
        primaryRole: user.primaryRole 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          primaryRole: user.primaryRole,
          location: user.location,
          languages: user.languages,
          preferredLanguage: user.preferredLanguage
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: { user }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: { user }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
});

// Update user roles
router.put('/roles', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { roles, primaryRole } = req.body;

    // Validate roles
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one role is required'
      });
    }

    if (!primaryRole || !roles.includes(primaryRole)) {
      return res.status(400).json({
        status: 'error',
        message: 'Primary role must be one of the selected roles'
      });
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { roles, primaryRole },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      status: 'success',
      message: 'Roles updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update roles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update roles',
      error: error.message
    });
  }
});

// Get user by role
router.get('/by-role/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const { location, limit = 20, page = 1 } = req.query;

    let filter = { roles: role };
    if (location) filter.location = { $regex: location, $options: 'i' };

    const users = await User.find(filter)
      .select('-password')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ rating: -1, totalRatings: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalUsers: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

module.exports = router;
