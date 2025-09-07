const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Job = require('../models/Job');
const { authenticateToken, requireAdmin, requireAgent } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authenticateToken);

// Admin Dashboard Stats
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLabour = await User.countDocuments({ roles: 'labour' });
    const totalEmployers = await User.countDocuments({ roles: 'employer' });
    const totalFarmers = await User.countDocuments({ roles: 'farmer' });
    const totalBuyers = await User.countDocuments({ roles: 'buyer' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Top performing labour profiles
    const topLabour = await User.find({ roles: 'labour' })
      .select('name rating totalRatings location labourProfile')
      .sort({ rating: -1, totalRatings: -1 })
      .limit(5);

    res.json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalLabour,
          totalEmployers,
          totalFarmers,
          totalBuyers,
          totalJobs,
          activeJobs,
          verifiedUsers,
          recentRegistrations
        },
        topLabour
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// Create worker/labour profile (Agent function)
router.post('/create-worker', requireAgent, async (req, res) => {
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

    // Create worker profile
    const worker = new User({
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
      createdBy: req.user._id // Track which agent created this profile
    });

    await worker.save();

    res.status(201).json({
      status: 'success',
      message: 'Worker profile created successfully',
      data: {
        worker: {
          id: worker._id,
          name: worker.name,
          email: worker.email,
          phone: worker.phone,
          location: worker.location,
          tempPassword
        }
      }
    });

  } catch (error) {
    console.error('Create worker error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create worker profile',
      error: error.message
    });
  }
});

// Get all workers with filtering and pagination
router.get('/workers', requireAgent, async (req, res) => {
  try {
    const {
      location,
      fieldOfWork,
      experience,
      availability,
      languages,
      isVerified,
      isActive,
      search,
      limit = 20,
      page = 1
    } = req.query;

    let filter = { roles: 'labour' };
    
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (fieldOfWork) {
      const fieldArray = Array.isArray(fieldOfWork) ? fieldOfWork : [fieldOfWork];
      filter['labourProfile.fieldOfWork'] = { $in: fieldArray };
    }
    if (experience) filter['labourProfile.workExperience'] = { $gte: parseInt(experience) };
    if (availability) filter['labourProfile.availability'] = availability;
    if (languages) {
      const langArray = Array.isArray(languages) ? languages : [languages];
      filter.languages = { $in: langArray };
    }
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Search by name, email, or phone
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const workers = await User.find(filter)
      .select('-password')
      .populate('createdBy', 'name email')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        workers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalWorkers: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch workers',
      error: error.message
    });
  }
});

// Get worker by ID
router.get('/workers/:id', requireAgent, async (req, res) => {
  try {
    const worker = await User.findById(req.params.id)
      .select('-password')
      .populate('createdBy', 'name email');

    if (!worker || !worker.roles.includes('labour')) {
      return res.status(404).json({
        status: 'error',
        message: 'Worker not found'
      });
    }

    res.json({
      status: 'success',
      data: { worker }
    });

  } catch (error) {
    console.error('Get worker error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch worker',
      error: error.message
    });
  }
});

// Update worker profile
router.put('/workers/:id', requireAgent, async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      languages,
      preferredLanguage,
      bio,
      labourProfile,
      documents,
      isVerified,
      isActive
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (languages) updateData.languages = languages;
    if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;
    if (bio) updateData.bio = bio;
    if (labourProfile) updateData.labourProfile = labourProfile;
    if (documents) updateData.documents = documents;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (isActive !== undefined) updateData.isActive = isActive;

    const worker = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('createdBy', 'name email');

    if (!worker || !worker.roles.includes('labour')) {
      return res.status(404).json({
        status: 'error',
        message: 'Worker not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Worker profile updated successfully',
      data: { worker }
    });

  } catch (error) {
    console.error('Update worker error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update worker profile',
      error: error.message
    });
  }
});

// Delete worker profile
router.delete('/workers/:id', requireAdmin, async (req, res) => {
  try {
    const worker = await User.findByIdAndDelete(req.params.id);

    if (!worker || !worker.roles.includes('labour')) {
      return res.status(404).json({
        status: 'error',
        message: 'Worker not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Worker profile deleted successfully'
    });

  } catch (error) {
    console.error('Delete worker error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete worker profile',
      error: error.message
    });
  }
});

// Verify worker profile
router.put('/workers/:id/verify', requireAgent, async (req, res) => {
  try {
    const { isVerified, verificationNotes } = req.body;

    const worker = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isVerified: isVerified,
        verificationNotes: verificationNotes,
        verifiedBy: req.user._id,
        verifiedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password').populate('createdBy', 'name email');

    if (!worker || !worker.roles.includes('labour')) {
      return res.status(404).json({
        status: 'error',
        message: 'Worker not found'
      });
    }

    res.json({
      status: 'success',
      message: `Worker profile ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: { worker }
    });

  } catch (error) {
    console.error('Verify worker error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify worker profile',
      error: error.message
    });
  }
});

// Get all users (admin only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const {
      roles,
      primaryRole,
      location,
      isVerified,
      isActive,
      search,
      limit = 20,
      page = 1
    } = req.query;

    let filter = {};
    
    if (roles) {
      if (Array.isArray(roles)) {
        filter.roles = { $in: roles };
      } else {
        filter.roles = roles;
      }
    }
    if (primaryRole) filter.primaryRole = primaryRole;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('createdBy', 'name email')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

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
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Create agent account
router.post('/create-agent', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      password
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !location || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
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

    // Create agent
    const agent = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      roles: ['agent'],
      primaryRole: 'agent',
      location,
      languages: ['english'],
      preferredLanguage: 'english',
      isVerified: true,
      isActive: true,
      createdBy: req.user._id
    });

    await agent.save();

    res.status(201).json({
      status: 'success',
      message: 'Agent created successfully',
      data: {
        agent: {
          id: agent._id,
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          location: agent.location
        }
      }
    });

  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create agent',
      error: error.message
    });
  }
});

module.exports = router;






