const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Agent = require('../models/Agent');
const User = require('../models/User');
const MarketPrice = require('../models/MarketPrice');
const Job = require('../models/Job');
const { 
  validateAgentRegistration, 
  validateAgentLogin, 
  validateWorkerCreation, 
  validateMarketPrice,
  sanitizeInput 
} = require('../middleware/validation');
const router = express.Router();

// Apply sanitization to all routes
router.use(sanitizeInput);

// GET /api/agents - Get all agents (for testing)
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json({
      status: 'success',
      message: 'Agents retrieved successfully',
      data: { agents }
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch agents',
      error: error.message
    });
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'sampark-jyoti-secret-key-2024';

// Agent Registration with Location Fields
router.post('/register', validateAgentRegistration, async (req, res) => {
  try {
    const { 
      email, 
      password, 
      name, 
      organization, 
      phone, 
      location, 
      district, 
      state, 
      pincode 
    } = req.body;

    // Validate required fields
    if (!email || !password || !name || !organization || !phone || !location || !district || !state) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password, name, organization, phone, location, district, and state are required'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please enter a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ email });
    
    if (existingAgent) {
      return res.status(400).json({
        status: 'error',
        message: 'Agent with this email already exists'
      });
    }

    // Generate default values
    const agentName = email.split('@')[0];
    const defaultPhone = '0000000000';
    const defaultLocation = 'Not specified';
    const defaultOrganization = 'Sampark Jyoti';
    const autoLicense = 'AGT_' + Date.now();
    const defaultTerritory = 'General';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new agent with provided fields
    const agent = new Agent({
      name: name || agentName,
      email,
      password: hashedPassword,
      phone: phone || defaultPhone,
      location: location || defaultLocation,
      district: district || 'Not specified',
      state: state || 'Not specified',
      pincode: pincode || '000000',
      licenseNumber: autoLicense,
      organization: organization || defaultOrganization,
      territory: defaultTerritory,
      agentId: 'AGT_' + Date.now() // Explicitly set agentId
    });

    await agent.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        agentId: agent._id,
        email: agent.email,
        role: 'agent',
        permissions: agent.permissions
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: 'success',
      message: 'Agent registered successfully',
      data: {
        agent: {
          id: agent._id,
          agentId: agent.agentId,
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          location: agent.location,
          organization: agent.organization,
          territory: agent.territory,
          isVerified: agent.isVerified,
          permissions: agent.permissions
        },
        token
      }
    });

  } catch (error) {
    console.error('Agent registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Agent Login
router.post('/login', validateAgentLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if agent exists
    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if agent is active
    if (!agent.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Update login tracking
    agent.lastLogin = new Date();
    agent.loginCount += 1;
    await agent.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        agentId: agent._id,
        email: agent.email,
        role: 'agent',
        permissions: agent.permissions
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        agent: {
          id: agent._id,
          agentId: agent.agentId,
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          location: agent.location,
          organization: agent.organization,
          territory: agent.territory,
          isVerified: agent.isVerified,
          permissions: agent.permissions,
          workersCreated: agent.workersCreated,
          priceUpdatesCount: agent.priceUpdatesCount,
          rating: agent.averageRating
        },
        token
      }
    });

  } catch (error) {
    console.error('Agent login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
});

