const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Agent = require('../models/Agent');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validation');

// Middleware to verify agent token (copied from agents.js)
const authenticateAgent = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'sampark-jyoti-secret-key-2024';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const agent = await Agent.findById(decoded.agentId || decoded.userId);
    if (!agent) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. Agent not found.'
      });
    }

    req.agent = agent;
    next();
  } catch (error) {
    console.error('Agent auth middleware error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

// Apply sanitization to all routes
router.use(sanitizeInput);

// POST /api/products - Post a new product (farmer posts product)
router.post('/', async (req, res) => {
  try {
    const {
      productName,
      category,
      subcategory,
      description,
      quantity,
      unit,
      pricePerUnit,
      minimumOrder,
      quality,
      condition,
      grade,
      organic,
      certification,
      location,
      district,
      state,
      pincode,
      farmLocation,
      farmer,
      urgency,
      harvestDate,
      storageCondition,
      packaging,
      deliveryOptions,
      deliveryRadius,
      images
    } = req.body;

    // Validate required fields
    if (!productName || !category || !description || !quantity || !unit || !pricePerUnit || 
        !location || !district || !state || !farmer?.name || !farmer?.phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Calculate total price
    const totalPrice = quantity * pricePerUnit;

    // Create product
    const product = new Product({
      productName,
      category,
      subcategory,
      description,
      quantity,
      unit,
      pricePerUnit,
      totalPrice,
      minimumOrder: minimumOrder || 1,
      availableQuantity: quantity,
      quality: quality || 'good',
      condition: condition || 'fresh',
      grade,
      organic: organic || false,
      certification: certification || [],
      location,
      district,
      state,
      pincode,
      farmLocation,
      farmer,
      urgency: urgency || 'medium',
      harvestDate,
      storageCondition,
      packaging,
      deliveryOptions: deliveryOptions || ['pickup'],
      deliveryRadius: deliveryRadius || 50,
      images: images || []
    });

    await product.save();

    // Find agents in the same location
    const agents = await Agent.find({
      $or: [
        { location: { $regex: location, $options: 'i' } },
        { territory: { $regex: location, $options: 'i' } },
        { district: { $regex: district, $options: 'i' } },
        { state: { $regex: state, $options: 'i' } }
      ],
      isActive: true
    }).select('name email phone location territory organization');

    // Assign to the first available agent or leave unassigned
    if (agents.length > 0) {
      product.assignedAgent = agents[0]._id;
      product.status = 'under_review';
      await product.save();
    }

    res.status(201).json({
      status: 'success',
      message: 'Product posted successfully',
      data: {
        product: {
          id: product._id,
          productName: product.productName,
          category: product.category,
          location: product.location,
          status: product.status,
          assignedAgent: agents.length > 0 ? {
            name: agents[0].name,
            phone: agents[0].phone,
            organization: agents[0].organization
          } : null,
          postedAt: product.postedAt
        }
      }
    });

  } catch (error) {
    console.error('Product posting error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to post product'
    });
  }
});

// GET /api/products - Get all approved products (for app listing)
router.get('/', async (req, res) => {
  try {
    const { category, location, district, state, search, page = 1, limit = 20 } = req.query;
    
    const filter = { status: 'approved', availableQuantity: { $gt: 0 } };
    
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (district) filter.district = { $regex: district, $options: 'i' };
    if (state) filter.state = { $regex: state, $options: 'i' };
    if (search) {
      filter.$text = { $search: search };
    }

    const products = await Product.find(filter)
      .populate('assignedAgent', 'name organization phone')
      .sort({ postedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch products'
    });
  }
});

// GET /api/products/categories - Get product categories
router.get('/categories', (req, res) => {
    res.json({
      status: 'success',
      data: {
        categories: [
          { value: 'grains', label: 'Grains' },
          { value: 'vegetables', label: 'Vegetables' },
          { value: 'fruits', label: 'Fruits' },
          { value: 'dairy', label: 'Dairy' },
          { value: 'poultry', label: 'Poultry' },
          { value: 'fish', label: 'Fish' },
          { value: 'spices', label: 'Spices' },
          { value: 'pulses', label: 'Pulses' },
          { value: 'oilseeds', label: 'Oilseeds' },
          { value: 'other', label: 'Other' }
        ]
      }
    });
});

// GET /api/products/trending - Get trending products
router.get('/trending', async (req, res) => {
  try {
    const trendingProducts = await Product.find({ 
      status: 'approved',
      availableQuantity: { $gt: 0 }
    })
      .populate('assignedAgent', 'name organization phone')
      .sort({ views: -1, postedAt: -1 })
      .limit(10);

    res.json({
      status: 'success',
      data: { products: trendingProducts }
    });

  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trending products'
    });
  }
});

// GET /api/products/:id - Get specific product details
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('assignedAgent', 'name organization phone email');

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    res.json({
      status: 'success',
      data: { product }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch product'
    });
  }
});

// GET /api/products/agent/pending - Get pending products for agent review
router.get('/agent/pending', authenticateAgent, async (req, res) => {
  try {
    const agentId = req.agent._id;
    
    const products = await Product.find({
      $or: [
        { assignedAgent: agentId, status: 'under_review' },
        { status: 'pending' }
      ]
    })
    .populate('assignedAgent', 'name organization phone')
    .sort({ postedAt: -1 });

    res.json({
      status: 'success',
      data: { products }
    });

  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending products'
    });
  }
});

// PUT /api/products/:id/validate - Agent validates a product
router.put('/:id/validate', authenticateAgent, async (req, res) => {
  try {
    const { status, validationNotes } = req.body;
    const agentId = req.agent._id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Assign agent if not already assigned
    if (!product.assignedAgent) {
      product.assignedAgent = agentId;
    }

    product.status = status;
    product.validationNotes = validationNotes || '';
    product.validatedBy = agentId;
    product.validatedAt = new Date();

    await product.save();

    res.json({
      status: 'success',
      message: `Product ${status} successfully`,
      data: { product }
    });

  } catch (error) {
    console.error('Validate product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to validate product'
    });
  }
});

// GET /api/products/agent/my-products - Get agent's assigned products
router.get('/agent/my-products', authenticateAgent, async (req, res) => {
  try {
    const agentId = req.agent._id;
    
    const products = await Product.find({ assignedAgent: agentId })
      .sort({ postedAt: -1 });

    res.json({
      status: 'success',
      data: { products }
    });

  } catch (error) {
    console.error('Get agent products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch agent products'
    });
  }
});

module.exports = router;
