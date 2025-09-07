const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Basic Job Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['construction', 'domestic', 'agriculture', 'driver', 'security', 'cleaning', 'cooking', 'other']
  },
  workType: {
    type: String,
    required: true,
    enum: ['full_time', 'part_time', 'contract', 'daily_wage']
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: Number,
    required: true
  },
  salaryType: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'per_project']
  },
  
  // Location Information
  location: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  
  // Requirements
  requiredSkills: [{
    type: String,
    trim: true
  }],
  experienceRequired: {
    type: String,
    enum: ['none', '0-1', '1-3', '3-5', '5+'],
    default: 'none'
  },
  educationRequired: {
    type: String,
    enum: ['none', 'primary', 'secondary', 'higher_secondary', 'graduate', 'post_graduate'],
    default: 'none'
  },
  ageRange: {
    min: { type: Number, default: 18 },
    max: { type: Number, default: 65 }
  },
  
  // Contact Information
  employer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    organization: {
      type: String,
      trim: true
    }
  },
  
  // Agent Assignment
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    default: null
  },
  agentNotes: {
    type: String,
    trim: true
  },
  
  // Status and Validation
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  validationNotes: {
    type: String,
    trim: true
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    default: null
  },
  validatedAt: {
    type: Date,
    default: null
  },
  
  // Timestamps
  postedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  },
  
  // Additional Information
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  benefits: [{
    type: String,
    trim: true
  }],
  workingHours: {
    start: String,
    end: String
  },
  workingDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  shortlisted: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for location-based queries
jobSchema.index({ location: 1, district: 1, state: 1 });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ assignedAgent: 1, status: 1 });
jobSchema.index({ postedAt: -1 });

// Virtual for job age
jobSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.postedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for isExpired
jobSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

module.exports = mongoose.model('Job', jobSchema);