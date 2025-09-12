const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'sampark-jyoti-secret-key-2024';

// Labour Self Registration (for mobile app)
router.post('/self-register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      location,
      age,
      workExperience,
      minimumWage,
      workRole,
      fieldOfWork,
      speciality,
      extraSkills,
      skillLevel,
      availability,
      workingHours,
      hasVehicle,
      vehicleType,
      hasLicense,
      licenseType,
      canLiftHeavyObjects,
      hasHealthIssues,
      emergencyContact,
      bio,
      languages,
      preferredLanguage
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !location || !age || !minimumWage || !workRole || !speciality) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, password, phone, location, age, minimum wage, work role, and speciality are required'
      });
    }

    // Validate age
    if (age < 18 || age > 70) {
      return res.status(400).json({
        status: 'error',
        message: 'Age must be between 18 and 70'
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters'
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

    // Create self-registered labour profile
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
        age: parseInt(age),
        workExperience: parseInt(workExperience) || 0,
        workLocation: location,
        minimumWage: parseInt(minimumWage),
        workRole,
        fieldOfWork: Array.isArray(fieldOfWork) ? fieldOfWork : [fieldOfWork].filter(Boolean),
        speciality,
        extraSkills: Array.isArray(extraSkills) ? extraSkills : (extraSkills ? extraSkills.split(',').map(s => s.trim()) : []),
        performanceRating: 3, // Default rating for self-registered
        skillLevel: skillLevel || 'beginner',
        availability: availability || 'full_time',
        workingHours: workingHours || 'day_shift',
        hasVehicle: hasVehicle === 'true' || hasVehicle === true,
        vehicleType: vehicleType || 'none',
        hasLicense: hasLicense === 'true' || hasLicense === true,
        licenseType: licenseType || 'none',
        canLiftHeavyObjects: canLiftHeavyObjects === 'true' || canLiftHeavyObjects === true,
        hasHealthIssues: hasHealthIssues === 'true' || hasHealthIssues === true,
        emergencyContact: emergencyContact || {},
        previousEmployers: [],
        selfRegistered: true // Mark as self-registered
      },
      isVerified: false, // Self-registered profiles need verification
      isActive: true,
      createdBy: null // No agent created this
    });

    await labour.save();

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { 
        userId: labour._id, 
        email: labour.email, 
        roles: labour.roles,
        primaryRole: labour.primaryRole 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      status: 'success',
      message: 'Labour profile created successfully! You can now login to the app.',
      data: {
        labour: {
          id: labour._id,
          name: labour.name,
          email: labour.email,
          phone: labour.phone,
          location: labour.location,
          age: labour.labourProfile.age,
          workRole: labour.labourProfile.workRole,
          speciality: labour.labourProfile.speciality,
          minimumWage: labour.labourProfile.minimumWage,
          skillLevel: labour.labourProfile.skillLevel,
          performanceRating: labour.labourProfile.performanceRating,
          selfRegistered: true
        },
        token
      }
    });

  } catch (error) {
    console.error('Self registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create labour profile',
      error: error.message
    });
  }
});

// Labour Login (for mobile app)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if labour exists
    const labour = await User.findOne({ 
      email,
      roles: 'labour'
    });

    if (!labour) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid credentials or not a labour account'
      });
    }

    // Check if labour is active
    if (!labour.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, labour.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: labour._id, 
        email: labour.email, 
        roles: labour.roles,
        primaryRole: labour.primaryRole 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        labour: {
          id: labour._id,
          name: labour.name,
          email: labour.email,
          phone: labour.phone,
          location: labour.location,
          roles: labour.roles,
          primaryRole: labour.primaryRole,
          labourProfile: labour.labourProfile,
          isVerified: labour.isVerified,
          rating: labour.rating,
          selfRegistered: labour.labourProfile.selfRegistered || false,
          createdBy: labour.createdBy
        },
        token
      }
    });

  } catch (error) {
    console.error('Labour login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get labour profile
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
    const labour = await User.findById(decoded.userId).select('-password');
    
    if (!labour || !labour.roles.includes('labour')) {
      return res.status(404).json({
        status: 'error',
        message: 'Labour profile not found'
      });
    }

    res.json({
      status: 'success',
      data: { labour }
    });

  } catch (error) {
    console.error('Get labour profile error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
});

// Update labour profile (self-update)
router.put('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const {
      phone,
      location,
      bio,
      minimumWage,
      availability,
      workingHours,
      extraSkills,
      emergencyContact
    } = req.body;

    const updateData = {};
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (bio) updateData.bio = bio;
    
    // Labour profile updates
    if (minimumWage) updateData['labourProfile.minimumWage'] = minimumWage;
    if (availability) updateData['labourProfile.availability'] = availability;
    if (workingHours) updateData['labourProfile.workingHours'] = workingHours;
    if (extraSkills) updateData['labourProfile.extraSkills'] = extraSkills;
    if (emergencyContact) updateData['labourProfile.emergencyContact'] = emergencyContact;

    const labour = await User.findByIdAndUpdate(
      decoded.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!labour || !labour.roles.includes('labour')) {
      return res.status(404).json({
        status: 'error',
        message: 'Labour profile not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { labour }
    });

  } catch (error) {
    console.error('Update labour profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

module.exports = router;






