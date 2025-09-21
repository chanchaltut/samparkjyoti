const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validation');

// Apply sanitization to all routes
router.use(sanitizeInput);

// GET /api/vendors - Get all vendors (public endpoint for farmers)
router.get('/', async (req, res) => {
  try {
    const { 
      district, 
      state, 
      tradeProduct, 
      tradeCategory,
      search,
      status = 'active',
      limit = 50, 
      page = 1 
    } = req.query;
    
    let filter = { status: status };
    
    // Apply filters
    if (district) filter.district = { $regex: district, $options: 'i' };
    if (state) filter.state = { $regex: state, $options: 'i' };
    if (tradeProduct) filter.tradeProducts = { $regex: tradeProduct, $options: 'i' };
    if (tradeCategory) filter.tradeCategories = tradeCategory;
    
    if (search) {
      filter.$or = [
        { vendorName: { $regex: search, $options: 'i' } },
        { marketName: { $regex: search, $options: 'i' } },
        { marketLocation: { $regex: search, $options: 'i' } },
        { tradeProducts: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const vendors = await Vendor.find(filter)
      .populate('createdBy', 'name email')
      .sort({ isVerified: -1, rating: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Vendor.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        vendors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalVendors: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch vendors',
      error: error.message
    });
  }
});

// GET /api/vendors/categories - Get available trade categories
router.get('/categories', (req, res) => {
  res.json({
    status: 'success',
    data: {
      categories: [
        { value: 'vegetables', label: 'Vegetables' },
        { value: 'fruits', label: 'Fruits' },
        { value: 'grains', label: 'Grains' },
        { value: 'spices', label: 'Spices' },
        { value: 'dairy', label: 'Dairy' },
        { value: 'poultry', label: 'Poultry' },
        { value: 'fish', label: 'Fish' },
        { value: 'other', label: 'Other' }
      ]
    }
  });
});

// GET /api/vendors/:id - Get vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('verifiedBy', 'name email');

    if (!vendor) {
      return res.status(404).json({
        status: 'error',
        message: 'Vendor not found'
      });
    }

    res.json({
      status: 'success',
      data: { vendor }
    });

  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch vendor',
      error: error.message
    });
  }
});

// POST /api/vendors - Create new vendor (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      vendorName,
      marketName,
      marketLocation,
      district,
      state,
      pincode,
      contactPerson,
      phone,
      email,
      address,
      tradeProducts,
      tradeCategories,
      businessType,
      licenseNumber,
      gstNumber,
      operatingDays,
      operatingHours,
      description,
      specializations,
      paymentMethods
    } = req.body;

    // Validate required fields
    if (!vendorName || !marketName || !marketLocation || !district || !state || 
        !contactPerson || !phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Create vendor
    const vendor = new Vendor({
      vendorName,
      marketName,
      marketLocation,
      district,
      state,
      pincode,
      contactPerson,
      phone,
      email,
      address,
      tradeProducts: tradeProducts || [],
      tradeCategories: tradeCategories || [],
      businessType: businessType || 'both',
      licenseNumber,
      gstNumber,
      operatingDays: operatingDays || [],
      operatingHours: operatingHours || { start: '06:00', end: '18:00' },
      description,
      specializations: specializations || [],
      paymentMethods: paymentMethods || ['cash'],
      createdBy: req.user.id
    });

    await vendor.save();

    res.status(201).json({
      status: 'success',
      message: 'Vendor created successfully',
      data: { vendor }
    });

  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create vendor',
      error: error.message
    });
  }
});

// PUT /api/vendors/:id - Update vendor (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!vendor) {
      return res.status(404).json({
        status: 'error',
        message: 'Vendor not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Vendor updated successfully',
      data: { vendor }
    });

  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update vendor',
      error: error.message
    });
  }
});

// PUT /api/vendors/:id/verify - Verify vendor (admin only)
router.put('/:id/verify', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!vendor) {
      return res.status(404).json({
        status: 'error',
        message: 'Vendor not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Vendor verified successfully',
      data: { vendor }
    });

  } catch (error) {
    console.error('Verify vendor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify vendor',
      error: error.message
    });
  }
});

// PUT /api/vendors/:id/status - Update vendor status (admin only)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be active, inactive, or suspended'
      });
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!vendor) {
      return res.status(404).json({
        status: 'error',
        message: 'Vendor not found'
      });
    }

    res.json({
      status: 'success',
      message: `Vendor status updated to ${status}`,
      data: { vendor }
    });

  } catch (error) {
    console.error('Update vendor status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update vendor status',
      error: error.message
    });
  }
});

// DELETE /api/vendors/:id - Delete vendor (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.'
      });
    }

    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        status: 'error',
        message: 'Vendor not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Vendor deleted successfully'
    });

  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete vendor',
      error: error.message
    });
  }
});

module.exports = router;
