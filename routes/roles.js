const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get all labour profiles
router.get('/labour', async (req, res) => {
  try {
    const { 
      location, 
      fieldOfWork, 
      experience, 
      availability,
      languages,
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
    console.error('Get labour profiles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch labour profiles',
      error: error.message
    });
  }
});

// Get all employer profiles
router.get('/employer', async (req, res) => {
  try {
    const { 
      location, 
      typeOfWork, 
      experience,
      languages,
      limit = 20, 
      page = 1 
    } = req.query;
    
    let filter = { roles: 'employer' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (typeOfWork) filter['employerProfile.typeOfWork'] = typeOfWork;
    if (experience) filter['employerProfile.workExperience'] = { $gte: parseInt(experience) };
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
    console.error('Get employer profiles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch employer profiles',
      error: error.message
    });
  }
});

// Get all farmer profiles
router.get('/farmer', async (req, res) => {
  try {
    const { 
      location, 
      cropYield, 
      farmingType,
      organic,
      languages,
      limit = 20, 
      page = 1 
    } = req.query;
    
    let filter = { roles: 'farmer' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (cropYield) {
      const cropArray = Array.isArray(cropYield) ? cropYield : [cropYield];
      filter['farmerProfile.cropYield.cropName'] = { $in: cropArray };
    }
    if (farmingType) filter['farmerProfile.farmingType'] = farmingType;
    if (organic !== undefined) filter['farmerProfile.cropYield.isOrganic'] = organic === 'true';
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
    console.error('Get farmer profiles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch farmer profiles',
      error: error.message
    });
  }
});

// Get all buyer profiles
router.get('/buyer', async (req, res) => {
  try {
    const { 
      location, 
      buyerType, 
      preferredCategories,
      languages,
      limit = 20, 
      page = 1 
    } = req.query;
    
    let filter = { roles: 'buyer' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (buyerType) filter['buyerProfile.buyerType'] = buyerType;
    if (preferredCategories) {
      const categoryArray = Array.isArray(preferredCategories) ? preferredCategories : [preferredCategories];
      filter['buyerProfile.preferredCategories'] = { $in: categoryArray };
    }
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
    console.error('Get buyer profiles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch buyer profiles',
      error: error.message
    });
  }
});

// Update labour profile
router.put('/labour/:userId', async (req, res) => {
  try {
    const { 
      workExperience, 
      workLocation, 
      minimumWage, 
      fieldOfWork, 
      extraSkills, 
      availability 
    } = req.body;
    
    const updateData = {};
    if (workExperience !== undefined) updateData['labourProfile.workExperience'] = workExperience;
    if (workLocation) updateData['labourProfile.workLocation'] = workLocation;
    if (minimumWage !== undefined) updateData['labourProfile.minimumWage'] = minimumWage;
    if (fieldOfWork) updateData['labourProfile.fieldOfWork'] = fieldOfWork;
    if (extraSkills) updateData['labourProfile.extraSkills'] = extraSkills;
    if (availability) updateData['labourProfile.availability'] = availability;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
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
      message: 'Labour profile updated successfully',
      data: { user }
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

// Update employer profile
router.put('/employer/:userId', async (req, res) => {
  try {
    const { 
      workExperience, 
      workLocation, 
      typeOfWork, 
      businessDetails, 
      typicalAmount, 
      typicalDaysOfWork, 
      skillsRequired 
    } = req.body;
    
    const updateData = {};
    if (workExperience !== undefined) updateData['employerProfile.workExperience'] = workExperience;
    if (workLocation) updateData['employerProfile.workLocation'] = workLocation;
    if (typeOfWork) updateData['employerProfile.typeOfWork'] = typeOfWork;
    if (businessDetails) updateData['employerProfile.businessDetails'] = businessDetails;
    if (typicalAmount !== undefined) updateData['employerProfile.typicalAmount'] = typicalAmount;
    if (typicalDaysOfWork !== undefined) updateData['employerProfile.typicalDaysOfWork'] = typicalDaysOfWork;
    if (skillsRequired) updateData['employerProfile.skillsRequired'] = skillsRequired;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
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
      message: 'Employer profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update employer profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update employer profile',
      error: error.message
    });
  }
});

// Update farmer profile
router.put('/farmer/:userId', async (req, res) => {
  try {
    const { 
      cropYield, 
      minimumSupportPrice, 
      specialtyYield, 
      farmingType, 
      landSize, 
      landUnit 
    } = req.body;
    
    const updateData = {};
    if (cropYield) updateData['farmerProfile.cropYield'] = cropYield;
    if (minimumSupportPrice !== undefined) updateData['farmerProfile.minimumSupportPrice'] = minimumSupportPrice;
    if (specialtyYield) updateData['farmerProfile.specialtyYield'] = specialtyYield;
    if (farmingType) updateData['farmerProfile.farmingType'] = farmingType;
    if (landSize !== undefined) updateData['farmerProfile.landSize'] = landSize;
    if (landUnit) updateData['farmerProfile.landUnit'] = landUnit;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
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
      message: 'Farmer profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update farmer profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update farmer profile',
      error: error.message
    });
  }
});

// Update buyer profile
router.put('/buyer/:userId', async (req, res) => {
  try {
    const { 
      buyerType, 
      businessVerification, 
      preferredCategories, 
      typicalOrderSize, 
      orderSizeUnit 
    } = req.body;
    
    const updateData = {};
    if (buyerType) updateData['buyerProfile.buyerType'] = buyerType;
    if (businessVerification) updateData['buyerProfile.businessVerification'] = businessVerification;
    if (preferredCategories) updateData['buyerProfile.preferredCategories'] = preferredCategories;
    if (typicalOrderSize !== undefined) updateData['buyerProfile.typicalOrderSize'] = typicalOrderSize;
    if (orderSizeUnit) updateData['buyerProfile.orderSizeUnit'] = orderSizeUnit;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
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
      message: 'Buyer profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update buyer profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update buyer profile',
      error: error.message
    });
  }
});

module.exports = router;