// Middleware to verify agent token
const authenticateAgent = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const agent = await Agent.findById(decoded.agentId).select('-password');
    
    if (!agent || !agent.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token or agent not active'
      });
    }

    req.agent = agent;
    next();
  } catch (error) {
    console.error('Agent auth error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

// Get agent profile
router.get('/profile', authenticateAgent, async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: { agent: req.agent }
    });
  } catch (error) {
    console.error('Get agent profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

// Create enhanced labour profile (Agent function)
router.post('/create-labour', authenticateAgent, async (req, res) => {
  try {
    if (!req.agent.permissions.canCreateWorkers) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to create worker profiles'
      });
    }

    const {
      name,
      email,
      phone,
      location,
      age,
      workExperience,
      minimumWage,
      workRole,
      fieldOfWork,
      speciality,
      extraSkills,
      performanceRating,
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
    if (!name || !email || !phone || !location || !age || !minimumWage || !workRole || !speciality) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, phone, location, age, minimum wage, work role, and speciality are required'
      });
    }

    // Validate age
    if (age < 18 || age > 70) {
      return res.status(400).json({
        status: 'error',
        message: 'Age must be between 18 and 70'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Worker with this email already exists'
      });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Create enhanced labour profile
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
        performanceRating: parseFloat(performanceRating) || 3,
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
        previousEmployers: []
      },
      isVerified: false,
      isActive: true,
      createdBy: req.agent._id
    });

    await labour.save();

    // Update agent's worker creation count
    req.agent.workersCreated += 1;
    await req.agent.save();

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
          age: labour.labourProfile.age,
          workRole: labour.labourProfile.workRole,
          speciality: labour.labourProfile.speciality,
          minimumWage: labour.labourProfile.minimumWage,
          skillLevel: labour.labourProfile.skillLevel,
          performanceRating: labour.labourProfile.performanceRating,
          tempPassword,
          createdBy: req.agent.name,
          agentId: req.agent.agentId
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

// Create worker/labour profile (Simplified version)
router.post('/create-worker', authenticateAgent, async (req, res) => {
  try {
    if (!req.agent.permissions.canCreateWorkers) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to create worker profiles'
      });
    }

    const {
      name,
      phone,
      location,
      workRole,
      speciality,
      minimumWage
    } = req.body;

    // Validate required fields
    if (!name || !phone || !location || !workRole || !speciality || !minimumWage) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, phone, location, work role, speciality, and minimum wage are required'
      });
    }

    // Generate a simple email and password
    const email = `worker${Date.now()}@samparkjyoti.com`;
    // Generate a more user-friendly password (6 characters, mix of letters and numbers)
    const tempPassword = Math.random().toString(36).slice(-6).toUpperCase();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Create simplified worker profile
    const worker = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      roles: ['labour'],
      primaryRole: 'labour',
      location,
      languages: ['english'],
      preferredLanguage: 'english',
      labourProfile: {
        age: 25, // Default age
        workExperience: 0,
        workLocation: location,
        minimumWage: parseInt(minimumWage),
        workRole,
        fieldOfWork: ['services'], // Default field
        speciality,
        extraSkills: [],
        performanceRating: 3,
        skillLevel: 'beginner',
        availability: 'full_time',
        workingHours: 'day_shift',
        hasVehicle: false,
        vehicleType: 'none',
        hasLicense: false,
        licenseType: 'none',
        canLiftHeavyObjects: false,
        hasHealthIssues: false,
        emergencyContact: {},
        previousEmployers: []
      },
      isVerified: false,
      isActive: true,
      createdBy: req.agent._id
    });

    await worker.save();

    // Update agent's worker creation count
    req.agent.workersCreated += 1;
    await req.agent.save();

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
          workRole: worker.labourProfile.workRole,
          speciality: worker.labourProfile.speciality,
          minimumWage: worker.labourProfile.minimumWage,
          tempPassword,
          createdBy: req.agent.name,
          agentId: req.agent.agentId
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

// Get workers created by agent
router.get('/my-workers', authenticateAgent, async (req, res) => {
  try {
    const { limit = 20, page = 1, search } = req.query;
    
    let filter = { 
      createdBy: req.agent._id,
      roles: 'labour'
    };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const workers = await User.find(filter)
      .select('-password')
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
    console.error('Get my workers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get workers',
      error: error.message
    });
  }
});

