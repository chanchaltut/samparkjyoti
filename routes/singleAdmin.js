const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'sampark-jyoti-secret-key-2024';

// Single Admin Configuration
const ADMIN_CONFIG = {
  email: 'admin@samparkjyoti.com',
  password: 'admin123456', // This will be hashed
  name: 'System Administrator',
  phone: '9999999999',
  location: 'Head Office'
};

// Initialize single admin (run once)
router.post('/initialize', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: ADMIN_CONFIG.email,
      roles: 'admin'
    });

    if (existingAdmin) {
      return res.status(400).json({
        status: 'error',
        message: 'Admin already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, salt);

    // Create single admin
    const admin = new User({
      name: ADMIN_CONFIG.name,
      email: ADMIN_CONFIG.email,
      password: hashedPassword,
      phone: ADMIN_CONFIG.phone,
      roles: ['admin'],
      primaryRole: 'admin',
      location: ADMIN_CONFIG.location,
      languages: ['english'],
      preferredLanguage: 'english',
      isVerified: true,
      isActive: true,
      bio: 'System Administrator with full access to create and manage labour profiles'
    });

    await admin.save();

    res.status(201).json({
      status: 'success',
      message: 'Single admin initialized successfully',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          roles: admin.roles
        },
        credentials: {
          email: ADMIN_CONFIG.email,
          password: ADMIN_CONFIG.password
        }
      }
    });

  } catch (error) {
    console.error('Initialize admin error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initialize admin',
      error: error.message
    });
  }
});

// Single Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Only allow the specific admin email
    if (email !== ADMIN_CONFIG.email) {
      return res.status(400).json({
        status: 'error',
        message: 'Access denied. Only the system administrator can login.'
      });
    }

    // Check if admin exists
    const admin = await User.findOne({ 
      email: ADMIN_CONFIG.email,
      roles: 'admin'
    });

    if (!admin) {
      return res.status(400).json({
        status: 'error',
        message: 'Admin not found. Please initialize the system first.'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: admin._id, 
        email: admin.email, 
        roles: admin.roles,
        primaryRole: admin.primaryRole,
        isSystemAdmin: true
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      message: 'Admin login successful',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          roles: admin.roles,
          primaryRole: admin.primaryRole,
          location: admin.location,
          isSystemAdmin: true
        },
        token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
});

// Middleware to verify single admin
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify this is the system admin
    if (!decoded.isSystemAdmin || decoded.email !== ADMIN_CONFIG.email) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Only system administrator allowed.'
      });
    }

    const admin = await User.findById(decoded.userId).select('-password');
    
    if (!admin || !admin.roles.includes('admin')) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid admin token'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

// Get admin profile
router.get('/profile', authenticateAdmin, async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: { 
        admin: req.admin,
        isSystemAdmin: true,
        permissions: {
          canCreateLabour: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canManageSystem: true
        }
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

// Create labour profile (Admin only)
router.post('/create-labour', authenticateAdmin, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      languages,
      preferredLanguage,
      bio,
      labourProfile,
      documents
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !location) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, phone, and location are required'
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

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Create labour profile
    const labour = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      roles: ['labour'],
      primaryRole: 'labour',
      location,
      languages: languages || ['english'],
      preferredLanguage: preferredLanguage || 'english',
      bio,
      labourProfile: {
        workExperience: labourProfile?.workExperience || 0,
        workLocation: labourProfile?.workLocation || location,
        minimumWage: labourProfile?.minimumWage || 0,
        fieldOfWork: labourProfile?.fieldOfWork || [],
        extraSkills: labourProfile?.extraSkills || [],
        availability: labourProfile?.availability || 'full_time'
      },
      documents: documents || [],
      isVerified: false,
      isActive: true,
      createdBy: req.admin._id
    });

    await labour.save();

    res.status(201).json({
      status: 'success',
      message: 'Labour profile created successfully',
      data: {
        labour: {
          id: labour._id,
          name: labour.name,
          email: labour.email,
          phone: labour.phone,
          location: labour.location,
          tempPassword,
          createdBy: req.admin.name
        }
      }
    });

  } catch (error) {
    console.error('Create labour error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create labour profile',
      error: error.message
    });
  }
});

