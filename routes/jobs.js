const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
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

// POST /api/jobs - Post a new job (employer posts job)
router.post('/', async (req, res) => {
  try {
    const { 
      title,
      description,
      category, 
      workType,
      duration,
      salary,
      salaryType,
      location, 
      district,
      state,
      pincode,
      requiredSkills,
      experienceRequired,
      educationRequired,
      ageRange,
      employer,
      urgency,
      benefits,
      workingHours,
      workingDays
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !workType || !duration || !salary || !salaryType || 
        !location || !district || !state || !employer?.name || !employer?.phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Create job
    const job = new Job({
      title,
      description,
      category,
      workType,
      duration,
      salary, 
      salaryType,
      location,
      district,
      state,
      pincode,
      requiredSkills: requiredSkills || [],
      experienceRequired: experienceRequired || 'none',
      educationRequired: educationRequired || 'none',
      ageRange: ageRange || { min: 18, max: 65 },
      employer,
      urgency: urgency || 'medium',
      benefits: benefits || [],
      workingHours: workingHours || {},
      workingDays: workingDays || []
    });

    await job.save();

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
      job.assignedAgent = agents[0]._id;
      job.status = 'under_review';
      await job.save();
    }

    res.status(201).json({
      status: 'success',
      message: 'Job posted successfully',
      data: {
        job: {
          id: job._id,
          title: job.title,
          location: job.location,
          status: job.status,
          assignedAgent: agents.length > 0 ? {
            name: agents[0].name,
            phone: agents[0].phone,
            organization: agents[0].organization
          } : null,
          postedAt: job.postedAt
        }
      }
    });

  } catch (error) {
    console.error('Job posting error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to post job'
    });
  }
});

// GET /api/jobs - Get all approved jobs (for app listing)
router.get('/', async (req, res) => {
  try {
    const { category, location, district, state, page = 1, limit = 20 } = req.query;
    
    const filter = { status: 'approved' };
    
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (district) filter.district = { $regex: district, $options: 'i' };
    if (state) filter.state = { $regex: state, $options: 'i' };

    const jobs = await Job.find(filter)
      .populate('assignedAgent', 'name organization phone')
      .sort({ postedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        jobs,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch jobs'
    });
  }
});

// GET /api/jobs/categories - Get job categories
router.get('/categories', (req, res) => {
    res.json({
      status: 'success',
    data: {
      categories: [
        { value: 'construction', label: 'Construction' },
        { value: 'domestic', label: 'Domestic' },
        { value: 'agriculture', label: 'Agriculture' },
        { value: 'driver', label: 'Driver' },
        { value: 'security', label: 'Security' },
        { value: 'cleaning', label: 'Cleaning' },
        { value: 'cooking', label: 'Cooking' },
        { value: 'other', label: 'Other' }
      ]
    }
  });
});

// GET /api/jobs/:id - Get specific job details
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('assignedAgent', 'name organization phone email');
    
    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    res.json({
      status: 'success',
      data: { job }
    });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch job'
    });
  }
});

// GET /api/jobs/agent/pending - Get pending jobs for agent review
router.get('/agent/pending', authenticateAgent, async (req, res) => {
  try {
    const agentId = req.agent._id;
    const agent = req.agent;
    
    // Get jobs that need agent assignment or are assigned to this agent
    const jobs = await Job.find({
      $or: [
        { assignedAgent: agentId, status: { $in: ['pending', 'under_review'] } },
        { 
          assignedAgent: null, 
          status: 'pending',
          // Location-based matching
          $or: [
            { location: { $regex: agent.location, $options: 'i' } },
            { district: { $regex: agent.district, $options: 'i' } },
            { state: { $regex: agent.state, $options: 'i' } }
          ]
        }
      ]
    })
    .populate('assignedAgent', 'name organization phone')
    .sort({ postedAt: -1 });

    res.json({
      status: 'success',
      data: { jobs }
    });

  } catch (error) {
    console.error('Get pending jobs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending jobs'
    });
  }
});

// PUT /api/jobs/:id/validate - Agent validates a job
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
    
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    // Assign agent if not already assigned
    if (!job.assignedAgent) {
      job.assignedAgent = agentId;
    }

    job.status = status;
    job.validationNotes = validationNotes || '';
    job.validatedBy = agentId;
    job.validatedAt = new Date();

    await job.save();

    res.json({
      status: 'success',
      message: `Job ${status} successfully`,
      data: { job }
    });

  } catch (error) {
    console.error('Validate job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to validate job'
    });
  }
});

// GET /api/jobs/agent/my-jobs - Get agent's assigned jobs
router.get('/agent/my-jobs', authenticateAgent, async (req, res) => {
  try {
    const agentId = req.agent._id;
    
    const jobs = await Job.find({ assignedAgent: agentId })
      .sort({ postedAt: -1 });

    res.json({
      status: 'success',
      data: { jobs }
    });

  } catch (error) {
    console.error('Get agent jobs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch agent jobs'
    });
  }
});

module.exports = router;