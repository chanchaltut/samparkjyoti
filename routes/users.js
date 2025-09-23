const express = require('express');
const User = require('../models/User');
const { normalizeLocation, locationsMatch } = require('../utils/locationMatcher');
const router = express.Router();

// Get all users (with filtering by roles)
router.get('/', async (req, res) => {
  try {
    const { 
      roles, 
      primaryRole,
      location, 
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

    const users = await User.find(filter)
      .select('-password')
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

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
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
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Update user profile (including role-specific profiles)
router.put('/:id', async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      location, 
      languages,
      preferredLanguage,
      bio,
      labourProfile,
      employerProfile,
      farmerProfile,
      buyerProfile
    } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (languages) updateData.languages = languages;
    if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;
    if (bio) updateData.bio = bio;
    if (labourProfile) updateData.labourProfile = labourProfile;
    if (employerProfile) updateData.employerProfile = employerProfile;
    if (farmerProfile) updateData.farmerProfile = farmerProfile;
    if (buyerProfile) updateData.buyerProfile = buyerProfile;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Get users by specific role with detailed filtering
router.get('/role/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const { 
      location, 
      experience,
      skills,
      limit = 20, 
      page = 1 
    } = req.query;

    let filter = { roles: role };
    if (location) filter.location = { $regex: location, $options: 'i' };

    // Role-specific filtering
    if (role === 'labour') {
      if (experience) filter['labourProfile.workExperience'] = { $gte: parseInt(experience) };
      if (skills) {
        const skillArray = Array.isArray(skills) ? skills : [skills];
        filter['labourProfile.fieldOfWork'] = { $in: skillArray };
      }
    } else if (role === 'employer') {
      if (experience) filter['employerProfile.workExperience'] = { $gte: parseInt(experience) };
    } else if (role === 'farmer') {
      if (skills) {
        const cropArray = Array.isArray(skills) ? skills : [skills];
        filter['farmerProfile.cropYield.cropName'] = { $in: cropArray };
      }
    } else if (role === 'buyer') {
      if (skills) {
        const categoryArray = Array.isArray(skills) ? skills : [skills];
        filter['buyerProfile.preferredCategories'] = { $in: categoryArray };
      }
    }

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

// Search users by multiple criteria
router.get('/search/advanced', async (req, res) => {
  try {
    const { 
      roles,
      location,
      skills,
      experience,
      rating,
      languages,
      limit = 20,
      page = 1
    } = req.query;

    let filter = {};
    
    if (roles) {
      const roleArray = Array.isArray(roles) ? roles : [roles];
      filter.roles = { $in: roleArray };
    }
    
    if (location) filter.location = { $regex: location, $options: 'i' };
    
    if (skills) {
      const skillArray = Array.isArray(skills) ? skills : [skills];
      filter.$or = [
        { 'labourProfile.fieldOfWork': { $in: skillArray } },
        { 'employerProfile.skillsRequired': { $in: skillArray } },
        { 'farmerProfile.specialtyYield': { $in: skillArray } }
      ];
    }
    
    if (experience) {
      filter.$or = [
        { 'labourProfile.workExperience': { $gte: parseInt(experience) } },
        { 'employerProfile.workExperience': { $gte: parseInt(experience) } }
      ];
    }
    
    if (rating) filter.rating = { $gte: parseFloat(rating) };
    
    if (languages) {
      const langArray = Array.isArray(languages) ? languages : [languages];
      filter.languages = { $in: langArray };
    }

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
    console.error('Advanced search error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Search failed',
      error: error.message
    });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Get farmers by location using location matcher
router.get('/farmers/by-location', async (req, res) => {
  try {
    const { location, district, state } = req.query;
    
    if (!location && !district && !state) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide location, district, or state parameter'
      });
    }

    // Get all farmers first
    const allFarmers = await User.find({ 
      roles: 'farmer',
      primaryRole: 'farmer'
    }).select('-password');

    let matchedFarmers = [];

    if (location) {
      // Use location matcher to find farmers in the same location
      const normalizedLocation = normalizeLocation(location);
      
      matchedFarmers = allFarmers.filter(farmer => {
        const farmerLocation = normalizeLocation(farmer.location);
        return locationsMatch(normalizedLocation, farmerLocation);
      });
    } else if (district) {
      // Match by district
      const normalizedDistrict = normalizeLocation(district);
      
      matchedFarmers = allFarmers.filter(farmer => {
        const farmerLocation = normalizeLocation(farmer.location);
        return farmerLocation.includes(normalizedDistrict) || 
               normalizedDistrict.includes(farmerLocation);
      });
    } else if (state) {
      // Match by state
      const normalizedState = normalizeLocation(state);
      
      matchedFarmers = allFarmers.filter(farmer => {
        const farmerLocation = normalizeLocation(farmer.location);
        return farmerLocation.includes(normalizedState) || 
               normalizedState.includes(farmerLocation);
      });
    }

    // Get unique districts from matched farmers
    const districts = [...new Set(matchedFarmers.map(farmer => {
      const parts = farmer.location.split(',').map(p => p.trim());
      return parts[parts.length - 2] || parts[parts.length - 1]; // Get district part
    }))];

    res.json({
      status: 'success',
      data: {
        farmers: matchedFarmers,
        districts: districts,
        totalFarmers: matchedFarmers.length,
        searchCriteria: {
          location: location || null,
          district: district || null,
          state: state || null
        }
      }
    });

  } catch (error) {
    console.error('Get farmers by location error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get farmers by location',
      error: error.message
    });
  }
});

module.exports = router;
