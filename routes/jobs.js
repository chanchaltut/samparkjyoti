const express = require('express');
const Job = require('../models/Job');
const router = express.Router();

// Get all jobs (with filtering)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      location, 
      salary, 
      experience, 
      employerType,
      languageRequirements,
      limit = 20, 
      page = 1 
    } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (salary) filter.salary = { $gte: parseInt(salary) };
    if (experience) filter.experience = experience;
    if (employerType) filter['employerDetails.typeOfWork'] = employerType;
    if (languageRequirements) {
      const langArray = Array.isArray(languageRequirements) ? languageRequirements : [languageRequirements];
      filter.languageRequirements = { $in: langArray };
    }

    const jobs = await Job.find(filter)
      .populate('employer', 'name email phone location roles employerProfile')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalJobs: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name email phone location roles employerProfile')
      .populate('applications.labour', 'name email phone location roles labourProfile rating totalRatings');
    
    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    res.json({
      status: 'success',
      data: { job }
    });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch job',
      error: error.message
    });
  }
});

// Create new job (only for users with employer role)
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      location, 
      salary, 
      experience, 
      requirements, 
      employer,
      startDate,
      duration,
      workHours,
      benefits,
      languageRequirements,
      jobRequirements
    } = req.body;

    // Validate that the user has employer role
    const user = await require('../models/User').findById(employer);
    if (!user || !user.roles.includes('employer')) {
      return res.status(403).json({
        status: 'error',
        message: 'Only users with employer role can post jobs'
      });
    }

    const job = new Job({
      title,
      description,
      category,
      location,
      salary,
      experience,
      requirements,
      employer,
      startDate,
      duration,
      workHours,
      benefits,
      languageRequirements,
      jobRequirements,
      employerDetails: {
        workExperience: user.employerProfile?.workExperience,
        typeOfWork: user.employerProfile?.typeOfWork,
        businessDetails: user.employerProfile?.businessDetails,
        typicalAmount: user.employerProfile?.typicalAmount,
        typicalDaysOfWork: user.employerProfile?.typicalDaysOfWork
      }
    });

    await job.save();

    res.status(201).json({
      status: 'success',
      message: 'Job posted successfully',
      data: { job }
    });

  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create job',
      error: error.message
    });
  }
});

// Update job
router.put('/:id', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      location, 
      salary, 
      experience, 
      requirements, 
      status,
      startDate,
      duration,
      workHours,
      benefits,
      languageRequirements,
      jobRequirements
    } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (location) updateData.location = location;
    if (salary) updateData.salary = salary;
    if (experience) updateData.experience = experience;
    if (requirements) updateData.requirements = requirements;
    if (status) updateData.status = status;
    if (startDate) updateData.startDate = startDate;
    if (duration) updateData.duration = duration;
    if (workHours) updateData.workHours = workHours;
    if (benefits) updateData.benefits = benefits;
    if (languageRequirements) updateData.languageRequirements = languageRequirements;
    if (jobRequirements) updateData.jobRequirements = jobRequirements;

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Job updated successfully',
      data: { job }
    });

  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update job',
      error: error.message
    });
  }
});

// Apply for job (only for users with labour role)
router.post('/:id/apply', async (req, res) => {
  try {
    const { labourId, coverLetter, expectedSalary } = req.body;
    
    // Validate that the user has labour role
    const user = await require('../models/User').findById(labourId);
    if (!user || !user.roles.includes('labour')) {
      return res.status(403).json({
        status: 'error',
        message: 'Only users with labour role can apply for jobs'
      });
    }
    
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    // Check if already applied
    const alreadyApplied = job.applications.find(
      app => app.labour.toString() === labourId
    );

    if (alreadyApplied) {
      return res.status(400).json({
        status: 'error',
        message: 'Already applied for this job'
      });
    }

    // Create labour snapshot
    const labourSnapshot = {
      workExperience: user.labourProfile?.workExperience || 0,
      fieldOfWork: user.labourProfile?.fieldOfWork || [],
      extraSkills: user.labourProfile?.extraSkills || [],
      rating: user.rating || 0,
      totalRatings: user.totalRatings || 0
    };

    job.applications.push({
      labour: labourId,
      coverLetter,
      expectedSalary,
      appliedAt: new Date(),
      labourSnapshot
    });

    await job.save();

    res.json({
      status: 'success',
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to apply for job',
      error: error.message
    });
  }
});

// Get jobs by employer
router.get('/employer/:employerId', async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    
    const jobs = await Job.find({ employer: req.params.employerId })
      .populate('applications.labour', 'name email phone location roles labourProfile rating totalRatings')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments({ employer: req.params.employerId });

    res.json({
      status: 'success',
      data: {
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalJobs: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get jobs by employer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// Delete job
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete job',
      error: error.message
    });
  }
});

module.exports = router;