// Update market price (Agent function)
router.post('/update-price', authenticateAgent, validateMarketPrice, async (req, res) => {
  try {
    if (!req.agent.permissions.canUpdatePrices) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update market prices'
      });
    }

    const {
      productName,
      category,
      currentPrice,
      unit,
      market,
      district,
      state,
      quality,
      description,
      stockQuantity,
      tags
    } = req.body;

    // Validate required fields
    if (!productName || !category || !currentPrice || !unit || !market || !district || !state) {
      return res.status(400).json({
        status: 'error',
        message: 'Product name, category, current price, unit, market, district, and state are required'
      });
    }

    // Get previous price for the same product and location
    const previousEntry = await MarketPrice.findOne({
      productName,
      location: req.agent.location,
      market
    }).sort({ createdAt: -1 });

    // Create new market price entry
    const marketPrice = new MarketPrice({
      productName,
      category,
      currentPrice,
      previousPrice: previousEntry ? previousEntry.currentPrice : 0,
      unit,
      location: req.agent.location,
      market,
      district,
      state,
      quality: quality || 'standard',
      updatedBy: req.agent._id,
      agentName: req.agent.name,
      agentLocation: req.agent.location,
      description,
      stockQuantity,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await marketPrice.save();

    // Update agent's price update count
    req.agent.priceUpdatesCount += 1;
    req.agent.lastPriceUpdate = new Date();
    await req.agent.save();

    res.status(201).json({
      status: 'success',
      message: 'Market price updated successfully',
      data: {
        marketPrice: {
          id: marketPrice._id,
          productName: marketPrice.productName,
          currentPrice: marketPrice.formattedPrice,
          previousPrice: `₹${marketPrice.previousPrice}/${marketPrice.unit}`,
          priceChange: marketPrice.priceChange,
          priceChangePercentage: marketPrice.priceChangePercentage,
          trend: marketPrice.trend,
          trendIcon: marketPrice.trendIcon,
          location: marketPrice.location,
          market: marketPrice.market,
          updatedBy: req.agent.name,
          updatedAt: marketPrice.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update market price',
      error: error.message
    });
  }
});

// Get market prices updated by agent
router.get('/my-prices', authenticateAgent, async (req, res) => {
  try {
    const { limit = 20, page = 1, category, search } = req.query;
    
    let filter = { updatedBy: req.agent._id };
    
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { market: { $regex: search, $options: 'i' } }
      ];
    }

    const prices = await MarketPrice.find(filter)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await MarketPrice.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        prices,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalPrices: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my prices error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get price updates',
      error: error.message
    });
  }
});

// Get agent dashboard stats
router.get('/dashboard', authenticateAgent, async (req, res) => {
  try {
    const agentId = req.agent._id;
    
    const workersCount = await User.countDocuments({ 
      createdBy: agentId,
      roles: 'labour'
    });
    
    const pricesCount = await MarketPrice.countDocuments({ 
      updatedBy: agentId 
    });
    
    // Get job statistics
    const totalJobs = await Job.countDocuments({ assignedAgent: agentId });
    const pendingJobs = await Job.countDocuments({ 
      assignedAgent: agentId, 
      status: { $in: ['pending', 'under_review'] }
    });
    const approvedJobs = await Job.countDocuments({ 
      assignedAgent: agentId, 
      status: 'approved'
    });
    const rejectedJobs = await Job.countDocuments({ 
      assignedAgent: agentId, 
      status: 'rejected'
    });
    
    
    const recentWorkers = await User.find({ 
      createdBy: agentId,
      roles: 'labour'
    })
    .select('name email location createdAt')
    .sort({ createdAt: -1 })
    .limit(5);
    
    const recentPrices = await MarketPrice.find({ 
      updatedBy: agentId
    })
    .select('productName currentPrice unit trend createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      status: 'success',
      data: {
        stats: {
          workersCreated: workersCount,
          priceUpdates: pricesCount,
          rating: req.agent.averageRating,
          loginCount: req.agent.loginCount,
          // Job statistics
          totalJobs,
          pendingJobs,
          approvedJobs,
          rejectedJobs
        },
        recentWorkers,
        recentPrices
      }
    });

  } catch (error) {
    console.error('Agent dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

module.exports = router;