// Get all labour profiles created by admin
router.get('/labour-profiles', authenticateAdmin, async (req, res) => {
  try {
    const { 
      location,
      fieldOfWork,
      experience,
      availability,
      search,
      limit = 20,
      page = 1 
    } = req.query;

    let filter = { 
      roles: 'labour',
      createdBy: req.admin._id
    };
    
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (fieldOfWork) {
      const fieldArray = Array.isArray(fieldOfWork) ? fieldOfWork : [fieldOfWork];
      filter['labourProfile.fieldOfWork'] = { $in: fieldArray };
    }
    if (experience) filter['labourProfile.workExperience'] = { $gte: parseInt(experience) };
    if (availability) filter['labourProfile.availability'] = availability;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const labourProfiles = await User.find(filter)
      .select('-password')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        labourProfiles,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProfiles: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get labour profiles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get labour profiles',
      error: error.message
    });
  }
});

// Update labour profile
router.put('/labour-profiles/:id', authenticateAdmin, async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      bio,
      labourProfile,
      isVerified,
      isActive
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (bio) updateData.bio = bio;
    if (labourProfile) updateData.labourProfile = labourProfile;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (isActive !== undefined) updateData.isActive = isActive;

    const labour = await User.findOneAndUpdate(
      { 
        _id: req.params.id, 
        roles: 'labour',
        createdBy: req.admin._id 
      },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!labour) {
      return res.status(404).json({
        status: 'error',
        message: 'Labour profile not found or access denied'
      });
    }

    res.json({
      status: 'success',
      message: 'Labour profile updated successfully',
      data: { labour }
    });

  } catch (error) {
    console.error('Update labour profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update labour profile',
      error: error.message
    });
  }
});

// Delete labour profile
router.delete('/labour-profiles/:id', authenticateAdmin, async (req, res) => {
  try {
    const labour = await User.findOneAndDelete({
      _id: req.params.id,
      roles: 'labour',
      createdBy: req.admin._id
    });

    if (!labour) {
      return res.status(404).json({
        status: 'error',
        message: 'Labour profile not found or access denied'
      });
    }

    res.json({
      status: 'success',
      message: 'Labour profile deleted successfully'
    });

  } catch (error) {
    console.error('Delete labour profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete labour profile',
      error: error.message
    });
  }
});

// Get admin dashboard stats
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const totalLabour = await User.countDocuments({ 
      roles: 'labour',
      createdBy: req.admin._id
    });
    
    const verifiedLabour = await User.countDocuments({ 
      roles: 'labour',
      createdBy: req.admin._id,
      isVerified: true
    });
    
    const activeLabour = await User.countDocuments({ 
      roles: 'labour',
      createdBy: req.admin._id,
      isActive: true
    });

    // Recent labour profiles (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLabour = await User.countDocuments({
      roles: 'labour',
      createdBy: req.admin._id,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Top labour profiles by rating
    const topLabour = await User.find({ 
      roles: 'labour',
      createdBy: req.admin._id
    })
    .select('name rating totalRatings location labourProfile')
    .sort({ rating: -1, totalRatings: -1 })
    .limit(5);

    // Field of work distribution
    const fieldDistribution = await User.aggregate([
      { 
        $match: { 
          roles: 'labour',
          createdBy: req.admin._id
        }
      },
      { $unwind: '$labourProfile.fieldOfWork' },
      { 
        $group: { 
          _id: '$labourProfile.fieldOfWork', 
          count: { $sum: 1 } 
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        stats: {
          totalLabour,
          verifiedLabour,
          activeLabour,
          recentLabour,
          verificationRate: totalLabour > 0 ? ((verifiedLabour / totalLabour) * 100).toFixed(1) : 0
        },
        topLabour,
        fieldDistribution,
        adminInfo: {
          name: req.admin.name,
          email: req.admin.email,
          location: req.admin.location,
          profilesCreated: totalLabour
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

module.exports = router;






